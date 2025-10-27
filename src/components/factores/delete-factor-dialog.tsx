import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useState, useCallback } from "react";

import { type Factor } from "@/utils/types";

import supabase from "@/utils/supabaseClient";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  deleting: Factor | null;
  setDeleting: (m: Factor | null) => void;
  setData: React.Dispatch<React.SetStateAction<Factor[]>>;
};

export default function DeleteFactorDialog({
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

        const prevDataCapture: Factor[] = [];
            setData((curr) => {
              prevDataCapture.push(...curr);
              return curr.filter((f) => f.idfactor !== deleting.idfactor);
            });

        const { error } = await supabase
            .from("factorriesgo")
            .delete()
            .eq("idfactor", deleting.idfactor);

        setLoading(false);
        setDeleting(null);
        setOpen(false);

        if (error) {
      setData(prevDataCapture);
      alert("No se pudo eliminar el factor: " + error.message);
    }
    }, [deleting, setData, setDeleting, setOpen]);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => !o && onClose()}
            >
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Eliminar factor</DialogTitle>
                <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el factor de manera permanente.
                </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 pt-1">
                <p className="text-sm">Confirma que deseas eliminar:</p>
                <div className="rounded-md border p-3 text-sm">
                    <div><span className="font-medium">Descripción:</span> {deleting?.descripcion}</div>
                    <div><span className="font-medium">Categoría:</span> {deleting?.categoria}</div>
                </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={loading}
                >
                    {loading ? "Eliminando…" : "Eliminar"}
                </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}