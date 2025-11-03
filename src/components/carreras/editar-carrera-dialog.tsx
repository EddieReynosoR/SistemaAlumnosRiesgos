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
import { useState, useCallback, useEffect } from "react";
import supabase from "@/utils/supabaseClient";
import type { Carrera } from "@/utils/types";
import { toast } from "sonner";
import { useSession } from "@/context/SessionContext";

type EditCarreraDialog = {
  editing: Carrera | null;
  setEditing: (m: Carrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<Carrera[]>>;
};

export function EditCarreraDialog({ editing, setEditing, setData }: EditCarreraDialog) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materiasCount, setMateriasCount] = useState<number | null>(null);

  const { docente } = useSession();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!editing?.idcarrera) { setMateriasCount(null); return; }
      const { count, error } = await supabase
        .from("materia")
        .select("*", { count: "exact", head: true })
        .eq("idcarrera", editing.idcarrera);

      if (!mounted) return;
      if (error) setError(error.message);
      setMateriasCount(count ?? 0);
    })();
    return () => { mounted = false; };
  }, [editing?.idcarrera]);

  const bloqueada = (materiasCount ?? 0) > 0;

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editing) return;

      if (bloqueada) {
        setError("No puedes editar esta carrera porque tiene materias registradas.");
        return;
      }

      const form = new FormData(e.currentTarget);
      const nombre = String(form.get("nombre") ?? "").trim();
      const cantidadsemestres = String(form.get("cantidadsemestres") ?? "").trim();

      if (!nombre) {
        setError("Debes indicar el nombre para esta carrera.")
        return;
      }

      setSaving(true);
      const { error } = await supabase
        .from("carrera")
        .update({ nombre, cantidadsemestres, usuariomodifico: docente?.iddocente, fechamodificacion: new Date().toISOString() })
        .eq("idcarrera", editing.idcarrera);

      setSaving(false);

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      setData((prev) =>
        prev.map((c) =>
          c.idcarrera === editing.idcarrera ? { ...c, nombre } : c
        )
      );

      console.log("Test")

      toast.success("Se editó la carrera de forma correcta.");

      setEditing(null);     
    },
    [editing, setEditing, setData, bloqueada]
  );

  return (
    <Dialog
      open={!!editing}
      onOpenChange={(open) => {
        if (!open) {
          setEditing(null);
          setError(null);
        }
      }}
    >
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

            <div className="grid gap-2">
              <Label htmlFor="nombre">Cantidad de semestres</Label>
              <Input
                id="cantidadsemestres"
                name="cantidadsemestres"
                min={1}
                max={12}
                type="number"
                defaultValue={editing?.cantidadsemestres}
              />
            </div>
            {materiasCount !== null && (
              <p className="text-xs text-muted-foreground">
                Materias ligadas a esta carrera: {materiasCount}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
