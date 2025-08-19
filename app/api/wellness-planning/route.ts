import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const plan = await req.json();
    const docRef = await addDoc(collection(admin.firestore(), "wellnessPlans"), {
      ...plan,
      userId: userId, // Associate plan with user
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Error saving wellness plan:", error);
    return NextResponse.json({ error: "Failed to save wellness plan." }, { status: 500 });
  }
}