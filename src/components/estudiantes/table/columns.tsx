import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type EstudianteConCarrera } from "@/utils/types";

type ColumnHandlers = {
  onFactor: (est: EstudianteConCarrera) => void;
  onCalificacion: (est: EstudianteConCarrera) => void;
  onEdit: (est: EstudianteConCarrera) => void;
  onDelete: (est: EstudianteConCarrera) => void;
};


export const getColumns = ({ onFactor, onCalificacion, onEdit, onDelete }: ColumnHandlers): ColumnDef<EstudianteConCarrera>[] => [
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
    accessorKey: "carrera.nombre",
    header: "Carrera",
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
  {
    id: "actions",
    cell: ({ row }) => {
      const estudiante = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCalificacion(estudiante)}>
              Calificaciones
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFactor(estudiante)}>
              Factores
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(estudiante)}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(estudiante)}>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]