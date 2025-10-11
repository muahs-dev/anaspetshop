import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface NewClientDialogProps {
  onClientAdded?: () => void;
}

export const NewClientDialog = ({ onClientAdded }: NewClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    emergency_contact: "",
    pet_name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    setLoading(true);

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .insert([{
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        emergency_contact: formData.emergency_contact,
      }])
      .select()
      .single();

    if (clientError) {
      toast.error("Erro ao cadastrar cliente");
      console.error(clientError);
      setLoading(false);
      return;
    }

    // Se tem nome do pet, cadastrar o pet também
    if (formData.pet_name && clientData) {
      const { error: petError } = await supabase
        .from("pets")
        .insert([{
          name: formData.pet_name,
          client_id: clientData.id,
        }]);

      if (petError) {
        toast.error("Cliente cadastrado, mas erro ao cadastrar pet");
        console.error(petError);
      }
    }

    toast.success("Cliente cadastrado com sucesso!");
    setFormData({ full_name: "", phone: "", email: "", emergency_contact: "", pet_name: "" });
    setOpen(false);
    onClientAdded?.();

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Contato de Emergência</Label>
            <Input
              id="emergency_contact"
              type="tel"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet_name">Nome do Pet</Label>
            <Input
              id="pet_name"
              value={formData.pet_name}
              onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
