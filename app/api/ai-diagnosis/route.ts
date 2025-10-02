import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY as string,
});

// Language mapping for AI diagnosis responses
const languagePrompts = {
  en: "Respond in English.",
  ar: "Respond in Arabic (العربية). Use proper Arabic medical terminology.",
  es: "Respond in Spanish (Español). Use proper Spanish medical terminology.",
  fr: "Respond in French (Français). Use proper French medical terminology.",
  ja: "Respond in Japanese (日本語). Use proper Japanese medical terminology.",
  id: "Respond in Indonesian (Bahasa Indonesia). Use proper Indonesian medical terminology.",
  hi: "Respond in Hindi (हिन्दी). Use proper Hindi medical terminology."
};

export async function POST(req: NextRequest) {
  try {
    const { image, symptoms, language = 'en' } = await req.json();

    if (!image && !symptoms) {
      return NextResponse.json({ error: "No image or symptom data provided." }, { status: 400 });
    }

    const languageInstruction = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;
    let messages: any[] = [];

    if (image) {
      // Use Llama 4 Scout for vision analysis
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this medical image and provide a professional assessment. ${languageInstruction} ${symptoms ? `Additional context: ${symptoms}` : ''}

Provide your analysis in JSON format with:
- "confidence": number 0-100 indicating diagnostic confidence
- "findings": array of potential conditions or issues identified (in the requested language)
- "recommendations": array of specific actions to take (in the requested language)
- "urgency": 'low', 'medium', or 'high'`
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ];
    } else {
      // Text-only symptom analysis
      messages = [
        {
          role: "user",
          content: `Analyze these symptoms and provide a professional medical assessment. ${languageInstruction}: ${symptoms}

Provide your analysis in JSON format with:
- "confidence": number 0-100 indicating diagnostic confidence
- "findings": array of potential conditions or issues identified (in the requested language)
- "recommendations": array of specific actions to take (in the requested language)
- "urgency": 'low', 'medium', or 'high'`
        }
      ];
    }

    const completion = await groq.chat.completions.create({
      model: image ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(jsonString);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("Error during AI diagnosis:", error);
    return NextResponse.json({ error: "Failed to process the request." }, { status: 500 });
  }
}
