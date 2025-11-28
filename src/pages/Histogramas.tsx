import { useEffect, useState, useRef } from "react";
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
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";

// ✅ Colores HEX seguros
const COLORS = ["#000B58", "#003161", "#006A67", "#FDEB9E", "#3b82f6", "#e03b3b"];

type Formato = "excel" | "csv" | "pdf" | "todos";

function Histograma() {
  const [data, setData] = useState<any[]>([]);
  const [factores, setFactores] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function obtenerDatosHistograma() {
      const { data: estudiantes, error } = await supabase
        .from("estudiante")
        .select(`
          calificacionasistencia( materia(nombre) ),
          riesgoestudiante( factorriesgo(categoria) )
        `);

      if (error) {
        console.error("Error al obtener datos:", error.message);
        return;
      }

      const conteoPorMateria: Record<string, any> = {};
      const categoriasSet: Set<string> = new Set<string>();

      for (const estudiante of estudiantes) {
        const materias =
          estudiante.calificacionasistencia?.map(
            (c: any) => c.materia?.nombre
          ) || [];

        const factoresEst =
          estudiante.riesgoestudiante?.map(
            (r: any) => r.factorriesgo?.categoria
          ) || [];

        for (const materia of materias) {
          if (!materia) continue;
          if (!conteoPorMateria[materia]) conteoPorMateria[materia] = { materia };

          for (const factor of factoresEst) {
            if (!factor) continue;
            categoriasSet.add(factor);
            conteoPorMateria[materia][factor] =
              (conteoPorMateria[materia][factor] || 0) + 1;
          }
        }
      }

      const datosArray: any[] = Object.values(conteoPorMateria);
      setData(datosArray);
      setFactores(Array.from(categoriasSet));
    }

    obtenerDatosHistograma();
  }, []);

  const generarNombreArchivo = (base: string, ext: string) => {
    const f = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
    return `${base}_${f}.${ext}`;
  };

  const guardarArchivo = (blob: Blob, nombre: string) => {
    saveAs(blob, nombre);
  };

  const getDatosTabulares = () => {
    const columnas = ["materia", ...factores];
    const filasNormalizadas = data.map((row) => {
      const obj: Record<string, number | string> = { materia: row.materia };
      factores.forEach((f) => (obj[f] = row[f] || 0));
      return obj;
    });
    return { columnas, filasNormalizadas };
  };

  // ✅ MODIFICADO: Agregado parámetro 'mostrarAlerta' (por defecto true)
  const exportarExcel = async (mostrarAlerta = true) => {
    try {
      if (!data || data.length === 0) {
        alert("⚠️ No hay datos para exportar.");
        return;
      }
      const { columnas, filasNormalizadas } = getDatosTabulares();
      await new Promise((r) => setTimeout(r, 500));
      
      const chartElement = chartRef.current;
      if (!chartElement) throw new Error("No se encontró el gráfico.");

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const workbook = new ExcelJS.Workbook();
      
      const sheet = workbook.addWorksheet("Datos");
      const headerRow = sheet.addRow(columnas);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } };
      });
      sheet.columns = columnas.map(() => ({ width: 20 }));

      filasNormalizadas.forEach((fila) => {
        const rowData = columnas.map(col => fila[col]);
        sheet.addRow(rowData);
      });

      const chartSheet = workbook.addWorksheet("Gráfico");
      const imageId = workbook.addImage({ base64: imgData, extension: "png" });
      chartSheet.addImage(imageId, { tl: { col: 1, row: 1 }, ext: { width: 700, height: 400 } });
      chartSheet.getCell("A20").value = "Gráfico generado automáticamente.";

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), generarNombreArchivo("histograma", "xlsx"));

      // ✅ Alerta de éxito
      if (mostrarAlerta) alert("¡Archivo Excel exportado con éxito!");

    } catch (err: any) {
      console.error("Error Excel:", err);
      alert(`Error al exportar Excel: ${err.message}`);
    }
  };

  // ✅ MODIFICADO: Agregado parámetro 'mostrarAlerta'
  const exportarCSV = async (mostrarAlerta = true) => {
    try {
      if (!data.length) return alert("⚠️ No hay datos para exportar.");
      const { filasNormalizadas } = getDatosTabulares();
      const ws = XLSX.utils.json_to_sheet(filasNormalizadas);
      const csv = XLSX.utils.sheet_to_csv(ws);
      guardarArchivo(new Blob([csv], { type: "text/csv;charset=utf-8" }), generarNombreArchivo("histograma", "csv"));
      
      // ✅ Alerta de éxito
      if (mostrarAlerta) alert("¡Archivo CSV exportado con éxito!");
    } catch (err: any) {
      alert(`Error al exportar CSV: ${err.message}`);
    }
  };

  // ✅ MODIFICADO: Agregado parámetro 'mostrarAlerta'
  const exportarPDF = async (mostrarAlerta = true) => {
    try {
      if (!chartRef.current) throw new Error("Gráfico no encontrado.");
      
      const { columnas, filasNormalizadas } = getDatosTabulares();
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Histograma de Riesgos por Materia", doc.internal.pageSize.getWidth() / 2, 45, { align: "center" });
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Generado automáticamente", doc.internal.pageSize.getWidth() / 2, 65, { align: "center" });

      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 540;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
      const imgY = 90;

      doc.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

      const filasTabla = filasNormalizadas.map((fila) => columnas.map((col) => fila[col] ?? 0));

      autoTable(doc, {
        head: [columnas],
        body: filasTabla,
        startY: imgY + imgHeight + 40,
        theme: "grid",
        styles: { fontSize: 9, halign: "center" },
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
      });

      const blob = doc.output("blob");
      guardarArchivo(blob, generarNombreArchivo("histograma", "pdf"));
      
      // ✅ Alerta de éxito
      if (mostrarAlerta) alert("¡Archivo PDF exportado con éxito!");
      
    } catch (err: any) {
      console.error("Error PDF:", err);
      if (err.message && err.message.includes("oklch")) {
        alert("Error de compatibilidad de colores. Intenta recargar la página.");
      } else {
        alert(`Error al exportar PDF: ${err.message}`);
      }
    }
  };

  // ✅ MODIFICADO: Lógica para manejar las alertas (individual o grupal)
  const handleExportar = async (fmt: Formato) => {
    if (!data.length) return alert("No hay datos disponibles para exportar.");
    setTimeout(async () => {
      switch (fmt) {
        case "excel": 
          await exportarExcel(true); 
          break;
        case "csv": 
          await exportarCSV(true); 
          break;
        case "pdf": 
          await exportarPDF(true); 
          break;
        case "todos":
          // Aquí pasamos 'false' para que NO salga alerta en cada uno
          await exportarExcel(false); 
          await exportarCSV(false); 
          await exportarPDF(false);
          // Y mostramos una sola alerta al final
          alert("¡Todos los archivos (Excel, CSV, PDF) se han exportado con éxito!");
          break;
      }
    }, 100);
  };

  // --- ACCESIBILIDAD (ATAJOS) ---
  useEffect(() => {
    const manejarAtajos = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.altKey && e.key.toLowerCase() === 'e') { e.preventDefault(); handleExportar('excel'); }
      if (e.altKey && e.key.toLowerCase() === 'c') { e.preventDefault(); handleExportar('csv'); }
      if (e.altKey && e.key.toLowerCase() === 'p') { e.preventDefault(); handleExportar('pdf'); }
      if (e.altKey && e.key.toLowerCase() === 't') { e.preventDefault(); handleExportar('todos'); }
    };
    window.addEventListener('keydown', manejarAtajos);
    return () => window.removeEventListener('keydown', manejarAtajos);
  }, [data]);

  return (
    <MainLayout text="Histograma">
      <div className="p-6 text-primary">
        <h2 className="text-2xl font-semibold mb-4">
          Histograma de Riesgos por Materia
        </h2>
        <p className="mb-4">
          Frecuencia de factores de riesgo agrupados por cada materia.
        </p>

        <div
          ref={chartRef}
          className="w-full h-[400px] p-4 rounded-2xl shadow-md"
          style={{ backgroundColor: "#ffffff", color: "#333333" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis stroke="#666666" tick={{ fill: "#666666" }} dataKey="materia" />
              <YAxis stroke="#666666" tick={{ fill: "#666666" }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc", color: "#000" }}
                itemStyle={{ color: "#000" }}
              />
              <Legend wrapperStyle={{ color: "#000000" }} />
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

        {/* ✅ RESTAURADO: Botones usando .map exactamente como en tu código original */}
        <div className="flex flex-wrap gap-3 mt-6">
          {(["excel", "csv", "pdf", "todos"] as Formato[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportar(fmt)}
              title={`Exportar como ${fmt.toUpperCase()} (Atajo: Alt + ${fmt.charAt(0).toUpperCase()})`}
              className="cursor-pointer hover:border-2 hover:border-primary hover:bg-secondary hover:text-primary 
                         bg-primary text-neutral rounded-2xl w-50 h-10 m-5 px-6 font-medium transition-all
                         focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent"
            >
              Exportar {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default Histograma;