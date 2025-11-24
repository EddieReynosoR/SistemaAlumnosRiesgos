import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useEffect, useMemo } from "react";
import supabase from "@/utils/supabaseClient";
import type { Carrera } from "@/utils/types";
import { toast } from "sonner";
import { useSession } from "@/context/SessionContext";

type Props = { onSuccess?: () => void };

function FieldError({ message }: { message?: string }) {
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
  ncontrol?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  carrera?: string;
  semestre?: string;
};

export function AgregarEstudianteDialog({ onSuccess }: Props) {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [selectedCarrera, setSelectedCarrera] = useState<string>("");
  const [semestre, setSemestre] = useState<number | "">("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  const { docente } = useSession();

  // --- NUEVO: ESCUCHAR TECLADO (ATAJO ALT + E) ---
  useEffect(() => {
    const manejarAtajo = (e: KeyboardEvent) => {
      // Ignorar si el usuario escribe en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Atajo Alt + E
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setOpen(true); // ¡Abrimos el modal directamente!
      }
    };

    window.addEventListener('keydown', manejarAtajo);
    return () => window.removeEventListener('keydown', manejarAtajo);
  }, []);

  useEffect(() => {
    const fetchCarreras = async () => {
      const { data, error } = await supabase
        .from("carrera")
        .select("idcarrera, nombre, cantidadsemestres");
      if (error) console.error("Error al cargar carreras:", error);
      else setCarreras(data as Carrera[]);
    };
    fetchCarreras();
  }, []);

  const maxSemestre = useMemo(() => {
    return (
      carreras.find((c) => c.idcarrera === selectedCarrera)?.cantidadsemestres ??
      12
    );
  }, [carreras, selectedCarrera]);

  useEffect(() => {
    if (!selectedCarrera) {
      setSemestre("");
      return;
    }

    setSemestre((prev) => {
      if (prev === "") return 1;
      const v = Number(prev);
      return Math.min(Math.max(v, 1), maxSemestre);
    });
  }, [selectedCarrera, maxSemestre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FieldErrors = {};

    const form = new FormData(e.currentTarget as HTMLFormElement);
    const ncontrol = String(form.get("ncontrol") ?? "").trim();
    const nombre = String(form.get("nombre") ?? "").trim();
    const apellidoPaterno = String(form.get("apellidoPaterno") ?? "").trim();
    const apellidoMaternoRaw = String(
      form.get("apellidoMaterno") ?? ""
    ).trim();
    const apellidoMaterno = apellidoMaternoRaw || null;

    if (!ncontrol) {
      newErrors.ncontrol = "El número de control es obligatorio.";
    } else if (ncontrol.length < 8) {
      newErrors.ncontrol = "El número de control debe tener al menos 8 caracteres.";
    }
    else if (!/^\d+$/.test(ncontrol)) {
      newErrors.ncontrol = "El número de control solo debe contener números.";
    }

    if (!nombre) {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!apellidoPaterno) {
      newErrors.apellidoPaterno = "El apellido paterno es obligatorio.";
    } else if (apellidoPaterno.length < 2) {
      newErrors.apellidoPaterno =
        "El apellido paterno debe tener al menos 2 caracteres.";
    }

    if (apellidoMaternoRaw && apellidoMaternoRaw.length < 2) {
      newErrors.apellidoMaterno =
        "Si capturas apellido materno, debe tener al menos 2 caracteres.";
    }

    if (!selectedCarrera) {
      newErrors.carrera = "Debes seleccionar una carrera.";
    }

    const s = Number(semestre);
    if (!selectedCarrera) {
      newErrors.semestre = "Selecciona primero una carrera.";
    } else if (!semestre) {
      newErrors.semestre = "El semestre es obligatorio.";
    } else if (Number.isNaN(s) || s < 1 || s > maxSemestre) {
      newErrors.semestre = `El semestre debe estar entre 1 y ${maxSemestre}.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setSaving(true);
    const nuevoEstudiante = {
      numerocontrol: ncontrol,
      nombre,
      apellidopaterno: apellidoPaterno,
      apellidomaterno: apellidoMaterno,
      semestre: s,
      idcarrera: selectedCarrera,
      usuariomodifico: docente?.iddocente,
      fechamodificacion: new Date().toISOString(),
    };

    const { error } = await supabase.from("estudiante").insert(nuevoEstudiante);
    setSaving(false);

    if (error) {
      toast.error("No se pudo guardar el estudiante: " + error.message);
      return;
    }

    toast.success("Estudiante agregado correctamente");
    onSuccess?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* --- AQUÍ ESTÁ EL BOTÓN QUE QUERÍAS MODIFICAR --- */}
        <Button 
          variant="default" 
          onClick={() => setOpen(true)}
          title="Agregar Estudiante (Atajo: Alt + E)"
          className="focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent"
        >
          Agregar Estudiante
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar estudiante</DialogTitle>
          <DialogDescription>
            Agrega un nuevo estudiante al sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ncontrol">Número de control</Label>
            <Input
              id="ncontrol"
              name="ncontrol"
              placeholder="21212036"
            />
            <FieldError message={errors.ncontrol} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Eduardo"
            />
            <FieldError message={errors.nombre} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
            <Input
              id="apellidoPaterno"
              name="apellidoPaterno"
              placeholder="Reynoso"
            />
            <FieldError message={errors.apellidoPaterno} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apellidoMaterno">
              Apellido materno (opcional)
            </Label>
            <Input
              id="apellidoMaterno"
              name="apellidoMaterno"
              placeholder="Rosales"
            />
            <FieldError message={errors.apellidoMaterno} />
          </div>

          <div className="grid gap-2">
            <Label>Carrera</Label>
            <Select
              value={selectedCarrera}
              onValueChange={(value) => {
                setSelectedCarrera(value);
                // 🔴 limpiar error al cambiar
                setErrors((prev) => ({ ...prev, carrera: undefined }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una carrera" />
              </SelectTrigger>
              <SelectContent>
                {carreras.map((c) => (
                  <SelectItem key={c.idcarrera} value={String(c.idcarrera)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.carrera} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="semestre">Semestre</Label>
            <Input
              type="number"
              id="semestre"
              name="semestre"
              min={1}
              max={maxSemestre}
              placeholder={`1–${maxSemestre}`}
              disabled={!selectedCarrera}
              value={semestre}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setSemestre("");
                  setErrors((prev) => ({ ...prev, semestre: undefined }));
                  return;
                }
                const v = Number(raw);
                if (Number.isNaN(v)) return;
                const clamped = Math.min(Math.max(v, 1), maxSemestre);
                setSemestre(clamped);
                setErrors((prev) => ({ ...prev, semestre: undefined }));
              }}
            />
            {!!selectedCarrera && (
              <p className="text-xs text-muted-foreground">
                Rango permitido: 1 a {maxSemestre}
              </p>
            )}
            <FieldError message={errors.semestre} />
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}