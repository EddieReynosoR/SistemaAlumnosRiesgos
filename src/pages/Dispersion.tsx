import { useEffect, useState, useRef } from "react";
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
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";

type Formato = "excel" | "csv" | "pdf" | "todos";

function Dispersion() {
  const [data, setData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function obtenerDatosDispersion() {
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

      setData(datosProcesados);
    }

    obtenerDatosDispersion();
  }, []);

  const generarNombreArchivo = (base: string, ext: string) => {
    const f = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
    return `${base}_${f}.${ext}`;
  };

  const guardarArchivo = (blob: Blob, nombre: string) => {
    saveAs(blob, nombre);
  };

  const exportarExcel = async () => {
    try {
      if (!data || data.length === 0) {
        alert("⚠️ No hay datos para exportar.");
        return;
      }

      await new Promise((r) => setTimeout(r, 500));

      const chartElement = chartRef.current;
      if (!chartElement) throw new Error("Gráfico no encontrado");

      // ✅ Configuración corregida para html2canvas
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff", // Fondo blanco forzado
      });
      const imgData = canvas.toDataURL("image/png");

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Datos");

      const columnas = Object.keys(data[0] || {});
      columnas.forEach((col, i) => {
        sheet.getCell(1, i + 1).value = col;
        sheet.getCell(1, i + 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getCell(1, i + 1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" },
        };
        sheet.getColumn(i + 1).width = 18;
      });

      data.forEach((fila, filaIdx) => {
        columnas.forEach((col, colIdx) => {
          sheet.getCell(filaIdx + 2, colIdx + 1).value = fila[col];
        });
      });

      const chartSheet = workbook.addWorksheet("Gráfico");
      const imageId = workbook.addImage({
        base64: imgData,
        extension: "png",
      });

      chartSheet.addImage(imageId, {
        tl: { col: 1, row: 1 },
        ext: { width: 700, height: 400 },
      });

      chartSheet.getCell("A20").value =
        "Gráfica de Dispersión (Asistencia vs Calificación)";

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        generarNombreArchivo("grafica_dispersion", "xlsx")
      );

    } catch (err: any) {
      console.error("Error Excel:", err);
      alert(`Error al exportar Excel: ${err.message}`);
    }
  };

  const exportarCSV = async () => {
    if (!data.length) {
        alert("No hay datos.");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    guardarArchivo(blob, generarNombreArchivo("grafica_dispersion", "csv"));
  };

  const exportarPDF = async () => {
    try {
      if (!chartRef.current) throw new Error("Gráfico no encontrado");

      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("Gráfica de Dispersión: Calificación vs Asistencia", doc.internal.pageSize.getWidth() / 2, 45, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Generado automáticamente", doc.internal.pageSize.getWidth() / 2, 65, { align: "center" });

      // ✅ Configuración corregida para html2canvas
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff", // Fondo blanco forzado
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 540;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
      const imgY = 90;

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(1);
      doc.rect(imgX - 5, imgY - 5, imgWidth + 10, imgHeight + 10);
      doc.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

      const columnas = Object.keys(data[0] || {});
      const filas = data.map((fila) => columnas.map((k) => fila[k]));

      // ✅ Estilos de tabla con colores fijos
      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: imgY + imgHeight + 40,
        theme: "grid",
        styles: { fontSize: 9, halign: "center" },
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
      });

      const blob = doc.output("blob");
      guardarArchivo(blob, generarNombreArchivo("grafica_dispersion", "pdf"));
    } catch (err: any) {
      console.error("Error PDF:", err);
      alert(`Error al exportar PDF: ${err.message}`);
    }
  };

  const handleExportar = async (fmt: Formato) => {
    if (!data.length) {
      alert("No hay datos disponibles para exportar.");
      return;
    }
    setTimeout(async () => {
        switch (fmt) {
        case "excel": await exportarExcel(); break;
        case "csv": await exportarCSV(); break;
        case "pdf": await exportarPDF(); break;
        case "todos": await exportarExcel(); await exportarCSV(); await exportarPDF(); break;
        }
    }, 100);
  };

  // --- ACCESIBILIDAD (ATAJOS) ---
  useEffect(() => {
    const manejarAtajos = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // ✅ Atajos E, C, P y T (Todos)
      if (e.altKey && e.key.toLowerCase() === 'e') { e.preventDefault(); handleExportar('excel'); }
      if (e.altKey && e.key.toLowerCase() === 'c') { e.preventDefault(); handleExportar('csv'); }
      if (e.altKey && e.key.toLowerCase() === 'p') { e.preventDefault(); handleExportar('pdf'); }
      if (e.altKey && e.key.toLowerCase() === 't') { e.preventDefault(); handleExportar('todos'); }
    };
    window.addEventListener('keydown', manejarAtajos);
    return () => window.removeEventListener('keydown', manejarAtajos);
  }, [data]);

  return (
    <MainLayout text="Diagrama de Dispersión">
      <div className="p-6 text-primary">
        <h2 className="text-2xl font-semibold mb-4">Diagrama de Dispersión</h2>
        <p className="mb-4 text-neutral">
          Relación entre la asistencia y la calificación de los estudiantes.
        </p>

        {/* ✅ Contenedor con fondo blanco explícito para exportación */}
        <div 
          ref={chartRef} 
          className="w-full h-[400px] p-4 rounded-2xl shadow-md"
          style={{ backgroundColor: "#ffffff", color: "#333333" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* ✅ Ejes con colores HEX fijos */}
              <XAxis 
                stroke="#666666" 
                tick={{ fill: "#666666" }} 
                type="number" 
                dataKey="asistencia" 
                name="Asistencia" 
                unit="%"
              >
                <Label fill="#666666" value="Asistencia (%)" offset={-20} position="insideBottom" />
              </XAxis>
              <YAxis 
                stroke="#666666" 
                tick={{ fill: "#666666" }} 
                type="number" 
                dataKey="calificacion" 
                name="Calificación" 
                domain={[0, 100]}
              >
                <Label
                  fill="#666666"
                  value="Calificación (0-100)"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc", color: "#000" }} />
              <Scatter
                name="Relación Calificación/Asistencia"
                data={data}
                fill="#3b82f6" // ✅ Color HEX fijo para los puntos
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Botones con accesibilidad (focus ring y tooltips) */}
        <div className="flex flex-wrap gap-3 mt-6">
          {(["excel", "csv", "pdf", "todos"] as Formato[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportar(fmt)}
              title={`Exportar como ${fmt.toUpperCase()} (Atajo: Alt + ${fmt === "todos" ? "T" : fmt.charAt(0).toUpperCase()})`}
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

export default Dispersion;