import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const plan = await req.json();
    const docRef = await addDoc(collection(db, "wellnessPlans"), {
      ...plan,
      createdAt: serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save wellness plan." }, { status: 500 });
  }
}