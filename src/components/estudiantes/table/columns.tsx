import { type ColumnDef } from "@tanstack/react-table";
import { type Estudiante } from "@/utils/types";

export const columns: ColumnDef<Estudiante>[] = [
  {
    accessorKey: "numerocontrol",
    header: "Número de Control",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "apellidopaterno",
    header: "Apellido Paterno",
  },
  {
    accessorKey: "apellidomaterno",
    header: "Apellido Materno",
  },
  {
    accessorKey: "semestre",
    header: "Semestre",
    filterFn: (row, id, value) => {
      const cell = Number(row.getValue(id))
      const fv = Number(value)
      return Number.isFinite(fv) ? cell === fv : true
    },
  },
]