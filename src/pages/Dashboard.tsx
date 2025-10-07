import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog, Calendar, AlertTriangle, DollarSign } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const [stats, setStats] = useState({
    dogsPresent: 0,
    upcomingCheckIns: 0,
    vaccineAlerts: 0,
    monthlyRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [expiringVaccines, setExpiringVaccines] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

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

    // Vaccine alerts (next 30 days)
    const thirtyDaysFromNow = format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    );
    const { data: vaccines } = await supabase
      .from("vaccines")
      .select("*, pets(name, clients(full_name))")
      .lte("expiry_date", thirtyDaysFromNow)
      .gte("expiry_date", today)
      .order("expiry_date", { ascending: true })
      .limit(5);

    // Monthly revenue
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("payment_status", "Pago")
      .gte("charge_date", monthStart)
      .lte("charge_date", monthEnd);

    const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    setStats({
      dogsPresent: presentDogs?.length || 0,
      upcomingCheckIns: upcoming?.length || 0,
      vaccineAlerts: vaccines?.length || 0,
      monthlyRevenue: totalRevenue,
    });

    setUpcomingAppointments(upcoming || []);
    setExpiringVaccines(vaccines || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao sistema de gestão da ANASPETSHOP</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Vacinas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.vaccineAlerts}</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent text-accent-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {stats.monthlyRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Vacinas</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringVaccines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma vacina próxima do vencimento</p>
            ) : (
              <div className="space-y-4">
                {expiringVaccines.map((vaccine) => (
                  <div
                    key={vaccine.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{vaccine.pets?.name}</p>
                      <p className="text-sm text-muted-foreground">{vaccine.vaccine_name}</p>
                    </div>
                    <span className="text-sm font-medium text-warning">
                      {format(new Date(vaccine.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
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

export default Dashboard;
