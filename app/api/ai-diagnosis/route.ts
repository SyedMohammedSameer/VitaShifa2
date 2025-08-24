import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

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

const disclaimerTranslations = {
  en: "This AI analysis is for informational purposes only and should not replace professional medical diagnosis.",
  ar: "هذا التحليل بالذكاء الاصطناعي للأغراض الإعلامية فقط ولا يجب أن يحل محل التشخيص الطبي المهني.",
  es: "Este análisis de IA es solo para fines informativos y no debe reemplazar el diagnóstico médico profesional.",
  fr: "Cette analyse IA est à des fins informatives uniquement et ne doit pas remplacer un diagnostic médical professionnel.",
  ja: "このAI分析は情報提供のみを目的としており、専門的な医学的診断に代わるものではありません。",
  id: "Analisis AI ini hanya untuk tujuan informasi dan tidak boleh menggantikan diagnosis medis profesional.",
  hi: "यह AI विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर चिकित्सा निदान की जगह नहीं ले सकता।"
};

// Helper function to convert a Base64 Data URL to a GoogleGenerativeAI.Part
function dataUrlToGenerativePart(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid Data URL.");
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];

  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { image, language = 'en' } = await req.json(); // Expect language parameter

    if (!image) {
      return NextResponse.json({ error: "No image data provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Get language-specific instruction
    const languageInstruction = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;
    
    const prompt = `Analyze this medical image and provide a brief, professional assessment. ${languageInstruction}

    Focus on potential findings and actionable recommendations. Do not repeat disclaimers about not being a doctor. Provide the analysis in a JSON format with keys: 
    - "confidence" (a number between 0 and 100)
    - "findings" (an array of strings in the requested language)
    - "recommendations" (an array of strings in the requested language)
    - "urgency" (a string which can be 'low', 'medium', or 'high')
    
    Ensure all text content is in the requested language.`;

    const imagePart = dataUrlToGenerativePart(image);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from the response
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(jsonString);

    // Add the disclaimer in the appropriate language
    const disclaimer = disclaimerTranslations[language as keyof typeof disclaimerTranslations] || disclaimerTranslations.en;

    return NextResponse.json({
        ...analysisResult,
        disclaimer: disclaimer
    });

  } catch (error) {
    console.error("Error during AI diagnosis:", error);
    return NextResponse.json({ error: "Failed to process the image." }, { status: 500 });
  }
}