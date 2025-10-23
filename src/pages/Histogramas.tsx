import MainLayout from "../layouts/MainLayout";
function Histograma() {
  return (
    <div>
      <MainLayout text="Histograma">
        {/* A partir de aqui pueden empezar a crear el diseño */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">Histograma</h2>
          <p className="mb-2">Aquí podrás visualizar el histograma de los estudiantes.</p>
        </div>
      </MainLayout>
    </div>
  );
}   
export default Histograma;