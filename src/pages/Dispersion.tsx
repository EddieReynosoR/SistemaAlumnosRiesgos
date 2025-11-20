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
import jsPDF from "jspdf";
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

    await new Promise((r) => setTimeout(r, 400));

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

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Datos");

    const columnas = Object.keys(data[0]);
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

    alert("Exportación a Excel completada correctamente.");
  } catch (err) {
    console.error("Error al exportar Excel:", err);
    alert("Ocurrió un error al generar el archivo Excel. Revisa la consola.");
  }
};

  const exportarCSV = async () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    guardarArchivo(blob, generarNombreArchivo("grafica_dispersion", "csv"));
  };

  const exportarPDF = async () => {
  if (!chartRef.current) return;

  const doc = new jsPDF("l", "pt", "a4");


  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);

  doc.text(
    "Gráfica de Dispersión: Calificación vs Asistencia",
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


  const canvas = await html2canvas(chartRef.current);
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

  autoTable(doc, {
    head: [columnas],
    body: filas,
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
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    bodyStyles: {
      textColor: [60, 60, 60],
    },


    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);

      doc.text(
        `Página ${doc.getNumberOfPages()}`,
        pageWidth - 60,
        pageHeight - 20
      );

      
      doc.text(
        "Sistema Académico • © 2025",
        20,
        pageHeight - 20
      );
    },
  });

  
  const blob = doc.output("blob");
  guardarArchivo(blob, generarNombreArchivo("grafica_dispersion", "pdf"));
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
    <MainLayout text="Diagrama de Dispersión">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Diagrama de Dispersión</h2>
        <p className="mb-4">
          Relación entre la asistencia y la calificación de los estudiantes.
        </p>

        <div ref={chartRef} className="w-full h-[400px] bg-white p-2 border rounded shadow">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="asistencia" name="Asistencia" unit="%">
                <Label value="Asistencia (%)" offset={-20} position="insideBottom" />
              </XAxis>
              <YAxis type="number" dataKey="calificacion" name="Calificación" domain={[0, 100]}>
                <Label
                  value="Calificación (0-100)"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name="Relación Calificación/Asistencia"
                data={data}
                fill="#000B58"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {(["excel", "csv", "pdf", "todos"] as Formato[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportar(fmt)}
              className="px-8 py-2 rounded-lg font-semibold text-white flex items-center gap-2
                          bg-[hsl(219,57%,51%)] hover:bg-[hsl(219,61%,65%)] transition shadow"
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
