import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Financial = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientsWithTransactions();
  }, []);

  const fetchClientsWithTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select(`
        *,
        transactions(
          id,
          payment_status,
          amount
        )
      `)
      .order("full_name", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar dados financeiros");
      console.error(error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const getClientStatus = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) return "Em dia";
    const hasPending = transactions.some((t) => t.payment_status === "Pendente");
    return hasPending ? "Pendente" : "Em dia";
  };

  const getTotalPending = (transactions: any[]) => {
    if (!transactions) return 0;
    return transactions
      .filter((t) => t.payment_status === "Pendente")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie pagamentos e cobranças</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const status = getClientStatus(client.transactions);
            const totalPending = getTotalPending(client.transactions);

            return (
              <Card
                key={client.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/financial/${client.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.full_name}</CardTitle>
                    <Badge variant={status === "Em dia" ? "default" : "destructive"}>
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Telefone:</span> {client.phone}
                    </p>
                    {totalPending > 0 && (
                      <p className="text-sm font-medium text-destructive">
                        Valor Pendente: R$ {totalPending.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {client.transactions?.length || 0} transação(ões)
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredClients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum cliente encontrado
        </div>
      )}
    </div>
  );
};

export default Financial;
