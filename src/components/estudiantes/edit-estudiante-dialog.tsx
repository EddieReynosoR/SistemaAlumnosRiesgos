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

import { toast } from "sonner";
import { useSession } from "@/context/SessionContext";

type EditEstudianteDialog = {
  editing: EstudianteConCarrera | null;
  setEditing: (m: EstudianteConCarrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<EstudianteConCarrera[]>>;
};

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p
      className={`flex items-center gap-2 text-sm font-bold text-white bg-red-600 px-3 py-2 rounded-md transition-all duration-300 ${
        message ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="white"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {message || " "}
    </p>
  );
}

type FieldErrors = {
  numerocontrol?: string;
  nombre?: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  carrera?: string;
  semestre?: string;
};

export default function EditEstudianteDialog({
  editing,
  setEditing,
  setData,
}: EditEstudianteDialog) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carrerasLoading, setCarrerasLoading] = useState(false);
  const [carreraId, setCarreraId] = useState<string>("");
  const [semestre, setSemestre] = useState<number | "">("");

  const { docente } = useSession();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCarrerasLoading(true);
      const { data, error } = await supabase
        .from("carrera")
        .select("idcarrera, nombre, cantidadsemestres")
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
    setFieldErrors({});
    setError(null);
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
      setError(null);

      const form = new FormData(e.currentTarget);

      const numerocontrol = String(form.get("numerocontrol") ?? "").trim();
      const nombre = String(form.get("nombre") ?? "").trim();
      const apellidopaterno = String(
        form.get("apellidopaterno") ?? ""
      ).trim();
      const apellidomaternoRaw = String(
        form.get("apellidomaterno") ?? ""
      ).trim();
      const apellidomaterno = apellidomaternoRaw || null;

      const newFieldErrors: FieldErrors = {};

      if (!numerocontrol) {
        newFieldErrors.numerocontrol = "El número de control es obligatorio.";
      } else if (numerocontrol.length < 8) {
        newFieldErrors.numerocontrol =
          "El número de control debe tener al menos 8 caracteres.";
      }
        else if (!/^\d+$/.test(numerocontrol)) {
        newFieldErrors.numerocontrol = "El número de control solo debe contener números.";
      }

      if (!nombre) {
        newFieldErrors.nombre = "El nombre es obligatorio.";
      } else if (nombre.length < 2) {
        newFieldErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
      }

      if (!apellidopaterno) {
        newFieldErrors.apellidopaterno = "El apellido paterno es obligatorio.";
      } else if (apellidopaterno.length < 2) {
        newFieldErrors.apellidopaterno =
          "El apellido paterno debe tener al menos 2 caracteres.";
      }

      if (apellidomaternoRaw && apellidomaternoRaw.length < 2) {
        newFieldErrors.apellidomaterno =
          "Si capturas apellido materno, debe tener al menos 2 caracteres.";
      }

      if (!carreraId) {
        newFieldErrors.carrera = "Debes seleccionar una carrera.";
      }

      const sRaw = String(form.get("semestre") ?? "").trim();
      const s = Number(sRaw);
      if (!sRaw) {
        newFieldErrors.semestre = "El semestre es obligatorio.";
      } else if (Number.isNaN(s) || s < 1 || s > maxSemestre) {
        newFieldErrors.semestre = `El semestre debe estar entre 1 y ${maxSemestre}.`;
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setSaving(false);
        return;
      }

      setFieldErrors({});

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
          setFieldErrors((prev) => ({
            ...prev,
            semestre: `No puedes bajar el semestre a ${s} porque existen materias registradas de semestres posteriores (${count} encontradas).`,
          }));
          setSaving(false);
          return;
        }
      }

      const payload = {
        numerocontrol,
        nombre,
        apellidopaterno,
        apellidomaterno,
        semestre: s,
        idcarrera: carreraId,
        usuariomodifico: docente?.iddocente,
        fechamodificacion: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("estudiante")
        .update(payload)
        .eq("idestudiante", editing.idestudiante);

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setData((rows) =>
        rows.map((r) =>
          r.idestudiante === editing.idestudiante ? { ...r, ...payload } : r
        )
      );

      toast.success("Se editó al estudiante de forma correcta.");
      setEditing(null);
    },
    [editing, carreraId, maxSemestre, setData, setEditing, docente]
  );

  return (
    <Dialog
      open={!!editing}
      onOpenChange={(open) => {
        if (!open) {
          setEditing(null);
          setError(null);
          setFieldErrors({});
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
            />
            <FieldError message={fieldErrors.numerocontrol} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={editing?.nombre ?? ""}
            />
            <FieldError message={fieldErrors.nombre} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apellidopaterno">Apellido paterno</Label>
            <Input
              id="apellidopaterno"
              name="apellidopaterno"
              defaultValue={editing?.apellidopaterno ?? ""}
            />
            <FieldError message={fieldErrors.apellidopaterno} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apellidomaterno">Apellido materno (Opcional)</Label>
            <Input
              id="apellidomaterno"
              name="apellidomaterno"
              defaultValue={editing?.apellidomaterno ?? ""}
            />
            <FieldError message={fieldErrors.apellidomaterno} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="idcarrera">Carrera</Label>
            <Select
              value={carreraId}
              onValueChange={(value) => {
                setCarreraId(value);
                setFieldErrors((prev) => ({ ...prev, carrera: undefined }));
              }}
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
            <FieldError message={fieldErrors.carrera} />
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
                if (raw === "") {
                  setSemestre("");
                  setFieldErrors((prev) => ({ ...prev, semestre: undefined }));
                  return;
                }
                const v = Number(raw);
                if (Number.isNaN(v)) return;
                const clamped = Math.min(Math.max(v, 1), maxSemestre);
                setSemestre(clamped);
                setFieldErrors((prev) => ({ ...prev, semestre: undefined }));
              }}
            />
            {carreraId && (
              <p className="text-xs text-muted-foreground">
                Rango permitido: 1 a {maxSemestre}
              </p>
            )}
            <FieldError message={fieldErrors.semestre} />
          </div>

          {error && (
            <p
              className={`mt-1 flex items-center gap-2 text-sm font-bold text-white bg-red-600 px-3 py-2 rounded-md transition-all duration-300`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </p>
          )}

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