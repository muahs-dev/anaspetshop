import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { NewAppointmentDialog } from "@/components/NewAppointmentDialog";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos da creche</p>
        </div>
        <NewAppointmentDialog onAppointmentAdded={fetchAppointments} />
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="pointer-events-auto"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
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
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {appointment.pets?.photo_url ? (
                        <img
                          src={appointment.pets.photo_url}
                          alt={appointment.pets.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg">🐕</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{appointment.pets?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.pets?.clients?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
