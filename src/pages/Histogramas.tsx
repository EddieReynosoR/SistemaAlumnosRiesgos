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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";


const COLORS = ["var(--primary)", "var(--secondary)", "var(--tertiary)", "var(--neutral)", "#3b82f6", "#e03b3b"];
// const COLORS = ["#000B58", "#003161", "#006A67", "#FDEB9E", "#3b82f6", "#e03b3b"];
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

  const exportarExcel = async () => {
  try {
    if (!data || data.length === 0) {
      alert("⚠️ No hay datos para exportar.");
      return;
    }

    const { columnas, filasNormalizadas } = getDatosTabulares();

    await new Promise((r) => setTimeout(r, 400));

    const chartElement = chartRef.current;
    if (!chartElement) {
      alert("No se encontró el gráfico.");
      return;
    }

    const canvas = await html2canvas(chartElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "var(--background)",
    });
    const imgData = canvas.toDataURL("image/png");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Datos");

    columnas.forEach((col, idx) => {
      sheet.getCell(1, idx + 1).value = col;
      sheet.getCell(1, idx + 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getCell(1, idx + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      sheet.getColumn(idx + 1).width = 20;
    });

    filasNormalizadas.forEach((fila, rowIdx) => {
      columnas.forEach((col, colIdx) => {
        sheet.getCell(rowIdx + 2, colIdx + 1).value = fila[col];
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
      "Gráfico generado automáticamente desde el sistema";

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      generarNombreArchivo("histograma", "xlsx")
    );

    alert("✅ Exportación a Excel completada correctamente.");
  } catch (err) {
    console.error("Error al exportar Excel:", err);
    alert("Ocurrió un error al generar el Excel. Revisa la consola.");
  }
};

  const exportarCSV = async () => {
    if (!data.length) return alert("⚠️ No hay datos para exportar.");
    const { filasNormalizadas } = getDatosTabulares();
    const ws = XLSX.utils.json_to_sheet(filasNormalizadas);
    const csv = XLSX.utils.sheet_to_csv(ws);
    guardarArchivo(new Blob([csv], { type: "text/csv;charset=utf-8" }), generarNombreArchivo("histograma", "csv"));
  };

 
  const exportarPDF = async () => {
  if (!chartRef.current) return;

  const { columnas, filasNormalizadas } = getDatosTabulares();
  const doc = new jsPDF("l", "pt", "a4");

  // ============================
  //          ENCABEZADO
  // ============================
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);

  doc.text(
    "Histograma de Riesgos por Materia",
    doc.internal.pageSize.getWidth() / 2,
    45,
    { align: "center" }
  );

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Generado automáticamente por el sistema académico",
    doc.internal.pageSize.getWidth() / 2,
    65,
    { align: "center" }
  );

  // ============================
  //       CAPTURA DE GRÁFICA
  // ============================
  const canvas = await html2canvas(chartRef.current);
  const imgData = canvas.toDataURL("image/png");

  const imgWidth = 540;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
  const imgY = 90;

  // Marco visual suave
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(1);
  doc.rect(imgX - 5, imgY - 5, imgWidth + 10, imgHeight + 10);

  doc.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

  // ============================
  //          TABLA DE DATOS
  // ============================
  const filasTabla = filasNormalizadas.map((fila) =>
    columnas.map((col) => fila[col] ?? 0)
  );

  autoTable(doc, {
    head: [columnas],
    body: filasTabla,
    startY: imgY + imgHeight + 40,
    margin: { left: 20, right: 20 },
    theme: "grid",

    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      halign: "center",
      lineColor: [225, 225, 225],
    },

    headStyles: {
      fillColor: [33, 150, 243],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    bodyStyles: {
      textColor: [60, 60, 60],
    },

    // ============================
    //          PIE DE PÁGINA
    // ============================
    didDrawPage: () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);

      // Número de página
      doc.text(
        `Página ${doc.getNumberOfPages()}`,
        pageWidth - 60,
        pageHeight - 20
      );

      // Marca institucional
      doc.text(
        "Sistema Académico • © 2025",
        20,
        pageHeight - 20
      );
    }
  });

  // ============================
  //        EXPORTAR PDF
  // ============================
  const blob = doc.output("blob");
  guardarArchivo(blob, generarNombreArchivo("histograma", "pdf"));
};


  const handleExportar = async (fmt: Formato) => {
    if (!data.length) return alert("No hay datos disponibles para exportar.");
    switch (fmt) {
      case "excel": await exportarExcel(); break;
      case "csv": await exportarCSV(); break;
      case "pdf": await exportarPDF(); break;
      case "todos":
        await exportarExcel(); await exportarCSV(); await exportarPDF(); break;
    }
    alert("✅ Exportación completada correctamente.");
  };

  return (
    <MainLayout text="Histograma">
      <div className="p-6 text-primary">
        <h2 className="text-2xl  font-semibold mb-4">
          Histograma de Riesgos por Materia
        </h2>
        <p className="mb-4 text-neutral">
          Frecuencia de factores de riesgo agrupados por cada materia.
        </p>

        <div
          ref={chartRef}
          className="w-full h-[400px] bg-background p-4 rounded-2xl shadow-md"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis stroke="var(--text)" tick={{ fill: "var(--text)" }} dataKey="materia" />
              <YAxis stroke="var(--text)" tick={{ fill: "var(--text)" }} allowDecimals={false} />
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

        <div className="flex flex-wrap gap-3 mt-6">
          {(["excel", "csv", "pdf", "todos"] as Formato[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportar(fmt)}
<<<<<<< HEAD
              className="px-8 py-2 rounded-lg font-semibold text-white flex items-center gap-2
                          bg-[hsl(219,57%,51%)] hover:bg-[hsl(219,61%,65%)] transition shadow"
=======
              className="cursor-pointer hover:border-2 hover:border-primary hover:bg-secondary hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
>>>>>>> 1fd73871532e21f7c87d4842b0bb3d3ac9ccf45a
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
