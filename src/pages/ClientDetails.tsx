import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    emergency_contact: "",
  });

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const fetchClientDetails = async () => {
    setLoading(true);
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientError) {
      toast.error("Erro ao carregar dados do cliente");
      console.error(clientError);
      navigate("/clients");
      return;
    }

    const { data: petsData, error: petsError } = await supabase
      .from("pets")
      .select("*")
      .eq("client_id", id);

    if (petsError) {
      console.error(petsError);
    }

    setClient(clientData);
    setPets(petsData || []);
    setFormData({
      full_name: clientData.full_name,
      phone: clientData.phone,
      emergency_contact: clientData.emergency_contact || "",
    });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        emergency_contact: formData.emergency_contact,
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar alterações");
      console.error(error);
    } else {
      toast.success("Cliente atualizado com sucesso!");
      fetchClientDetails();
    }
    setSaving(false);
  };

  const handleDeletePet = async (petId: string) => {
    const { error } = await supabase.from("pets").delete().eq("id", petId);

    if (error) {
      toast.error("Erro ao excluir pet");
      console.error(error);
    } else {
      toast.success("Pet excluído com sucesso");
      fetchClientDetails();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Editar Cliente</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie informações do cliente e seus pets
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Contato de Emergência</Label>
            <Input
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact: e.target.value })
              }
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pets do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {pets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pet cadastrado</p>
          ) : (
            <div className="space-y-3">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{pet.name}</p>
                    {pet.breed && (
                      <p className="text-sm text-muted-foreground">{pet.breed}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Pet</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir {pet.name}? Esta ação não
                          pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePet(pet.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetails;
