import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const db = admin.firestore();

    const plan = await req.json();
    const docRef = await db.collection("wellnessPlans").add({
      ...plan,
      userId: userId, // Associate plan with user
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Error saving wellness plan:", error);
    return NextResponse.json({ error: "Failed to save wellness plan." }, { status: 500 });
  }
}