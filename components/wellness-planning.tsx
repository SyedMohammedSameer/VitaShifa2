"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Target,
  Activity,
  Apple,
  Moon,
  CheckCircle,
  TrendingUp,
  Loader2,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import i18n from "@/lib/i18n"

interface WellnessData {
  personalInfo: {
    age: string
    gender: string
    height: string
    weight: string
    activityLevel: string
  }
  healthGoals: string[]
  lifestyle: {
    sleepHours: string
    stressLevel: string
    smokingStatus: string
    alcoholConsumption: string
    exerciseFrequency: string
  }
  medicalHistory: {
    conditions: string[]
    medications: string
    allergies: string
  }
  preferences: {
    dietType: string
    exercisePreferences: string[]
    timeAvailability: string
  }
}

interface Recommendation {
  tip: string;
  explanation: string;
}

interface DailySchedule {
  day: string;
  fitness: string;
  nutrition: string;
  mindfulness: string;
}

interface AIPlan {
  nutritionPlan: { title: string; summary: string; recommendations: Recommendation[] };
  fitnessPlan: { title: string; summary: string; recommendations: Recommendation[] };
  mindfulnessPlan: { title: string; summary: string; recommendations: Recommendation[] };
  weeklySchedule: { title: string; summary: string; schedule: DailySchedule[] };
}

const steps = [
  { id: 1, titleKey: "wellness.steps.personalInfo", icon: Target },
  { id: 2, titleKey: "wellness.steps.healthGoals", icon: Heart },
  { id: 3, titleKey: "wellness.steps.lifestyle", icon: Activity },
  { id: 4, titleKey: "wellness.steps.medicalHistory", icon: CheckCircle },
  { id: 5, titleKey: "wellness.steps.preferences", icon: Apple },
  { id: 6, titleKey: "wellness.steps.plan", icon: TrendingUp },
]

export function WellnessPlanning() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1)
  const { user } = useAuth();
  const { toast } = useToast();
  const planRef = useRef<HTMLDivElement>(null);
  const [generatedPlan, setGeneratedPlan] = useState<AIPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPlan = () => {
    const planContent = planRef.current;
    if (!planContent) {
      toast({ title: t("errors.generic"), description: "Could not find plan content.", variant: "destructive" });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${t("dashboard.title")} ${t("wellness.title")}</title>
            <style>
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
              body { 
                margin: 2rem; 
                font-family: "Inter", sans-serif;
                background: linear-gradient(135deg, oklch(0.98 0.005 180) 0%, oklch(0.95 0.01 200) 100%);
                color: oklch(0.15 0.02 200);
              }
              .card {
                background-color: oklch(0.99 0.002 180 / 0.8);
                border: 1px solid oklch(0.85 0.01 180 / 0.4);
                border-radius: 0.75rem;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                page-break-inside: avoid;
              }
              .text-center { text-align: center; }
              h3 { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }
              p { color: oklch(0.45 0.02 200); }
            </style>
          </head>
          <body>
            ${planContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({ 
        title: t("success.sent"), 
        description: "Your PDF is ready. Please use the 'Save as PDF' option in your browser's print menu." 
      });
    }
  };

  const [formData, setFormData] = useState<WellnessData>({
    personalInfo: {
      age: "",
      gender: "",
      height: "",
      weight: "",
      activityLevel: "",
    },
    healthGoals: [],
    lifestyle: {
      sleepHours: "",
      stressLevel: "",
      smokingStatus: "",
      alcoholConsumption: "",
      exerciseFrequency: "",
    },
    medicalHistory: {
      conditions: [],
      medications: "",
      allergies: "",
    },
    preferences: {
      dietType: "",
      exercisePreferences: [],
      timeAvailability: "",
    },
  })

  const updateFormData = (section: keyof WellnessData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }))
  }

  const nextStep = async () => {
    if (currentStep === steps.length - 1) {
        setIsGenerating(true);
        setGeneratedPlan(null);
        try {
            const response = await fetch('/api/wellness-planning/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formData,
                    language: i18n.language // Send current language to API
                }),
            });

            if (!response.ok) throw new Error('Failed to generate plan');
            
            const plan: AIPlan = await response.json();
            setGeneratedPlan(plan);
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error(error);
            toast({ title: t("errors.generic"), description: "Could not generate your wellness plan.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    } else if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  // Health goals with translations
  const healthGoals = [
    t("wellness.healthGoals.weightLoss"),
    t("wellness.healthGoals.weightGain"),
    t("wellness.healthGoals.muscleBuilding"),
    t("wellness.healthGoals.cardiovascularHealth"),
    t("wellness.healthGoals.stressManagement"),
    t("wellness.healthGoals.betterSleep"),
    t("wellness.healthGoals.increasedEnergy"),
    t("wellness.healthGoals.diseasePrevention"),
    t("wellness.healthGoals.mentalWellness"),
    t("wellness.healthGoals.flexibilityImprovement"),
  ];

  // Medical conditions with translations
  const medicalConditions = [
    t("wellness.medicalHistory.conditions.diabetes"),
    t("wellness.medicalHistory.conditions.hypertension"),
    t("wellness.medicalHistory.conditions.heartDisease"),
    t("wellness.medicalHistory.conditions.asthma"),
    t("wellness.medicalHistory.conditions.arthritis"),
    t("wellness.medicalHistory.conditions.depressionAnxiety"),
    t("wellness.medicalHistory.conditions.thyroidDisorders"),
    t("wellness.medicalHistory.conditions.none"),
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">{t("wellness.personalInfo.age")}</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder={t("wellness.personalInfo.agePrompt")}
                  value={formData.personalInfo.age}
                  onChange={(e) => updateFormData("personalInfo", { age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("wellness.personalInfo.gender")}</Label>
                <Select
                  value={formData.personalInfo.gender}
                  onValueChange={(value) => updateFormData("personalInfo", { gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("wellness.personalInfo.gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("wellness.personalInfo.genderOptions.male")}</SelectItem>
                    <SelectItem value="female">{t("wellness.personalInfo.genderOptions.female")}</SelectItem>
                    <SelectItem value="other">{t("wellness.personalInfo.genderOptions.other")}</SelectItem>
                    <SelectItem value="prefer-not-to-say">{t("wellness.personalInfo.genderOptions.preferNotToSay")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">{t("wellness.personalInfo.height")}</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder={t("wellness.personalInfo.heightPrompt")}
                  value={formData.personalInfo.height}
                  onChange={(e) => updateFormData("personalInfo", { height: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">{t("wellness.personalInfo.weight")}</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={t("wellness.personalInfo.weightPrompt")}
                  value={formData.personalInfo.weight}
                  onChange={(e) => updateFormData("personalInfo", { weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t("wellness.personalInfo.activityLevel")}</Label>
              <RadioGroup
                value={formData.personalInfo.activityLevel}
                onValueChange={(value) => updateFormData("personalInfo", { activityLevel: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">{t("wellness.personalInfo.activityLevels.sedentary")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">{t("wellness.personalInfo.activityLevels.light")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">{t("wellness.personalInfo.activityLevels.moderate")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very" id="very" />
                  <Label htmlFor="very">{t("wellness.personalInfo.activityLevels.very")}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{t("wellness.healthGoals.title")}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {healthGoals.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.healthGoals.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData((prev) => ({
                            ...prev,
                            healthGoals: [...prev.healthGoals, goal],
                          }))
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            healthGoals: prev.healthGoals.filter((g) => g !== goal),
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={goal}>{goal}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>{t("wellness.lifestyle.sleepHours")}</Label>
                <Select
                  value={formData.lifestyle.sleepHours}
                  onValueChange={(value) => updateFormData("lifestyle", { sleepHours: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.search")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-5">{t("wellness.lifestyle.sleepOptions.lessThan5")}</SelectItem>
                    <SelectItem value="5-6">{t("wellness.lifestyle.sleepOptions.5to6")}</SelectItem>
                    <SelectItem value="7-8">{t("wellness.lifestyle.sleepOptions.7to8")}</SelectItem>
                    <SelectItem value="more-than-8">{t("wellness.lifestyle.sleepOptions.moreThan8")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>{t("wellness.lifestyle.stressLevel")}</Label>
                <Select
                  value={formData.lifestyle.stressLevel}
                  onValueChange={(value) => updateFormData("lifestyle", { stressLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.search")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("wellness.lifestyle.stressLevels.low")}</SelectItem>
                    <SelectItem value="moderate">{t("wellness.lifestyle.stressLevels.moderate")}</SelectItem>
                    <SelectItem value="high">{t("wellness.lifestyle.stressLevels.high")}</SelectItem>
                    <SelectItem value="very-high">{t("wellness.lifestyle.stressLevels.veryHigh")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>{t("wellness.lifestyle.smokingStatus")}</Label>
                <RadioGroup
                  value={formData.lifestyle.smokingStatus}
                  onValueChange={(value) => updateFormData("lifestyle", { smokingStatus: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never-smoke" />
                    <Label htmlFor="never-smoke">{t("wellness.lifestyle.smokingOptions.never")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="former" id="former-smoke" />
                    <Label htmlFor="former-smoke">{t("wellness.lifestyle.smokingOptions.former")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current-smoke" />
                    <Label htmlFor="current-smoke">{t("wellness.lifestyle.smokingOptions.current")}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>{t("wellness.lifestyle.alcoholConsumption")}</Label>
                <Select
                  value={formData.lifestyle.alcoholConsumption}
                  onValueChange={(value) => updateFormData("lifestyle", { alcoholConsumption: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.search")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">{t("wellness.lifestyle.alcoholOptions.never")}</SelectItem>
                    <SelectItem value="rarely">{t("wellness.lifestyle.alcoholOptions.rarely")}</SelectItem>
                    <SelectItem value="occasionally">{t("wellness.lifestyle.alcoholOptions.occasionally")}</SelectItem>
                    <SelectItem value="regularly">{t("wellness.lifestyle.alcoholOptions.regularly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">{t("wellness.medicalHistory.conditionsTitle")}</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {medicalConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={formData.medicalHistory.conditions.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData((prev) => ({
                              ...prev,
                              medicalHistory: {
                                ...prev.medicalHistory,
                                conditions: [...prev.medicalHistory.conditions, condition],
                              },
                            }))
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              medicalHistory: {
                                ...prev.medicalHistory,
                                conditions: prev.medicalHistory.conditions.filter((c) => c !== condition),
                              },
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={condition}>{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">{t("wellness.medicalHistory.medications")}</Label>
                <Textarea
                  id="medications"
                  placeholder={t("wellness.medicalHistory.medicationsPrompt")}
                  value={formData.medicalHistory.medications}
                  onChange={(e) => updateFormData("medicalHistory", { medications: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">{t("wellness.medicalHistory.allergies")}</Label>
                <Textarea
                  id="allergies"
                  placeholder={t("wellness.medicalHistory.allergiesPrompt")}
                  value={formData.medicalHistory.allergies}
                  onChange={(e) => updateFormData("medicalHistory", { allergies: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>{t("wellness.preferences.dietType")}</Label>
                <Select
                  value={formData.preferences.dietType}
                  onValueChange={(value) => updateFormData("preferences", { dietType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("wellness.preferences.dietType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">{t("wellness.preferences.dietTypes.balanced")}</SelectItem>
                    <SelectItem value="vegetarian">{t("wellness.preferences.dietTypes.vegetarian")}</SelectItem>
                    <SelectItem value="vegan">{t("wellness.preferences.dietTypes.vegan")}</SelectItem>
                    <SelectItem value="keto">{t("wellness.preferences.dietTypes.keto")}</SelectItem>
                    <SelectItem value="mediterranean">{t("wellness.preferences.dietTypes.mediterranean")}</SelectItem>
                    <SelectItem value="low-carb">{t("wellness.preferences.dietTypes.lowCarb")}</SelectItem>
                    <SelectItem value="other">{t("wellness.preferences.dietTypes.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">{t("wellness.preferences.exerciseTypes")}</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {[
                    t("wellness.preferences.exercises.walking"),
                    t("wellness.preferences.exercises.weightTraining"),
                    t("wellness.preferences.exercises.yoga"),
                    t("wellness.preferences.exercises.swimming"),
                    t("wellness.preferences.exercises.cycling"),
                    t("wellness.preferences.exercises.dancing"),
                    t("wellness.preferences.exercises.teamSports"),
                    t("wellness.preferences.exercises.homeWorkouts"),
                  ].map((exercise) => (
                    <div key={exercise} className="flex items-center space-x-2">
                      <Checkbox
                        id={exercise}
                        checked={formData.preferences.exercisePreferences.includes(exercise)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                exercisePreferences: [...prev.preferences.exercisePreferences, exercise],
                              },
                            }))
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                exercisePreferences: prev.preferences.exercisePreferences.filter((e) => e !== exercise),
                              },
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={exercise}>{exercise}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("wellness.preferences.timeAvailability")}</Label>
                <Select
                  value={formData.preferences.timeAvailability}
                  onValueChange={(value) => updateFormData("preferences", { timeAvailability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("wellness.preferences.timeAvailability")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30-min">{t("wellness.preferences.timeOptions.15to30")}</SelectItem>
                    <SelectItem value="30-60-min">{t("wellness.preferences.timeOptions.30to60")}</SelectItem>
                    <SelectItem value="1-2-hours">{t("wellness.preferences.timeOptions.1to2hours")}</SelectItem>
                    <SelectItem value="weekends-only">{t("wellness.preferences.timeOptions.weekendsOnly")}</SelectItem>
                    <SelectItem value="flexible">{t("wellness.preferences.timeOptions.flexible")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 6:
        if (isGenerating) {
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="text-xl font-semibold">{t("wellness.plan.generating")}</h3>
                    <p className="text-muted-foreground">{t("wellness.plan.generatingSubtitle")}</p>
                </div>
            )
        }

        if (!generatedPlan) {
            return <div className="text-center h-64">{t("errors.generic")}</div>
        }

        return (
            <div className="space-y-6">
                 <div ref={planRef} className="p-6 bg-background space-y-6">
                     <div className="text-center space-y-2 mb-6">
                        <h3 className="text-2xl font-semibold text-foreground">{t("wellness.plan.title")}</h3>
                        <p className="text-muted-foreground">{t("wellness.plan.subtitle")}</p>
                     </div>
                     
                     <Card className="bg-primary/5 border-primary/20">
                         <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-primary"><Target className="h-5 w-5" /> {t("wellness.plan.goals")}</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <div className="flex flex-wrap gap-2">
                             {formData.healthGoals.map((goal) => (<Badge key={goal} variant="secondary">{goal}</Badge>))}
                             </div>
                         </CardContent>
                     </Card>

                     {[generatedPlan.nutritionPlan, generatedPlan.fitnessPlan, generatedPlan.mindfulnessPlan].map((plan, index) => {
                        const icons = [<Apple key="n" className="h-5 w-5" />, <Activity key="f" className="h-5 w-5" />, <Moon key="m" className="h-5 w-5" />];
                        return (
                            <Card key={plan.title} className="bg-secondary/5 border-secondary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-secondary">{icons[index]} {plan.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground italic">{plan.summary}</p>
                                    <div className="space-y-3">
                                        {plan.recommendations.map((rec) => (
                                            <div key={rec.tip}>
                                                <p className="font-medium text-foreground">{rec.tip}</p>
                                                <p className="text-sm text-muted-foreground pl-4">{rec.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                     })}

                     <Card className="bg-secondary/5 border-secondary/20">
                         <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-secondary"><Calendar className="h-5 w-5" /> {generatedPlan.weeklySchedule.title}</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <p className="text-sm text-muted-foreground italic mb-4">{generatedPlan.weeklySchedule.summary}</p>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 font-medium">{t("common.search")}</th>
                                            <th className="p-2 font-medium">Fitness</th>
                                            <th className="p-2 font-medium">Nutrition Focus</th>
                                            <th className="p-2 font-medium">Mindfulness</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedPlan.weeklySchedule.schedule.map((day) => (
                                            <tr key={day.day} className="border-b text-sm">
                                                <td className="p-2 font-medium">{day.day}</td>
                                                <td className="p-2">{day.fitness}</td>
                                                <td className="p-2">{day.nutrition}</td>
                                                <td className="p-2">{day.mindfulness}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                         </CardContent>
                     </Card>
                 </div>
                 
                 <div className="flex gap-4 mt-6">
                     <Button className="flex-1" onClick={handleDownloadPlan}>{t("wellness.plan.downloadPdf")}</Button>
                     <Button variant="outline" className="flex-1 bg-transparent">{t("wellness.plan.scheduleCheckin")}</Button>
                 </div>
            </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <Heart className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("wellness.title")}</h1>
          <p className="text-muted-foreground">{t("wellness.description")}</p>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                {t("common.search")} {currentStep} {t("common.search")} {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% {t("common.search")}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex flex-col items-center gap-2 text-xs",
                      step.id <= currentStep ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        step.id <= currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:block text-center max-w-16">{t(step.titleKey)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>{t(steps[currentStep - 1]?.titleKey)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}

          {currentStep < 6 && (
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t("common.previous")}
              </Button>
              <Button onClick={nextStep} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : (currentStep === steps.length -1 ? t("wellness.plan.generating") : t("common.next"))}
                {!isGenerating && currentStep < steps.length -1 && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}