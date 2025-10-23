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
    // Ajusta nombres de columnas a tu esquema real
    const { error } = await supabase
      .from("docente")
      .upsert(
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
      password: formValues.password
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
      setStatus("✅ Cuenta creada. Revisa tu correo para confirmar. El perfil se registrará automáticamente.");
    }
  };

  return (
    <main>
      <Link className="home-link" to="/">
        ◄ Home
      </Link>
      <form className="main-container" onSubmit={handleSubmit}>
        <h1 className="header-text">Registrarse</h1>
        <input
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
        />
        <input
          name="password"
          onChange={handleInputChange}
          type="password"
          placeholder="Contraseña"
        />
        <input
          name="nombre"
          onChange={handleInputChange}
          type="text"
          placeholder="Nombre"
        />
        <input
          name="apellidoPaterno"
          onChange={handleInputChange}
          type="text"
          placeholder="Apellido paterno"
        />
        <input
          name="apellidoMaterno"
          onChange={handleInputChange}
          type="text"
          placeholder="Apellido materno"
        />
        <button type="submit">Crear cuenta</button>
        <Link className="auth-link" to="/auth/sign-in">
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
        {status && <p>{status}</p>}
      </form>
    </main>
  );
};

export default SignUpPage;