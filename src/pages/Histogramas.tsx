import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout"; 
import supabase from "../utils/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#3b82f6", "#e03b3b"];

function Histograma() {
  const [data, setData] = useState([]);
  const [factores, setFactores] = useState([]);

  useEffect(() => {
    async function obtenerDatosHistograma() {
    
      const { data: estudiantes, error } = await supabase
        .from("estudiante")
        .select(
          `
          calificacionasistencia( materia(nombre) ),
          riesgoestudiante( factorriesgo(categoria) )
        `
        );

      if (error) {
        console.error("Error al obtener datos:", error.message);
        return;
      }
      
      const conteoPorMateria = {};
      const categoriasSet = new Set(); 

      for (const estudiante of estudiantes) {
        const materias = estudiante.calificacionasistencia.map(
          (c) => c.materia?.nombre
        );
        const factores = estudiante.riesgoestudiante.map(
          (r) => r.factorriesgo?.categoria
        );

        for (const materia of materias) {
          if (!materia) continue; 

          if (!conteoPorMateria[materia]) {
            conteoPorMateria[materia] = { materia: materia };
          }

          for (const factor of factores) {
            if (!factor) continue; 
            categoriasSet.add(factor); 
            conteoPorMateria[materia][factor] = (conteoPorMateria[materia][factor] || 0) + 1;
          }
        }
      }

      const datosArray = Object.values(conteoPorMateria);
      
      console.log("Datos FINALES para el Histograma:", datosArray); 
      setData(datosArray);
      setFactores(Array.from(categoriasSet)); 
    }

    obtenerDatosHistograma();
  }, []);

  return (
    <MainLayout text="Histograma">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Histograma de Riesgos por Materia</h2>
        <p className="mb-4">
          Frecuencia de factores de riesgo agrupados por cada materia.
        </p>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="materia" /> 
              <YAxis allowDecimals={false} /> 
              <Tooltip />
              <Legend />
              
              {factores.map((factor, index) => (
                <Bar
                  key={factor}
                  dataKey={factor}
                  name={factor}
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}

export default Histograma;