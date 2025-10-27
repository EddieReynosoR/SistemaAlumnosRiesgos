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
import type { Materia } from "@/utils/types";

type Carrera = { idcarrera: string; nombre: string };

type EditMateriaDialogProps = {
  editing: Materia | null;
  setEditing: (m: Materia | null) => void;
  setData: React.Dispatch<React.SetStateAction<Materia[]>>;
};

export function EditMateriaDialog({ editing, setEditing, setData }: EditMateriaDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carrerasLoading, setCarrerasLoading] = useState(false);
  const [carreraId, setCarreraId] = useState<string>("");
  const [semestre, setSemestre] = useState<number>(1);

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
  }, [editing]);

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editing) return;

      const form = new FormData(e.currentTarget);
      const nombre = String(form.get("nombre") ?? "").trim();
      const idcarrera = String(form.get("idcarrera") ?? "").trim();

      if (!nombre || !semestre || !idcarrera) return;

      setSaving(true);
      const { error } = await supabase
        .from("materia")
        .update({ nombre, semestre: semestre, idcarrera })
        .eq("idmateria", editing.idmateria);

      setSaving(false);

      if (error) {
        setError(error.message);
        return;
      }

      setData((prev) =>
        prev.map((m) =>
          m.idmateria === editing.idmateria ? { ...m, nombre, semestre: semestre, idcarrera } : m
        )
      );

      setEditing(null);
    },
    [editing, setEditing, setData, semestre]
  );

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
                onValueChange={(value) => setSemestre(Number(value)) }
              >
                <SelectTrigger id="semestre">
                  <SelectValue placeholder="Selecciona un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="idcarrera">Carrera</Label>
              <Select
                value={carreraId}
                onValueChange={setCarreraId}
                disabled={carrerasLoading}
              >
                <SelectTrigger id="idcarrera">
                  <SelectValue placeholder={carrerasLoading ? "Cargando carreras..." : "Selecciona una carrera"} />
                </SelectTrigger>
                <SelectContent>
                  {carreras.map((c) => (
                    <SelectItem key={c.idcarrera} value={c.idcarrera}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Hidden para FormData */}
              <input type="hidden" name="idcarrera" value={carreraId} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
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
