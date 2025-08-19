"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  Scan,
  Heart,
  AlertTriangle,
  Settings,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  Pill,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MedicalConsultation } from "@/components/medical-consultation"
import { AIDiagnosis } from "@/components/ai-diagnosis"
import { WellnessPlanning } from "@/components/wellness-planning"
import { EmergencyCare } from "@/components/emergency-care"
import { Settings as SettingsComponent } from "@/components/settings"
import { MedicationReminders } from "@/components/medication-reminders"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

const navigationItems = [
  { id: "consultation", label: "Medical Consultation", icon: MessageSquare },
  { id: "diagnosis", label: "AI Diagnosis", icon: Scan },
  { id: "wellness", label: "Wellness Planning", icon: Heart },
  { id: "medication", label: "Medication Reminders", icon: Pill },
  { id: "emergency", label: "Emergency Care", icon: AlertTriangle },
]

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("consultation")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "consultation":
        return <MedicalConsultation />
      case "diagnosis":
        return <AIDiagnosis />
      case "wellness":
        return <WellnessPlanning />
      case "medication":
        return <MedicationReminders />
      case "emergency":
        return <EmergencyCare />
      case "settings":
        return <SettingsComponent />
      default:
        return <MedicalConsultation />
    }
  }

  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage)

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-3xl liquid-morph"></div>
        <div className="floating-orb absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-2xl liquid-morph"></div>
        <div className="floating-orb absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-to-br from-accent/20 to-secondary/25 rounded-full blur-3xl liquid-morph"></div>
        <div className="floating-orb absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-primary/35 to-accent/25 rounded-full blur-2xl liquid-morph"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-header">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground pulse-glow">
                <Stethoscope className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-semibold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VitaShifa
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-accent/20">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/20">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLanguage?.flag}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/50">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => setSelectedLanguage(language.code)}
                    className={cn(
                      "flex items-center gap-2 hover:bg-accent/20",
                      selectedLanguage === language.code && "bg-accent/30",
                    )}
                  >
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 ring-2 ring-primary/30 cursor-pointer">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    VS
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/50">
                <DropdownMenuItem onClick={() => setActiveTab("settings")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform glass-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4 pt-20 md:pt-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12 transition-all duration-200 relative overflow-hidden shimmer-effect",
                        activeTab === item.id
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg pulse-glow"
                          : "hover:bg-accent/20 hover:text-accent-foreground",
                      )}
                      onClick={() => {
                        setActiveTab(item.id)
                        setSidebarOpen(false)
                      }}
                    >
                      <Icon className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </Button>
                  )
                })}
              </nav>

              {/* Chat History Section */}
              <div className="mt-8">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recent Consultations</h3>
                <div className="space-y-2">
                  {["Chest pain consultation", "Wellness check-up", "Medication review"].map((chat, index) => (
                    <Card
                      key={index}
                      className="glass-card p-3 cursor-pointer hover:bg-accent/20 transition-all duration-200 hover:scale-105"
                    >
                      <p className="text-sm text-foreground truncate">{chat}</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen relative z-10">
          <div className="container mx-auto p-6">{renderContent()}</div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}