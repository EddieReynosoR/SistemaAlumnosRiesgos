import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../utils/supabaseClient";

type SignUpForm = {
  email: string;
  password: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
};

const SignUpPage = () => {
  const { session } = useSession();
  if (session) return <Navigate to="/" />;

  const [status, setStatus] = useState("");
  const [formValues, setFormValues] = useState<SignUpForm>({
    email: "",
    password: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const agregarDocente = async (userId: string) => {
    const { error } = await supabase.from("docente").upsert(
      {
        idusuario: userId,
        nombre: formValues.nombre,
        apellidopaterno: formValues.apellidoPaterno || null,
        apellidomaterno: formValues.apellidoMaterno || null,
      },
      { onConflict: "idusuario" }
    );

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Creando cuenta...");

    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
    });

    if (error) {
      setStatus("");
      alert(error.message);
      return;
    }

    const newUserId = data.user?.id;
    if (newUserId) {
      try {
        await agregarDocente(newUserId);
        setStatus("✅ Cuenta creada y perfil de docente registrado.");
      } catch (e: any) {
        console.error(e);
        setStatus("⚠️ Ocurrió un error al crear la cuenta.");
      }
    } else {
      setStatus(
        "✅ Cuenta creada. Revisa tu correo para confirmar. El perfil se registrará automáticamente."
      );
    }
  };

  return (
    <main>
      <nav className="bg-Primary text-Neutral p-5">
        <Link className="home-link " to="/">
          ◄ Home
        </Link>
      </nav>

      <form
        className="main-container flex text-Primary flex-col  h-full justify-center items-center"
        onSubmit={handleSubmit}
      >
        <h1 className="header-text">Registrarse</h1>
        <div className="relative m-5 w-64 group">
          <legend className="text-xs">Email</legend>
          <input
            className="w-full p-2 border-none border-b-2 border-gray-400 bg-transparent outline-none"
            name="email"
            onChange={handleInputChange}
            type="email"
            placeholder="Email"
          />
          <span
            className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
        </div>
        <div className="relative m-5 w-64 group">
          <legend className="text-xs">Contraseña</legend>
          <input
            className="w-full p-2 border-none border-b-2 border-gray-400 bg-transparent outline-none"
            name="password"
            onChange={handleInputChange}
            type="password"
            placeholder="Contraseña"
          />
          <span
            className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
        </div>
        <div className="relative m-5 w-64 group">
          <legend className="text-xs">Nombre</legend>
          <input
            className="w-full p-2 border-none border-b-2 border-gray-400 bg-transparent outline-none"
            name="nombre"
            onChange={handleInputChange}
            type="text"
            placeholder="Nombre"
          />
          <span
            className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
        </div>
        <div className="relative m-5 w-64 group">
          <legend className="text-xs">Apellido Paterno</legend>
          <input
            className="w-full p-2 border-none border-b-2 border-gray-400 bg-transparent outline-none"
            name="apellidoPaterno"
            onChange={handleInputChange}
            type="text"
            placeholder="Apellido paterno"
          />
          <span
            className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
        </div>
        <div className="relative m-5 w-64 group">
          <legend className="text-xs">Apellido Materno</legend>
          <input
                      className="w-full p-2 border-none border-b-2 border-gray-900 bg-transparent outline-none"

            name="apellidoMaterno"
            onChange={handleInputChange}
            type="text"
            placeholder="Apellido materno"
          />
          <span
            className="absolute left-0 bottom-0 h-0.5 bg-Primary w-0 
               transition-all duration-300 ease-in-out group-focus-within:w-full"
          ></span>
        </div>

        

        <button
          type="submit"
          className="cursor-pointer bg-Primary text-Neutral  rounded-2xl w-50 h-10 m-5"
        >
          Crear cuenta
        </button>
        <Link className="auth-link  hover:text-Tertiary" to="/auth/sign-in">
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
        {status && <p>{status}</p>}
      </form>
    </main>
  );
};

export default SignUpPage;
