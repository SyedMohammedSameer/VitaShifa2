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
  Droplets,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


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

const steps = [
  { id: 1, title: "Personal Information", icon: Target },
  { id: 2, title: "Health Goals", icon: Heart },
  { id: 3, title: "Lifestyle Assessment", icon: Activity },
  { id: 4, title: "Medical History", icon: CheckCircle },
  { id: 5, title: "Preferences", icon: Apple },
  { id: 6, title: "Your Wellness Plan", icon: TrendingUp },
]

export function WellnessPlanning() {
  const [currentStep, setCurrentStep] = useState(1)
  const { user } = useAuth();
  const { toast } = useToast();
  const planRef = useRef<HTMLDivElement>(null);

  const handleDownloadPlan = () => {
    // Create a new window with just the wellness plan content
    const printWindow = window.open('', '_blank');
    const planContent = planRef.current;
    
    if (printWindow && planContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>VitaShifa Wellness Plan</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
              body { font-family: system-ui, -apple-system, sans-serif; }
              .space-y-4 > * + * { margin-top: 1rem; }
              .space-y-6 > * + * { margin-top: 1.5rem; }
              .text-center { text-align: center; }
              .text-2xl { font-size: 1.5rem; line-height: 2rem; }
              .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              .text-foreground { color: #0f172a; }
              .text-primary { color: #3b82f6; }
              .text-secondary { color: #94a3b8; }
              .text-muted-foreground { color: #64748b; }
              .bg-primary\\/5 { background-color: rgba(59, 130, 246, 0.05); }
              .bg-secondary\\/5 { background-color: rgba(148, 163, 184, 0.05); }
              .bg-secondary\\/10 { background-color: rgba(148, 163, 184, 0.1); }
              .border { border: 1px solid #e2e8f0; }
              .border-primary\\/20 { border-color: rgba(59, 130, 246, 0.2); }
              .border-secondary\\/20 { border-color: rgba(148, 163, 184, 0.2); }
              .rounded-lg { border-radius: 0.5rem; }
              .rounded-full { border-radius: 9999px; }
              .p-4 { padding: 1rem; }
              .p-6 { padding: 1.5rem; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-6 { margin-bottom: 1.5rem; }
              .mt-6 { margin-top: 1.5rem; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .justify-center { justify-content: center; }
              .gap-2 { gap: 0.5rem; }
              .gap-3 { gap: 0.75rem; }
              .h-8 { height: 2rem; }
              .w-8 { width: 2rem; }
              .h-16 { height: 4rem; }
              .w-16 { width: 4rem; }
              .h-5 { height: 1.25rem; }
              .w-5 { width: 1.25rem; }
              .h-4 { height: 1rem; }
              .w-4 { width: 1rem; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .grid { display: grid; }
              .gap-4 { gap: 1rem; }
              .text-sm { font-size: 0.875rem; }
              .flex-wrap { flex-wrap: wrap; }
              .badge { display: inline-flex; align-items: center; border-radius: 0.375rem; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 500; background-color: #f1f5f9; color: #475569; }
            </style>
          </head>
          <body>
            ${planContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      toast({ 
        title: "Print Dialog Opened", 
        description: "Choose 'Save as PDF' in the print dialog to download your wellness plan." 
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
    if (currentStep === steps.length - 1) { // On the last step before the plan is shown
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to generate a plan.", variant: "destructive" });
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/wellness-planning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save wellness plan');
            
            toast({ title: "Success", description: "Your wellness plan has been generated and saved." });
            setCurrentStep(currentStep + 1); // Move to the final plan view
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not save your wellness plan.", variant: "destructive" });
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.personalInfo.age}
                  onChange={(e) => updateFormData("personalInfo", { age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.personalInfo.gender}
                  onValueChange={(value) => updateFormData("personalInfo", { gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Enter your height"
                  value={formData.personalInfo.height}
                  onChange={(e) => updateFormData("personalInfo", { height: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter your weight"
                  value={formData.personalInfo.weight}
                  onChange={(e) => updateFormData("personalInfo", { weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Current Activity Level</Label>
              <RadioGroup
                value={formData.personalInfo.activityLevel}
                onValueChange={(value) => updateFormData("personalInfo", { activityLevel: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentary (little to no exercise)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Lightly active (light exercise 1-3 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderately active (moderate exercise 3-5 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very" id="very" />
                  <Label htmlFor="very">Very active (hard exercise 6-7 days/week)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">What are your primary health goals?</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Weight loss",
                  "Weight gain",
                  "Muscle building",
                  "Cardiovascular health",
                  "Stress management",
                  "Better sleep",
                  "Increased energy",
                  "Disease prevention",
                  "Mental wellness",
                  "Flexibility improvement",
                ].map((goal) => (
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
                <Label>Average sleep hours per night</Label>
                <Select
                  value={formData.lifestyle.sleepHours}
                  onValueChange={(value) => updateFormData("lifestyle", { sleepHours: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-5">Less than 5 hours</SelectItem>
                    <SelectItem value="5-6">5-6 hours</SelectItem>
                    <SelectItem value="7-8">7-8 hours</SelectItem>
                    <SelectItem value="more-than-8">More than 8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Current stress level</Label>
                <Select
                  value={formData.lifestyle.stressLevel}
                  onValueChange={(value) => updateFormData("lifestyle", { stressLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very-high">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Smoking status</Label>
                <RadioGroup
                  value={formData.lifestyle.smokingStatus}
                  onValueChange={(value) => updateFormData("lifestyle", { smokingStatus: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never-smoke" />
                    <Label htmlFor="never-smoke">Never smoked</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="former" id="former-smoke" />
                    <Label htmlFor="former-smoke">Former smoker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current-smoke" />
                    <Label htmlFor="current-smoke">Current smoker</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Alcohol consumption</Label>
                <Select
                  value={formData.lifestyle.alcoholConsumption}
                  onValueChange={(value) => updateFormData("lifestyle", { alcoholConsumption: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
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
                <Label className="text-base font-medium">Do you have any of these conditions?</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {[
                    "Diabetes",
                    "Hypertension",
                    "Heart disease",
                    "Asthma",
                    "Arthritis",
                    "Depression/Anxiety",
                    "Thyroid disorders",
                    "None of the above",
                  ].map((condition) => (
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
                <Label htmlFor="medications">Current medications (optional)</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you're currently taking..."
                  value={formData.medicalHistory.medications}
                  onChange={(e) => updateFormData("medicalHistory", { medications: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Known allergies (optional)</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any known allergies..."
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
                <Label>Preferred diet type</Label>
                <Select
                  value={formData.preferences.dietType}
                  onValueChange={(value) => updateFormData("preferences", { dietType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced diet</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Ketogenic</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="low-carb">Low carb</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Preferred exercise types</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {[
                    "Walking/Jogging",
                    "Weight training",
                    "Yoga/Pilates",
                    "Swimming",
                    "Cycling",
                    "Dancing",
                    "Team sports",
                    "Home workouts",
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
                <Label>Time availability for wellness activities</Label>
                <Select
                  value={formData.preferences.timeAvailability}
                  onValueChange={(value) => updateFormData("preferences", { timeAvailability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30-min">15-30 minutes daily</SelectItem>
                    <SelectItem value="30-60-min">30-60 minutes daily</SelectItem>
                    <SelectItem value="1-2-hours">1-2 hours daily</SelectItem>
                    <SelectItem value="weekends-only">Weekends only</SelectItem>
                    <SelectItem value="flexible">Flexible schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div ref={planRef} className="p-4 bg-background">
              <div className="text-center space-y-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Your Personalized Wellness Plan</h3>
                <p className="text-muted-foreground">
                  Based on your responses, we've created a customized wellness plan just for you.
                </p>
              </div>

              <div className="grid gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Target className="h-5 w-5" />
                      Your Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {formData.healthGoals.map((goal) => (
                        <Badge key={goal} variant="secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-secondary">
                      <Activity className="h-5 w-5" />
                      Recommended Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                        <Heart className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Cardio Exercise</p>
                        <p className="text-sm text-muted-foreground">30 minutes, 3-4 times per week</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                        <Apple className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Nutrition Focus</p>
                        <p className="text-sm text-muted-foreground">Balanced diet with portion control</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                        <Moon className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Sleep Optimization</p>
                        <p className="text-sm text-muted-foreground">7-8 hours of quality sleep nightly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                        <Droplets className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Hydration</p>
                        <p className="text-sm text-muted-foreground">8-10 glasses of water daily</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button className="flex-1" onClick={handleDownloadPlan}>Download Plan as PDF</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Schedule Check-in
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <Heart className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Wellness Planning</h1>
          <p className="text-muted-foreground">Create your personalized health and wellness plan</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
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
                    <span className="hidden sm:block text-center max-w-16">{step.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}

          {/* Navigation */}
          {currentStep < 6 && (
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={nextStep} disabled={currentStep === steps.length}>
                {currentStep === steps.length -1 ? "Generate Plan" : "Next"}
                {currentStep < steps.length -1 && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}