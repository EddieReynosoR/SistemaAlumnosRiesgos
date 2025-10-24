import MainLayout from "../layouts/MainLayout";

function Pareto() {
  return (
    <div>
      <MainLayout text="Análisis de Pareto">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Análisis de Pareto</h2>
          <p className="mb-2">Aquí podrás visualizar el análisis de Pareto de los estudiantes.</p>
        </div>
      </MainLayout>
    </div>
  );
}

export default Pareto;
