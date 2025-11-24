import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import type { MateriaConCarrera } from "@/utils/types";
import { useState, useCallback, useMemo, useEffect } from "react";
import supabase from "@/utils/supabaseClient";
import { getColumns } from "@/components/materias/table/columns";
import { DataTable } from "@/components/materias/table/data-table";
import { useSession } from "@/context/SessionContext";
import { EditMateriaDialog } from "@/components/materias/editar-materia-dialog";
import { DeleteMateriaDialog } from "@/components/materias/delete-materia-dialog";

export default function MateriasPage() {
  const [data, setData] = useState<MateriaConCarrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<MateriaConCarrera | null>(null);
  const [deleting, setDeleting] = useState<MateriaConCarrera | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const { docente } = useSession();

  const fetchMaterias = useCallback(async () => {
    if (!docente?.iddocente) return;

    setLoading(true);
    setError(null);

    const { data: rows, error } = await supabase
      .from("materia")
      .select(
        `idmateria,
                nombre,
                iddocente,
                idcarrera,
                semestre,
                cantidadunidades,
                carrera (
                    idcarrera,
                    nombre,
                    cantidadsemestres
                )`
      )
      .eq("iddocente", docente.iddocente)
      .order("nombre", { ascending: true });

    if (error) setError(error.message);
    else setData((rows ?? []) as MateriaConCarrera[]);

    if (error) setError(error.message);
    else setData((rows ?? []) as MateriaConCarrera[]);

    setLoading(false);
  }, [docente]);

  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  const handleDelete = useCallback((est: MateriaConCarrera) => {
    setDeleting(est);
    setDeleteDialog(true);
  }, []);

  const handleEdit = useCallback((est: MateriaConCarrera) => {
    setEditing(est);
  }, []);

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  );

  // if (loading) return <main className="p-6">Cargando…</main>;
  // if (error) return <main className="p-6 text-red-600">Error: {error}</main>;

  return (
    <MainLayout text="Materias">
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Materias</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchMaterias}
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
          globalFilterColumns={["nombre", "semestre"]}
          onRefresh={fetchMaterias}
        />

        <EditMateriaDialog
          editing={editing}
          setEditing={setEditing}
          setData={setData}
        />

        <DeleteMateriaDialog
          open={deleteDialog}
          setOpen={setDeleteDialog}
          deleting={deleting}
          setDeleting={setDeleting}
          setData={setData}
        />
      </main>
    </MainLayout>
  );
}
