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

export type CalificacionAsistencia = {
  id: number;
  idestudiante: number;
  unidad: number;
  asistencia: number;
  calificacion: number;
};

type ColumnHandlers = {
  onEdit: (registro: CalificacionAsistencia) => void;
  onDelete: (registro: CalificacionAsistencia) => void;
};

export const getColumns = ({ onEdit, onDelete }: ColumnHandlers): ColumnDef<CalificacionAsistencia>[] => [
  {
    accessorKey: "unidad",
    header: "Unidad",
  },
  {
    accessorKey: "asistencia",
    header: "Cantidad de asistencias"
  },
  {
    accessorKey: "calificacion",
    header: "Calificación"
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const registro = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(registro)}>
              Editar
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem onClick={() => onDelete(registro)}>
              Eliminar
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
