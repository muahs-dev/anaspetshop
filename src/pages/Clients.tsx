import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NewClientDialog } from "@/components/NewClientDialog";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*, pets(count)")
      .order("full_name", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar clientes");
      console.error(error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes & Pets</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e seus pets</p>
        </div>
        <NewClientDialog onClientAdded={fetchClients} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{client.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Telefone:</span> {client.phone}
                </p>
                {client.email && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Email:</span> {client.email}
                  </p>
                )}
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium text-primary">
                    {client.pets?.[0]?.count || 0} Pet(s)
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
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

export default Clients;
