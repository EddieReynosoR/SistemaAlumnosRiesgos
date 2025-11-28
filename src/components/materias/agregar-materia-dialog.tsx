import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import supabase from "@/utils/supabaseClient";
import { useSession } from "@/context/SessionContext";

import { type Carrera } from "@/utils/types";

import { toast } from "sonner";
// Asegúrate de que la ruta sea correcta
import ErrorMessage from "../ErrorMessage";

type Props = {
  onSuccess?: () => void;
  triggerLabel?: string;
  defaultSemestre?: number;
};

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function AgregarMateriaDialog({
  onSuccess,
  triggerLabel = "Agregar materia",
  defaultSemestre = 1,
}: Props) {
  const [open, setOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [cantidadUnidades, setCantidadUnidades] = useState<number>(1);
  const [semestre, setSemestre] = useState<number>(defaultSemestre ?? 1);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carreraId, setCarreraId] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { docente } = useSession();

  // --- NUEVO: ACCESIBILIDAD (ATAJO ALT + M) ---
  useEffect(() => {
    const manejarAtajo = (e: KeyboardEvent) => {
      // Ignorar si el usuario escribe en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Atajo Alt + M
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setOpen(true); // Abrir el modal
      }
    };

    window.addEventListener('keydown', manejarAtajo);
    return () => window.removeEventListener('keydown', manejarAtajo);
  }, []);

  const selectedCarrera = useMemo(
    () => carreras.find((c) => c.idcarrera === carreraId) ?? null,
    [carreras, carreraId]
  );

  const maxSemestres = selectedCarrera?.cantidadsemestres ?? 12;

  const resetForm = useCallback(() => {
    setNombre("");
    setSemestre(defaultSemestre ?? 1);
    setCarreraId("");
    setCantidadUnidades(1);
    setError(null);
  }, [defaultSemestre]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  useEffect(() => {
    const fetchCarreras = async () => {
      if (!open) return;
      setLoadingCarreras(true);
      const { data, error } = await supabase
        .from("carrera")
        .select("idcarrera, nombre, cantidadsemestres")
        .order("nombre", { ascending: true });

      if (error) {
        setError("No se pudieron cargar las carreras: " + error.message);
      } else {
        setCarreras((data ?? []) as Carrera[]);
      }
      setLoadingCarreras(false);
    };
    fetchCarreras();
  }, [open]);

  // Si cambia la carrera, asegurar que el semestre no exceda su tope
  useEffect(() => {
    if (!selectedCarrera) return;
    setSemestre((prev) => clamp(prev, 1, selectedCarrera.cantidadsemestres));
  }, [selectedCarrera]);

  const validate = () => {
    if (!nombre.trim()) return "El nombre de la materia es obligatorio.";
    if (!carreraId) return "Selecciona una carrera.";
    if (semestre < 1 || semestre > maxSemestres)
      return `El semestre debe estar entre 1 y ${maxSemestres} para la carrera seleccionada.`;
    if (cantidadUnidades < 1 || cantidadUnidades > 6)
      return "La cantidad de unidades debe estar entre 1 y 6.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      if (!docente?.iddocente) return;
      setSaving(true);

      const payload = {
        nombre: nombre.trim(),
        iddocente: docente.iddocente,
        idcarrera: carreraId,
        semestre: clamp(semestre, 1, maxSemestres),
        cantidadunidades: cantidadUnidades,
        usuariomodifico: docente?.iddocente,
        fechamodificacion: new Date().toISOString()
      };

      const { error: dbError } = await supabase.from("materia").insert([payload]);

      if (dbError) {
        setError(dbError.message);
        toast.error("No se pudo guardar la materia");
        return;
      }

      onSuccess?.();
      toast.success("Materia agregada correctamente");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* --- BOTÓN MODIFICADO --- */}
        <Button 
          variant="default"
          title={`${triggerLabel} (Atajo: Alt + M)`}
          className="focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[640px] text-text">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar materia</DialogTitle>
            <DialogDescription>
              Registra una nueva materia vinculada al docente y la carrera seleccionada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej. Temas Avanzados de Software"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cantidadunidades">Cantidad de unidades</Label>
              <Input
                id="cantidadunidades"
                name="cantidadunidades"
                type="number"
                min={1}
                max={6}
                value={cantidadUnidades}
                onChange={(e) => setCantidadUnidades(clamp(Number(e.target.value), 1, 6))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="carrera">Carrera *</Label>
              <Select
                value={carreraId}
                onValueChange={setCarreraId}
                disabled={loadingCarreras}
              >
                <SelectTrigger id="carrera" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingCarreras ? "Cargando carreras…" : "Selecciona una carrera"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {carreras.map((c) => (
                    <SelectItem key={c.idcarrera} value={c.idcarrera}>
                      {c.nombre}{" "}
                      {Number.isFinite(c.cantidadsemestres) ? `— ${c.cantidadsemestres} sem.` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {carreraId && (
                <p className="text-xs text-muted-foreground">
                  Máximo permitido para esta carrera: {maxSemestres} semestre(s).
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="semestre">Semestre</Label>
              <Input
                id="semestre"
                type="number"
                min={1}
                max={maxSemestres}
                value={semestre}
                onChange={(e) =>
                  setSemestre(clamp(Number(e.target.value), 1, maxSemestres))
                }
                disabled={!carreraId}
              />
              {!carreraId && (
                <p className="text-xs text-muted-foreground">
                  Selecciona primero una carrera para ver el tope de semestres.
                </p>
              )}
            </div>

            <ErrorMessage message={error} />
          </div>

          <DialogFooter className="mt-2 flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>
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