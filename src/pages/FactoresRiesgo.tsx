import MainLayout from "../layouts/MainLayout";
function FactoresRiesgo() {
  return (
    <div>
      <MainLayout text="Factores de Riesgo">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Factores de Riesgo</h2>
          <p className="mb-2">Aquí podrás visualizar los factores de riesgo de los estudiantes.</p>
        </div>
      </MainLayout>
    </div>
  );
}

export default FactoresRiesgo;
