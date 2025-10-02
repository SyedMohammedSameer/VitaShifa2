import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, language = 'en' } = await req.json();
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Build conversation history for Groq
    let conversationHistory: Array<{ role: "system" | "user" | "assistant", content: string }> = [
      {
        role: "system",
        content: `You are VitaShifa, an AI health companion. Provide helpful, accurate medical information in a clear, conversational, and empathetic tone.

Your approach:
- Give direct, knowledgeable answers about health topics, symptoms, conditions, and general wellness
- Explain medical concepts clearly using simple language
- For complex topics, use structured formats like bullet points or sections when helpful
- You can mention specific medications, treatments, and medical procedures when relevant to the question
- Provide actionable advice and recommendations based on medical knowledge

Formatting:
- Use newlines to separate paragraphs
- Use hyphens for lists
- No asterisks for formatting`
      }
    ];

    // Load previous conversation history if exists
    if (conversationId) {
      const db = admin.firestore();
      const consultationRef = db.collection("consultations").doc(conversationId);
      const docSnap = await consultationRef.get();

      if (docSnap.exists && docSnap.data()?.userId === userId) {
        const messages = docSnap.data()?.messages || [];
        conversationHistory = [
          conversationHistory[0], // Keep system message
          ...messages.map((msg: { sender: string; content: string }) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content
          }))
        ];
      }
    }

    // Add current user message
    conversationHistory.push({
      role: "user",
      content: message
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: conversationHistory,
      temperature: 0.8,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content || "";

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