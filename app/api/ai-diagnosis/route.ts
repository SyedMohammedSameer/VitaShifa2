import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // In a real application, you would process the image file here.
  // Since we are not saving the image, we will just return a mock analysis.
  const mockAnalysis = {
    confidence: Math.floor(Math.random() * 30) + 70,
    findings: [
      "No obvious abnormalities detected",
      "Image quality is suitable for analysis",
      "Recommend professional medical evaluation for confirmation",
    ],
    recommendations: [
      "Consult with a healthcare professional",
      "Consider follow-up imaging if symptoms persist",
      "Monitor for any changes in symptoms",
    ],
    urgency: "low",
    disclaimer:
      "This AI analysis is for informational purposes only and should not replace professional medical diagnosis.",
  };

  return NextResponse.json(mockAnalysis);
}