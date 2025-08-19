import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are an AI health companion named VitaShifa. Provide helpful and safe medical information, but always remind the user to consult with a doctor. Do not provide a diagnosis." }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I am VitaShifa, an AI health companion. I will provide helpful and safe medical information, and I will always remind users to consult with a doctor. I will not provide a diagnosis." }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get a response from the AI." }, { status: 500 });
  }
}