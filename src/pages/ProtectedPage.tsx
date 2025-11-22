import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";

const ProtectedPage = () => {
  const { session, docente, loading } = useSession();

  if (loading) return <p>Cargando...</p>;
  if (!session) return <p>No has iniciado sesión</p>;

  return (
    <main>
      <nav className="h-15 bg-primary flex items-center ">
        <Link className="home-link " to="/">
          <button className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-25 h-10 m-2">
            ◄ Home
          </button>
        </Link>
      </nav>
      <div className="flex justify-center mt-35">

      <section className="main-container border-b-2 border-t-2 shadow-2xl text-primary border-primary rounded-lg h-75 w-180 flex flex-col justify-evenly  items-center">
        <h1 className="header-text">Página protegida</h1>

        <p>Usuario: {session.user.email}</p>

        {docente ? (
          <>
            <h2>Perfil del Docente</h2>
            <p>
              <strong>Nombre:</strong> {docente.nombre}{" "}
              {docente.apellidopaterno} {docente.apellidomaterno}
            </p>
          </>
        ) : (
          <p>No se encontró perfil de docente asociado.</p>
        )}
      </section>
        </div>
    </main>
  );
};

export default ProtectedPage;
