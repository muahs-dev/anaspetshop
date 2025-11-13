import { useEffect, useState } from "react";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { InstallPWA } from "@/components/InstallPWA";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { registerServiceWorker } from "@/utils/registerSW";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Appointments from "./pages/Appointments";
import Financial from "./pages/Financial";
import Auth from "./pages/Auth";
import AccessPending from "./pages/AccessPending";
import UserManagement from "./pages/UserManagement";
import PendingApprovals from "./pages/PendingApprovals";
import Reminders from "./pages/Reminders";
import Pets from "./pages/Pets";
import PetExpenses from "./pages/PetExpenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { role, loading: roleLoading } = useUserRole();

  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  // Admin e Staff veem o dashboard administrativo
  if (role === "admin" || role === "staff") {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b px-4 bg-background">
              <SidebarTrigger />
              <ThemeToggle />
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDetails />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/pet-expenses" element={<PetExpenses />} />
                <Route path="/creche/lembretes" element={<Reminders />} />
                {role === "admin" && (
                  <>
                    <Route path="/pending-approvals" element={<PendingApprovals />} />
                    <Route path="/users" element={<UserManagement />} />
                  </>
                )}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Usuário sem role definido
  return (
    <Routes>
      <Route path="/" element={<AccessPending />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          
          <Sonner />
          <InstallPWA />
          {!user ? (
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          ) : (
            <AuthenticatedApp />
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
