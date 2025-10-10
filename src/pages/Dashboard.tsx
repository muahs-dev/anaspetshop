import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const [stats, setStats] = useState({
    dogsPresent: 0,
    upcomingCheckIns: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    // Dogs present today
    const { data: presentDogs } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", today)
      .eq("status", "Presente");

    // Upcoming check-ins today
    const { data: upcoming } = await supabase
      .from("appointments")
      .select("*, pets(name, clients(full_name))")
      .eq("appointment_date", today)
      .eq("status", "Agendado")
      .order("created_at", { ascending: true })
      .limit(5);

    setStats({
      dogsPresent: presentDogs?.length || 0,
      upcomingCheckIns: upcoming?.length || 0,
    });

    setUpcomingAppointments(upcoming || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao sistema de gestão da ANASPETSHOP</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cães Presentes Hoje</CardTitle>
            <Dog className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dogsPresent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Check-ins</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingCheckIns}</div>
            <p className="text-xs text-muted-foreground">Para hoje</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Check-ins de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum check-in pendente</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{appointment.pets?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.pets?.clients?.full_name}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {appointment.service_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
