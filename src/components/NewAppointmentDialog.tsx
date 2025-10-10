import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewAppointmentDialogProps {
  onAppointmentAdded?: () => void;
}

export const NewAppointmentDialog = ({ onAppointmentAdded }: NewAppointmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<Date>();

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  useEffect(() => {
    if (selectedClient) {
      fetchPets(selectedClient);
    } else {
      setPets([]);
      setSelectedPet("");
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, full_name")
      .order("full_name");

    if (error) {
      toast.error("Erro ao carregar clientes");
    } else {
      setClients(data || []);
    }
  };

  const fetchPets = async (clientId: string) => {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name")
      .eq("client_id", clientId)
      .order("name");

    if (error) {
      toast.error("Erro ao carregar pets");
    } else {
      setPets(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPet || !serviceType || !appointmentDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("appointments").insert([
      {
        pet_id: selectedPet,
        service_type: serviceType as "Banho" | "Creche" | "Hotel",
        appointment_date: format(appointmentDate, "yyyy-MM-dd"),
        status: "Agendado" as "Agendado",
      },
    ]);

    if (error) {
      toast.error("Erro ao criar agendamento");
      console.error(error);
    } else {
      toast.success("Agendamento criado com sucesso!");
      resetForm();
      setOpen(false);
      onAppointmentAdded?.();
    }

    setLoading(false);
  };

  const resetForm = () => {
    setSelectedClient("");
    setSelectedPet("");
    setServiceType("");
    setAppointmentDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet">Pet *</Label>
            <Select value={selectedPet} onValueChange={setSelectedPet} disabled={!selectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pet" />
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
            <Label htmlFor="service">Tipo de Serviço *</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Creche">Creche</SelectItem>
                <SelectItem value="Banho">Banho</SelectItem>
                <SelectItem value="Tosa">Tosa</SelectItem>
                <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data do Agendamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? (
                    format(appointmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
