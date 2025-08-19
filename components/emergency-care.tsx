"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Phone,
  MapPin,
  Heart,
  Thermometer,
  Zap,
  Shield,
  Search,
  ChevronRight,
  PhoneCall,
  Navigation,
  Users,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EmergencyContact {
  name: string
  number: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface FirstAidGuide {
  id: string
  title: string
  severity: "critical" | "urgent" | "moderate"
  symptoms: string[]
  steps: string[]
  warnings: string[]
  icon: React.ComponentType<{ className?: string }>
}

const emergencyContacts: EmergencyContact[] = [
  {
    name: "Emergency Services",
    number: "911",
    description: "Police, Fire, Ambulance",
    icon: Phone,
  },
  {
    name: "Poison Control",
    number: "1-800-222-1222",
    description: "24/7 Poison Emergency",
    icon: Shield,
  },
  {
    name: "Crisis Hotline",
    number: "988",
    description: "Mental Health Crisis",
    icon: Heart,
  },
  {
    name: "Non-Emergency",
    number: "311",
    description: "Non-urgent medical advice",
    icon: PhoneCall,
  },
]

const firstAidGuides: FirstAidGuide[] = [
  {
    id: "cpr",
    title: "CPR (Cardiopulmonary Resuscitation)",
    severity: "critical",
    symptoms: ["Person is unconscious", "Not breathing", "No pulse"],
    steps: [
      "Call 911 immediately",
      "Place person on firm, flat surface",
      "Tilt head back, lift chin",
      "Place heel of hand on center of chest",
      "Push hard and fast at least 2 inches deep",
      "Give 30 chest compressions at 100-120 per minute",
      "Give 2 rescue breaths",
      "Continue cycles until help arrives",
    ],
    warnings: ["Do not stop CPR until professional help arrives", "Ensure scene is safe before approaching"],
    icon: Heart,
  },
  {
    id: "choking",
    title: "Choking (Heimlich Maneuver)",
    severity: "critical",
    symptoms: ["Cannot speak or cough", "Clutching throat", "Blue lips or face"],
    steps: [
      "Stand behind the person",
      "Place arms around their waist",
      "Make a fist with one hand",
      "Place fist above navel, below ribcage",
      "Grasp fist with other hand",
      "Give quick upward thrusts",
      "Continue until object is expelled",
      "Call 911 if unsuccessful",
    ],
    warnings: ["For infants, use back blows and chest thrusts", "Seek medical attention even if successful"],
    icon: AlertTriangle,
  },
  {
    id: "bleeding",
    title: "Severe Bleeding Control",
    severity: "urgent",
    symptoms: ["Heavy bleeding", "Blood soaking through bandages", "Spurting blood"],
    steps: [
      "Call 911 for severe bleeding",
      "Apply direct pressure with clean cloth",
      "Elevate injured area above heart if possible",
      "Apply pressure to pressure points if needed",
      "Do not remove embedded objects",
      "Cover with sterile bandage",
      "Monitor for shock symptoms",
    ],
    warnings: ["Do not use tourniquet unless trained", "Watch for signs of shock"],
    icon: Zap,
  },
  {
    id: "burns",
    title: "Burn Treatment",
    severity: "moderate",
    symptoms: ["Red, painful skin", "Blisters", "White or charred skin"],
    steps: [
      "Remove from heat source safely",
      "Cool burn with cool (not cold) water for 10-20 minutes",
      "Remove jewelry/clothing before swelling",
      "Cover with sterile, non-adhesive bandage",
      "Take over-the-counter pain medication",
      "Seek medical attention for large or deep burns",
    ],
    warnings: ["Do not use ice", "Do not break blisters", "Seek immediate care for electrical burns"],
    icon: Thermometer,
  },
]

export function EmergencyCare() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide | null>(null)

  const filteredGuides = firstAidGuides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.symptoms.some((symptom) => symptom.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "urgent":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/5 border-destructive/20"
      case "urgent":
        return "bg-secondary/5 border-secondary/20"
      default:
        return "bg-muted/5 border-border"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Emergency Care</h1>
          <p className="text-muted-foreground">Quick access to emergency guidance and first aid instructions</p>
        </div>
      </div>

      {/* Emergency Alert */}
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
              <Phone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive">Life-Threatening Emergency?</h3>
              <p className="text-sm text-muted-foreground">
                If someone is unconscious, not breathing, or severely injured, call emergency services immediately.
              </p>
            </div>
            <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <Phone className="h-4 w-4 mr-2" />
              Call 911
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="guides">First Aid Guides</TabsTrigger>
          <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => {
              const Icon = contact.icon
              return (
                <Card key={contact.name} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">{contact.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{contact.number}</p>
                        <Button size="sm" className="mt-2">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Location Services */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Find Nearest Hospital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Locate the nearest emergency room or urgent care facility based on your current location.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Navigation className="h-4 w-4 mr-2" />
                  Find Hospitals
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <MapPin className="h-4 w-4 mr-2" />
                  Urgent Care
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search first aid guides or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* First Aid Guides */}
          <div className="grid gap-4">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon
              return (
                <Card
                  key={guide.id}
                  className={cn("cursor-pointer transition-all hover:shadow-md", getSeverityBg(guide.severity))}
                  onClick={() => setSelectedGuide(guide)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            guide.severity === "critical"
                              ? "bg-destructive/10 text-destructive"
                              : guide.severity === "urgent"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-primary/10 text-primary",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{guide.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getSeverityColor(guide.severity)} className="text-xs">
                              {guide.severity.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {guide.symptoms.length} symptoms • {guide.steps.length} steps
                            </p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Guide Modal */}
          {selectedGuide && (
            <Card className={cn("mt-6", getSeverityBg(selectedGuide.severity))}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <selectedGuide.icon className="h-5 w-5" />
                    {selectedGuide.title}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedGuide(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Symptoms</h4>
                  <ul className="space-y-1">
                    {selectedGuide.symptoms.map((symptom, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-secondary mt-0.5 flex-shrink-0" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Steps to Follow</h4>
                  <ol className="space-y-2">
                    {selectedGuide.steps.map((step, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {selectedGuide.warnings.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Important Warnings
                    </h4>
                    <ul className="space-y-1">
                      {selectedGuide.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-destructive">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Emergency Symptom Checker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Select symptoms to get immediate guidance on whether emergency care is needed.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive text-base">Call 911 Immediately If:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">• Unconscious or unresponsive</div>
                    <div className="text-sm text-muted-foreground">• Difficulty breathing or no breathing</div>
                    <div className="text-sm text-muted-foreground">• Chest pain or pressure</div>
                    <div className="text-sm text-muted-foreground">• Severe bleeding</div>
                    <div className="text-sm text-muted-foreground">• Signs of stroke (FAST test)</div>
                    <div className="text-sm text-muted-foreground">• Severe allergic reaction</div>
                    <div className="text-sm text-muted-foreground">• Poisoning or overdose</div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-secondary text-base">Seek Urgent Care For:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">• High fever (over 103°F)</div>
                    <div className="text-sm text-muted-foreground">• Severe abdominal pain</div>
                    <div className="text-sm text-muted-foreground">• Deep cuts requiring stitches</div>
                    <div className="text-sm text-muted-foreground">• Suspected broken bones</div>
                    <div className="text-sm text-muted-foreground">• Severe headache with vision changes</div>
                    <div className="text-sm text-muted-foreground">• Persistent vomiting</div>
                    <div className="text-sm text-muted-foreground">• Signs of dehydration</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-destructive hover:bg-destructive/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency: Call 911
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Find Urgent Care
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
