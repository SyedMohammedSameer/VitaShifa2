import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const db = admin.firestore();

        const q = db.collection("reminders").where("userId", "==", userId);
        const querySnapshot = await q.get();
        const reminders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        return NextResponse.json(reminders);
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return NextResponse.json({ error: "Failed to fetch reminders." }, { status: 500 });
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
        const db = admin.firestore();
        
        const reminder = await req.json();
        const docRef = await db.collection("reminders").add({
            ...reminder,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error("Error adding reminder:", error);
        return NextResponse.json({ error: "Failed to add reminder." }, { status: 500 });
    }
}