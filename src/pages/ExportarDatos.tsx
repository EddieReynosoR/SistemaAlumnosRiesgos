import MainLayout from "../layouts/MainLayout";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import supabase from "../utils/supabaseClient";

type Formato = "excel" | "csv" | "pdf" | "todos" | "";

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    getFileHandle: (
      name: string,
      options?: { create?: boolean }
    ) => Promise<FileSystemFileHandle>;
  }
}

interface Estudiante {
  idestudiante: number;
  numerocontrol: string;
  nombre: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  semestre: number;
}

interface CalificacionAsistencia {
  idestudiante: number;
  calificacion: number;
  asistencia: number;
}

interface FactorRiesgo {
  idfactor: number;
  categoria: string;
  descripcion: string;
}

interface RiesgoEstudiante {
  idestudiante: number;
  idfactor: number;
}

const ExportarDatos: React.FC = () => {
  const [formato, setFormato] = useState<Formato>("");
  const [incluirDatos, setIncluirDatos] = useState<boolean>(false);
  const [ruta, setRuta] = useState<FileSystemDirectoryHandle | null>(null);
  const [usarUbicacionManual, setUsarUbicacionManual] = useState(false);

  const generarNombreArchivo = (base: string, extension: string) => {
    const fecha = new Date();
    const f = fecha.toISOString().replace(/[:T]/g, "-").slice(0, 16);
    return `${base}_${f}.${extension}`;
  };

  const elegirCarpeta = async () => {
    try {
      if (!window.showDirectoryPicker) {
        alert("Tu navegador no soporta elegir carpetas. Se descargará automáticamente.");
        return;
      }
      const handle = await window.showDirectoryPicker();
      setRuta(handle);
      setUsarUbicacionManual(true);
      alert("Carpeta seleccionada correctamente.");
    } catch (err) {
      console.error("Error seleccionando carpeta:", err);
    }
  };

  const obtenerDatos = async () => {
    const { data: calificaciones, error: errCalif } = await supabase
      .from("calificacionasistencia")
      .select("*");
    if (errCalif) throw new Error(errCalif.message);

    const { data: factores, error: errFact } = await supabase
      .from("factorriesgo")
      .select("*");
    if (errFact) throw new Error(errFact.message);

    const { data: riesgoEst, error: errRE } = await supabase
      .from("riesgoestudiante")
      .select("*");
    if (errRE) throw new Error(errRE.message);

    const riesgosCompletos = (riesgoEst ?? [])
      .map((r) => {
        const factor = (factores ?? []).find((f) => f.idfactor === r.idfactor);
        if (!factor || factor.descripcion === "N/A") return null;
        return {
          idestudiante: r.idestudiante,
          categoria: factor.categoria,
          descripcion_riesgo: factor.descripcion,
        };
      })
      .filter(
        (r): r is { idestudiante: number; categoria: string; descripcion_riesgo: string } =>
          !!r
      );

    if (!incluirDatos) {
      return (calificaciones ?? []).map((c) => {
        const riesgo = riesgosCompletos.find((r) => r.idestudiante === c.idestudiante);
        return {
          idestudiante: c.idestudiante,
          calificacion: c.calificacion,
          asistencia: c.asistencia,
          riesgo: riesgo
            ? `${riesgo.categoria}: ${riesgo.descripcion_riesgo}`
            : "Sin riesgo",
        };
      });
    }

    const { data: estudiantes, error: errEst } = await supabase
      .from("estudiante")
      .select("*");
    if (errEst) throw new Error(errEst.message);

    return (estudiantes ?? []).map((est) => {
      const califs = (calificaciones ?? []).filter(
        (c) => c.idestudiante === est.idestudiante
      );
      const riesgos = riesgosCompletos.filter(
        (r) => r.idestudiante === est.idestudiante
      );

      const promedio =
        califs.length > 0
          ? califs.reduce((acc, c) => acc + Number(c.calificacion || 0), 0) /
            califs.length
          : 0;
      const asistenciaTotal = califs.reduce(
        (acc, c) => acc + (c.asistencia || 0),
        0
      );

      return {
        numero_control: est.numerocontrol,
        nombre: est.nombre,
        apellidos: `${est.apellidopaterno ?? ""} ${est.apellidomaterno ?? ""}`,
        semestre: est.semestre,
        promedio: promedio.toFixed(2),
        asistencia_total: asistenciaTotal,
        factores_riesgo:
          riesgos.length > 0
            ? riesgos
                .map((r) => `${r.categoria}: ${r.descripcion_riesgo}`)
                .join(" | ")
            : "Sin riesgo",
      };
    });
  };

  const guardarArchivo = async (blob: Blob, nombre: string) => {
    if (usarUbicacionManual && ruta) {
      try {
        const fileHandle = await ruta.getFileHandle(nombre, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        console.error("Error guardando manualmente:", err);
      }
    }
    saveAs(blob, nombre);
  };

const exportarExcel = async (datos: any[]) => {
  if (!datos || datos.length === 0) {
    alert("No hay datos para exportar en Excel.");
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([]);

  XLSX.utils.sheet_add_json(ws, datos, { origin: "A1", skipHeader: false });

  const rango = XLSX.utils.decode_range(ws["!ref"] || "A1");
  const encabezados = Object.keys(datos[0]);

  encabezados.forEach((_, i) => {
    const celda = ws[XLSX.utils.encode_cell({ r: 0, c: i })];
    if (celda) {
      celda.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  });

  const anchoCols = encabezados.map((h) => {
    const maxLongitud = Math.max(
      h.length,
      ...datos.map((r) => String(r[h] || "").length)
    );
    return { wch: Math.min(maxLongitud + 2, 40) };
  });
  ws["!cols"] = anchoCols;

  ws["!autofilter"] = { ref: XLSX.utils.encode_range(rango) };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  await guardarArchivo(blob, generarNombreArchivo("reporte_estudiantes", "xlsx"));
};

  const exportarCSV = async (datos: any[]) => {
    const ws = XLSX.utils.json_to_sheet(datos);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    await guardarArchivo(blob, generarNombreArchivo("reporte_estudiantes", "csv"));
  };

  const exportarPDF = async (datos: any[]) => {
    if (!datos || datos.length === 0) {
      alert("⚠️ No hay datos para exportar en PDF.");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(14);
    doc.text("Reporte General de Estudiantes", 40, 40);

    const columnas = Object.keys(datos[0]);
    const filas = datos.map((fila) => columnas.map((key) => fila[key] ?? ""));

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 60,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    });

    const blob = doc.output("blob");
    await guardarArchivo(blob, generarNombreArchivo("reporte_estudiantes", "pdf"));
  };

  // 🧠 Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formato) return alert("Selecciona un formato.");

    const datos = await obtenerDatos();
    if (!datos || datos.length === 0) return alert("No se encontraron datos.");

    switch (formato) {
      case "excel":
        await exportarExcel(datos);
        break;
      case "csv":
        await exportarCSV(datos);
        break;
      case "pdf":
        await exportarPDF(datos);
        break;
      case "todos":
        await exportarExcel(datos);
        await exportarCSV(datos);
        await exportarPDF(datos);
        break;
    }

    alert("Exportación completada correctamente.");
  };

  const handleCancelar = () => {
    setFormato("");
    setIncluirDatos(false);
    setRuta(null);
    setUsarUbicacionManual(false);
  };

  return (
    <div>
      <MainLayout text="Exportar Datos">
        <h2 className="text-2xl font-semibold mb-4 p-3">Exportar Datos</h2>
        <div className="max-w-5xl mx-auto p-8 bg-white border-2 border-gray-300 shadow-xl rounded-2xl mt-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block text-gray-700 font-medium mb-1">
                Formato de Exportación:
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {["excel", "csv", "pdf", "todos"].map((fmt) => (
                  <label key={fmt} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="formato"
                      value={fmt}
                      checked={formato === fmt}
                      onChange={() => setFormato(fmt as Formato)}
                      className="text-blue-600"
                    />
                    {fmt.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="datosEstudiantes"
                checked={incluirDatos}
                onChange={() => setIncluirDatos(!incluirDatos)}
                className="text-blue-600"
              />
              <label htmlFor="datosEstudiantes" className="text-gray-700 font-medium">
                Incluir datos de estudiante
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-1">
                Ruta destino:
              </label>
              <button
                type="button"
                onClick={elegirCarpeta}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Elegir carpeta
              </button>
              {ruta && <p className="text-sm text-gray-600 mt-1">Carpeta seleccionada ✔️</p>}
            </div>

            <div className="flex justify-end gap-3 pt-5">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Exportar
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </MainLayout>
    </div>
  );
};

export default ExportarDatos;