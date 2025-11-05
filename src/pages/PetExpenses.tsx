import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import NewPetExpenseDialog from "@/components/NewPetExpenseDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetExpense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  category: string | null;
  pets: {
    name: string;
  };
}

export default function PetExpenses() {
  const [expenses, setExpenses] = useState<PetExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pet_expenses")
      .select(`
        *,
        pets (
          name
        )
      `)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gastos da Pet</h1>
        <NewPetExpenseDialog onSuccess={fetchExpenses} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum gasto registrado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.expense_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{expense.pets?.name}</TableCell>
                    <TableCell>{expense.category || "-"}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">
                      R$ {Number(expense.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
