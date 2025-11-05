import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Dog, Pencil } from "lucide-react";
import EditPetDialog from "@/components/EditPetDialog";

interface Pet {
  id: string;
  name: string;
  breed: string;
  birth_date: string;
  sex: string;
  size: string;
  photo_url: string | null;
  client_id: string;
  clients: {
    full_name: string;
  };
}

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pets")
      .select(`
        *,
        clients (
          full_name
        )
      `)
      .order("name");

    if (error) {
      console.error("Error fetching pets:", error);
    } else {
      setPets(data || []);
    }
    setLoading(false);
  };

  const filteredPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pets</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar pets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Dog className="h-5 w-5" />
                  {pet.name}
                </CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingPet(pet);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Tutor:</strong> {pet.clients?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Raça:</strong> {pet.breed || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Sexo:</strong> {pet.sex || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Porte:</strong> {pet.size || "N/A"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredPets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum pet encontrado
        </div>
      )}

      <EditPetDialog
        pet={editingPet}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchPets}
      />
    </div>
  );
}
