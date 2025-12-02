import { useEffect } from "react";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { InstallPWA } from "@/components/InstallPWA";
import { registerServiceWorker } from "@/utils/registerSW";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Appointments from "./pages/Appointments";
import Financial from "./pages/Financial";
import UserManagement from "./pages/UserManagement";
import PendingApprovals from "./pages/PendingApprovals";
import Reminders from "./pages/Reminders";
import Pets from "./pages/Pets";
import PetExpenses from "./pages/PetExpenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <InstallPWA />
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
                    <Route path="/pending-approvals" element={<PendingApprovals />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
