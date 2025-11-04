import { useState } from "react";
import { Plus, Trash2, Bell } from "lucide-react";
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
  const [newReminderTime, setNewReminderTime] = useState("");

  const handleAddReminder = () => {
    if (!newReminderName.trim() || !newReminderTime) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      name: newReminderName,
      time: newReminderTime,
      active: true,
    };

    setReminders([...reminders, newReminder]);
    setNewReminderName("");
    setNewReminderTime("");
    setIsDialogOpen(false);
    toast.success("Lembrete criado com sucesso");
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
                <Label htmlFor="time">Horário</Label>
                <div className="relative">
                  <Input
                    id="time"
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="text-lg font-semibold"
                  />
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
                  <Button
                    variant={reminder.active ? "default" : "outline"}
                    onClick={() => toggleReminder(reminder.id)}
                  >
                    {reminder.active ? "Concluído" : "Não Concluído"}
                  </Button>
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
