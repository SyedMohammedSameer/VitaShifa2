// components/settings.tsx
"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext";
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
import { useTranslation } from "react-i18next"
import i18n from "@/lib/i18n"

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
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
]

export function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1990-01-01",
      emergencyContact: "+1 (555) 987-6543",
    },
    preferences: {
      language: i18n.language,
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
        if (!user) return;
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/settings', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (Object.keys(data).length > 0) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };
    fetchSettings();
  }, [user]);

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(newSettings),
        });
        if (!response.ok) throw new Error('Failed to save settings');
        toast({ title: t("success.saved"), description: t("settings.saveSuccess") });
    } catch (error) {
        console.error(error);
        toast({ title: t("errors.generic"), description: t("settings.saveError"), variant: "destructive" });
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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    updateSettings("preferences", { language: langCode });
    if (langCode === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.description")}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t("settings.tabs.profile")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("settings.tabs.preferences")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="privacy">{t("settings.tabs.privacy")}</TabsTrigger>
          <TabsTrigger value="data">{t("settings.tabs.data")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("settings.profile.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">{t("settings.profile.changePhoto")}</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    {t("settings.profile.removePhoto")}
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.profile.fullName")}</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => updateSettings("profile", { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.profile.email")}</Label>
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
                  <Label htmlFor="phone">{t("settings.profile.phone")}</Label>
                  <Input
                    id="phone"
                    value={settings.profile.phone}
                    onChange={(e) => updateSettings("profile", { phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">{t("settings.profile.dateOfBirth")}</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={settings.profile.dateOfBirth}
                    onChange={(e) => updateSettings("profile", { dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency">{t("settings.profile.emergencyContact")}</Label>
                <Input
                  id="emergency"
                  value={settings.profile.emergencyContact}
                  onChange={(e) => updateSettings("profile", { emergencyContact: e.target.value })}
                />
              </div>

              <Button onClick={() => saveSettings(settings)}>{t("settings.profile.saveChanges")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.preferences.language")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.preferences.languageLabel")}</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={handleLanguageChange}
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
                {t("settings.preferences.appearance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.preferences.theme")}</Label>
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
                        {t("settings.preferences.themeOptions.light")}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        {t("settings.preferences.themeOptions.dark")}
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        {t("settings.preferences.themeOptions.system")}
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
                {t("settings.preferences.accessibility")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.preferences.highContrast")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.preferences.highContrastDesc")}</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.highContrast}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ highContrast: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.preferences.largeText")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.preferences.largeTextDesc")}</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.largeText}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ largeText: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.preferences.screenReader")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.preferences.screenReaderDesc")}</p>
                </div>
                <Switch
                  checked={settings.preferences.accessibility.screenReader}
                  onCheckedChange={(checked) => updateAccessibilitySettings({ screenReader: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.preferences.reducedMotion")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.preferences.reducedMotionDesc")}</p>
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
                {t("settings.notifications.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.email")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notifications.emailDesc")}</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.email}
                  onCheckedChange={(checked) => updateNotificationSettings({ email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.push")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notifications.pushDesc")}</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.push}
                  onCheckedChange={(checked) => updateNotificationSettings({ push: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.sms")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notifications.smsDesc")}</p>
                </div>
                <Switch
                  checked={settings.preferences.notifications.sms}
                  onCheckedChange={(checked) => updateNotificationSettings({ sms: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.notifications.reminders")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notifications.remindersDesc")}</p>
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
                {t("settings.privacy.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.privacy.dataSharing")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.privacy.dataSharingDesc")}</p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => updateSettings("privacy", { dataSharing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.privacy.analytics")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.privacy.analyticsDesc")}</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => updateSettings("privacy", { analytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.privacy.marketing")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.privacy.marketingDesc")}</p>
                </div>
                <Switch
                  checked={settings.privacy.marketing}
                  onCheckedChange={(checked) => updateSettings("privacy", { marketing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.privacy.thirdParty")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.privacy.thirdPartyDesc")}</p>
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
              <CardTitle>{t("settings.privacy.accountSecurity")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                {t("settings.privacy.viewPrivacy")}
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                {t("settings.privacy.changePassword")}
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Volume2 className="h-4 w-4 mr-2" />
                {t("settings.privacy.twoFactor")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t("settings.data.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">{t("settings.data.export")}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("settings.data.exportDesc")}
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t("settings.data.exportData")}
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">{t("settings.data.import")}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("settings.data.importDesc")}
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("settings.data.importData")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">{t("settings.data.dangerZone")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">{t("settings.data.deleteAccount")}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("settings.data.deleteAccountDesc")}
                </p>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("settings.data.deleteAccount")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}