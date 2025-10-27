import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import supabase from "@/utils/supabaseClient";
import type { Carrera } from "@/utils/types";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  deleting: Carrera | null;
  setDeleting: (m: Carrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<Carrera[]>>;
};

export function DeleteCarreraDialog({
  open,
  setOpen,
  deleting,
  setDeleting,
  setData,
}: Props) {
  const [loading, setLoading] = useState(false);

  const onClose = useCallback(() => {
    if (loading) return;
    setDeleting(null);
    setOpen(false);
  }, [loading, setDeleting, setOpen]);

  const confirmDelete = useCallback(async () => {
    if (!deleting) return;

    setLoading(true);

    const prevDataCapture: Carrera[] = [];
    setData((curr) => {
      prevDataCapture.push(...curr);
      return curr.filter((c) => c.idcarrera !== deleting.idcarrera);
    });

    const { error } = await supabase
      .from("carrera")
      .delete()
      .eq("idcarrera", deleting.idcarrera);

    setLoading(false);
    setDeleting(null);
    setOpen(false);

    if (error) {
      setData(prevDataCapture);
      alert("No se pudo eliminar la materia: " + error.message);
    }
  }, [deleting, setData, setDeleting, setOpen]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar carrera</DialogTitle>
          <DialogDescription>
            Esta acción eliminará{" "}
            <span className="font-medium">
              {deleting?.nombre ?? "esta carrera"}
            </span>
            . No podrás deshacerlo.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          ¿Seguro que deseas continuar?
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
            {loading ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
