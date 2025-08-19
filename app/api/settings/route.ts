import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Assuming you have a way to get the current user's ID
    const userId = "test-user"; // Replace with actual user ID from auth
    const docRef = doc(db, "settings", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return NextResponse.json(docSnap.data());
    } else {
        return NextResponse.json({ error: "No settings found for this user." }, { status: 404 });
    }
}


export async function POST(req: NextRequest) {
  try {
    const userId = "test-user"; // Replace with actual user ID
    const settings = await req.json();
    await setDoc(doc(db, "settings", userId), settings, { merge: true });
    return NextResponse.json({ message: "Settings updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}