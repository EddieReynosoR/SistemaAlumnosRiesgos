import { getColumns } from "@/components/estudiantes/table/columns";
import { DataTable } from "@/components/estudiantes/table/data-table";
import { type Estudiante } from "@/utils/types";
import { useEffect, useCallback, useState, useMemo } from "react";

import supabase from "@/utils/supabaseClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalificacionesDialog } from "@/components/calificaciones/calificaciones-dialog";
import { SeleccionarFactoresDialog } from "@/components/riesgosestudiantes/agregar-riesgo-dialog";

export default function EstudiantesPage() {
  const [data, setData] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Estudiante | null>(null);
  const [deleting, setDeleting] = useState<Estudiante | null>(null);
  const [calificacion, setCalificacion] = useState<Estudiante | null>(null);
  const [factor, setFactor] = useState<Estudiante | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchEstudiantes = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("estudiante")
      .select("idestudiante, numerocontrol, nombre, apellidopaterno, apellidomaterno, semestre")
      .order("idestudiante", { ascending: false });

    if (error) setError(error.message);
    else setData((rows ?? []) as Estudiante[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  const handleDelete = useCallback((est: Estudiante) => {
    setDeleting(est);
    setDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleting) return;
    setDeletingLoading(true);

    const prev = data;
    setData((d) => d.filter((x) => x.idestudiante !== deleting.idestudiante));

    const { error } = await supabase
      .from("estudiante")
      .delete()
      .eq("idestudiante", deleting.idestudiante);

    setDeletingLoading(false);
    setDeleting(null);
    setDeleteDialog(false);

    if (error) {
      setData(prev);
      alert("No se pudo eliminar: " + error.message);
    }
  }, [deleting, data]);

  const handleEdit = useCallback((est: Estudiante) => {
    setEditing(est);
  }, []);

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editing) return;
      setSaving(true);

      const form = new FormData(e.currentTarget);
      const payload = {
        numerocontrol: String(form.get("numerocontrol") ?? "").trim(),
        nombre: String(form.get("nombre") ?? "").trim(),
        apellidopaterno: String(form.get("apellidopaterno") ?? "").trim(),
        apellidomaterno: String(form.get("apellidomaterno") ?? "").trim(),
        semestre: Number(form.get("semestre") ?? editing.semestre),
      };

      const { error } = await supabase
        .from("estudiante")
        .update(payload)
        .eq("idestudiante", editing.idestudiante);

      setSaving(false);

      if (error) {
        alert("No se pudo guardar: " + error.message);
        return;
      }

      // Actualiza en memoria sin refetch
      setData((rows) =>
        rows.map((r) =>
          r.idestudiante === editing.idestudiante ? { ...r, ...payload } : r
        )
      );
      setEditing(null);
    },
    [editing]
  );

  const handleCalificacion = useCallback((est: Estudiante) => {
    setCalificacion(est);
  }, []);

  const handleFactor = useCallback((est: Estudiante) => {
    setFactor(est);
  }, []);

  const columns = useMemo(
    () => getColumns({ onFactor: handleFactor, onCalificacion: handleCalificacion, onEdit: handleEdit, onDelete: handleDelete }),
    [handleCalificacion, handleEdit, handleDelete]
  );

  if (loading) return <main className="p-6">Cargando…</main>
  if (error) return <main className="p-6 text-red-600">Error: {error}</main>

  return (
    <main className="container mx-auto py-10">
      <DataTable columns={columns} data={data} globalFilterColumns={["numerocontrol", "nombre"]} onRefresh={fetchEstudiantes} />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estudiante</DialogTitle>
            <DialogDescription>
              Actualiza los datos y guarda los cambios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="grid gap-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="numerocontrol">Número de control</Label>
              <Input
                id="numerocontrol"
                name="numerocontrol"
                defaultValue={editing?.numerocontrol ?? ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={editing?.nombre ?? ""} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellidopaterno">Apellido paterno</Label>
              <Input
                id="apellidopaterno"
                name="apellidopaterno"
                defaultValue={editing?.apellidopaterno ?? ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellidomaterno">Apellido materno</Label>
              <Input
                id="apellidomaterno"
                name="apellidomaterno"
                defaultValue={editing?.apellidomaterno ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semestre">Semestre</Label>
              <Input
                id="semestre"
                name="semestre"
                type="number"
                min={1}
                max={12}
                defaultValue={editing?.semestre ?? 1}
                required
              />
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

      <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar estudiante</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar al estudiante{" "}
              <strong>
                {deleting?.nombre} {deleting?.apellidopaterno}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deletingLoading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingLoading}
            >
              {deletingLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CalificacionesDialog open={!!calificacion} setOpen={(open) => !open && setCalificacion(null)} estudiante={calificacion} />

      <SeleccionarFactoresDialog open={!!factor} setOpen={(open) => !open && setFactor(null)} estudiante={factor} />
    </main>
  )
}
