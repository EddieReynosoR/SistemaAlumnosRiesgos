import { useCallback, useState, useEffect } from "react";
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
import supabase from "@/utils/supabaseClient";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner"
// Asegúrate de que la ruta sea correcta
import ErrorMessage from "../ErrorMessage";

type Props = {
  onSuccess?: () => void;
  triggerLabel?: string;
  defaultSemestre?: number | "";
};

export default function AgregarCarreraDialog({
  onSuccess,
  triggerLabel = "Agregar carrera",
  defaultSemestre = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cantidadSemestres, setCantidadSemestres] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { docente } = useSession();

  // --- NUEVO: ACCESIBILIDAD (ATAJO ALT + C) ---
  useEffect(() => {
    const manejarAtajo = (e: KeyboardEvent) => {
      // Ignorar si el usuario escribe en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Atajo Alt + C
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setOpen(true); // Abrir el modal
      }
    };

    window.addEventListener('keydown', manejarAtajo);
    return () => window.removeEventListener('keydown', manejarAtajo);
  }, []);

  const resetForm = useCallback(() => {
    setNombre("");
    setCantidadSemestres(1);
    setError(null);
  }, []);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  const validate = () => {
    if (!nombre.trim()) return "El nombre de la carrera es obligatorio.";
    if (!cantidadSemestres || cantidadSemestres < 1) return "La cantidad de semestres debe ser al menos 1.";
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
        cantidadsemestres: cantidadSemestres,
        usuariomodifico: docente?.iddocente,
        fechamodificacion: new Date().toISOString()
      };

      const { error: dbError } = await supabase.from("carrera").insert([payload]);

      if (dbError) {
        setError(dbError.message);
        toast.error("No se pudo guardar la carrera");
        return;
      }

      onSuccess?.();
      toast.success("Carrera agregada correctamente");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido al guardar.");
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
          title={`${triggerLabel} (Atajo: Alt + C)`}
          className="focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[640px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar carrera</DialogTitle>
            <DialogDescription>
              Registra una nueva carrera.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej. Ingeniería en Sistemas"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cantidadsemestres">Cantidad de semestres *</Label>
              <Input
                id="cantidadsemestres"
                type="number"
                value={cantidadSemestres}
                min={1}
                max={12}
                onChange={(e) => setCantidadSemestres(Number(e.target.value))}
              />
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