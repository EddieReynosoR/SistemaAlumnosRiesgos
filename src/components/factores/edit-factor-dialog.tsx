import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useState, useCallback } from "react";

import { type Factor, FactorTipo } from "@/utils/types";

import supabase from "@/utils/supabaseClient";

import { toast } from "sonner";

type EditFactorDialog = {
  editing: Factor | null;
  setEditing: (m: Factor | null) => void;
  setData: React.Dispatch<React.SetStateAction<Factor[]>>;
};

export default function EditFactorDialog({ editing, setEditing, setData }: EditFactorDialog) {
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSaveEdit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!editing) return;

            const form = new FormData(e.currentTarget);
            const descripcion = String(form.get("descripcion") ?? "").trim();
            const categoria = String(form.get("categoria") ?? "").trim();

            if (!categoria) {
              setError("Debes de seleccionar una categoria.");
              return;
            }

            if (!descripcion) {
              setError("Debes de indicar una descripción.");
              return;
            }

            setSaving(true);
            const { error } = await supabase
            .from("factorriesgo")
            .update({ descripcion, categoria })
            .eq("idfactor", editing.idfactor);

            setSaving(false);

            if (error) {
            setError(error.message);
            return;
            }

            setData((prev) =>
            prev.map((f) =>
                f.idfactor === editing.idfactor ? { ...f, descripcion, categoria: f.categoria as FactorTipo } : f
            )
            );

            toast.success("Se eliminó el factor de forma correcta.");
            setEditing(null);
        },
        [editing]
    );

    return (
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar factor</DialogTitle>
            <DialogDescription>
              Actualiza la descripción o categoría del factor y guarda los cambios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="grid gap-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                name="categoria"
                defaultValue={editing?.categoria ?? undefined}
              >
                <SelectTrigger id="categoria" className="w-full">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FactorTipo).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={editing?.descripcion ?? ""}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
}