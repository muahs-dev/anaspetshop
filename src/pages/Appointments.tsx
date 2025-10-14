import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { NewAppointmentDialog } from "@/components/NewAppointmentDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments();
    }
  }, [selectedDate]);

  const fetchAppointments = async () => {
    if (!selectedDate) return;

    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("appointments")
      .select("*, pets(name, photo_url, clients(full_name))")
      .eq("appointment_date", dateStr)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar agendamentos");
      console.error(error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  const handleCheckIn = async (appointmentId: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "Presente" })
      .eq("id", appointmentId);

    if (error) {
      toast.error("Erro ao fazer check-in");
    } else {
      toast.success("Check-in realizado com sucesso!");
      fetchAppointments();
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      toast.error("Erro ao excluir agendamento");
      console.error(error);
    } else {
      toast.success("Agendamento excluído com sucesso!");
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Agendado: "bg-primary",
      Presente: "bg-success",
      Finalizado: "bg-muted",
      Cancelado: "bg-destructive",
    };
    return colors[status] || "bg-muted";
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Agendamentos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie os agendamentos da creche</p>
        </div>
        <NewAppointmentDialog onAppointmentAdded={fetchAppointments} />
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="pointer-events-auto w-full"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-xl">
              Agendamentos para {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum agendamento para esta data
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      {appointment.pets?.photo_url ? (
                        <img
                          src={appointment.pets.photo_url}
                          alt={appointment.pets.name}
                          className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-base md:text-lg">🐕</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{appointment.pets?.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {appointment.pets?.clients?.full_name}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {appointment.service_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {appointment.status === "Agendado" && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(appointment.id)}
                        >
                          Check-in
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
