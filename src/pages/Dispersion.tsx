import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout"; 
import supabase from "../utils/supabaseClient";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label, 
} from "recharts";

function Dispersion() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function obtenerDatosDispersion() {
      // consulta las columnas de asistencia y calificacion
      const { data: datosCrudos, error } = await supabase
        .from("calificacionasistencia")
        .select("asistencia, calificacion");

      if (error) {
        console.error("Error al obtener datos:", error.message);
        return;
      }

      const datosProcesados = datosCrudos.map((d) => ({
        asistencia: Number(d.asistencia),
        calificacion: Number(d.calificacion),
      }));

      console.log("Datos FINALES para Dispersión:", datosProcesados); 
      setData(datosProcesados);
    }

    obtenerDatosDispersion();
  }, []);

  return (
    <MainLayout text="Diagrama de Dispersión">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Diagrama de Dispersión</h2>
        <p className="mb-4">
          Relación entre la asistencia y la calificación de los estudiantes por
          unidad.
        </p>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20, right: 20, bottom: 30, left: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              
              <XAxis
                type="number"
                dataKey="asistencia"
                name="Asistencia"
                unit="%"
              >
                <Label value="Asistencia (%)" offset={-20} position="insideBottom" />
              </XAxis>

              <YAxis
                type="number"
                dataKey="calificacion"
                name="Calificación"
                domain={[0, 100]} 
              >
                 <Label value="Calificación (0-100)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>

              <Tooltip cursor={{ strokeDasharray: "3 3" }} />

              <Scatter
                name="Relación Calificación/Asistencia"
                data={data}
                fill="#3b82f6" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dispersion;