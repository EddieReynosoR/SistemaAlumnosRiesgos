import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCallback, useState, useEffect, useMemo } from "react";
import supabase from "@/utils/supabaseClient";

import type { EstudianteConCarrera, Carrera } from "@/utils/types";

type EditEstudianteDialog = {
  editing: EstudianteConCarrera | null;
  setEditing: (m: EstudianteConCarrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<EstudianteConCarrera[]>>;
};

export default function EditEstudianteDialog({
  editing,
  setEditing,
  setData,
}: EditEstudianteDialog) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carrerasLoading, setCarrerasLoading] = useState(false);
  const [carreraId, setCarreraId] = useState<string>("");
  const [semestre, setSemestre] = useState<number | "">("");

  // Cargar catálogo de carreras
  useEffect(() => {
    let mounted = true;
    (async () => {
      setCarrerasLoading(true);
      const { data, error } = await supabase
        .from("carrera")
        .select("idcarrera, nombre, cantidadsemestres") // ✅ Importante traer cantidadsemestres
        .order("nombre", { ascending: true });

      if (!mounted) return;
      if (!error) setCarreras((data ?? []) as Carrera[]);
      setCarrerasLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (editing?.idcarrera) setCarreraId(String(editing.idcarrera));
    else setCarreraId("");

    setSemestre(editing?.semestre ?? "");
  }, [editing]);

  const maxSemestre = useMemo(() => {
    return (
      carreras.find((c) => c.idcarrera === carreraId)?.cantidadsemestres ?? 12
    );
  }, [carreras, carreraId]);

  useEffect(() => {
    if (semestre === "") return;
    setSemestre((prev) => {
      if (prev === "") return "";
      const v = Number(prev);
      return Math.min(Math.max(v, 1), maxSemestre);
    });
  }, [maxSemestre]);

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editing) return;
      setSaving(true);

      const form = new FormData(e.currentTarget);
      const s = Number(form.get("semestre"));
      if (!s || s < 1 || s > maxSemestre) {
        setError(`El semestre debe estar entre 1 y ${maxSemestre}.`);
        setSaving(false);
        return;
      }

      if (s < editing.semestre) {
      const { count, error: checkError } = await supabase
        .from("materia")
        .select("*", { count: "exact", head: true })
        .eq("idcarrera", carreraId)
        .gt("semestre", s);

      if (checkError) {
        setError("Error verificando materias relacionadas.");
        setSaving(false);
        return;
      }

      if (count && count > 0) {
        setError(
          `No puedes bajar el semestre a ${s} porque existen materias registradas de semestres posteriores (${count} encontradas).`
        );
        setSaving(false);
        return;
      }
    }

      const payload = {
        numerocontrol: String(form.get("numerocontrol") ?? "").trim(),
        nombre: String(form.get("nombre") ?? "").trim(),
        apellidopaterno: String(form.get("apellidopaterno") ?? "").trim(),
        apellidomaterno: String(form.get("apellidomaterno") ?? "").trim(),
        semestre: s,
        idcarrera: carreraId,
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
    [editing, carreraId, maxSemestre, setData, setEditing]
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
            <Input
              id="nombre"
              name="nombre"
              defaultValue={editing?.nombre ?? ""}
              required
            />
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
                <SelectValue
                  placeholder={
                    carrerasLoading
                      ? "Cargando carreras..."
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="semestre">Semestre</Label>
            <Input
              id="semestre"
              name="semestre"
              type="number"
              min={1}
              max={maxSemestre}
              value={semestre}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") return setSemestre("");
                const v = Number(raw);
                if (Number.isNaN(v)) return;
                setSemestre(Math.min(Math.max(v, 1), maxSemestre)); // clamp
              }}
              required
            />
            {carreraId && (
              <p className="text-xs text-muted-foreground">
                Rango permitido: 1 a {maxSemestre}
              </p>
            )}
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
