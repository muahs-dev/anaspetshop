import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserCog } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role?: "admin" | "staff";
  role_id?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role as "admin" | "staff" | undefined,
          role_id: userRole?.id,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "admin" | "staff" | "none", roleId?: string) => {
    try {
      if (newRole === "none") {
        // Remove role
        if (roleId) {
          const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("id", roleId);

          if (error) throw error;
          toast.success("Permissão removida com sucesso");
        }
      } else {
        if (roleId) {
          // Update existing role
          const { error } = await supabase
            .from("user_roles")
            .update({ role: newRole })
            .eq("id", roleId);

          if (error) throw error;
          toast.success("Permissão atualizada com sucesso");
        } else {
          // Insert new role
          const { error } = await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: newRole });

          if (error) throw error;
          toast.success("Permissão concedida com sucesso");
        }
      }

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erro ao atualizar permissão");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="w-8 h-8" />
          Gerenciar Usuários
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as permissões de acesso dos usuários do sistema
        </p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div>
                  <div>{user.full_name || "Sem nome"}</div>
                  <div className="text-sm text-muted-foreground font-normal">{user.email}</div>
                </div>
                {user.role && (
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Administrador" : "Equipe"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select
                  value={user.role || "none"}
                  onValueChange={(value) => 
                    handleRoleChange(user.id, value as "admin" | "staff" | "none", user.role_id)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione uma permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem permissão</SelectItem>
                    <SelectItem value="staff">Equipe</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
