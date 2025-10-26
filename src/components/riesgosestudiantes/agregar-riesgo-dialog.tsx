import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import supabase from "@/utils/supabaseClient";

import { FactorTipo, type Factor, type Estudiante } from "@/utils/types";
// Nota: en utils/types define:
// export const FACTOR_TIPO = {...} as const
// export type FactorTipo = typeof FACTOR_TIPO[keyof typeof FACTOR_TIPO];

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  estudiante: Estudiante | null;
};

export function SeleccionarFactoresDialog({ open, setOpen, estudiante }: Props) {
  const [tipo, setTipo] = useState<FactorTipo | "">("");
  const [factores, setFactores] = useState<Factor[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga factores del tipo + preselección para el estudiante
  useEffect(() => {
    if (!tipo || !estudiante?.idestudiante) {
      setFactores([]);
      setCheckedIds([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) Factores del tipo seleccionado
      const factoresPromise = supabase
        .from("factorriesgo")
        .select("idfactor, descripcion, categoria")
        .eq("categoria", tipo)
        .order("descripcion", { ascending: true });

      // 2) Selecciones actuales del estudiante (todas), luego filtramos por los del tipo visible
      const seleccionadosPromise = supabase
        .from("riesgoestudiante")
        .select("idfactor")
        .eq("idestudiante", estudiante.idestudiante);

      const [{ data: facData, error: facErr }, { data: selData, error: selErr }] =
        await Promise.all([factoresPromise, seleccionadosPromise]);

      if (cancelled) return;

      if (facErr) setError(facErr.message);
      if (selErr) setError(selErr.message);

      const _factores = (facData ?? []) as Factor[];
      setFactores(_factores);

      // ids seleccionados del estudiante QUE pertenecen al tipo visible
      const visiblesIds = new Set(_factores.map(f => f.idfactor));
      const seleccionadosIds = (selData ?? []).map(r => r.idfactor as string);
      const precheck = seleccionadosIds.filter(id => visiblesIds.has(id));

      setCheckedIds(precheck);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [tipo, estudiante?.idestudiante]);

  // Si cambian los factores visibles, limpia ids que ya no están
  useEffect(() => {
    setCheckedIds(prev => prev.filter(id => factores.some(f => f.idfactor === id)));
  }, [factores]);

  // Si cambia el estudiante, resetea UI
  useEffect(() => {
    setTipo("");
    setFactores([]);
    setCheckedIds([]);
  }, [estudiante?.idestudiante]);

  const allVisibleIds = useMemo(() => factores.map(f => f.idfactor), [factores]);
  const allVisibleChecked = useMemo(
    () => allVisibleIds.length > 0 && allVisibleIds.every(id => checkedIds.includes(id)),
    [allVisibleIds, checkedIds]
  );

  const toggleId = (id: string, value: boolean) => {
    setCheckedIds(prev => value ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id));
  };

  const toggleAllVisible = (value: boolean) => {
    if (value) {
      setCheckedIds(prev => Array.from(new Set([...prev, ...allVisibleIds])));
    } else {
      setCheckedIds(prev => prev.filter(id => !allVisibleIds.includes(id)));
    }
  };

  // Guarda sincronizando: inserta nuevos y elimina desmarcados para el tipo actual
  const handleSave = async () => {
    if (!estudiante?.idestudiante || !tipo) return;

    setSaving(true);
    try {
      // Lee lo que YA hay guardado para este estudiante y este TIPO (solo ids de los visibles)
      const { data: actuales, error: readErr } = await supabase
        .from("riesgoestudiante")
        .select("idfactor")
        .eq("idestudiante", estudiante.idestudiante)
        .in("idfactor", allVisibleIds); // limitar al tipo visible

      if (readErr) throw readErr;

      const actualesIds = (actuales ?? []).map(r => r.idfactor as string);

      // Determina altas y bajas
      const toInsertIds = checkedIds.filter(id => !actualesIds.includes(id));
      const toDeleteIds = actualesIds.filter(id => !checkedIds.includes(id));

      // Inserta nuevos
      if (toInsertIds.length > 0) {
        const registros = toInsertIds.map(id => ({
          idestudiante: estudiante.idestudiante,
          idfactor: id,
        }));
        const { error: insertErr } = await supabase.from("riesgoestudiante").insert(registros);
        if (insertErr) throw insertErr;
      }

      // Elimina desmarcados
      if (toDeleteIds.length > 0) {
        const { error: delErr } = await supabase
          .from("riesgoestudiante")
          .delete()
          .eq("idestudiante", estudiante.idestudiante)
          .in("idfactor", toDeleteIds);
        if (delErr) throw delErr;
      }

      // Feedback y cerrar
      // (sustituye por toast de shadcn si prefieres)
      alert("✅ Factores de riesgo actualizados.");
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo actualizar la selección.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Seleccionar factores de riesgo</DialogTitle>
          <DialogDescription>
            Filtra por tipo y marca los factores que apliquen.
          </DialogDescription>
        </DialogHeader>

        {/* Filtro por tipo */}
        <div className="grid gap-2">
          <Label>Tipo de factor</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as FactorTipo)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FactorTipo).map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checkboxes */}
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="selectAll"
              checked={allVisibleChecked}
              onCheckedChange={(v) => toggleAllVisible(Boolean(v))}
              disabled={loading || factores.length === 0}
            />
            <Label htmlFor="selectAll" className="cursor-pointer">
              Seleccionar todos los visibles
            </Label>
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-64 p-3">
              {loading && <p className="text-sm text-muted-foreground">Cargando factores…</p>}
              {!loading && error && <p className="text-sm text-red-600">Error: {error}</p>}
              {!loading && !error && factores.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay factores para este tipo.</p>
              )}

              {!loading && !error && factores.map((f) => {
                const checked = checkedIds.includes(f.idfactor);
                const id = `factor-${f.idfactor}`;
                return (
                  <div key={f.idfactor} className="flex items-start gap-3 py-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(v) => toggleId(f.idfactor, Boolean(v))}
                    />
                    <Label htmlFor={id} className="cursor-pointer leading-6">
                      {f.descripcion}
                      <span className="ml-2 text-xs text-muted-foreground">({f.categoria})</span>
                    </Label>
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving || !tipo || !estudiante?.idestudiante}>
            {saving ? "Guardando…" : "Guardar selección"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
