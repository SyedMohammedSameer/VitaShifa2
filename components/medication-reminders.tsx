// components/medication-reminders.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Pill, Clock, Calendar, Check, X, AlarmClockIcon as Snooze, Trash2, TrendingUp, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { addDays, format, startOfDay, isBefore, parse } from "date-fns"
import { useTranslation } from "react-i18next"

// A more robust data structure for reminders
interface AdherenceLog {
  date: string; // YYYY-MM-DD
  status: "taken" | "skipped";
}

interface MedicationReminder {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  times: string[]; // e.g., ["08:00", "20:00"]
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  notes: string;
  adherence: AdherenceLog[];
}

interface UpcomingReminder {
  reminder: MedicationReminder;
  time: string;
  isOverdue: boolean;
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
}).flat();


export function MedicationReminders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<MedicationReminder[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newReminder, setNewReminder] = useState({
    name: "", dose: "", frequency: "", times: [""],
    startDate: format(new Date(), 'yyyy-MM-dd'), endDate: "", notes: "",
  })

  const frequencyOptions = [
    { value: "once-daily", label: t("medication.onceDaily") },
    { value: "twice-daily", label: t("medication.twiceDaily") },
    { value: "three-times", label: t("medication.threeTimesDaily") },
    { value: "four-times", label: t("medication.fourTimesDaily") },
    { value: "as-needed", label: t("medication.asNeeded") },
  ]

  const fetchReminders = async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/medication-reminders', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch reminders');
        }
        const data = await response.json();
        setReminders(data);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not fetch reminders.", variant: "destructive" });
      }
    };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...newReminder.times];
    newTimes[index] = value;
    setNewReminder({ ...newReminder, times: newTimes });
  };

  const addTimeSlot = () => {
    setNewReminder({ ...newReminder, times: [...newReminder.times, ""] });
  };

  const removeTimeSlot = (index: number) => {
    if (newReminder.times.length > 1) {
      const newTimes = newReminder.times.filter((_, i) => i !== index);
      setNewReminder({ ...newReminder, times: newTimes });
    }
  };

  const addReminder = async () => {
    if (!user || !newReminder.name || !newReminder.dose || !newReminder.frequency || newReminder.times.some(t => !t)) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/medication-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ ...newReminder, adherence: [] }),
      });

      if (!response.ok) throw new Error('Failed to add reminder');
      await fetchReminders(); // Re-fetch all reminders to get the new one
      setNewReminder({ name: "", dose: "", frequency: "", times: [""], startDate: format(new Date(), 'yyyy-MM-dd'), endDate: "", notes: "" });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Medication reminder added successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add reminder.", variant: "destructive" });
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/medication-reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to delete reminder');
      setReminders(reminders.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Medication reminder removed." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete reminder.", variant: "destructive" });
    }
  };

  const updateAdherence = async (reminderId: string, time: string, status: "taken" | "skipped") => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const reminder = reminders.find(r => r.id === reminderId);
      if (!reminder || !user) return;

      const newLog: AdherenceLog = { date: `${todayStr}T${time}:00`, status };
      
      const updatedAdherence = (reminder.adherence || []).filter(log => !log.date.startsWith(`${todayStr}T${time}`));
      updatedAdherence.push(newLog);

      try {
          const idToken = await user.getIdToken();
          const response = await fetch(`/api/medication-reminders/${reminderId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`,
              },
              body: JSON.stringify({ adherence: updatedAdherence }),
          });

          if (!response.ok) throw new Error('Failed to update adherence');

          await fetchReminders(); // Refresh data from server
          toast({
              title: status === 'taken' ? t("medication.taken") : t("medication.skipped"),
              description: status === 'taken' ? t("medication.jobStaying") : t("medication.reminderNoted"),
              variant: status === 'skipped' ? 'destructive' : 'default',
          });
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Could not update adherence.", variant: "destructive" });
      }
  };

  const snoozeDose = (id: string) => {
    toast({
      title: t("medication.snoozed"),
      description: t("medication.snoozeMessage"),
    })
  }

  const calculateAdherence = (reminder: MedicationReminder) => {
    const today = startOfDay(new Date());
    const sevenDaysAgo = startOfDay(addDays(today, -6));
    
    let totalDoses = 0;
    let takenDoses = 0;

    for (let i = 0; i < 7; i++) {
        const date = addDays(sevenDaysAgo, i);
        if (isBefore(date, startOfDay(parse(reminder.startDate, 'yyyy-MM-dd', new Date())))) continue;
        if (reminder.endDate && isBefore(startOfDay(parse(reminder.endDate, 'yyyy-MM-dd', new Date())), date)) continue;
        
        const dateStr = format(date, 'yyyy-MM-dd');
        totalDoses += reminder.times.length;

        const dosesTakenOnDate = (reminder.adherence || []).filter(log => log.date.startsWith(dateStr) && log.status === 'taken').length;
        takenDoses += dosesTakenOnDate;
    }
    
    if (totalDoses === 0) return 100; // No doses scheduled yet
    return Math.round((takenDoses / totalDoses) * 100);
  };

  const getUpcomingReminders = (): UpcomingReminder[] => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    return reminders
      .filter(r => {
          const startDate = parse(r.startDate, 'yyyy-MM-dd', new Date());
          const isStarted = !isBefore(now, startDate);
          const isEnded = r.endDate && isBefore(parse(r.endDate, 'yyyy-MM-dd', new Date()), now);
          return isStarted && !isEnded;
      })
      .flatMap((reminder) =>
        reminder.times.map((time) => {
            const reminderDateTime = parse(`${todayStr}T${time}:00`, "yyyy-MM-dd'T'HH:mm:ss", new Date());
            const isHandled = reminder.adherence && reminder.adherence.some(log => log.date.startsWith(`${todayStr}T${time}`));

            if (isBefore(reminderDateTime, now) && !isHandled) {
                return { reminder, time, isOverdue: true };
            }
            if (isBefore(now, reminderDateTime) && !isHandled) {
                return { reminder, time, isOverdue: false };
            }
            return null;
        })
      )
      .filter((item): item is UpcomingReminder => item !== null)
      .sort((a, b) => a.time.localeCompare(b.time));
  };
  
  const renderAdherenceChart = (reminder: MedicationReminder) => {
      const today = startOfDay(new Date());
      const sevenDaysAgo = startOfDay(addDays(today, -6));
      const days = Array.from({ length: 7 }).map((_, i) => addDays(sevenDaysAgo, i));
      
      return (
        <div className="flex gap-1">
          {days.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const logsForDay = (reminder.adherence || []).filter(log => log.date.startsWith(dateStr));
            const allTaken = logsForDay.length > 0 && logsForDay.length === reminder.times.length && logsForDay.every(l => l.status === 'taken');
            
            let color = "bg-muted";
            if (logsForDay.length > 0) {
                color = allTaken ? "bg-green-500" : "bg-orange-500";
            }
            
            return (
              <div key={index} className="flex-1 text-center">
                <div className={cn("h-8 rounded", color)} />
                <span className="text-xs text-muted-foreground">{format(day, 'E')[0]}</span>
              </div>
            );
          })}
        </div>
      );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("medication.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("medication.description")}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 pulse-glow">
              <Plus className="h-4 w-4 mr-2" />
              {t("medication.addReminder")}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle>{t("medication.addNew")}</DialogTitle>
              <DialogDescription>{t("medication.createReminder")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("medication.nameLabel")}</Label>
                  <Input
                    id="name"
                    value={newReminder.name}
                    onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                    placeholder={t("medication.namePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="dose">{t("medication.doseLabel")}</Label>
                  <Input
                    id="dose"
                    value={newReminder.dose}
                    onChange={(e) => setNewReminder({ ...newReminder, dose: e.target.value })}
                    placeholder={t("medication.dosePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">{t("medication.frequencyLabel")}</Label>
                <Select
                  value={newReminder.frequency}
                  onValueChange={(value) => setNewReminder({ ...newReminder, frequency: value })}
                >
                  <SelectTrigger><SelectValue placeholder={t("medication.selectFrequency")} /></SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("medication.timesLabel")}</Label>
                {newReminder.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                        <Select value={time} onValueChange={(value) => handleTimeChange(index, value)}>
                            <SelectTrigger><SelectValue placeholder={t("medication.selectTime")} /></SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((slot) => (<SelectItem key={slot} value={slot}>{slot}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        {newReminder.times.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(index)}>
                                <X className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addTimeSlot} className="mt-2">
                    <Plus className="h-4 w-4 mr-2"/> {t("medication.addTime")}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">{t("medication.startDateLabel")}</Label>
                  <Input id="startDate" type="date" value={newReminder.startDate} onChange={(e) => setNewReminder({ ...newReminder, startDate: e.target.value })}/>
                </div>
                <div>
                  <Label htmlFor="endDate">{t("medication.endDateLabel")}</Label>
                  <Input id="endDate" type="date" value={newReminder.endDate} onChange={(e) => setNewReminder({ ...newReminder, endDate: e.target.value })}/>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">{t("medication.notesLabel")}</Label>
                <Textarea id="notes" value={newReminder.notes} onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })} placeholder={t("medication.notesPlaceholder")}/>
              </div>

              <Button onClick={addReminder} className="w-full bg-gradient-to-r from-primary to-accent"> {t("medication.addMedication")} </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Reminders */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"> <Clock className="h-5 w-5 text-primary" /> {t("medication.upcomingReminders")} </CardTitle>
              <CardDescription>{t("medication.scheduleToday")}</CardDescription>
            </CardHeader>
            <CardContent>
              {getUpcomingReminders().length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("medication.noReminders")}</p>
                  <p className="text-sm text-muted-foreground">{t("medication.allCaughtUp")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getUpcomingReminders().map(({ reminder, time, isOverdue }, index) => (
                    <div key={`${reminder.id}-${index}`} className="flex items-center justify-between p-4 rounded-lg glass-card border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", isOverdue ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary")}>
                          <Pill className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{reminder.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {reminder.dose} at {time}
                            {isOverdue && <Badge variant="destructive" className="ml-2">{t("medication.overdue")}</Badge>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => updateAdherence(reminder.id, time, 'taken')} className="bg-green-600 hover:bg-green-700"> <Check className="h-4 w-4" /> </Button>
                        <Button size="sm" variant="outline" onClick={() => snoozeDose(reminder.id)}> <Snooze className="h-4 w-4" /> </Button>
                        <Button size="sm" variant="outline" onClick={() => updateAdherence(reminder.id, time, 'skipped')}> <X className="h-4 w-4" /> </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Adherence Chart */}
        <div>
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"> <TrendingUp className="h-5 w-5 text-primary" /> {t("medication.adherenceChartTitle")} </CardTitle>
              <CardDescription>{t("medication.adherenceChartDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">{t("medication.noMedicationsToTrack")}</p>) : reminders.map((reminder) => (
                  <div key={reminder.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{reminder.name}</p>
                      <Badge variant="outline" className={cn( calculateAdherence(reminder) >= 80 ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600")}>
                        {calculateAdherence(reminder)}%
                      </Badge>
                    </div>
                    {renderAdherenceChart(reminder)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Medications */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"> <Pill className="h-5 w-5 text-primary" /> {t("medication.allMedicationsTitle")} </CardTitle>
          <CardDescription>{t("medication.manageReminders")}</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("medication.noMedications")}</p>
              <p className="text-sm text-muted-foreground mb-4">{t("medication.addFirst")}</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-primary to-accent"> <Plus className="h-4 w-4 mr-2" /> {t("medication.addFirstMedication")} </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className="glass-card border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{reminder.name}</h3>
                        <p className="text-sm text-muted-foreground">{reminder.dose}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteReminder(reminder.id)} className="text-destructive hover:text-destructive hover:bg-destructive/20"> <Trash2 className="h-4 w-4" /> </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"> <Clock className="h-4 w-4 text-muted-foreground" /> <span>{reminder.times.join(", ")}</span> </div>
                      <div className="flex items-center gap-2"> <Calendar className="h-4 w-4 text-muted-foreground" /> <span>{reminder.frequency.replace("-", " ")}</span> </div>
                      {reminder.notes && <p className="text-muted-foreground italic">{reminder.notes}</p>}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t("medication.adherence")}</span>
                      <Badge variant="outline" className={cn(calculateAdherence(reminder) >= 80 ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600")}>
                        {calculateAdherence(reminder)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}