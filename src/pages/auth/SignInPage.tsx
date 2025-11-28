import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../utils/supabaseClient";
import Settings from "@/components/Settings";
const SignInPage = () => {
  const { session, obtenerPerfilDocente } = useSession();
  if (session) return <Navigate to="/Estudiantes" />;

  const [status, setStatus] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Logging in...");
    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });
    if (error) {
      alert(error.message);
    }

    await obtenerPerfilDocente();
    setStatus("");
  };
  return (
    <main className="flex flex-col h-screen bg-background  text-text">
      <nav className=" bg-primary text-neutral p-5 flex justify-between items-center">
        <Link className="home-link" to="/">
          ◄ Home
        </Link>
        <Settings />
      </nav>
      <form
        className="main-container  flex   flex-col   justify-center items-center"
        onSubmit={handleSubmit}
      >
        <h1 className="header-text m-5">Iniciar Sesión</h1>

        

        <div className="relative m-5 w-64 group">
          <legend className="text-xs">Email</legend>
        <input
            className="w-full p-2 border-none border-b-2 text-text border-gray-900 bg-transparent outline-none focus:outline-none focus-visible:outline-none"
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
          />
                    <span
            className="absolute left-0 bottom-0 h-0.5 bg-primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
          </div>
        <div className="relative m-5 w-64 group">
            <legend className="text-xs">Contraseña</legend>
        <input
            className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"
          name="password"
          onChange={handleInputChange}
          type="password"
          placeholder="Password"
          />
          <span
            className="absolute left-0 bottom-0 h-0.5 bg-primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
          </div>
        <button
          className="cursor-pointer bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
          type="submit"
        >
          Login
        </button>
        <Link className="auth-link hover:text-tertiary" to="/auth/sign-up">
          ¿No tienes una cuenta? Regístrate
        </Link>
        {status && <p>{status}</p>}
      </form>
    </main>
  );
};

export default SignInPage;
