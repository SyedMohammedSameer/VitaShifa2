import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Language mapping for AI responses
const languagePrompts = {
  en: "Respond in English.",
  ar: "Respond in Arabic (العربية). Use proper Arabic grammar and medical terminology.",
  es: "Respond in Spanish (Español). Use proper Spanish grammar and medical terminology.",
  fr: "Respond in French (Français). Use proper French grammar and medical terminology.", 
  ja: "Respond in Japanese (日本語). Use proper Japanese grammar and medical terminology.",
  id: "Respond in Indonesian (Bahasa Indonesia). Use proper Indonesian grammar and medical terminology.",
  hi: "Respond in Hindi (हिन्दी). Use proper Hindi grammar and medical terminology."
};

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, language = 'en' } = await req.json();
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Get language-specific prompt
    const languageInstruction = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `You are an AI health companion named VitaShifa. Your goal is to provide helpful, safe, and empathetic medical information in a natural, conversational tone.

          LANGUAGE INSTRUCTION: ${languageInstruction}

          Always remember:
          - You are not a replacement for a professional medical diagnosis.
          - Always encourage the user to consult with a doctor for any health concerns.
          - Provide responses in the requested language while maintaining medical accuracy.

          When explaining medical topics, aim for clarity. Structured formats can be helpful for complex topics, but prioritize what feels most natural for the conversation. For example, you might use a structure like this for a detailed query:
          Overview: [Brief overview]
          Common Symptoms:
          - [Symptom 1]
          - [Symptom 2]
          General Advice: [Actionable advice]

          Regarding medication: You can mention general categories of over-the-counter (OTC) medications (e.g., "pain relievers," "antihistamines") if relevant. However, you MUST NOT suggest specific drug names (e.g., Ibuprofen), brands, or dosages. This should always be followed by a strong recommendation to speak with a doctor or pharmacist first.

          Do not use asterisks for formatting. Use newlines to separate paragraphs and hyphens for lists.

          Finally, always end your response with a disclaimer in the requested language that this is not medical advice and to consult a healthcare professional for any health concerns.` }],
        },
        {
          role: "model",
          parts: [{ text: `I understand. I am VitaShifa. I will provide helpful, safe, and empathetic medical information in ${language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'ja' ? 'Japanese' : language === 'id' ? 'Indonesian' : language === 'hi' ? 'Hindi' : 'English'} in a natural, conversational tone. I will use structures like lists for clarity when needed, but not for every message. I will not provide a diagnosis. I will only mention general categories of OTC medications and will always include a strong disclaimer to consult a healthcare professional. Every response will end with the required disclaimer in the requested language.` }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    const db = admin.firestore();
    let newConversationId = conversationId;

    if (conversationId) {
      // Update existing conversation
      const consultationRef = db.collection("consultations").doc(conversationId);
      // Ensure the user owns this conversation before updating
      const docSnap = await consultationRef.get();
      if (docSnap.exists && docSnap.data()?.userId === userId) {
        await consultationRef.update({
          timestamp: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp to keep it recent
          messages: admin.firestore.FieldValue.arrayUnion(
            { sender: "user", content: message },
            { sender: "ai", content: text }
          ),
          language: language, // Store the conversation language
        });
      } else {
        return NextResponse.json({ error: "Permission denied or conversation not found" }, { status: 404 });
      }
    } else {
      // Create new conversation
      const consultationRef = db.collection("consultations").doc();
      await consultationRef.set({
        userId,
        title: message.substring(0, 30),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        language: language, // Store the conversation language
        messages: [
          { sender: "user", content: message },
          { sender: "ai", content: text },
        ],
      });
      newConversationId = consultationRef.id;
    }

    return NextResponse.json({ reply: text, conversationId: newConversationId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get a response from the AI." }, { status: 500 });
  }
}