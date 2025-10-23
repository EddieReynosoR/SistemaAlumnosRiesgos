import MainLayout from "../layouts/MainLayout";
function ExportarDatos() {
  return (
    <div>
      <MainLayout text="Exportar Datos">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Exportar Datos</h2>
          <p className="mb-2">Aquí podrás exportar los datos de los estudiantes.</p>
        </div>
      </MainLayout>
    </div>
  );
}

export default ExportarDatos;
