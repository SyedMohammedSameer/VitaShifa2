import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

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
    const { image } = await req.json(); // Expect a base64 data URL string

    if (!image) {
      return NextResponse.json({ error: "No image data provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this medical image and provide a brief, professional assessment. Focus on potential findings and actionable recommendations. Do not repeat disclaimers about not being a doctor. Provide the analysis in a JSON format with keys: "confidence" (a number between 0 and 100), "findings" (an array of strings), "recommendations" (an array of strings), and "urgency" (a string which can be 'low', 'medium', or 'high').`;

    const imagePart = dataUrlToGenerativePart(image);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from the response
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(jsonString);

    // Add the disclaimer here to ensure it's always present
    return NextResponse.json({
        ...analysisResult,
        disclaimer: "This AI analysis is for informational purposes only and should not replace professional medical diagnosis."
    });

  } catch (error) {
    console.error("Error during AI diagnosis:", error);
    return NextResponse.json({ error: "Failed to process the image." }, { status: 500 });
  }
}