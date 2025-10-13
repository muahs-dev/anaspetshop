import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Scissors, Bath, Home as HomeIcon, Instagram, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ClientDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Você saiu com sucesso");
      navigate("/auth");
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/5571992409363", "_blank");
  };

  const handleInstagram = () => {
    window.open("https://www.instagram.com/marieanapetshop/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Marie & Ana Pet Shop
            </h1>
          </div>
          <Button onClick={handleLogout} variant="ghost">
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo(a)!</h2>
          <p className="text-muted-foreground text-sm md:text-base">Agende os serviços para seu pet</p>
        </div>

        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Bath className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">Banho</CardTitle>
              <CardDescription className="text-xs md:text-sm">Agende um banho para seu pet</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full text-sm md:text-base">
                <Calendar className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Agendar Banho
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Scissors className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">Tosa</CardTitle>
              <CardDescription className="text-xs md:text-sm">Agende uma tosa para seu pet</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full text-sm md:text-base">
                <Calendar className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Agendar Tosa
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <HomeIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">Creche</CardTitle>
              <CardDescription className="text-xs md:text-sm">Reserve um dia na creche</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full text-sm md:text-base">
                <Calendar className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Reservar Creche
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Entre em Contato</CardTitle>
            <CardDescription className="text-xs md:text-sm">Fale conosco através das nossas redes sociais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button onClick={handleWhatsApp} className="flex-1 text-sm md:text-base" variant="outline">
              <MessageCircle className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              WhatsApp
            </Button>
            <Button onClick={handleInstagram} className="flex-1 text-sm md:text-base" variant="outline">
              <Instagram className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Instagram
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientDashboard;
