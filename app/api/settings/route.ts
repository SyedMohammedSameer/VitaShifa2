import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function GET(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const docRef = doc(admin.firestore(), "settings", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // Return default settings if none exist
      return NextResponse.json({});
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const settings = await req.json();
    await setDoc(doc(admin.firestore(), "settings", userId), settings, { merge: true });

    return NextResponse.json({ message: "Settings updated successfully." });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}