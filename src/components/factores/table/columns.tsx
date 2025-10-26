// src/components/factores/table/columns.tsx
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

import { type Factor, FactorTipo } from "@/utils/types";

type ColumnHandlers = {
  onEdit: (registro: Factor) => void;
  onDelete: (registro: Factor) => void;
};

const categoriaLabel: Record<string, string> = Object.values(FactorTipo).reduce(
  (acc, tipo) => {
    acc[tipo] = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    return acc;
  },
  {} as Record<string, string>
);

export const getColumns = ({ onEdit, onDelete }: ColumnHandlers): ColumnDef<Factor>[] => [
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="block max-w-[520px] truncate" title={row.original.descripcion}>
        {row.original.descripcion}
      </span>
    ),
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => {
      const categoria = row.original.categoria;
      return (
        <Badge variant="secondary" className="capitalize">
          {categoriaLabel[categoria] ?? categoria}
        </Badge>
      );
    },
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
