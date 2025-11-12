import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, History } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  has_role: boolean;
}

interface ApprovalHistory {
  id: string;
  user_email: string;
  user_name: string;
  action: string;
  assigned_role: string | null;
  approved_by_email: string;
  created_at: string;
}

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingUsers = async () => {
    try {
      // Buscar todos os profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar todas as roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Filtrar usuários sem role (pendentes)
      const rolesMap = new Set(roles?.map(r => r.user_id) || []);
      const pending = profiles?.filter(p => !rolesMap.has(p.id)) || [];

      setPendingUsers(pending.map(p => ({
        ...p,
        has_role: false
      })));
    } catch (error) {
      console.error("Erro ao buscar usuários pendentes:", error);
      toast.error("Erro ao carregar usuários pendentes");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("approval_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setApprovalHistory(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchApprovalHistory();

    // Realtime subscription for new users
    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchPendingUsers();
          toast.info("Novo usuário aguardando aprovação!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (userId: string, role: string) => {
    try {
      const user = pendingUsers.find(u => u.id === userId);
      if (!user) return;

      // Get current admin info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Insert role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as any });

      if (roleError) throw roleError;

      // Record in history
      const { error: historyError } = await supabase
        .from("approval_history")
        .insert({
          user_id: userId,
          user_email: user.email,
          user_name: user.full_name,
          action: "approved",
          assigned_role: role as "admin" | "staff" | "client",
          approved_by: currentUser.id,
          approved_by_email: currentUser.email || "",
        });

      if (historyError) throw historyError;

      toast.success("Usuário aprovado com sucesso!");
      fetchPendingUsers();
      fetchApprovalHistory();
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      toast.error("Erro ao aprovar usuário");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const user = pendingUsers.find(u => u.id === userId);
      if (!user) return;

      // Get current admin info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Record in history before deletion
      const { error: historyError } = await supabase
        .from("approval_history")
        .insert({
          user_id: userId,
          user_email: user.email,
          user_name: user.full_name,
          action: "rejected",
          assigned_role: null,
          approved_by: currentUser.id,
          approved_by_email: currentUser.email || "",
        });

      if (historyError) throw historyError;

      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast.success("Usuário rejeitado");
      fetchPendingUsers();
      fetchApprovalHistory();
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error);
      toast.error("Erro ao rejeitar usuário");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Aprovação de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os novos usuários que aguardam aprovação para acessar o sistema
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
            {pendingUsers.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">Nenhum usuário pendente</p>
                  <p className="text-muted-foreground">
                    Todos os usuários foram aprovados ou rejeitados
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {user.full_name || "Sem nome"}
                          <Badge variant="outline" className="ml-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cadastrado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">
                          Selecione o papel do usuário:
                        </label>
                        <Select
                          onValueChange={(value) => handleApprove(user.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Escolher papel..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Cliente</SelectItem>
                            <SelectItem value="staff">Funcionário</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleReject(user.id)}
                        className="mt-6"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aprovações</CardTitle>
              <CardDescription>
                Registro de todas as aprovações e rejeições de usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvalHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum registro de aprovação ainda
                </div>
              ) : (
                <div className="space-y-4">
                  {approvalHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{record.user_name}</p>
                          <Badge
                            variant={record.action === "approved" ? "default" : "destructive"}
                          >
                            {record.action === "approved" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprovado
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeitado
                              </>
                            )}
                          </Badge>
                          {record.assigned_role && (
                            <Badge variant="outline">
                              {record.assigned_role === "admin"
                                ? "Administrador"
                                : record.assigned_role === "staff"
                                ? "Funcionário"
                                : "Cliente"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{record.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Por: {record.approved_by_email}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
