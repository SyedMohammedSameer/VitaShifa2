import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin"; // Using the admin SDK

export async function GET(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const db = admin.firestore(); // Get firestore instance from admin

    const q = db.collection("consultations")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(5);

    const querySnapshot = await q.get();
    const consultations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(consultations);
  } catch (error: any) {
    console.error("Error fetching recent consultations:", error.message);
    return NextResponse.json({ error: "Failed to fetch recent consultations." }, { status: 500 });
  }
}