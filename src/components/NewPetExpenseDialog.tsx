import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Pet {
  id: string;
  name: string;
}

export default function NewPetExpenseDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [formData, setFormData] = useState({
    pet_id: "",
    amount: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
    category: "",
  });

  useEffect(() => {
    if (open) {
      fetchPets();
    }
  }, [open]);

  const fetchPets = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching pets:", error);
    } else {
      setPets(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("pet_expenses").insert({
      pet_id: formData.pet_id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      expense_date: formData.expense_date,
      category: formData.category || null,
    });

    if (error) {
      toast.error("Erro ao registrar gasto");
      console.error(error);
    } else {
      toast.success("Gasto registrado com sucesso!");
      setFormData({
        pet_id: "",
        amount: "",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
        category: "",
      });
      onSuccess();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Gasto da Pet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pet_id">Pet *</Label>
            <Select value={formData.pet_id} onValueChange={(value) => setFormData({ ...formData, pet_id: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">Data *</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: Alimentação, Veterinário, Higiene..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Gasto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
