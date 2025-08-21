import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert wellness and health planning assistant. Based on the user's data, create a highly personalized, actionable, and encouraging wellness plan.

      **User Data:**
      - **Personal Info:** Age ${formData.personalInfo.age}, Gender ${formData.personalInfo.gender}, Height ${formData.personalInfo.height}cm, Weight ${formData.personalInfo.weight}kg, Activity Level: ${formData.personalInfo.activityLevel}.
      - **Health Goals:** ${formData.healthGoals.join(", ")}.
      - **Lifestyle:** Sleeps ${formData.lifestyle.sleepHours} hours, Stress level is ${formData.lifestyle.stressLevel}, Smoking: ${formData.lifestyle.smokingStatus}, Alcohol: ${formData.lifestyle.alcoholConsumption}.
      - **Medical History:** Pre-existing conditions include ${formData.medicalHistory.conditions.join(", ") || "none"}.
      - **Preferences:** Prefers a ${formData.preferences.dietType} diet and enjoys ${formData.preferences.exercisePreferences.join(", ")} exercises. Time availability: ${formData.preferences.timeAvailability}.

      **Task:**
      Generate a detailed plan in a valid JSON format. The root object must have these exact keys: "nutritionPlan", "fitnessPlan", "mindfulnessPlan", and "weeklySchedule".

      1.  **For "nutritionPlan", "fitnessPlan", and "mindfulnessPlan"**:
          - **title**: A catchy title.
          - **summary**: An encouraging 1-2 sentence summary.
          - **recommendations**: An array of objects, where each object has a "tip" (a specific, actionable recommendation) and an "explanation" (a brief reason why this is beneficial). Create 3-4 recommendations for each section.

      2.  **For "weeklySchedule"**:
          - **title**: "Your Sample Week at a Glance".
          - **summary**: A brief sentence about consistency.
          - **schedule**: An array of 7 objects, one for each day ("Monday" to "Sunday"). Each day object should have three keys: "fitness" (e.g., "30-min brisk walk"), "nutrition" (e.g., "Focus on hydration and lean protein"), and "mindfulness" (e.g., "5-min guided meditation before bed"). Base the fitness activities on the user's preferences: ${formData.preferences.exercisePreferences.join(", ")}.

      Ensure the entire output is a single, valid JSON object.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const plan = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    return NextResponse.json(plan);

  } catch (error) {
    console.error("Error generating wellness plan:", error);
    return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
  }
}