// src/pages/FactoresPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTableFactores } from "@/components/factores/table/data-table";
import { getColumns } from "@/components/factores/table/columns";
import supabase from "@/utils/supabaseClient";
import { type Factor, FactorTipo } from "@/utils/types";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function FactoresPage() {
    const [data, setData] = useState<Factor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState<Factor | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    const [deleting, setDeleting] = useState<Factor | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deletingLoading, setDeletingLoading] = useState(false);

    const fetchFactores = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data: rows, error } = await supabase
            .from("factorriesgo")
            .select("idfactor, descripcion, categoria")
            .order("descripcion", { ascending: true });

        if (error) setError(error.message);
        else setData((rows ?? []) as Factor[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFactores();
    }, [fetchFactores]);

    const handleEdit = useCallback((registro: Factor) => {
        setEditing(registro);
    }, []);

    const handleDelete = useCallback((registro: Factor) => {
        setDeleting(registro);
        setDeleteDialog(true);
    }, []);

    const columns = useMemo(
        () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    const handleSaveEdit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!editing) return;

            const form = new FormData(e.currentTarget);
            const descripcion = String(form.get("descripcion") ?? "").trim();
            const categoria = String(form.get("categoria") ?? "").trim();

            if (!descripcion || !categoria) return;

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

            setEditing(null);
        },
        [editing]
    );

    const confirmDelete = useCallback(async () => {
        if (!deleting) return;

        setDeletingLoading(true);

        const prev = data;

        setData((d) => d.filter((x) => x.idfactor !== deleting.idfactor));

        const { error } = await supabase
            .from("factorriesgo")
            .delete()
            .eq("idfactor", deleting.idfactor);

        setDeletingLoading(false);
        setDeleteDialog(false);
        setDeleting(null);

        if (error) {
            setData(prev);
            alert("No se pudo eliminar: " + error.message);
        }
    }, [deleting, data]);

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Factores de riesgo</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFactores} disabled={loading}>
            {loading ? "Cargando…" : "Refrescar"}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">Error: {error}</div> : null}

      <DataTableFactores columns={columns} data={data} onRefresh={fetchFactores} />

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
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={editing?.descripcion ?? ""}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                name="categoria"
                defaultValue={editing?.categoria ?? undefined}
              >
                <SelectTrigger id="categoria">
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

      <Dialog
        open={deleteDialog}
        onOpenChange={(open) => {
            if (!open) {
            setDeleteDialog(false);
            setDeleting(null);
            }
        }}
        >
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Eliminar factor</DialogTitle>
            <DialogDescription>
                Esta acción no se puede deshacer. Se eliminará el factor de manera permanente.
            </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 pt-1">
            <p className="text-sm">Confirma que deseas eliminar:</p>
            <div className="rounded-md border p-3 text-sm">
                <div><span className="font-medium">Descripción:</span> {deleting?.descripcion}</div>
                <div><span className="font-medium">Categoría:</span> {deleting?.categoria}</div>
            </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
            <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialog(false)}
                disabled={deletingLoading}
            >
                Cancelar
            </Button>
            <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletingLoading}
            >
                {deletingLoading ? "Eliminando…" : "Eliminar"}
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    </main>
  );
}
