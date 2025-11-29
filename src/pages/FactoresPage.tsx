// src/pages/FactoresPage.tsx
import MainLayout from "@/layouts/MainLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTableFactores } from "@/components/factores/table/data-table";
import { getColumns } from "@/components/factores/table/columns";
import supabase from "@/utils/supabaseClient";
import { type Factor } from "@/utils/types";

import { Button } from "@/components/ui/button";
import EditFactorDialog from "@/components/factores/edit-factor-dialog";
import DeleteFactorDialog from "@/components/factores/delete-factor-dialog";


export default function FactoresPage() {
    const [data, setData] = useState<Factor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState<Factor | null>(null);

    const [deleting, setDeleting] = useState<Factor | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const fetchFactores = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data: rows, error } = await supabase
            .from("factorriesgo")
            .select("idfactor, descripcion, categoria")
            .order("descripcion", { ascending: true });

        if (error) setError(error.message);
        else setData((rows ?? []) as Factor[]);
        setLoading(false);
    }, []);

    // 1. Carga inicial (Ya estaba)
    useEffect(() => {
        fetchFactores();
    }, [fetchFactores]);

    // 2. NUEVO: Atajo de teclado (Alt + R) ⌨️
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey && (event.key === 'r' || event.key === 'R')) {
                event.preventDefault();
                // Opcional: solo refrescar si no está cargando para evitar llamadas duplicadas
                if (!loading) { 
                    fetchFactores();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        // Limpieza
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fetchFactores, loading]); // Asegúrate de incluir 'loading' si lo usas en la lógica

    const handleEdit = useCallback((registro: Factor) => {
        setEditing(registro);
    }, []);

    const handleDelete = useCallback((registro: Factor) => {
        setDeleting(registro);
        setDeleteDialog(true);
    }, []);

    const columns = useMemo(
        () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

  return (
    <MainLayout text="Factores de riesgo">

    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Factores de riesgo</h1>
        <div className="flex gap-2">
          {/* 3. MODIFICADO: Añadido Tooltip y ARIA para accesibilidad */}
          <Button 
            variant="outline" 
            onClick={fetchFactores} 
            disabled={loading}
            title="Refrescar lista (Alt + R)"       // Tooltip visual
            aria-keyshortcuts="Alt+r"              // Lector de pantalla
          >
            {loading ? "Cargando…" : "Refrescar"}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">Error: {error}</div> : null}

      <DataTableFactores columns={columns} data={data} onRefresh={fetchFactores} />

      <EditFactorDialog editing={editing} setEditing={setEditing} setData={setData} />

      <DeleteFactorDialog open={deleteDialog}
          setOpen={setDeleteDialog}
          deleting={deleting}
          setDeleting={setDeleting}
          setData={setData}
          />
    </main>
    </MainLayout>
  );
}