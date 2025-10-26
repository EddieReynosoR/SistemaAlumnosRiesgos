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
  SelectValue } from "@/components/ui/select";

import { useState, useEffect } from "react";

import supabase from "@/utils/supabaseClient";
import type { Carrera } from "@/utils/types";

type Props = { onSuccess?: () => void };

export function AgregarEstudianteDialog({ onSuccess }: Props) {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [selectedCarrera, setSelectedCarrera] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCarreras = async () => {
      const { data, error } = await supabase.from("carrera").select("idcarrera, nombre");
      if (error) {
        console.error("Error al cargar carreras:", error);
      } else {
        setCarreras(data as Carrera[]);
      }
    };
    fetchCarreras();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);
    const nuevoEstudiante = {
      numerocontrol: form.get("ncontrol"),
      nombre: form.get("nombre"),
      apellidopaterno: form.get("apellidoPaterno"),
      semestre: Number(form.get("semestre")),
      idcarrera: selectedCarrera ?? null
    };

    const { error } = await supabase.from("estudiante").insert(nuevoEstudiante);

    setSaving(false);

    if (error) {
      alert("❌ No se pudo guardar el estudiante");
      return;
    }

    alert("✅ Estudiante agregado correctamente");
    onSuccess?.(); 
    setOpen(false); 
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={() => setOpen(true)}>Agregar Estudiante</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar estudiante</DialogTitle>
          <DialogDescription>
            Agrega un nuevo estudiante al sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="ncontrol">Número de control</Label>
            <Input id="ncontrol" name="ncontrol" placeholder="21212036" required />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" placeholder="Eduardo" required />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
            <Input id="apellidoPaterno" name="apellidoPaterno" placeholder="Reynoso" required />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="semestre">Semestre</Label>
            <Input type="number" id="semestre" name="semestre" min={1} max={10} required />
          </div>

          <div className="grid gap-3">
            <Label>Carrera</Label>
            <Select onValueChange={setSelectedCarrera}>
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
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
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