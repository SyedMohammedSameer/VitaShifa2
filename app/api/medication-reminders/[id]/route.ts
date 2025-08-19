import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedData = await req.json();
    await updateDoc(doc(db, "reminders", id), updatedData);
    return NextResponse.json({ message: "Reminder updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update reminder." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteDoc(doc(db, "reminders", id));
    return NextResponse.json({ message: "Reminder deleted successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete reminder." }, { status: 500 });
  }
}