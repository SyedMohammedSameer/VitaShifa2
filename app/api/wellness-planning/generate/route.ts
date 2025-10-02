import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY as string,
});

// Language mapping for wellness plan responses
const languagePrompts = {
  en: "Respond in English.",
  ar: "Respond in Arabic (العربية). Use proper Arabic grammar and wellness terminology.",
  es: "Respond in Spanish (Español). Use proper Spanish grammar and wellness terminology.",
  fr: "Respond in French (Français). Use proper French grammar and wellness terminology.", 
  ja: "Respond in Japanese (日本語). Use proper Japanese grammar and wellness terminology.",
  id: "Respond in Indonesian (Bahasa Indonesia). Use proper Indonesian grammar and wellness terminology.",
  hi: "Respond in Hindi (हिन्दी). Use proper Hindi grammar and wellness terminology."
};

export async function POST(req: NextRequest) {
  try {
<<<<<<< HEAD
    const { formData, language = 'en' } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Get language-specific instruction
    const languageInstruction = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;

    const prompt = `
      You are an expert wellness and health planning assistant. Based on the user's data, create a highly personalized, actionable, and encouraging wellness plan.

      **LANGUAGE INSTRUCTION: ${languageInstruction}**

      **User Data:**
      - **Personal Info:** Age ${formData.personalInfo.age}, Gender ${formData.personalInfo.gender}, Height ${formData.personalInfo.height}cm, Weight ${formData.personalInfo.weight}kg, Activity Level: ${formData.personalInfo.activityLevel}.
      - **Health Goals:** ${formData.healthGoals.join(", ")}.
      - **Lifestyle:** Sleeps ${formData.lifestyle.sleepHours} hours, Stress level is ${formData.lifestyle.stressLevel}, Smoking: ${formData.lifestyle.smokingStatus}, Alcohol: ${formData.lifestyle.alcoholConsumption}.
      - **Medical History:** Pre-existing conditions include ${formData.medicalHistory.conditions.join(", ") || "none"}.
      - **Preferences:** Prefers a ${formData.preferences.dietType} diet and enjoys ${formData.preferences.exercisePreferences.join(", ")} exercises. Time availability: ${formData.preferences.timeAvailability}.

      **Task:**
      Generate a detailed plan in a valid JSON format in the requested language. The root object must have these exact keys: "nutritionPlan", "fitnessPlan", "mindfulnessPlan", and "weeklySchedule".

      1.  **For "nutritionPlan", "fitnessPlan", and "mindfulnessPlan"**:
          - **title**: A catchy title in the requested language.
          - **summary**: An encouraging 1-2 sentence summary in the requested language.
          - **recommendations**: An array of objects, where each object has a "tip" (a specific, actionable recommendation in the requested language) and an "explanation" (a brief reason why this is beneficial in the requested language). Create 3-4 recommendations for each section.

      2.  **For "weeklySchedule"**:
          - **title**: "Your Sample Week at a Glance" translated to the requested language.
          - **summary**: A brief sentence about consistency in the requested language.
          - **schedule**: An array of 7 objects, one for each day ("Monday" to "Sunday" translated to the requested language). Each day object should have three keys: "fitness" (e.g., "30-min brisk walk" in the requested language), "nutrition" (e.g., "Focus on hydration and lean protein" in the requested language), and "mindfulness" (e.g., "5-min guided meditation before bed" in the requested language). Base the fitness activities on the user's preferences: ${formData.preferences.exercisePreferences.join(", ")}.

      Ensure the entire output is a single, valid JSON object with all content in the requested language.
    `;
=======
    const formData = await req.json();

    const prompt = `Create a personalized wellness plan based on this profile:

Age: ${formData.personalInfo.age}, Gender: ${formData.personalInfo.gender}, Height: ${formData.personalInfo.height}cm, Weight: ${formData.personalInfo.weight}kg, Activity: ${formData.personalInfo.activityLevel}
Goals: ${formData.healthGoals.join(", ")}
Sleep: ${formData.lifestyle.sleepHours}hrs, Stress: ${formData.lifestyle.stressLevel}, Smoking: ${formData.lifestyle.smokingStatus}, Alcohol: ${formData.lifestyle.alcoholConsumption}
Conditions: ${formData.medicalHistory.conditions.join(", ") || "none"}
Diet: ${formData.preferences.dietType}, Exercise preferences: ${formData.preferences.exercisePreferences.join(", ")}, Time: ${formData.preferences.timeAvailability}

Generate JSON with these keys:

1. "nutritionPlan", "fitnessPlan", "mindfulnessPlan": Each has:
   - title: catchy title
   - summary: 1-2 sentences
   - recommendations: array of objects with "tip" and "explanation" (3-4 items each)

2. "weeklySchedule":
   - title: "Your Sample Week at a Glance"
   - summary: brief sentence
   - schedule: 7 day objects (Monday-Sunday) each with "fitness", "nutrition", "mindfulness"`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are VitaShifa's wellness planning expert. Create personalized, actionable health plans in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });
>>>>>>> e699cd4 (netlify deployment and model shift)

    const responseText = completion.choices[0]?.message?.content || "{}";
    const plan = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    return NextResponse.json(plan);

  } catch (error) {
    console.error("Error generating wellness plan:", error);
    return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
  }
}