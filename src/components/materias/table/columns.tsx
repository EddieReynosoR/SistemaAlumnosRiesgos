// src/components/materias/table/columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type MateriaConCarrera } from "@/utils/types";

type ColumnHandlers = {
  onEdit: (registro: MateriaConCarrera) => void;
  onDelete: (registro: MateriaConCarrera) => void;
};

export const getColumns = ({
  onEdit,
  onDelete
}: ColumnHandlers): ColumnDef<MateriaConCarrera>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="block max-w-[420px] truncate" title={row.original.nombre}>
        {row.original.nombre}
      </span>
    ),
  },
  {
    accessorKey: "semestre",
    header: "Semestre",
    filterFn: (row, id, value) => {
      const rowVal = Number(row.getValue(id));
      const target = Number(value as string);
      return rowVal === target;
    },
    cell: ({ row }) => {
      const s = row.original.semestre ?? "—";
      return (
        <Badge variant="secondary" className="font-mono">
          {s}
        </Badge>
      );
    },
    size: 80,
  },
  {
    accessorKey: "carrera.nombre",
    header: "Carrera"
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(registro)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
    size: 60,
  },
];
