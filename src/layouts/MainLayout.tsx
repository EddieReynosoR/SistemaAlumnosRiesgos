import Navigation from "../components/Navigation";
import { Link } from "react-router";
interface MainLayoutProps {
  text: string;
  children: React.ReactNode;
}

function MainLayout({ text, children }: MainLayoutProps) {
  return (
    <>
      <div className=" bg-Primary flex justify-between text-Neutral  p-4 border-b-2">
        <h1 className="text-3xl font-bold">{text}</h1>
        <Link to={'/'}>
        
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  className="mr-6 cursor-pointer"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>
        </Link>
        
      </div>
      <div className="flex h-[calc(100vh-72px)]">
      <Navigation />
      <main className="overflow-y-auto w-5/6">{children}
      {/* <p> 
      esto solo sirve para probar el scroll
          Simula contenido largo
          {Array.from({ length: 50 }, (_, i) => (
            <span key={i}>
              Este es el párrafo #{i + 1}. Lorem ipsum dolor sit amet consectetur adipisicing elit.Lorem ipsum dolor sit amet consectetur adipisicing elit.Lorem ipsum dolor sit amet consectetur adipisicing elit.
              <br />
            </span>
          ))}
        </p> */}
        </main>
      </div>
    </>
  );
}

export default MainLayout;
