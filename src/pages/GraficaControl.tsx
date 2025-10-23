import MainLayout from '../layouts/MainLayout';
function GraficaControl() {
  return (
    <div>
      <MainLayout text="Gráfica de Control">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Gráfica de Control</h2>
          <p className="mb-2">Aquí podrás visualizar la gráfica de control de los estudiantes.</p>
        </div>
      </MainLayout>
    </div>
  );
}

export default GraficaControl;
