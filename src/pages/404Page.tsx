
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">404 Página no encontrada</h1>
        <Link to="/">Volver al inicio</Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
