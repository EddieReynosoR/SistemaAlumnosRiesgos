import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <main>
      <nav className=" bg-primary text-neutral p-5">
        <Link className="home-link" to="/">
          ◄ Home
        </Link>
      </nav>
      <div className=" bg-primary-foreground text-5xl gap-24 min-h-screen flex flex-col items-center justify-center">
        
          <h1 className="header-text">Error 404 Página no encontrada</h1>
          <h1> ¯\_(ツ)_/¯</h1>
       
      </div>
    </main>
  )
};

export default NotFoundPage;
