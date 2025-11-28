import { Link } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useSession } from "../context/SessionContext";
import Settings from "@/components/Settings";

const HomePage = () => {
  const { session } = useSession();
  return (
    <main className=" flex flex-col h-screen">
      <nav className="p-4 flex justify-end bg-primary text-neutral border-b-2 ">
        <Settings />
      </nav>
     
        <section className="bg-background flex-1 h-lvh flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4 text-center text-text">
            Bienvenido al Sistema de Gestión de Alumnos en Riesgo
          </h1>

          <div className="m-5 text-text ">
            <p>Usuario actual: {session?.user.email || "Sin sesión"}</p>
          </div>

          {/* signup login */}
          <div className="flex justify-center gap-5">
            {session ? (
              <div>
                <Link to={"/Estudiantes"}>
                  <button className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5">
                    Ir al menu
                  </button>
                </Link>
                <button
                  className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
                  onClick={() => supabase.auth.signOut()}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className=" ">
                <Link to="/auth/sign-in">
                  <button className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5">
                    Iniciar sesión
                  </button>
                </Link>
                <Link to="/auth/sign-up">
                  <button className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5">
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
            {/* <Link to="/protected">
            <button className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5">
            Pagina protegida
            </button>
            </Link> */}
          </div>
        </section>
      
    </main>
  );
};

export default HomePage;
