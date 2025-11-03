// src/components/materias/table/data-table.tsx
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo} from "react";
import AgregarMateriaDialog from "../agregar-materia-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** columnas a considerar en el filtro global; si no se pasa se usan todas las keys del row.original */
  globalFilterColumns?: (keyof TData)[];
  onRefresh?: () => void;
}

export function DataTable<TData extends Record<string, any>, TValue>({
  columns,
  data,
  globalFilterColumns,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalQuery, setGlobalQuery] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: globalQuery,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase();
      const keys =
        (globalFilterColumns as string[]) ??
        (row.original ? Object.keys(row.original) : []);
      return keys.some((k) =>
        String(row.original?.[k] ?? "").toLowerCase().includes(q)
      );
    },
  });

  const semestreColumn = table.getColumn("semestre" as any);

  const uniqueSemestres = useMemo(() => {
    if (!semestreColumn) return [];
    const s = new Set<number>();
    data.forEach((r) => {
      const v = Number((r as any).semestre);
      if (!Number.isNaN(v)) s.add(v);
    });
    return Array.from(s).sort((a, b) => a - b);
  }, [data, semestreColumn]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por nombre ..."
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          className="w-[320px]"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Semestre:</span>
          <Select
            value={(semestreColumn?.getFilterValue() as string | undefined) ?? "todos"}
            onValueChange={(val) => {
              semestreColumn?.setFilterValue(val === "todos" ? undefined : val);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {uniqueSemestres.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  Semestre {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
            <AgregarMateriaDialog onSuccess={onRefresh} />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && (
                        <span className="ml-1 text-muted-foreground">
                          {sortDir === "asc"
                            ? "▲"
                            : sortDir === "desc"
                            ? "▼"
                            : ""}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {data.length} registros
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
