import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";

const ProtectedPage = () => {
  const { session, docente, loading } = useSession();

  if (loading) return <p>Cargando...</p>;
  if (!session) return <p>No has iniciado sesión</p>;

  return (
    <main>
      <Link className="home-link" to="/">
        ◄ Home
      </Link>

      <section className="main-container">
        <h1 className="header-text">Página protegida</h1>

        <p>Usuario: {session.user.email}</p>

        {docente ? (
          <>
            <h2>Perfil del Docente</h2>
            <p>
              <strong>Nombre:</strong> {docente.nombre} {docente.apellidopaterno}{" "}
              {docente.apellidomaterno}
            </p>
          </>
        ) : (
          <p>No se encontró perfil de docente asociado.</p>
        )}
      </section>
    </main>
  );
};

export default ProtectedPage;
