import { Link} from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useSession } from "../context/SessionContext";

const HomePage = () => {
  const { session } = useSession();
  return (
    <main className="flex justify-center mt-35">
      <section className="main-container border-b-2 border-t-2 shadow-2xl text-Primary border-Primary rounded-lg h-75 w-180 flex flex-col justify-evenly  items-center">
        <div className="border-b-0 w-full m-5  flex  justify-center">
          <h1 className="header-text">Dashboard</h1>
        </div>

        <div className="m-5">
          <p>Usuario actual: {session?.user.email || "Sin sesión"}</p>
        </div>
        <div className="flex gap-5">
          {session ? (
            <div>
              <Link to={"/Registro"}>
              <button className="cursor-pointer hover:border-2 hover:border-Primary hover:bg-Neutral hover:text-Primary  bg-Primary text-Neutral  rounded-2xl w-50 h-10 m-5">
                Regresar al menu
              </button>
              </Link>
              <button
                className="cursor-pointer hover:border-2 hover:border-Primary hover:bg-Neutral hover:text-Primary  bg-Primary text-Neutral  rounded-2xl w-50 h-10 m-5"
                onClick={() => supabase.auth.signOut()}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className=" ">
              <Link to="/auth/sign-in">
                <button className="cursor-pointer hover:border-2 hover:border-Primary hover:bg-Neutral hover:text-Primary  bg-Primary text-Neutral  rounded-2xl w-50 h-10 m-5">
                  Iniciar sesión
                </button>
              </Link>
            </div>
          )}
          <Link to="/protected">
            <button className="cursor-pointer hover:border-2 hover:border-Primary hover:bg-Neutral hover:text-Primary  bg-Primary text-Neutral  rounded-2xl w-50 h-10 m-5">
              Pagina protegida
            </button>
          </Link>
        </div>

        <div id="divider"></div>
      </section>
    </main>
  );
};

export default HomePage;
