import { Link } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useSession } from "../context/SessionContext";

const HomePage = () => {
  const { session } = useSession();
  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">Dashboard</h1>
        <p>Usuario actual: {session?.user.email || "Sin sesión"}</p>
        {session ? (
          <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
        ) : (
          <Link to="/auth/sign-in">Iniciar sesión</Link>
        )}
        <Link to="/protected">Pagina protegida</Link>
        <Link to="/estudiantes">Estudiantes</Link>
        <div id="divider"></div>       
      </section>
    </main>
  );
};

export default HomePage;