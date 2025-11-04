import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PetExpenses() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gastos da Pet</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Gasto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum gasto registrado ainda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
