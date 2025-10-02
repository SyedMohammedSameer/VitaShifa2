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
    const { formData, language = 'en' } = await req.json();

    const languageInstruction = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.en;

    const prompt = `Create a personalized wellness plan based on this profile. ${languageInstruction}

Age: ${formData.personalInfo.age}, Gender: ${formData.personalInfo.gender}, Height: ${formData.personalInfo.height}cm, Weight: ${formData.personalInfo.weight}kg, Activity: ${formData.personalInfo.activityLevel}
Goals: ${formData.healthGoals.join(", ")}
Sleep: ${formData.lifestyle.sleepHours}hrs, Stress: ${formData.lifestyle.stressLevel}, Smoking: ${formData.lifestyle.smokingStatus}, Alcohol: ${formData.lifestyle.alcoholConsumption}
Conditions: ${formData.medicalHistory.conditions.join(", ") || "none"}
Diet: ${formData.preferences.dietType}, Exercise preferences: ${formData.preferences.exercisePreferences.join(", ")}, Time: ${formData.preferences.timeAvailability}

Generate JSON with these keys (all content in the requested language):

1. "nutritionPlan", "fitnessPlan", "mindfulnessPlan": Each has:
   - title: catchy title
   - summary: 1-2 sentences
   - recommendations: array of objects with "tip" and "explanation" (3-4 items each)

2. "weeklySchedule":
   - title: "Your Sample Week at a Glance" (translated)
   - summary: brief sentence
   - schedule: 7 day objects (Monday-Sunday, translated) each with "fitness", "nutrition", "mindfulness"`;

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

    const responseText = completion.choices[0]?.message?.content || "{}";
    const plan = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    return NextResponse.json(plan);

  } catch (error) {
    console.error("Error generating wellness plan:", error);
    return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
  }
}
