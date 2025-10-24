import { columns } from "@/components/estudiantes/table/columns"
import { DataTable } from "@/components/estudiantes/table/data-table"
import { type Estudiante } from "@/utils/types"
import { useEffect, useCallback, useState } from "react"

import supabase from "@/utils/supabaseClient"

export default function EstudiantesPage() {
  const [data, setData] = useState<Estudiante[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstudiantes = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("estudiante")
      .select("idestudiante, numerocontrol, nombre, apellidopaterno, apellidomaterno, semestre")
      .order("idestudiante", { ascending: false });

    if (error) setError(error.message);
    else setData((rows ?? []) as Estudiante[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  if (loading) return <main className="p-6">Cargando…</main>
  if (error) return <main className="p-6 text-red-600">Error: {error}</main>

  return (
    <main className="container mx-auto py-10">
      <DataTable  columns={columns} data={data} globalFilterColumns={["numerocontrol", "nombre"]} onRefresh={fetchEstudiantes} />
    </main>
  )
}
