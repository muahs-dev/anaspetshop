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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bem-vindo(a)!</h2>
          <p className="text-muted-foreground">Agende os serviços para seu pet</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Bath className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Banho</CardTitle>
              <CardDescription>Agende um banho para seu pet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Banho
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Tosa</CardTitle>
              <CardDescription>Agende uma tosa para seu pet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Tosa
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <HomeIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Creche</CardTitle>
              <CardDescription>Reserve um dia na creche</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Reservar Creche
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entre em Contato</CardTitle>
            <CardDescription>Fale conosco através das nossas redes sociais</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleWhatsApp} className="flex-1" variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button onClick={handleInstagram} className="flex-1" variant="outline">
              <Instagram className="mr-2 h-4 w-4" />
              Instagram
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientDashboard;
