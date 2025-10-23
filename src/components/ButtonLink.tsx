import { Link } from "react-router-dom";

// Definimos el tipo de las props
interface LinkProps {
  to: string; // Ruta a donde dirigirá el enlace
  text: string; // Texto visible del enlace
}

function ButtonLink({ to, text }: LinkProps) {
  return (
    <li>
      <Link
        to={to}
        className="block px-4 py-2 hover:bg-gray-700 p-2 rounded"
      >
        {text}
      </Link>
    </li>
  );
}

export default ButtonLink;
