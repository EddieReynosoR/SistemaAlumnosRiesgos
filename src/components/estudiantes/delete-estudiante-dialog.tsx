import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useState, useCallback } from "react";

import { type EstudianteConCarrera } from "@/utils/types";

import supabase from "@/utils/supabaseClient";

import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  deleting: EstudianteConCarrera | null;
  setDeleting: (m: EstudianteConCarrera | null) => void;
  setData: React.Dispatch<React.SetStateAction<EstudianteConCarrera[]>>;
};

export default function DeleteEstudianteDialog({
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
    
        const prevDataCapture: EstudianteConCarrera[] = [];
                    setData((curr) => {
                      prevDataCapture.push(...curr);
                      return curr.filter((e) => e.idestudiante !== deleting.idestudiante);
                    });
    
        const { error } = await supabase
          .from("estudiante")
          .delete()
          .eq("idestudiante", deleting.idestudiante);
    
        setLoading(false);
        setDeleting(null);
        setLoading(false);
        setOpen(false);
    
        if (error) {
          setData(prevDataCapture);
          toast.error("No se pudo eliminar al estudiante: " + error.message);
          return;
        }

        toast.success("Se eliminó al estudiante de forma correcta.");
      }, [deleting, setData, setDeleting, setOpen]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="text-text">
          <DialogHeader>
            <DialogTitle>Eliminar estudiante</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar al estudiante{" "}
              <strong>
                {deleting?.nombre} {deleting?.apellidopaterno}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              className="cursor-pointer text-text bg-neutral hover:bg-neutral/90"
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
}