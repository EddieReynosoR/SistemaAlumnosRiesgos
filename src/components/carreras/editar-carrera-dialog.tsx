import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import supabase from "@/utils/supabaseClient";
import type { Carrera } from "@/utils/types";

type EditCarreraDialog = {
  editing: Carrera | null;
  setEditing: (m: Carrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<Carrera[]>>;
};

export function EditCarreraDialog({ editing, setEditing, setData }: EditCarreraDialog) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editing) return;

      const form = new FormData(e.currentTarget);
      const nombre = String(form.get("nombre") ?? "").trim();

      if (!nombre) return;

      setSaving(true);
      const { error } = await supabase
        .from("materia")
        .update({ nombre })
        .eq("idmateria", editing.idcarrera);

      setSaving(false);

      if (error) {
        setError(error.message);
        return;
      }

      setData((prev) =>
        prev.map((c) =>
          c.idcarrera === editing.idcarrera ? { ...c, nombre } : c
        )
      );

      setEditing(null);
    },
    [editing, setEditing, setData]
  );

  return (
    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
      <DialogContent>
        <form onSubmit={handleSaveEdit}>
          <DialogHeader>
            <DialogTitle>Editar carrera</DialogTitle>
            <DialogDescription>
              Actualiza el nombre de la carrera seleccionada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la carrera</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={editing?.nombre ?? ""}
                placeholder="Ej. Programación"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
