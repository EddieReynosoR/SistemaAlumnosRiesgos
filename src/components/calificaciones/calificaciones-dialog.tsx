import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";

import MateriaSelect from "./materias-select";

import { getColumns, type CalificacionAsistencia } from "@/components/calificaciones/table/columns";

import supabase from "@/utils/supabaseClient";
import { DataTable } from "./table/data-table";
import type { Estudiante } from "@/utils/types";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  estudiante: Estudiante | null
};

export function CalificacionesDialog({ open, setOpen, estudiante }: Props) {
  const [materiaId, setMateriaId] = useState<string | undefined>(undefined);
  const [unidad, setUnidad] = useState<number | "">("");
  const [asistencias, setAsistencias] = useState<number | "">("");
  const [calificacion, setCalificacion] = useState<number>(0);

  const [calificaciones, setCalificaciones] = useState<CalificacionAsistencia[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<CalificacionAsistencia | null>(null);
  const [editAsistencias, setEditAsistencias] = useState<number | "">("");
  const [editCalificacion, setEditCalificacion] = useState<number | "">("");

  const handleAgregar = async () => {
    if (!materiaId) {
      alert("Selecciona una materia antes de agregar.");
      return;
    }

    if (!unidad || calificacion < 0 || calificacion > 100) {
      alert("Por favor, ingresa una unidad válida y una calificación entre 0 y 100.");
      return;
    }

    const { error } = await supabase.from("calificacionasistencia").insert([
      {
        idestudiante: estudiante?.idestudiante,
        idmateria: materiaId,
        unidad,
        asistencia: asistencias,
        calificacion: calificacion,
      },
    ]);

    if (error) {
      console.error("Error al insertar registro:", error);
      alert("Ocurrió un error al agregar la calificación.");
    } else {
      alert("Calificación agregada correctamente ✅");

      setAsistencias(0);
      setCalificacion(0);
      setUnidad("");
    }
  }
  
  useEffect(() => {
  if (!materiaId || !estudiante?.idestudiante) return;

  const fetchUnidades = async () => {
    const { count, error } = await supabase
      .from("calificacionasistencia")
      .select("*", { count: "exact", head: true })
      .eq("idmateria", materiaId)
      .eq("idestudiante", estudiante.idestudiante);

    if (!error && count !== null) {
      setUnidad(count + 1);
    }
  };

  fetchUnidades();
}, [materiaId]);

  useEffect(() => {
    if (!materiaId || !estudiante?.idestudiante) return;

    console.log(estudiante.idestudiante)

    const fetchCalificacionesMateria = async (materiaId: string) => {
      const { data, error } = await supabase
        .from("calificacionasistencia")
        .select("id, idestudiante, unidad, asistencia, calificacion")
        .eq("idmateria", materiaId)
        .eq("idestudiante", estudiante.idestudiante)
        .order("unidad", { ascending: true });

      if (!error) {
        setCalificaciones(data);
      }
    };

    fetchCalificacionesMateria(materiaId);
  }, [materiaId]);

  useEffect(() => {
    setEditOpen(false);
    setDeleteOpen(false);
    setCurrent(null);
    setCalificaciones([]);
  }, [materiaId]);

  useEffect(() => {
    setCalificaciones([]);
    setMateriaId(undefined);
    setUnidad("");
    setAsistencias("");
    setCalificacion(0);
  }, [estudiante?.idestudiante])

  const handleEdit = useCallback((row: CalificacionAsistencia) => {
    setCurrent(row);
    setEditAsistencias(typeof row.asistencia === "number" ? row.asistencia : 0);
    setEditCalificacion(typeof row.calificacion === "number" ? row.calificacion : 0);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback((row: CalificacionAsistencia) => {
    setCurrent(row);
    setDeleteOpen(true);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!current) return;

    const a = Number(editAsistencias);
    const c = Number(editCalificacion);

    if (Number.isNaN(a) || Number.isNaN(c)) {
      alert("Revisa los valores de asistencias y calificación.");
      return;
    }
    if (c < 0 || c > 100) {
      alert("La calificación debe estar entre 0 y 100.");
      return;
    }

    // Optimista
    setCalificaciones((prev) =>
      prev.map((x) =>
        x.id === current.id ? { ...x, asistencia: a, calificacion: c } : x
      )
    );

    const { error } = await supabase
      .from("calificacionasistencia")
      .update({ asistencia: a, calificacion: c })
      .eq("id", current.id);

    if (error) {
      // Revertir si falla
      setCalificaciones((prev) =>
        prev.map((x) => (x.id === current.id ? current : x))
      );
      console.error(error);
      alert("No se pudo actualizar el registro.");
      return;
    }

    setEditOpen(false);
    setCurrent(null);
  }, [current, editAsistencias, editCalificacion]);

  const confirmDelete = useCallback(async () => {
    if (!current) return;

    const idToDelete = current.id;
    const backup = calificaciones;

    // Optimista
    setCalificaciones((prev) => prev.filter((x) => x.id !== idToDelete));

    const { error } = await supabase
      .from("calificacionasistencia")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error(error);
      setCalificaciones(backup);
      alert("No se pudo eliminar el registro.");
      return;
    }

    setDeleteOpen(false);
    setCurrent(null);
  }, [current, calificaciones]);
  
  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Administrar calificaciones</DialogTitle>
          <DialogDescription>
            Aquí podrás agregar o editar las calificaciones del estudiante por materia y unidad.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
            <MateriaSelect materiaId={materiaId} setMateriaId={setMateriaId} />

            <Separator />

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="unidad">Número de unidad</Label>
                <Input
                  id="unidad"
                  type="number"
                  placeholder="Unidad automática"
                  value={unidad}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="flex-1">
                <Label htmlFor="asistencias">Cantidad de asistencias</Label>
                <Input
                  id="asistencias"
                  type="number"
                  placeholder="Ej. 15"
                  value={asistencias}
                  min={0}
                  onChange={(e) => setAsistencias(Number(e.target.value))}
                />
              </div>

              <div className="flex-1">
                <Label htmlFor="calificacion">Calificación de unidad</Label>
                <Input
                  id="calificacion"
                  type="number"
                  placeholder="0 - 100"
                  min={0}
                  max={100}
                  value={calificacion}
                  onChange={(e) => setCalificacion(Number(e.target.value))}
                />
              </div>
            </div>

            <Separator />

            <div className="w-full flex justify-end">
              <Button onClick={handleAgregar}>Agregar</Button>
            </div>

            <DataTable columns={columns} data={calificaciones} />
        </div>
        <DialogFooter>
            <Button onClick={() => setOpen(false)}>
                Cerrar
            </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar calificación</DialogTitle>
            <DialogDescription>
              Unidad {current?.unidad}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-asistencias">Asistencias</Label>
              <Input
                id="edit-asistencias"
                type="number"
                value={editAsistencias}
                onChange={(e) => setEditAsistencias(Number(e.target.value))}
                placeholder="Ej. 15"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-calificacion">Calificación (0-100)</Label>
              <Input
                id="edit-calificacion"
                type="number"
                value={editCalificacion}
                onChange={(e) => setEditCalificacion(Number(e.target.value))}
                placeholder="Ej. 90"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar la unidad {current?.unidad} del estudiante? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </Dialog>
  );
}
