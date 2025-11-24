import { getColumns } from "@/components/estudiantes/table/columns";
import { DataTable } from "@/components/estudiantes/table/data-table";
import type { Estudiante, EstudianteConCarrera } from "@/utils/types";
import { useEffect, useCallback, useState, useMemo } from "react";

import supabase from "@/utils/supabaseClient";

import { Button } from "@/components/ui/button";
import { CalificacionesDialog } from "@/components/calificaciones/calificaciones-dialog";
import { SeleccionarFactoresDialog } from "@/components/riesgosestudiantes/agregar-riesgo-dialog";
import EditEstudianteDialog from "@/components/estudiantes/edit-estudiante-dialog";
import DeleteEstudianteDialog from "@/components/estudiantes/delete-estudiante-dialog";
import MainLayout from "@/layouts/MainLayout";
export default function EstudiantesPage() {
  const [data, setData] = useState<EstudianteConCarrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<EstudianteConCarrera | null>(null);
  const [deleting, setDeleting] = useState<EstudianteConCarrera | null>(null);
  const [calificacion, setCalificacion] = useState<Estudiante | null>(null);
  const [factor, setFactor] = useState<Estudiante | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const fetchEstudiantes = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("estudiante")
      .select(
        `
        idestudiante,
        numerocontrol,
        nombre,
        apellidopaterno,
        apellidomaterno,
        semestre,
        idcarrera,
        carrera (
          idcarrera,
          nombre
        )
      `
      )
      .order("idestudiante", { ascending: false });

    if (error) setError(error.message);
    else setData((rows ?? []) as EstudianteConCarrera[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  const handleDelete = useCallback((est: EstudianteConCarrera) => {
    setDeleting(est);
    setDeleteDialog(true);
  }, []);

  const handleEdit = useCallback((est: EstudianteConCarrera) => {
    setEditing(est);
  }, []);

  const handleCalificacion = useCallback((est: Estudiante) => {
    setCalificacion(est);
  }, []);

  const handleFactor = useCallback((est: Estudiante) => {
    setFactor(est);
  }, []);

  const columns = useMemo(
    () =>
      getColumns({
        onFactor: handleFactor,
        onCalificacion: handleCalificacion,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleCalificacion, handleEdit, handleDelete]
  );

  // if (loading) return <main className="p-6">Cargando…</main>;
  // if (error) return <main className="p-6 text-red-600">Error: {error}</main>;

  return (

    <MainLayout text="Estudiantes">
      <div className="p-6 space-y-4">
        
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Estudiantes</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchEstudiantes}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Refrescar"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-sm text-red-600">Error: {error}</div>
      ) : null}
      <DataTable
        columns={columns}
        data={data}
        globalFilterColumns={["numerocontrol", "nombre"]}
        onRefresh={fetchEstudiantes}
      />

      <EditEstudianteDialog
        editing={editing}
        setEditing={setEditing}
        setData={setData}
      />

      <DeleteEstudianteDialog
        open={deleteDialog}
        setOpen={setDeleteDialog}
        deleting={deleting}
        setDeleting={setDeleting}
        setData={setData}
        />

      <CalificacionesDialog
        open={!!calificacion}
        setOpen={(open) => !open && setCalificacion(null)}
        estudiante={calificacion}
        />

      <SeleccionarFactoresDialog
        open={!!factor}
        setOpen={(open) => !open && setFactor(null)}
        estudiante={factor}
        />
    </div>
    </MainLayout>

  );
}
