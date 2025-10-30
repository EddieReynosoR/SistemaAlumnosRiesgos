import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import supabase from "@/utils/supabaseClient";
type SignUpStudent = {
  NoControl: string;
  Nombre: string;
  ApellidoP: string;
  ApellidoM: string;
  Semestre: number;
  Carrera:string;
};

function RegistroEstudiantes() {



  const [status, setStatus] = useState("");
  const [formValues, setFormValues] = useState<SignUpStudent>({
    NoControl: "",
    Nombre: "",
    ApellidoP: "",
    ApellidoM: "",
    Semestre: 1,
    Carrera:"",
   
  });

    const obtenerIdCarrera = async (nombreCarrera: string) => {
    const { data, error } = await supabase
      .from("carrera")
      .select("idcarrera")
      .eq("nombre", nombreCarrera)
      .single();
      console.log(data?.idcarrera)
    if (error || !data) throw new Error("Carrera no encontrada");
    return data.idcarrera;
  };

  // function clear(){
  //  const ApellidoP = document.getElementsByName('ApellidoP')[0] as HTMLInputElement;
  //  if (ApellidoP) {
  //    ApellidoP.value = '';
  //  }
  // }
  
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
  const { name, value, type } = e.target;

  setFormValues({
    ...formValues,
    [name]: type === "number" ? Number(value) : value, // 👈 convierte a número
  });
};


  const agregarEstudiante = async (idcarrera: string) => {
    const { error } = await supabase.from("estudiante").upsert(
      {
       
        numerocontrol: formValues.NoControl,
        nombre: formValues.Nombre,
        apellidopaterno: formValues.ApellidoP || null,
        apellidomaterno: formValues.ApellidoM || null,
        semestre: formValues.Semestre,
        idcarrera: idcarrera
      },
      
    );

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Registrando estudiante...");

    try {
      // Paso 1: obtener el UUID de la carrera seleccionada
      const idCarrera = await obtenerIdCarrera(formValues.Carrera);

      // Paso 2: insertar estudiante con ese UUID
      await agregarEstudiante( idCarrera);

      setStatus("✅ Estudiante registrado correctamente.");
    } catch (error: any) {
      console.error(error);
      setStatus("⚠️ Error al registrar al estudiante. Verifica la carrera.");
    }
  };
  

  return (
    <MainLayout text="Registro de Estudiantes">
      <div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 max-w-2xl mx-auto p-8 bg-white border-2 border-gray-300 shadow-xl rounded-2xl mt-8">
          <div className="relative m-5 w-64 group">
            <legend className="text-xs">No Control</legend>
            <input
              className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
              name="NoControl"
              onChange={handleInputChange}
              type="text"
              placeholder="NoControl"
              required
            />
            <span
              className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
            ></span>
          </div>
          <div className="relative m-5 w-64 group">
            <legend className="text-xs">Nombre</legend>
            <input
              className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
              name="Nombre"
              onChange={handleInputChange}
              type="text"
              placeholder="Nombre"
              required
            />
            <span
              className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
            ></span>
          </div>
          <div className="relative m-5 w-64 group">
            <legend className="text-xs">Apellido Paterno</legend>
            <input
              className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
              name="ApellidoP"
              onChange={handleInputChange}
              type="text"
              placeholder="Apellido Paterno"
              required
            />
            <span
              className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
            ></span>
          </div>

          <div className="relative m-5 w-64 group">
            <legend className="text-xs">Apellido Materno</legend>
            <input
              className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
              name="ApellidoM"
              onChange={handleInputChange}
              type="text"
              placeholder="Apellido Materno"
              required
            />
            <span
              className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
            ></span>
          </div>
          <div className="relative m-5 w-64 group">
            <legend className="text-xs">Semestre</legend>
            <input
              className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
              name="Semestre"
              onChange={handleInputChange}
              type='number'
              placeholder="Semestre"
              required
            />
            <span
              className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
            ></span>
          </div>
          <div className="relative m-5 w-64 group">
  <legend className="text-xs">Id Carrera</legend>
  <select
    name="Carrera"
    onChange={handleInputChange}
    className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
    required
  >
    <option value="">Selecciona una carrera</option>
    <option value="Ingeniería en Sistemas Computacionales">
      Ingeniería en Sistemas Computacionales
    </option>
  </select>

  <span
    className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
     transition-all duration-300 ease-in-out group-focus-within:w-full"
  ></span>
</div>

          <button
            type="submit"
            className="cursor-pointer self-end col-span-2 bg-Primary text-Neutral  rounded-2xl w-100 h-10 m-5"
          >
            Crear cuenta
          </button>

          
        </form>
      </div>
      {status && <p>{status}</p>}
    </MainLayout>
    
  );
}

export default RegistroEstudiantes;
