import MainLayout from "../layouts/MainLayout";
function Dispersion() {
  return (
    <div>
      <MainLayout text="Análisis de Dispersión">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Análisis de Dispersión</h2>
          <p className="mb-2">Aquí podrás visualizar el análisis de dispersión de los estudiantes.</p>
        </div>
      </MainLayout>
    </div>
  );
}

export default Dispersion;
