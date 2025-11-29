import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import type { Carrera } from "@/utils/types";
import { useState, useCallback, useMemo, useEffect } from "react";
import supabase from "@/utils/supabaseClient";
import { useSession } from "@/context/SessionContext";
import { EditCarreraDialog } from "@/components/carreras/editar-carrera-dialog";
import { DataTableCarreras } from "@/components/carreras/table/data-table";
import { getColumns } from "@/components/carreras/table/columns";
import { DeleteCarreraDialog } from "@/components/carreras/delete-carrera-dialog";

export default function CarrerasPage() {
  const [data, setData] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Carrera | null>(null);
  const [deleting, setDeleting] = useState<Carrera | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const { docente } = useSession();

  const fetchCarreras = useCallback(async () => {
    if (!docente?.iddocente) return;

    setLoading(true);
    setError(null);

    const { data: rows, error } = await supabase
      .from("carrera")
      .select("idcarrera, nombre, cantidadsemestres")
      .order("nombre", { ascending: true });

    if (error) setError(error.message);
    else setData((rows ?? []) as Carrera[]);

    if (error) setError(error.message);
    else setData((rows ?? []) as Carrera[]);

    setLoading(false);
  }, [docente]);

  // Carga inicial
  useEffect(() => {
    fetchCarreras();
  }, [fetchCarreras]);

  // 1. NUEVO: Atajo de teclado (Alt + R) ⌨️
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detectar Alt + r (o R)
      if (event.altKey && (event.key === 'r' || event.key === 'R')) {
        event.preventDefault(); // Prevenir comportamiento por defecto
        if (!loading) { // Solo si no está cargando actualmente
          fetchCarreras(); // Ejecutar la función de refrescar
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Limpieza
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fetchCarreras, loading]); // Dependencias: fetchCarreras y loading

  const handleDelete = useCallback((est: Carrera) => {
    setDeleting(est);
    setDeleteDialog(true);
  }, []);

  const handleEdit = useCallback((est: Carrera) => {
    setEditing(est);
  }, []);

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  );

  return (
    <MainLayout text="Carreras">
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Carreras</h1>
          <div className="flex gap-2">
            {/* 2. MODIFICADO: Añadido Tooltip y ARIA para accesibilidad */}
            <Button
              variant="outline"
              onClick={fetchCarreras}
              disabled={loading}
              title="Refrescar lista (Alt + R)" // Tooltip visual
              aria-keyshortcuts="Alt+r"         // Lector de pantalla
            >
              {loading ? "Cargando..." : "Refrescar"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-sm text-red-600">Error: {error}</div>
        ) : null}
        <DataTableCarreras
          columns={columns}
          data={data}
          globalFilterColumns={["nombre"]}
          onRefresh={fetchCarreras}
        />

        <EditCarreraDialog
          editing={editing}
          setEditing={setEditing}
          setData={setData}
        />

        <DeleteCarreraDialog
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