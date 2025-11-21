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
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { useState, useCallback, useEffect } from "react";
import supabase from "@/utils/supabaseClient";
import type { MateriaConCarrera } from "@/utils/types";
import { useSession } from "@/context/SessionContext";
import ErrorMessage from "../ErrorMessage";

type Carrera = { idcarrera: string; nombre: string };

type EditMateriaDialogProps = {
  editing: MateriaConCarrera | null;
  setEditing: (m: MateriaConCarrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<MateriaConCarrera[]>>;
};

export function EditMateriaDialog({ editing, setEditing, setData }: EditMateriaDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carrerasLoading, setCarrerasLoading] = useState(false);

  const [carreraId, setCarreraId] = useState<string>("");
  const [semestre, setSemestre] = useState<number>(1);

  const [lockCarrera, setLockCarrera] = useState<boolean>(false);
  const [lockCheckLoading, setLockCheckLoading] = useState<boolean>(false);

  const { docente } = useSession();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCarrerasLoading(true);
      const { data, error } = await supabase
        .from("carrera")
        .select("idcarrera, nombre")
        .order("nombre", { ascending: true });

      if (!mounted) return;
      if (!error) setCarreras((data ?? []) as Carrera[]);
      setCarrerasLoading(false);
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (editing?.idcarrera) setCarreraId(String(editing.idcarrera));
    else setCarreraId("");

    if (editing?.semestre) setSemestre(Number(editing.semestre));
  }, [editing]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!editing?.idmateria) { 
        if (mounted) setLockCarrera(false);
        return;
      }

      setLockCheckLoading(true);
      const { count, error } = await supabase
        .from("calificacionasistencia")
        .select("*", { count: "exact", head: true })
        .eq("idmateria", editing.idmateria);

      if (!mounted) return;

      if (error) {
        setLockCarrera(true);
        setError(prev => prev ?? "No se pudo verificar calificaciones de la materia.");
      } else {
        setLockCarrera((count ?? 0) > 0);
      }
      setLockCheckLoading(false);
    })();

    return () => { mounted = false; };
  }, [editing?.idmateria]);

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editing) return;

      const form = new FormData(e.currentTarget);
      const nombre = String(form.get("nombre") ?? "").trim();
      const idcarrera = String(form.get("idcarrera") ?? "").trim();
      const cantidadunidades = String(form.get("cantidadunidades") ?? "").trim();

      if (!nombre) {
        setError("Debes de indicar un nombre.");
        return;
      }

      if (!semestre) {
        setError("Debes de indicar un semestre.")
        return;
      }

      if (!idcarrera) {
        setError("Debes de indicar una carrera.")
        return;
      }

      if (lockCarrera && idcarrera !== String(editing.idcarrera)) {
        setError("No puedes cambiar la carrera o el semestre porque esta materia ya tiene calificaciones registradas.");
        return;
      }

      setSaving(true);
      const { error } = await supabase
        .from("materia")
        .update({ nombre, semestre, idcarrera, cantidadunidades, usuariomodifico: docente?.iddocente, fechamodificacion: new Date().toISOString() })
        .eq("idmateria", editing.idmateria);

      setSaving(false);

      if (error) {
        setError(error.message);
        return;
      }

      setData((prev) =>
        prev.map((m) =>
          m.idmateria === editing.idmateria
            ? { ...m, nombre, semestre: semestre, idcarrera }
            : m
        )
      );

      setEditing(null);
    },
    [editing, setEditing, setData, semestre, lockCarrera]
  );

  const totalSemestres =
  (Array.isArray(editing?.carrera)
    ? editing?.carrera[0]?.cantidadsemestres
    : editing?.carrera?.cantidadsemestres) ?? 0;

  return (
    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
      <DialogContent>
        <form onSubmit={handleSaveEdit}>
          <DialogHeader>
            <DialogTitle>Editar materia</DialogTitle>
            <DialogDescription>
              Actualiza la información de la materia seleccionada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la materia</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={editing?.nombre ?? ""}
                placeholder="Ej. Programación"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="semestre">Semestre</Label>
              <Select
                defaultValue={editing ? String(editing.semestre) : ""}
                onValueChange={(value) => setSemestre(Number(value))}
                disabled={lockCarrera || lockCheckLoading}
              >
                <SelectTrigger id="semestre">
                  <SelectValue placeholder="Selecciona un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalSemestres }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre">Cantidad de unidades</Label>
              <Input
                id="cantidadunidades"
                name="cantidadunidades"
                defaultValue={editing?.cantidadunidades ?? 3}
                type="number"
                min={1}
                disabled={lockCarrera || lockCheckLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="idcarrera">Carrera</Label>
              <Select
                value={carreraId}
                onValueChange={setCarreraId}
                disabled={carrerasLoading || lockCarrera || lockCheckLoading}
              >
                <SelectTrigger id="idcarrera">
                  <SelectValue
                    placeholder={
                      carrerasLoading
                        ? "Cargando carreras..."
                        : lockCheckLoading
                        ? "Verificando calificaciones…"
                        : "Selecciona una carrera"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {carreras.map((c) => (
                    <SelectItem key={c.idcarrera} value={c.idcarrera}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="idcarrera" value={carreraId} />
              {lockCarrera && (
                <p className="text-xs text-muted-foreground">
                  Esta materia ya tiene calificaciones registradas; no es posible cambiar la carrera, semestre o cantidad de unidades.
                </p>
              )}
            </div>
          </div>

          <ErrorMessage message={error} />

          <DialogFooter className="mt-4 flex gap-2">
            <Button type="submit" disabled={saving || !carreraId}>
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