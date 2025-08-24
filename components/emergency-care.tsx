// components/emergency-care.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Youtube,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { emergencyContactsByCountry, EmergencyContact } from "@/lib/emergency-contacts";
import { useTranslation } from "react-i18next"

interface FirstAidGuide {
  id: string
  titleKey: string
  severity: "critical" | "urgent" | "moderate"
  symptomsKey: string[]
  icon: React.ComponentType<{ className?: string }>
  videoUrl: string
}

const firstAidGuides: FirstAidGuide[] = [
  {
    id: "cpr",
    titleKey: "emergency.firstAidGuides.cpr",
    severity: "critical",
    symptomsKey: ["emergency.symptoms.unconscious", "emergency.symptoms.notBreathing", "emergency.symptoms.noPulse"],
    icon: Heart,
    videoUrl: "https://www.youtube.com/watch?v=y52c9ebL-Wo", // St John Ambulance
  },
  {
    id: "choking",
    titleKey: "emergency.firstAidGuides.choking",
    severity: "critical", 
    symptomsKey: ["emergency.symptoms.cannotSpeak", "emergency.symptoms.clutchingThroat", "emergency.symptoms.blueLips"],
    icon: AlertTriangle,
    videoUrl: "https://www.youtube.com/watch?v=2dn13zneEjo", // American Red Cross
  },
  {
    id: "bleeding",
    titleKey: "emergency.firstAidGuides.bleeding",
    severity: "urgent",
    symptomsKey: ["emergency.symptoms.heavyBleeding", "emergency.symptoms.bloodSoaking", "emergency.symptoms.spurtingBlood"],
    icon: Zap,
    videoUrl: "https://www.youtube.com/watch?v=NxO5LvgqZe0", // American Red Cross
  },
  {
    id: "burns",
    titleKey: "emergency.firstAidGuides.burns", 
    severity: "moderate",
    symptomsKey: ["emergency.symptoms.redSkin", "emergency.symptoms.blisters", "emergency.symptoms.charredSkin"],
    icon: Thermometer,
    videoUrl: "https://www.youtube.com/watch?v=ZNWjfe-84Ig", // Mayo Clinic
  },
];

const countryList = Object.keys(emergencyContactsByCountry)
  .filter(key => key !== 'default' && key !== 'EU')
  .map(key => ({ code: key, name: new Intl.DisplayNames(['en'], { type: 'region' }).of(key) }))
  .sort((a, b) => a.name!.localeCompare(b.name!));

export function EmergencyCare() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("")
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    // Get user's locale and determine the country
    const locale = navigator.language; // e.g., "en-US"
    const countryCode = locale.split('-')[1] || 'default';
    const initialCountry = emergencyContactsByCountry[countryCode] ? countryCode : 'default';
    setSelectedCountry(initialCountry);
  }, []);

  useEffect(() => {
    setEmergencyContacts(emergencyContactsByCountry[selectedCountry] || emergencyContactsByCountry.default);
  }, [selectedCountry]);

  const findNearestHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://www.google.com/maps/search/hospital/@${latitude},${longitude},15z`;
        window.open(googleMapsUrl, "_blank");
      },
      () => {
        alert(t("emergency.locationError"));
      });
    } else {
      alert(t("emergency.geolocationNotSupported"));
    }
  };

  const filteredGuides = firstAidGuides.filter(
    (guide) =>
      t(guide.titleKey).toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.symptomsKey.some((symptomKey) => t(symptomKey).toLowerCase().includes(searchTerm.toLowerCase())),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("emergency.title")}</h1>
          <p className="text-muted-foreground">{t("emergency.description")}</p>
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
              <h3 className="text-lg font-semibold text-destructive">{t("emergency.lifeThreatening")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("emergency.lifeThreateningDesc")}
              </p>
            </div>
            <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {t("emergency.callEmergency")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">{t("emergency.tabs.contacts")}</TabsTrigger>
          <TabsTrigger value="guides">{t("emergency.tabs.guides")}</TabsTrigger>
          <TabsTrigger value="symptoms">{t("emergency.tabs.symptoms")}</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t("emergency.emergencyContacts")}</span>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("emergency.selectCountry")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="default">{t("emergency.default")}</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact) => {
                  const Icon = contact.icon
                  return (
                    <Card key={contact.nameKey + contact.number} className="bg-card/50 border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{t(contact.nameKey)}</h3>
                              <p className="text-sm text-muted-foreground">{t(contact.descriptionKey)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{contact.number}</p>
                            <Button size="sm" className="mt-2">
                              <Phone className="h-3 w-3 mr-1" />
                              {t("emergency.call")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Location Services */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("emergency.findHospital")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("emergency.findHospitalDesc")}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={findNearestHospital}>
                  <Navigation className="h-4 w-4 mr-2" />
                  {t("emergency.findHospitals")}
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t("emergency.urgentCare")}
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
              placeholder={t("emergency.firstAidSearch")}
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
                <a key={guide.id} href={guide.videoUrl} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                  <Card
                    className={cn("cursor-pointer transition-all hover:shadow-md hover:border-primary/50", 
                    guide.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' : 
                    guide.severity === 'urgent' ? 'bg-secondary/5 border-secondary/20' : 
                    'bg-muted/5 border-border'
                    )}
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
                            <h3 className="font-semibold text-foreground">{t(guide.titleKey)}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getSeverityColor(guide.severity)} className="text-xs">
                                {t(`emergency.severity.${guide.severity}`)}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {guide.symptomsKey.map(key => t(key)).join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                          <Youtube className="h-5 w-5" />
                          <span className="hidden sm:inline">{t("emergency.watchVideo")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t("emergency.symptomChecker.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                {t("emergency.symptomChecker.description")}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive text-base">{t("emergency.symptomChecker.callEmergencyIf")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "emergency.symptoms.emergencyList.unconscious",
                      "emergency.symptoms.emergencyList.breathing",
                      "emergency.symptoms.emergencyList.chestPain",
                      "emergency.symptoms.emergencyList.severeBleeding",
                      "emergency.symptoms.emergencyList.stroke",
                      "emergency.symptoms.emergencyList.allergic",
                      "emergency.symptoms.emergencyList.poisoning"
                    ].map((key) => (
                      <div key={key} className="text-sm text-muted-foreground">• {t(key)}</div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-secondary text-base">{t("emergency.symptomChecker.seekUrgentCareFor")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "emergency.symptoms.urgentList.highFever",
                      "emergency.symptoms.urgentList.abdominalPain",
                      "emergency.symptoms.urgentList.deepCuts",
                      "emergency.symptoms.urgentList.brokenBones",
                      "emergency.symptoms.urgentList.headache",
                      "emergency.symptoms.urgentList.vomiting",
                      "emergency.symptoms.urgentList.dehydration"
                    ].map((key) => (
                      <div key={key} className="text-sm text-muted-foreground">• {t(key)}</div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-destructive hover:bg-destructive/90">
                  <Phone className="h-4 w-4 mr-2" />
                  {t("emergency.emergencyCallButton")}
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  {t("emergency.findUrgentCare")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}