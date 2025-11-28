import Navigation from "../components/Navigation";
import Settings from "@/components/Settings";

interface MainLayoutProps {
  text: string;
  children: React.ReactNode;
}

function MainLayout({ text, children }: MainLayoutProps) {
  return (
    <>
      <div className="">
        <div className=" bg-primary flex justify-between text-neutral  p-4 border-b-2">
          <h1 className="text-3xl font-bold">{text}</h1>
          <Settings />
        </div>
        <div className="flex h-[calc(100vh-72px)]">
          <Navigation />
          <main className="overflow-y-auto flex-1 w-5/6 bg-background text-text ">
            {children}

          </main>
        </div>
      </div>
    </>
  );
}

export default MainLayout;
