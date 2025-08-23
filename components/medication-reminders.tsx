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

interface MedicationReminder {
  id: string
  name: string
  dose: string
  frequency: string
  times: string[]
  startDate: string
  endDate: string
  notes: string
  adherence: boolean[]
}

const frequencyOptions = [
  { value: "once-daily", label: "Once daily" },
  { value: "twice-daily", label: "Twice daily" },
  { value: "three-times", label: "Three times daily" },
  { value: "four-times", label: "Four times daily" },
  { value: "as-needed", label: "As needed" },
]

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00",
]

export function MedicationReminders() {
  const { user } = useAuth(); // Get the authenticated user
  const [reminders, setReminders] = useState<MedicationReminder[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newReminder, setNewReminder] = useState({
    name: "", dose: "", frequency: "", times: [""],
    startDate: "", endDate: "", notes: "",
  })

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) return; // Don't fetch if no user is logged in
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
    fetchReminders();
  }, [user]); // Re-run the effect when the user object changes

  const addReminder = async () => {
    if (!user || !newReminder.name || !newReminder.dose || !newReminder.frequency) {
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
        body: JSON.stringify(newReminder),
      });

      if (!response.ok) throw new Error('Failed to add reminder');

      const addedReminder = await response.json();
      setReminders([...reminders, { ...newReminder, id: addedReminder.id, adherence: [] }]);
      setNewReminder({ name: "", dose: "", frequency: "", times: [""], startDate: "", endDate: "", notes: "" });
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

  const markAsTaken = (id: string) => {
    toast({
      title: "Marked as Taken",
      description: "Great job staying on track!",
    })
  }

  const skipDose = (id: string) => {
    toast({
      title: "Dose Skipped",
      description: "Reminder noted. Consult your doctor if you frequently skip doses.",
      variant: "destructive",
    })
  }

  const snoozeDose = (id: string) => {
    toast({
      title: "Reminder Snoozed",
      description: "We'll remind you again in 15 minutes.",
    })
  }

  const calculateAdherence = (adherence: boolean[]) => {
    if (!adherence || adherence.length === 0) return 0;
    const taken = adherence.filter(Boolean).length
    return Math.round((taken / adherence.length) * 100)
  }

  const getUpcomingReminders = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)

    return reminders
      .flatMap((reminder) =>
        reminder.times.map((time) => ({
          ...reminder,
          nextTime: time,
          isOverdue: time < currentTime,
        })),
      )
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Medication Reminders
          </h1>
          <p className="text-muted-foreground mt-1">Stay on track with your medication schedule</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 pulse-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>Create a reminder for your medication schedule</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={newReminder.name}
                    onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                    placeholder="e.g., Lisinopril"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label htmlFor="dose">Dose *</Label>
                  <Input
                    id="dose"
                    value={newReminder.dose}
                    onChange={(e) => setNewReminder({ ...newReminder, dose: e.target.value })}
                    placeholder="e.g., 10mg"
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={newReminder.frequency}
                  onValueChange={(value) => setNewReminder({ ...newReminder, frequency: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Time(s)</Label>
                <Select
                  value={newReminder.times[0]}
                  onValueChange={(value) => setNewReminder({ ...newReminder, times: [value] })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newReminder.startDate}
                    onChange={(e) => setNewReminder({ ...newReminder, startDate: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newReminder.endDate}
                    onChange={(e) => setNewReminder({ ...newReminder, endDate: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newReminder.notes}
                  onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                  placeholder="Special instructions..."
                  className="glass-input"
                />
              </div>

              <Button onClick={addReminder} className="w-full bg-gradient-to-r from-primary to-accent">
                Add Medication
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Reminders */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Reminders
              </CardTitle>
              <CardDescription>Your medication schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              {getUpcomingReminders().length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming reminders</p>
                  <p className="text-sm text-muted-foreground">Add your first medication to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getUpcomingReminders().map((reminder, index) => (
                    <div
                      key={`${reminder.id}-${index}`}
                      className="flex items-center justify-between p-4 rounded-lg glass-card border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            reminder.isOverdue ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary",
                          )}
                        >
                          <Pill className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{reminder.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {reminder.dose} at {reminder.nextTime}
                            {reminder.isOverdue && (
                              <Badge variant="destructive" className="ml-2">
                                Overdue
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => markAsTaken(reminder.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => snoozeDose(reminder.id)}>
                          <Snooze className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => skipDose(reminder.id)}>
                          <X className="h-4 w-4" />
                        </Button>
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                7-Day Adherence
              </CardTitle>
              <CardDescription>Your medication compliance this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{reminder.name}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          calculateAdherence(reminder.adherence) >= 80
                            ? "text-green-600 border-green-600"
                            : "text-orange-600 border-orange-600",
                        )}
                      >
                        {calculateAdherence(reminder.adherence)}%
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className={cn("h-8 flex-1 rounded", reminder.adherence && reminder.adherence[index] ? "bg-green-500" : "bg-muted")} />
                      ))}
                    </div>
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
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            All Medications
          </CardTitle>
          <CardDescription>Manage your medication reminders</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medications added yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start by adding your first medication reminder</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-primary to-accent">
                <Plus className="h-4 w-4 mr-2" />
                Add First Medication
              </Button>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{reminder.times.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{reminder.frequency.replace("-", " ")}</span>
                      </div>
                      {reminder.notes && <p className="text-muted-foreground italic">{reminder.notes}</p>}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Adherence</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          calculateAdherence(reminder.adherence) >= 80
                            ? "text-green-600 border-green-600"
                            : "text-orange-600 border-orange-600",
                        )}
                      >
                        {calculateAdherence(reminder.adherence)}%
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