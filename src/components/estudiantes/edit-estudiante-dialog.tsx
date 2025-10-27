import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCallback, useState, useEffect } from "react";

import supabase from "@/utils/supabaseClient";

import type { EstudianteConCarrera, Carrera } from "@/utils/types";

type EditEstudianteDialog = {
  editing: EstudianteConCarrera | null;
  setEditing: (m: EstudianteConCarrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<EstudianteConCarrera[]>>;
};

export default function EditEstudianteDialog({ editing, setEditing, setData }: EditEstudianteDialog) {
    const [saving, setSaving] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        const [carreras, setCarreras] = useState<Carrera[]>([]);
          const [carrerasLoading, setCarrerasLoading] = useState(false);
          const [carreraId, setCarreraId] = useState<string>("");

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
      setSaving(true);

      const form = new FormData(e.currentTarget);

      const payload = {
        numerocontrol: String(form.get("numerocontrol") ?? "").trim(),
        nombre: String(form.get("nombre") ?? "").trim(),
        apellidopaterno: String(form.get("apellidopaterno") ?? "").trim(),
        apellidomaterno: String(form.get("apellidomaterno") ?? "").trim(),
        semestre: Number(form.get("semestre") ?? editing.semestre),
        idcarrera: String(form.get("idcarrera") ?? "").trim()
      };

      const { error } = await supabase
        .from("estudiante")
        .update(payload)
        .eq("idestudiante", editing.idestudiante);

      setSaving(false);

      if (error) {
        setError(error.message);
        return;
      }

      setData((rows) =>
        rows.map((r) =>
          r.idestudiante === editing.idestudiante ? { ...r, ...payload } : r
        )
      );
      setEditing(null);
    },
    [editing]
  );

    return (
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
              <input type="hidden" name="idcarrera" value={carreraId} />
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