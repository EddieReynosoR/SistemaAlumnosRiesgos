import Navigation from "../components/Navigation";
import Settings from "@/components/Settings";



interface MainLayoutProps {
  text: string;
  children: React.ReactNode;
}

function MainLayout({ text, children }: MainLayoutProps) {
  return (
    <>
      <div className=" bg-Primary flex justify-between text-Neutral  p-4 border-b-2">
        <h1 className="text-3xl font-bold">{text}</h1>
\
        <Settings />
        
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
