import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";
import supabase from "@/utils/supabaseClient";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Materia = { idmateria: string; nombre: string };

export default function MateriaSelect({
  materiaId,
  setMateriaId,
}: {
  materiaId: string | undefined;
  setMateriaId: (v: string) => void;
}) {
  const { docente } = useSession();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!docente?.iddocente) {
        setMaterias([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("materia")
        .select("idmateria, nombre")
        .eq("iddocente", docente.iddocente)
        .order("nombre", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Error cargando materias:", error);
        setMaterias([]);
      } else {
        setMaterias((data ?? []) as Materia[]);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [docente?.iddocente]);

  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor="materia">Materia</Label>
      <Select
        value={materiaId}
        onValueChange={setMateriaId}
        disabled={loading || materias.length === 0}
      >
        <SelectTrigger id="materia" className="w-full">
          <SelectValue
            placeholder={loading ? "Cargando..." : "Selecciona una materia"}
          />
        </SelectTrigger>

        {/* ajusta el ancho al de tu DialogContent (por ejemplo 700 u 800) */}
        <SelectContent className="w-[800px]">
          {materias.map((m) => (
            <SelectItem key={m.idmateria} value={m.idmateria}>
              {m.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
