import { useState, useEffect, useRef } from "react"; // Se añadieron useEffect y useRef
import MainLayout from "../layouts/MainLayout";
import * as XLSX from "xlsx";
import supabase from "../utils/supabaseClient";
import { 
  FaFileUpload, 
  FaFileExcel, 
  FaTimesCircle 
} from "react-icons/fa";

interface EstudianteRow {
  numerocontrol: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  semestre: number;
  idcarrera: string;
  idmateria: string;
  idfactor: string;
  unidad: number;
  asistencia: number;
  calificacion: number;
}

const COLUMNAS_ESPERADAS = [
  "numerocontrol",
  "nombre",
  "apellidopaterno",
  "apellidomaterno",
  "semestre",
  "idcarrera",
  "idmateria",
  "idfactor",
  "unidad",
  "asistencia",
  "calificacion",
];

export default function ImportarEstudiantesForm() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<EstudianteRow[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Referencias para los botones
  const btnGuardarRef = useRef<HTMLButtonElement>(null);
  const btnCancelarRef = useRef<HTMLButtonElement>(null);

  // Configuración de atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'g': // Alt + g -> Guardar
            e.preventDefault();
            btnGuardarRef.current?.click();
            break;
          case 'x': // Alt + x -> Cancelar
            e.preventDefault();
            btnCancelarRef.current?.click();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const esUUID = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

  const validarColumnas = (row: any) => {
    const columnasArchivo = Object.keys(row).map((c) => c.toLowerCase());
    return COLUMNAS_ESPERADAS.filter((col) => !columnasArchivo.includes(col));
  };

  // =======================
  // LEER Y VALIDAR ARCHIVO
  // =======================
  const leerArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);
    setErrores([]);
    setPreview([]);
    setMensaje("");

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<any>(sheet);

    if (data.length === 0) {
      setErrores(["El archivo está vacío."]);
      return;
    }

    const faltantes = validarColumnas(data[0]);
    if (faltantes.length > 0) {
      setErrores([`Columnas faltantes: ${faltantes.join(", ")}`]);
      return;
    }

    const erroresDetectados: string[] = [];
    const rows: EstudianteRow[] = [];

    data.forEach((row: any, i: number) => {
      const fila = i + 2;

      const item: EstudianteRow = {
        numerocontrol: String(row.numerocontrol),
        nombre: row.nombre,
        apellidopaterno: row.apellidopaterno,
        apellidomaterno: row.apellidomaterno,
        semestre: Number(row.semestre),
        idcarrera: row.idcarrera,
        idmateria: row.idmateria,
        idfactor: row.idfactor,
        unidad: Number(row.unidad),
        asistencia: Number(row.asistencia),
        calificacion: Number(row.calificacion),
      };

      Object.entries(item).forEach(([campo, valor]) => {
        if (!valor && valor !== 0) {
          erroresDetectados.push(`Fila ${fila}: El campo "${campo}" está vacío.`);
        }
      });

      if (!esUUID(item.idcarrera)) erroresDetectados.push(`Fila ${fila}: idcarrera inválido.`);
      if (!esUUID(item.idmateria)) erroresDetectados.push(`Fila ${fila}: idmateria inválido.`);
      if (!esUUID(item.idfactor)) erroresDetectados.push(`Fila ${fila}: idfactor inválido.`);

      if (item.semestre < 1 || item.semestre > 12)
        erroresDetectados.push(`Fila ${fila}: semestre debe ser 1–12.`);

      rows.push(item);
    });

    if (erroresDetectados.length > 0) {
      setErrores(erroresDetectados);
      return;
    }

    setPreview(rows);
  };

  // =======================
  // INSERTAR EN LAS TABLAS (CON ERRORES AGRUPADOS)
  // =======================
  const guardarEnSupabase = async () => {
    if (preview.length === 0) {
      setMensaje("Debes cargar y validar el archivo.");
      return;
    }

    setLoading(true);
    setMensaje("");

    const erroresAgrupados: string[] = []; // <--- Aquí agrupamos todo

    try {
      for (const [index, row] of preview.entries()) {
        const filaExcel = index + 2;

        // 1️⃣ INSERTAR ESTUDIANTE
        const { data: estudiante, error: errEst } = await supabase
          .from("estudiante")
          .insert({
            numerocontrol: row.numerocontrol,
            nombre: row.nombre,
            apellidopaterno: row.apellidopaterno,
            apellidomaterno: row.apellidomaterno,
            semestre: row.semestre,
            idcarrera: row.idcarrera,
          })
          .select("idestudiante")
          .single();

        if (errEst) {
          erroresAgrupados.push(
            `Fila ${filaExcel}: No se pudo insertar el estudiante (${row.numerocontrol}).`
          );
          continue;
        }

        const idestudiante = estudiante.idestudiante;

        // 2️⃣ INSERTAR RIESGO
        const { error: errRiesgo } = await supabase
          .from("riesgoestudiante")
          .insert({
            idestudiante: idestudiante,
            idfactor: row.idfactor,
          });

        if (errRiesgo) {
          erroresAgrupados.push(
            `Fila ${filaExcel}: No se pudo insertar el riesgo del estudiante (${row.numerocontrol}).`
          );
        }

        // 3️⃣ INSERTAR CALIFICACIÓN
        const { error: errCal } = await supabase
          .from("calificacionasistencia")
          .insert({
            idestudiante: idestudiante,
            idmateria: row.idmateria,
            unidad: row.unidad,
            asistencia: row.asistencia,
            calificacion: row.calificacion,
          });

        if (errCal) {
          erroresAgrupados.push(
            `Fila ${filaExcel}: No se pudo insertar la calificación/asistencia del estudiante (${row.numerocontrol}).`
          );
        }
      }

      // MOSTRAR ERRORES AGRUPADOS
      if (erroresAgrupados.length > 0) {
        setMensaje(
          "❌ Se encontraron errores:\n\n" +
            erroresAgrupados.map((e) => `• ${e}`).join("\n")
        );
      } else {
        setMensaje("✅ Todos los registros fueron guardados correctamente.");
      }

      setPreview([]);
      setArchivo(null);

    } catch (error: any) {
      setMensaje("❌ Error inesperado: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="text-Primary">
      <MainLayout text="Importar Estudiantes">

        <div className="w-full flex justify-center items-center py-10">
          <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-lg">

            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
              Importar Estudiantes
            </h2>

            {/* ARCHIVO */}
            <div className="mb-6">
              <label className="font-semibold text-gray-700">Archivo CSV o Excel</label>
              <div className="flex items-center bg-gray-100 border px-3 py-2 rounded-lg mt-1">
                <FaFileUpload className="text-gray-500 mr-2" />
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={leerArchivo}
                  className="bg-transparent w-full outline-none"
                />
              </div>
            </div>

            {/* ERRORES */}
            {errores.length > 0 && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Errores encontrados:</h3>
                <ul className="list-disc ml-5">
                  {errores.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* VISTA PREVIA */}
            {preview.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Vista previa (primeros 10)</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {COLUMNAS_ESPERADAS.map((c) => (
                          <th key={c} className="p-2 border capitalize">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {COLUMNAS_ESPERADAS.map((c) => (
                            <td key={c} className="border p-2">{(row as any)[c]}</td>
                          ))} 
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOTONES */}
            <div className="mt-8 flex justify-center gap-5">
              <button
                ref={btnGuardarRef} // Referencia añadida
                onClick={guardarEnSupabase}
                disabled={loading}
                title="Atajo: Alt + g"
                className="px-8 py-2 rounded-lg font-semibold text-white flex items-center gap-2 bg-[hsl(219,57%,51%)] hover:bg-[hsl(219,61%,65%)] transition shadow"
              >
                Guardar {loading ? "..." : <FaFileExcel />}
              </button>

              <button
                ref={btnCancelarRef} // Referencia añadida
                onClick={() => {
                  setArchivo(null);
                  setPreview([]);
                  setErrores([]);
                  setMensaje("");
                }}
                title="Atajo: Alt + x"
                className="px-8 py-2 rounded-lg font-semibold text-white bg-[#e74c3c] hover:bg-red-600 transition flex items-center gap-2"
              >
                Cancelar <FaTimesCircle />
              </button>
            </div>

            {mensaje && (
              <pre className="mt-4 text-center font-semibold text-gray-700 whitespace-pre-wrap">
                {mensaje}
              </pre>
            )}

          </div>
        </div>

      </MainLayout>
    </div>
  );
}