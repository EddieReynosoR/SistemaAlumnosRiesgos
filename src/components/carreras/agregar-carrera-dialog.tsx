import { useCallback, useState } from "react";
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

  const resetForm = useCallback(() => {
    setNombre("");
    setError(null);
  }, [defaultSemestre]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  const validate = () => {
    if (!nombre.trim()) return "El nombre de la materia es obligatorio.";
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
        cantidadsemestres: cantidadSemestres
      };

      const { error: dbError } = await supabase.from("carrera").insert([payload]);

      if (dbError) {
        setError(dbError.message);
        alert("❌ No se pudo guardar la carrera");
        return;
      }

      onSuccess?.();
      alert("✅ Carrera agregada correctamente");
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
        <Button variant="default">{triggerLabel}</Button>
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
                placeholder="Ej. Temas Avanzados de Software"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre">Cantidad de semestres *</Label>
              <Input
                id="cantidadsemestres"
                min={1}
                max={12}
                onChange={(e) => setCantidadSemestres(Number(e.target.value))}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
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
