import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import  supabase  from "../utils/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

function GraficaControl() {
  const [data, setData] = useState([]);
  const [mean, setMean] = useState(0);
  const [ucl, setUcl] = useState(0);
  const [lcl, setLcl] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { data: rows, error } = await supabase
        .from("calificacionasistencia")
        .select("unidad, calificacion");

      if (error) {
        console.error("Error al obtener datos:", error);
        return;
      }

      if (rows && rows.length > 0) {
        // 🔹 Calcular promedio
        const calificaciones = rows.map((r) => Number(r.calificacion));
        const meanValue =
          calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;

        // 🔹 Desviación estándar
        const stdDev = Math.sqrt(
          calificaciones
            .map((c) => Math.pow(c - meanValue, 2))
            .reduce((a, b) => a + b, 0) / calificaciones.length
        );

        // 🔹 Límites de control ±3σ
        const upper = meanValue + 3 * stdDev;
        const lower = meanValue - 3 * stdDev;

        setMean(meanValue);
        setUcl(upper);
        setLcl(lower);

        // 🔹 Ordenar por unidad
        const sorted = rows.sort((a, b) => a.unidad - b.unidad);
        setData(sorted);
      }
    }

    fetchData();
  }, []);

  return (
    <MainLayout text="Gráfica de Control">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Gráfica de Control</h2>
        <p className="mb-4">
          Esta gráfica muestra la variación de las calificaciones por unidad,
          junto con los límites de control estadístico.
        </p>

        <div className="w-full h-[400px] bg-white p-4 rounded-2xl shadow-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="unidad" label={{ value: "Unidad", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Calificación", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />

              {/* Línea de calificaciones */}
              <Line
                type="monotone"
                dataKey="calificacion"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Calificación"
              />

              {/* Líneas de control */}
              <ReferenceLine y={mean} label="Media" stroke="green" strokeDasharray="5 5" />
              <ReferenceLine y={ucl} label="UCL (+3σ)" stroke="red" strokeDasharray="5 5" />
              <ReferenceLine y={lcl} label="LCL (-3σ)" stroke="red" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}

export default GraficaControl;