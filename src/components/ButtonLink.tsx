import { Link, useLocation } from "react-router-dom";

interface LinkProps {
  to: string;
  text: string;
}

function ButtonLink({ to, text }: LinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link
        to={to}
        className={`block px-4 py-2 rounded transition-colors duration-200
          ${isActive
            ? "bg-Neutral text-Primary font-semibold shadow-md"
            : "text-Neutral hover:bg-Neutral hover:text-Primary"
          }`}
      >
        {text}
      </Link>
    </li>
  );
}

export default ButtonLink;
