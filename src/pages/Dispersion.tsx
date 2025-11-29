import { useEffect, useState, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import supabase from "../utils/supabaseClient";
import {
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
  Legend
} from "recharts";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";

type Formato = "excel" | "csv" | "pdf" | "todos";

// Función para calcular la regresión lineal (Línea de tendencia)
function calcularLineaTendencia(datos: any[]) {
  const n = datos.length;
  if (n < 2) return [];

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  let minX = datos[0].asistencia;
  let maxX = datos[0].asistencia;

  for (let i = 0; i < n; i++) {
    const x = datos[i].asistencia;
    const y = datos[i].calificacion;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  return [
    { asistencia: minX, calificacion: m * minX + b, tipo: "tendencia" },
    { asistencia: maxX, calificacion: m * maxX + b, tipo: "tendencia" }
  ];
}

// Tooltip Personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload.find((p: any) => p.payload.tipo !== "tendencia");
    if (dataPoint) {
      return (
        <div className="bg-white p-3 border border-gray-300 shadow-md rounded-md text-sm text-black">
          <p className="font-bold mb-1">{dataPoint.payload.nombreCompleto}</p>
          <p>Asistencia: <span className="font-semibold">{dataPoint.payload.asistencia}%</span></p>
          <p>Calificación: <span className="font-semibold">{dataPoint.payload.calificacion}</span></p>
        </div>
      );
    }
    return null;
  }
  return null;
};

function Dispersion() {
  const [data, setData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function obtenerDatosDispersion() {
      const { data: datosCrudos, error } = await supabase
        .from("calificacionasistencia")
        .select(`
          asistencia, 
          calificacion,
          estudiante (
            nombre,
            apellidopaterno
          )
        `);

      if (error) {
        console.error("Error al obtener datos:", error.message);
        return;
      }

      const datosProcesados = datosCrudos
        .map((d: any) => ({
          asistencia: Number(d.asistencia),
          calificacion: Number(d.calificacion),
          nombreCompleto: d.estudiante 
            ? `${d.estudiante.nombre} ${d.estudiante.apellidopaterno}` 
            : "Estudiante Desconocido",
          tipo: "estudiante"
        }))
        .sort((a, b) => a.asistencia - b.asistencia);

      setData(datosProcesados);

      if (datosProcesados.length > 1) {
        setTrendData(calcularLineaTendencia(datosProcesados));
      }
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

  // --- Funciones de Exportación ---
  const exportarExcel = async (mostrarAlerta = true) => {
    if (!chartRef.current) return;
    try {
        const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Datos");
        
        sheet.columns = [
            { header: "Estudiante", key: "nombreCompleto", width: 25 },
            { header: "Asistencia", key: "asistencia", width: 15 },
            { header: "Calificación", key: "calificacion", width: 15 },
        ];
        
        data.forEach((item) => sheet.addRow(item));

        const chartSheet = workbook.addWorksheet("Gráfico");
        const imageId = workbook.addImage({ base64: imgData, extension: "png" });
        chartSheet.addImage(imageId, { tl: { col: 1, row: 1 }, ext: { width: 700, height: 400 } });
        
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), generarNombreArchivo("dispersion", "xlsx"));

        if (mostrarAlerta) alert("¡Archivo Excel exportado con éxito!");

    } catch (e) { console.error(e); }
  };

  const exportarCSV = (mostrarAlerta = true) => {
    const csvContent = [
        ["Estudiante", "Asistencia", "Calificacion"],
        ...data.map((d) => [d.nombreCompleto, d.asistencia, d.calificacion]),
    ].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    guardarArchivo(blob, generarNombreArchivo("dispersion", "csv"));

    if (mostrarAlerta) alert("¡Archivo CSV exportado con éxito!");
  };

  const exportarPDF = async (mostrarAlerta = true) => {
    if (!chartRef.current) return;
    try {
        const doc = new jsPDF("p", "pt", "a4");
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 500;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.text("Diagrama de Dispersión", 40, 40);
        doc.addImage(imgData, "PNG", 40, 60, imgWidth, imgHeight);
        
        autoTable(doc, {
            head: [["Estudiante", "Asistencia", "Calificación"]],
            body: data.map(d => [d.nombreCompleto, d.asistencia, d.calificacion]),
            startY: imgHeight + 80,
        });
        doc.save("dispersion.pdf");

        if (mostrarAlerta) alert("¡Archivo PDF exportado con éxito!");

    } catch (e) { console.error(e); }
  };

  // ✅ NUEVO: Controlador centralizado igual que en Histograma
  const handleExportar = async (fmt: Formato) => {
    if (!data.length) return alert("No hay datos disponibles para exportar.");
    setTimeout(async () => {
      switch (fmt) {
        case "excel": await exportarExcel(true); break;
        case "csv": await exportarCSV(true); break;
        case "pdf": await exportarPDF(true); break;
        case "todos":
          await exportarExcel(false); 
          exportarCSV(false);
          await exportarPDF(false);
          alert("¡Todos los archivos (Excel, CSV, PDF) se han exportado con éxito!");
          break;
      }
    }, 100);
  };

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
    <MainLayout text="Diagrama de Dispersión">
      <div className="p-6 ">
        <h2 className="text-2xl font-semibold mb-4">Diagrama de Dispersión</h2>
        <p className="mb-4 ">
          Relación entre la asistencia y la calificación de los estudiantes.
        </p>

        <div 
          ref={chartRef} 
          className="w-full h-[400px] p-4 rounded-2xl shadow-md"
          style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 20, right: 20, bottom: 60, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              
              <XAxis 
                stroke="var(--text)" 
                tick={{ fill: "var(--text)" }} 
                type="number" 
                dataKey="asistencia" 
                name="Asistencia" 
                unit="%" 
                stroke="#666666"
                domain={['dataMin - 5', 'dataMax + 5']}
              >
                <Label fill="var(--text)" value="Asistencia (%)" offset={-20} position="insideBottom" />
              </XAxis>
              
              <YAxis 
                stroke="var(--text)" 
                tick={{ fill: "var(--text)" }} 
                type="number" 
                dataKey="calificacion" 
                name="Calificación" 
                domain={[0, 100]} 
                stroke="#666666"
              >
                <Label
                  fill="var(--text)"
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
                fill="var(--text)" // ✅ Color HEX fijo para los puntos
              />

              <Scatter 
                name="Estudiantes" 
                data={data} 
                fill="#3b82f6" 
                shape="circle" 
              />

              <Scatter 
                name="Tendencia" 
                data={trendData} 
                line={{ stroke: '#e03b3b', strokeWidth: 3 }} 
                shape={() => null} 
                fill="none"
                legendType="line"
              />

            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ BOTONES IDÉNTICOS AL HISTOGRAMA (Mismo map y mismas clases) */}
        <div className="flex flex-wrap gap-3 mt-6">
          {(["excel", "csv", "pdf", "todos"] as Formato[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportar(fmt)}
              title={`Exportar como ${fmt.toUpperCase()} (Atajo: Alt + ${fmt === "todos" ? "T" : fmt.charAt(0).toUpperCase()})`}
              className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary bg-primary text-neutral rounded-2xl w-50 h-10 m-5 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent"
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