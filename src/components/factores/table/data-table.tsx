import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type Factor, FactorTipo } from "@/utils/types";

import { useState } from "react";
import AgregarFactorDialog from "../agregar-factor-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRefresh?: () => void;
}

/**
 * DataTable para factores de riesgo
 * - Búsqueda por descripción (globalFilter)
 * - Filtro por categoría (column filter de "categoria")
 */
export function DataTableFactores<TData, TValue>({
  columns,
  data,
  onRefresh
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString", // busca en celdas string
  });

  // Acceso a la columna "categoria" para setear filtro
  const categoriaColumn = table.getColumn("categoria");

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por descripción…"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Categoría:</span>
          <Select
            value={(categoriaColumn?.getFilterValue() as string) ?? "todas"}
            onValueChange={(val) =>
              categoriaColumn?.setFilterValue(val === "todas" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {Object.values(FactorTipo).map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <AgregarFactorDialog onSuccess={onRefresh} />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Tipado de ayuda por si quieres usarlo directamente sin genéricos:
export type FactorTable = React.FC<DataTableProps<Factor, unknown>>;
