import { Home, Users, Calendar, DollarSign, LogOut, Dog, UserCog, Instagram, MessageCircle, ChevronDown, Bell, UserCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const baseMenuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agendamentos", url: "/appointments", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useUserRole();
  const currentPath = location.pathname;
  const [pendingCount, setPendingCount] = useState(0);

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPendingCount = async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id");

        if (profilesError) throw profilesError;

        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id");

        if (rolesError) throw rolesError;

        const rolesSet = new Set(roles?.map(r => r.user_id) || []);
        const pending = profiles?.filter(p => !rolesSet.has(p.id)) || [];
        
        setPendingCount(pending.length);
      } catch (error) {
        console.error("Erro ao buscar usuários pendentes:", error);
      }
    };

    fetchPendingCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("profiles-sidebar")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchPendingCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const menuItems = baseMenuItems;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Você saiu com sucesso");
      navigate("/auth");
    }
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <Dog className="h-8 w-8 text-primary" />
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                ANASPETSHOP
              </h1>
              <p className="text-xs text-muted-foreground">Petshop & Creche</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="relative py-3">
                    <NavLink to={item.url} className="group">
                      {isActive(item.url) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'font-bold' : ''}`} />
                      {!isCollapsed && <span className={isActive(item.url) ? 'font-semibold' : ''}>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <Collapsible defaultOpen={true} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <span>Clientes</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/clients")} className="relative py-3">
                      <NavLink to="/clients">
                        {isActive("/clients") && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <Users className={`h-4 w-4 ${isActive("/clients") ? 'font-bold' : ''}`} />
                        {!isCollapsed && <span className={isActive("/clients") ? 'font-semibold' : ''}>Clientes & Pets</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/pets")} className="relative py-3">
                      <NavLink to="/pets">
                        {isActive("/pets") && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <Dog className={`h-4 w-4 ${isActive("/pets") ? 'font-bold' : ''}`} />
                        {!isCollapsed && <span className={isActive("/pets") ? 'font-semibold' : ''}>Pets</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Separator className="my-2" />

        <Collapsible defaultOpen={true} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <span>Financeiro</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/financial")} className="relative py-3">
                      <NavLink to="/financial">
                        {isActive("/financial") && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <DollarSign className={`h-4 w-4 ${isActive("/financial") ? 'font-bold' : ''}`} />
                        {!isCollapsed && <span className={isActive("/financial") ? 'font-semibold' : ''}>Pagamentos Clientes</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/pet-expenses")} className="relative py-3">
                      <NavLink to="/pet-expenses">
                        {isActive("/pet-expenses") && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <DollarSign className={`h-4 w-4 ${isActive("/pet-expenses") ? 'font-bold' : ''}`} />
                        {!isCollapsed && <span className={isActive("/pet-expenses") ? 'font-semibold' : ''}>Gastos da Pet</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Separator className="my-2" />

        <Collapsible defaultOpen={true} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <span>Creche</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/creche/lembretes")} className="relative py-3">
                      <NavLink to="/creche/lembretes">
                        {isActive("/creche/lembretes") && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <Bell className={`h-4 w-4 ${isActive("/creche/lembretes") ? 'font-bold' : ''}`} />
                        {!isCollapsed && <span className={isActive("/creche/lembretes") ? 'font-semibold' : ''}>Lembretes</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Separator className="my-2" />

        {isAdmin && (
          <Collapsible defaultOpen={true} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <span>Admin</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/pending-approvals")} className="relative py-3">
                        <NavLink to="/pending-approvals" className="flex items-center justify-between w-full">
                          {isActive("/pending-approvals") && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                          )}
                          <div className="flex items-center gap-2">
                            <UserCheck className={`h-4 w-4 ${isActive("/pending-approvals") ? 'font-bold' : ''}`} />
                            {!isCollapsed && <span className={isActive("/pending-approvals") ? 'font-semibold' : ''}>Aprovação de Usuários</span>}
                          </div>
                          {!isCollapsed && pendingCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {pendingCount}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/users")} className="relative py-3">
                        <NavLink to="/users">
                          {isActive("/users") && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                          )}
                          <UserCog className={`h-4 w-4 ${isActive("/users") ? 'font-bold' : ''}`} />
                          {!isCollapsed && <span className={isActive("/users") ? 'font-semibold' : ''}>Gerenciar Usuários</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        <Separator className="my-2" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contato</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => window.open("https://wa.me/5571992409363", "_blank")} className="py-3">
                  <MessageCircle className="h-4 w-4" />
                  {!isCollapsed && <span>WhatsApp</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => window.open("https://www.instagram.com/marieanapetshop/", "_blank")} className="py-3">
                  <Instagram className="h-4 w-4" />
                  {!isCollapsed && <span>Instagram</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="py-3 text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
