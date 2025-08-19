import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const querySnapshot = await getDocs(collection(db, "reminders"));
  const reminders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  try {
    const reminder = await req.json();
    const docRef = await addDoc(collection(db, "reminders"), {
      ...reminder,
      createdAt: serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add reminder." }, { status: 500 });
  }
}