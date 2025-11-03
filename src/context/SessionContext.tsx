import { createContext, useContext, useEffect, useState, useMemo } from "react";
import supabase from "../utils/supabaseClient";
import { type Session } from "@supabase/supabase-js";


export type Docente = {
  iddocente: string;
  idusuario: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
};

type SessionContextType = {
  session: Session | null;
  docente: Docente | null;
  loading: boolean;
  obtenerPerfilDocente: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  docente: null,
  loading: true,
  obtenerPerfilDocente: async () => {},
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [docente, setDocente] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (!newSession?.user) {
        setDocente(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const obtenerPerfilDocente = async (): Promise<void> => {
    const userId = session?.user?.id;

    if (!userId) {
      setDocente(null);
      return;
    }

    const { data, error } = await supabase
      .from("docente")
      .select("*")
      .eq("idusuario", userId)
      .single();

    if (error) {
      setDocente(null);
      return;
    }

    setDocente(data as Docente);
  };

  useEffect(() => {
    if (session?.user) {
      obtenerPerfilDocente();
    } else {
      setDocente(null);
    }
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
          session,
          docente,
          loading,
          obtenerPerfilDocente,
        }),
    [session, docente, loading]
  );

  return (
    <SessionContext.Provider value={value}>
      { children }
    </SessionContext.Provider>
  );
};