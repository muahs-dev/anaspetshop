import { Home, Users, Calendar, DollarSign, Dog, UserCog, ChevronDown, Bell, UserCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

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
              {baseMenuItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
