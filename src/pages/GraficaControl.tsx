import { useEffect, useState, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import supabase from "../utils/supabaseClient";
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
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";

type Formato = "excel" | "csv" | "pdf" | "todos";

interface PuntoControl {
  unidad: number;
  calificacion: number;
  media: number;
  ucl: number;
  lcl: number;
}

function GraficaControl() {
  const [data, setData] = useState<PuntoControl[]>([]);
  const [mean, setMean] = useState(0);
  const [ucl, setUcl] = useState(0);
  const [lcl, setLcl] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

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
        const calificaciones = rows.map((r: any) => Number(r.calificacion));

        const meanValue =
          calificaciones.reduce((a: number, b: number) => a + b, 0) /
          calificaciones.length;

        const stdDev = Math.sqrt(
          calificaciones
            .map((c: number) => Math.pow(c - meanValue, 2))
            .reduce((a: number, b: number) => a + b, 0) / calificaciones.length
        );

        const upper = meanValue + 3 * stdDev;
        const lower = meanValue - 3 * stdDev;

        setMean(meanValue);
        setUcl(upper);
        setLcl(lower);

        const sorted = [...rows]
          .sort((a: any, b: any) => a.unidad - b.unidad)
          .map((r: any) => ({
            unidad: Number(r.unidad),
            calificacion: Number(r.calificacion),
            media: meanValue,
            ucl: upper,
            lcl: lower,
          }));

        setData(sorted);
      }
    }

    fetchData();
  }, []);

  const generarNombreArchivo = (base: string, ext: string) => {
    const f = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
    return `${base}_${f}.${ext}`;
  };

  const guardarArchivo = (blob: Blob, nombre: string) => {
    saveAs(blob, nombre);
  };

  const prepararDatosExport = () => {
    if (!data || data.length === 0) {
      return {
        rows: [] as PuntoControl[],
        headersBonitos: [] as string[],
        rowsParaPDF: [] as (string | number)[][],
      };
    }

    const rows = data;

    const headersBonitos = [
      "Unidad",
      "Calificación",
      "Media",
      "UCL (+3σ)",
      "LCL (-3σ)",
    ];

    const rowsParaPDF = rows.map((p) => [
      p.unidad,
      p.calificacion,
      p.media.toFixed(2),
      p.ucl.toFixed(2),
      p.lcl.toFixed(2),
    ]);

    return { rows, headersBonitos, rowsParaPDF };
  };

const exportarExcel = async () => {
    if (!data || data.length === 0) {
      alert("⚠️ No hay datos para exportar en Excel.");
      return;
    }

    const { rows } = prepararDatosExport();
    const filasExcel = rows.map((p) => ({
      Unidad: p.unidad,
      Calificacion: p.calificacion,
      Media: Number(p.media.toFixed(2)),
      UCL_3s: Number(p.ucl.toFixed(2)),
      LCL_3s: Number(p.lcl.toFixed(2)),
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Datos");

    sheet.addRow(["Unidad", "Calificación", "Media", "UCL (+3σ)", "LCL (-3σ)"]);

    filasExcel.forEach((fila) => {
      sheet.addRow([
        fila.Unidad,
        fila.Calificacion,
        fila.Media,
        fila.UCL_3s,
        fila.LCL_3s,
      ]);
    });

    const encabezados = sheet.getRow(1);
    encabezados.font = { bold: true, color: { argb: "FFFFFF" } };
    encabezados.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
    encabezados.alignment = { horizontal: "center", vertical: "middle" };

    sheet.columns.forEach((col, idx) => {
      let maxLength = 0;
      
      sheet.eachRow((row, rowIndex) => {
        const cellValue = String(row.getCell(idx + 1).value);
        maxLength = Math.max(maxLength, cellValue.length);
      });
      col.width = maxLength + 2; 
    });

    const chartSheet = workbook.addWorksheet("Gráfico");

    const chartElement = chartRef.current;
    if (!chartElement) {
      alert("No se encontró el gráfico.");
      return;
    }

    const canvas = await html2canvas(chartElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Agregar la imagen al Excel
    const imageId = workbook.addImage({
      base64: imgData,
      extension: "png",
    });

    chartSheet.addImage(imageId, {
      tl: { col: 1, row: 1 },
      ext: { width: 700, height: 400 },
    });

    // Guardar el archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), generarNombreArchivo("grafica_control", "xlsx"));

    alert("✅ Exportación a Excel completada correctamente.");
};


  const exportarCSV = async () => {
    if (!data || data.length === 0) {
      alert("⚠️ No hay datos para exportar en CSV.");
      return;
    }

    const { rows } = prepararDatosExport();

    const filasCSV = rows.map((p) => ({
      Unidad: p.unidad,
      Calificacion: p.calificacion,
      Media: Number(p.media.toFixed(2)),
      UCL_3s: Number(p.ucl.toFixed(2)),
      LCL_3s: Number(p.lcl.toFixed(2)),
    }));

    const ws = XLSX.utils.json_to_sheet(filasCSV);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    guardarArchivo(blob, generarNombreArchivo("grafica_control", "csv"));
  };

  const exportarPDF = async () => {
    if (!chartRef.current) {
      alert("No pude capturar la gráfica.");
      return;
    }

    const { headersBonitos, rowsParaPDF } = prepararDatosExport();

    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Gráfica de Control: Calificación por Unidad", 40, 40);

    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");

    const imgWidth = 500;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    doc.addImage(imgData, "PNG", 40, 60, imgWidth, imgHeight);

    autoTable(doc, {
      head: [headersBonitos],
      body: rowsParaPDF,
      startY: 80 + imgHeight,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    const blob = doc.output("blob");
    guardarArchivo(blob, generarNombreArchivo("grafica_control", "pdf"));
  };

  const handleExportar = async (fmt: Formato) => {
    if (!data.length) {
      alert("No hay datos disponibles para exportar.");
      return;
    }

    switch (fmt) {
      case "excel":
        await exportarExcel();
        break;
      case "csv":
        await exportarCSV();
        break;
      case "pdf":
        await exportarPDF();
        break;
      case "todos":
        await exportarExcel();
        await exportarCSV();
        await exportarPDF();
        break;
    }

    alert("Exportación completada correctamente.");
  };

  return (
    <MainLayout text="Gráfica de Control">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Gráfica de Control</h2>
        <p className="mb-4">
          Esta gráfica muestra la variación de las calificaciones por unidad, junto con los
          límites de control estadístico (±3σ) y la media general.
        </p>

        <div
          ref={chartRef}
          className="w-full h-[400px] bg-white p-4 rounded-2xl shadow-md"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="unidad"
                label={{
                  value: "Unidad",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Calificación",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="calificacion"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Calificación"
              />

              <ReferenceLine
                y={mean}
                label="Media"
                stroke="green"
                strokeDasharray="5 5"
              />
              <ReferenceLine
                y={ucl}
                label="UCL (+3σ)"
                stroke="red"
                strokeDasharray="5 5"
              />
              <ReferenceLine
                y={lcl}
                label="LCL (-3σ)"
                stroke="red"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {(["excel", "csv", "pdf", "todos"] as Formato[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportar(fmt)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Exportar {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default GraficaControl;
