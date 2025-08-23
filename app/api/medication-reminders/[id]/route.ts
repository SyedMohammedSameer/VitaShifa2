import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

async function verifyOwnership(userId: string, reminderId: string) {
  const db = admin.firestore();
  const docRef = db.collection("reminders").doc(reminderId);
  const docSnap = await docRef.get();
  if (!docSnap.exists || docSnap.data()?.userId !== userId) {
    throw new Error("Permission denied or reminder not found");
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { id } = await params;
    const db = admin.firestore();

    await verifyOwnership(userId, id);
    const updatedData = await req.json();
    await db.collection("reminders").doc(id).update(updatedData);

    return NextResponse.json({ message: "Reminder updated successfully." });
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json({ error: "Failed to update reminder." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { id } = await params;
    const db = admin.firestore();

    await verifyOwnership(userId, id);
    await db.collection("reminders").doc(id).delete();

    return NextResponse.json({ message: "Reminder deleted successfully." });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ error: "Failed to delete reminder." }, { status: 500 });
  }
}