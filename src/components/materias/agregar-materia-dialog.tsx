import { useCallback, useEffect, useState } from "react";
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

type Carrera = {
  idcarrera: string;
  nombre: string;
};

type Props = {
  onSuccess?: () => void;
  triggerLabel?: string;
  defaultSemestre?: number | "";
};

export default function AgregarMateriaDialog({
  onSuccess,
  triggerLabel = "Agregar materia",
  defaultSemestre = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [semestre, setSemestre] = useState<number | "">(defaultSemestre);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carreraId, setCarreraId] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { docente } = useSession();

  const resetForm = useCallback(() => {
    setNombre("");
    setSemestre(defaultSemestre);
    setCarreraId("");
    setError(null);
  }, [defaultSemestre]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  // Cargar carreras al abrir el diálogo
  useEffect(() => {
    const fetchCarreras = async () => {
      if (!open) return;
      setLoadingCarreras(true);
      const { data, error } = await supabase
        .from("carrera")
        .select("idcarrera, nombre")
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

  const validate = () => {
    if (!nombre.trim()) return "El nombre de la materia es obligatorio.";
    if (!carreraId) return "Selecciona una carrera.";
    if (semestre !== "" && (semestre < 1 || semestre > 12))
      return "El semestre debe estar entre 1 y 12.";
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
        semestre: semestre === "" ? null : semestre,
      };

      const { error: dbError } = await supabase.from("materia").insert([payload]);

      if (dbError) {
        setError(dbError.message);
        alert("❌ No se pudo guardar la materia");
        return;
      }

      onSuccess?.();
      alert("✅ Materia agregada correctamente");
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
        <Button variant="default">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[640px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar materia</DialogTitle>
            <DialogDescription>
              Registra una nueva materia vinculada al docente y la carrera seleccionada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Nombre */}
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

            {/* Carrera */}
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
                type="number"
                min={1}
                max={12}
                placeholder="Ej. 1"
                value={semestre}
                onChange={(e) => {
                  const val = e.target.value;
                  setSemestre(val === "" ? "" : Number(val));
                }}
              />
            </div>

            {/* Error */}
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
