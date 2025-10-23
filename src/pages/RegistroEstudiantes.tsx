import MainLayout from "../layouts/MainLayout";
import InputRegistro, { MultiOpcion } from "../components/InputRegistro";

function RegistroEstudiantes() {
  return (
    <div className="h-full w-full">
      <MainLayout text="Registro de Estudiantes">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4 p-4 h-full w-full">
          <div className="col-span-2 h-full w-full border-b-2 border-t-2 rounded-2xl shadow">
            <form action="" method="post" className="h-full w-full">
              <fieldset className="h-full w-full">
                <div className="justify-items-center grid grid-cols-2 gap-4 p-4 h-full w-full">
                  <InputRegistro Nombre="IdEstudiante" />
                  <InputRegistro Nombre="Nombre" />
                  <InputRegistro Nombre="Semestre" />
                  <MultiOpcion
                    Nombre="Carrera"
                    opciones={["ISC", "IM", "IE", "II", "LA"]}
                  />
                </div>
              </fieldset>
            </form>
          </div>
          <div className="border-b-2 border-t-2 rounded-2xl shadow">
            <h1>Calificaciones</h1>
           <input className="border-2 w-50  h-30" multiple type="text" />
          </div>
          <div className="flex flex-col justify-between p-4 border-b-2 border-t-2 rounded-2xl shadow">
            <div>
              <h1 className="">Factores de Riesgo</h1>
            </div>
            <div className="grid grid-cols-2 grid-rows-3">
              <div>
              <input type="checkbox" name="Academico" id="" />
              <label htmlFor="Academico">Academico</label>
              </div>
              <div>
              <input type="checkbox" name="Psicologico" id="" />
              <label htmlFor="Psicologico">Psicologico</label>
              </div>
              <div>
              <input type="checkbox" name="Social" id="" />
              <label htmlFor="Social">Social</label>
              </div>
              <div>
              <input type="checkbox" name="Familiar" id="" />
              <label htmlFor="Familiar">Familiar</label>
              </div>
              <div>
              <input type="checkbox" name="Economico" id="" />
              <label htmlFor="Economico">Economico</label>
              </div>
            </div>
            <div className="h-10 flex gap-4">
              <input className="bg-black w-24 rounded-xl text-white " type="submit" value="Guardar" />
              <input className="bg-gray-300 w-24 rounded-xl text-black " type="reset" value="Cancelar" />
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
}

export default RegistroEstudiantes;
