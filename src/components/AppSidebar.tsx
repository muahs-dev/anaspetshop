import { Home, Users, Calendar, DollarSign, LogOut, Dog, UserCog, Instagram, MessageCircle } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
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

const baseMenuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Clientes & Pets", url: "/clients", icon: Users },
  { title: "Agendamentos", url: "/appointments", icon: Calendar },
  { title: "Financeiro", url: "/financial", icon: DollarSign },
];

const adminMenuItems = [
  { title: "Gerenciar Usuários", url: "/users", icon: UserCog },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useUserRole();
  const currentPath = location.pathname;

  // Only admins see the admin menu items
  const menuItems = isAdmin 
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

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
              <p className="text-xs text-muted-foreground">Gestão de Creche</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Contato</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => window.open("https://wa.me/5571992409363", "_blank")}>
                  <MessageCircle className="h-4 w-4" />
                  {!isCollapsed && <span>WhatsApp</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => window.open("https://www.instagram.com/marieanapetshop/", "_blank")}>
                  <Instagram className="h-4 w-4" />
                  {!isCollapsed && <span>Instagram</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
