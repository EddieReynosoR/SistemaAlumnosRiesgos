import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import  supabase  from "../utils/supabaseClient";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Pareto() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function obtenerDatos() {
      const { data, error } = await supabase
        .from("factorriesgo")
        .select("categoria");

      if (error) {
        console.error("Error al obtener datos:", error.message);
        return;
      }

      const conteo = data.reduce((acc, item) => {
        const cat = item.categoria || "Sin categoria";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const datosArray = Object.entries(conteo).map(([categoria, frecuencia]) => ({
        categoria,
        frecuencia,
      }));

      datosArray.sort((a, b) => b.frecuencia - a.frecuencia);

      const total = datosArray.reduce((sum, d) => sum + d.frecuencia, 0);
      let acumulado = 0;
      const datosPareto = datosArray.map((d) => {
        acumulado += d.frecuencia;
        return {
          ...d,
          porcentaje: ((acumulado / total) * 100).toFixed(2),
        };
      });

      setData(datosPareto);
    }

    obtenerDatos();
  }, []);

  return (
    <MainLayout text="Análisis de Pareto">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Análisis de Pareto</h2>
        <p className="mb-4">
          Este gráfico muestra la distribución de las categorías de factores de riesgo.
        </p>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="frecuencia"
                fill="#3b82f6"
                barSize={40}
                name="Frecuencia"
              />
              <Line
                yAxisId="right"
                dataKey="porcentaje"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Porcentaje acumulado"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}

export default Pareto;
