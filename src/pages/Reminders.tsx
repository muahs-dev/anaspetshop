import { useState, useEffect } from "react";
import { Plus, Trash2, Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Reminder {
  id: string;
  name: string;
  time: string;
  active: boolean;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReminderName, setNewReminderName] = useState("");
  const [newReminderHour, setNewReminderHour] = useState("");
  const [newReminderMinute, setNewReminderMinute] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Load reminders from localStorage
    const saved = localStorage.getItem("reminders");
    if (saved) {
      setReminders(JSON.parse(saved));
    }

    // Request notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  useEffect(() => {
    // Save reminders to localStorage
    localStorage.setItem("reminders", JSON.stringify(reminders));

    // Check reminders every minute
    const interval = setInterval(() => {
      checkReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    reminders.forEach(reminder => {
      if (reminder.active && reminder.time === currentTime) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Lembrete da Creche", {
            body: reminder.name,
            icon: "/icon-192x192.png",
            tag: reminder.id
          });
        }
      }
    });
  };

  const handleAddReminder = () => {
    if (!newReminderName.trim() || !newReminderHour || !newReminderMinute) {
      toast.error("Preencha todos os campos");
      return;
    }

    const time = `${newReminderHour.padStart(2, '0')}:${newReminderMinute.padStart(2, '0')}`;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      name: newReminderName,
      time: time,
      active: true,
    };

    setReminders([...reminders, newReminder]);
    setNewReminderName("");
    setNewReminderHour("");
    setNewReminderMinute("");
    setIsDialogOpen(false);
    toast.success("Lembrete criado com sucesso! Você receberá uma notificação no horário.");
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    toast.success("Lembrete excluído");
  };

  const toggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lembretes</h1>
          <p className="text-muted-foreground">Gerencie seus lembretes da creche</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lembrete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Lembrete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Lembrete</Label>
                <Input
                  id="name"
                  placeholder="Ex: Alimentar os pets"
                  value={newReminderName}
                  onChange={(e) => setNewReminderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="hour" className="text-xs text-muted-foreground">Hora</Label>
                    <Input
                      id="hour"
                      type="number"
                      min="0"
                      max="23"
                      placeholder="00"
                      value={newReminderHour}
                      onChange={(e) => setNewReminderHour(e.target.value)}
                      className="text-2xl font-bold text-center h-16"
                    />
                  </div>
                  <Clock className="h-6 w-6 text-muted-foreground mt-5" />
                  <div className="flex-1">
                    <Label htmlFor="minute" className="text-xs text-muted-foreground">Minuto</Label>
                    <Input
                      id="minute"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="00"
                      value={newReminderMinute}
                      onChange={(e) => setNewReminderMinute(e.target.value)}
                      className="text-2xl font-bold text-center h-16"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddReminder} className="w-full">
                Criar Lembrete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum lembrete criado ainda.
              <br />
              Clique em "Novo Lembrete" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {reminder.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteReminder(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className={reminder.active ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground"} />
                    <span className="text-2xl font-bold">{reminder.time}</span>
                  </div>
                  {reminder.active && (
                    <Button
                      variant="outline"
                      onClick={() => toggleReminder(reminder.id)}
                    >
                      Não Concluído
                    </Button>
                  )}
                  {!reminder.active && (
                    <span className="text-sm text-muted-foreground font-medium">Concluído</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reminders;
