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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/utils/supabaseClient";
import { toast } from "sonner";

import { FactorTipo } from "@/utils/types";
import { useSession } from "@/context/SessionContext";
// Asegúrate de que esta ruta sea correcta según tu proyecto, 
// si 'ErrorMessage' está en otra carpeta, ajusta el import.
import ErrorMessage from "../ErrorMessage"; 

type Props = {
  onSuccess?: () => void;
  defaultTipo?: FactorTipo;
  triggerLabel?: string;
};

export default function AgregarFactorDialog({
  onSuccess,
  defaultTipo,
  triggerLabel = "Agregar factor",
}: Props) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<FactorTipo | "">(
    defaultTipo ?? ""
  );

  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { docente } = useSession();

  // --- NUEVO: ACCESIBILIDAD (ATAJO ALT + F) ---
  useEffect(() => {
    const manejarAtajo = (e: KeyboardEvent) => {
      // Ignorar si el usuario escribe en un input o textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Atajo Alt + F
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setOpen(true); // Abrir el modal
      }
    };

    window.addEventListener('keydown', manejarAtajo);
    return () => window.removeEventListener('keydown', manejarAtajo);
  }, []);

  const resetForm = useCallback(() => {
    setTipo(defaultTipo ?? "");
    setDescripcion("");
    setError(null);
  }, [defaultTipo]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  const validate = () => {
    if (!tipo) return "Selecciona un tipo.";
    if (!descripcion) return "Indica una descripción."
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
      setSaving(true);

      const { error: dbError } = await supabase.from("factorriesgo").insert([
        {
          categoria: tipo,
          descripcion: descripcion.trim() || null,
          usuariomodifico: docente?.iddocente,
          fechamodificacion: new Date().toISOString()
        },
      ]);

      if (dbError) {
        setError(dbError.message);
        toast.error("No se pudo guardar el factor.");
        return;
      }

      onSuccess?.();
      toast.success("Factor agregado correctamente");
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
        {/* --- BOTÓN MODIFICADO PARA ACCESIBILIDAD --- */}
        <Button 
          variant="default"
          title={`${triggerLabel} (Atajo: Alt + F)`}
          className="focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar factor</DialogTitle>
            <DialogDescription>
              Registra un nuevo factor para clasificar y evaluar a los estudiantes por tipo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={tipo || ""}
                onValueChange={(val) => setTipo(val as FactorTipo)}
              >
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FactorTipo).map((t) => (
                        <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Detalles adicionales del factor…"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>

            {/* Asegúrate de tener importado el componente ErrorMessage correctamente */}
            {error && (
                <div className="text-sm text-red-600 font-medium p-2 bg-red-50 rounded">
                    {error}
                </div>
            )}
            {/* <ErrorMessage message={error} /> Si usas el componente importado */}
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