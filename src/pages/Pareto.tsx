import { useEffect, useState, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import supabase from "../utils/supabaseClient";
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
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

function Pareto() {
  const [data, setData] = useState([]);
  const chartRef = useRef(null);

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

  // ✅ Exportar Excel con la gráfica incluida
  const exportToExcelWithChart = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Pareto");

    // Encabezados
    worksheet.columns = [
      { header: "Categoría", key: "categoria", width: 30 },
      { header: "Frecuencia", key: "frecuencia", width: 15 },
      { header: "Porcentaje", key: "porcentaje", width: 15 },
    ];

    // Datos
    data.forEach((item) => worksheet.addRow(item));

    // Agregar imagen
    const imageId = workbook.addImage({
      base64: imgData,
      extension: "png",
    });

    // Insertar imagen (posición fila 1, columna 5)
    worksheet.addImage(imageId, {
      tl: { col: 5, row: 1 },
      ext: { width: 500, height: 300 },
    });

    // Generar buffer y guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "pareto_con_grafica.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Análisis de Pareto", 20, 20);

    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 20, 30, 180, 100);
        doc.text("Datos de Pareto:", 20, 140);
        data.forEach((d, index) => {
          doc.text(
            `${d.categoria}: Frecuencia ${d.frecuencia}, Porcentaje ${d.porcentaje}%`,
            20,
            150 + index * 10
          );
        });
        doc.save("pareto.pdf");
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Categoria", "Frecuencia", "Porcentaje"],
      ...data.map((d) => [d.categoria, d.frecuencia, d.porcentaje]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, "pareto.csv");
  };

  const exportAll = () => {
    exportToExcelWithChart();
    exportToCSV();
    exportToPDF();
  };

  return (
    <MainLayout text="Análisis de Pareto">
      <div className="p-4 text-primary">
        <h2 className="text-2xl font-semibold mb-4">Análisis de Pareto</h2>
        <p className="mb-4">
          Este gráfico muestra la distribución de las categorías de factores de riesgo.
        </p>

        <div className="w-full h-[400px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis stroke="var(--text)" dataKey="categoria" />
              <YAxis stroke="var(--text)" yAxisId="left" />
              <YAxis stroke="var(--text)" yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="frecuencia"
                fill="var(--primary)"
                barSize={40}
                name="Frecuencia"
              />
              <Line
                yAxisId="right"
                dataKey="porcentaje"
                stroke="var(--neutral)"
                strokeWidth={3}
                name="Porcentaje acumulado"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={exportAll}
            className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
          >
            Exportar Todo
          </button>
          <button
            onClick={exportToExcelWithChart}
            className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
          >
            Exportar Excel
          </button>
          <button
            onClick={exportToCSV}
            className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportToPDF}
            className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
          >
            Exportar PDF
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default Pareto;
