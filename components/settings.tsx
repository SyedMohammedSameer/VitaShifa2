"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SettingsIcon, User, Bell, Shield, Globe, Palette, Download, Upload, Trash2, Eye, Moon, Sun, Volume2, Accessibility,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserSettings {
  profile: {
    name: string
    email: string
    phone: string
    dateOfBirth: string
    emergencyContact: string
  }
  preferences: {
    language: string
    theme: "light" | "dark" | "system"
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
      reminders: boolean
    }
    accessibility: {
      highContrast: boolean
      largeText: boolean
      screenReader: boolean
      reducedMotion: boolean
    }
  }
  privacy: {
    dataSharing: boolean
    analytics: boolean
    marketing: boolean
    thirdParty: boolean
  }
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
]

export function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1990-01-01",
      emergencyContact: "+1 (555) 987-6543",
    },
    preferences: {
      language: "en",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
        reminders: true,
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        reducedMotion: false,
      },
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      marketing: false,
      thirdParty: false,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);


  const saveSettings = async (newSettings: UserSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      toast({ title: "Success", description: "Settings saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
    }
  };

  const updateSettings = (section: keyof UserSettings, updates: any) => {
    const newSettings = {
      ...settings,
      [section]: { ...settings[section], ...updates },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  }

  const updateNotificationSettings = (updates: Partial<UserSettings["preferences"]["notifications"]>) => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        notifications: { ...settings.preferences.notifications, ...updates },
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  }

  const updateAccessibilitySettings = (updates: Partial<UserSettings["preferences"]["accessibility"]>) => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        accessibility: { ...settings.preferences.accessibility, ...updates },
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Change Photo</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Remove Photo
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => updateSettings("profile", { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSettings("profile", { email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.profile.phone}
                    onChange={(e) => updateSettings("profile", { phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={settings.profile.dateOfBirth}
                    onChange={(e) => updateSettings("profile", { dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={settings.profile.emergencyContact}
                  onChange={(e) => updateSettings("profile", { emergencyContact: e.target.value })}
                />
              </div>

              <Button onClick={() => saveSettings(settings)}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) => updateSettings("preferences", { language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.preferences.theme}
                  onValueChange={(value: "light" | "dark" | "system") =>
                    updateSettings("preferences", { theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.highContrast}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ highContrast: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Large Text</Label>
                  <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.largeText}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ largeText: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Screen Reader Support</Label>
                  <p className="text-sm text-muted-foreground">Optimize for screen reading software</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.screenReader}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ screenReader: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.reducedMotion}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ reducedMotion: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates and reminders via email</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.email}
                  onCheckedChange={(checked) => updateNotificationSettings({ email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get instant notifications on your device</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.push}
                  onCheckedChange={(checked) => updateNotificationSettings({ push: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important alerts via text message</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.sms}
                  onCheckedChange={(checked) => updateNotificationSettings({ sms: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Health Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminders for medications and appointments</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.reminders}
                  onCheckedChange={(checked) => updateNotificationSettings({ reminders: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Sharing with Healthcare Providers</Label>
                  <p className="text-sm text-muted-foreground">Allow sharing anonymized data for research</p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => updateSettings("privacy", { dataSharing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics & Performance</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => updateSettings("privacy", { analytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional content and health tips</p>
                </div>
                <Switch
                  checked={settings.privacy.marketing}
                  onCheckedChange={(checked) => updateSettings("privacy", { marketing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Third-party Integrations</Label>
                  <p className="text-sm text-muted-foreground">Allow connections with fitness trackers and apps</p>
                </div>
                <Switch
                  checked={settings.privacy.thirdParty}
                  onCheckedChange={(checked) => updateSettings("privacy", { thirdParty: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                View Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Volume2 className="h-4 w-4 mr-2" />
                Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a copy of your health data, consultations, and wellness plans.
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Import Health Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Import health records from other platforms or devices.
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}