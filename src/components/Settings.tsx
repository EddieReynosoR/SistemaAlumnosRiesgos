"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import supabase from "../utils/supabaseClient";
import { useNavigate } from "react-router";


export default function Settings() {

  const [section, setSection] = useState("accesibilidad");
  const [AccesisActive, setIsActive] = useState(false);
  const [PerfilActive, setPerfilActive] = useState(false);

const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  const saved = localStorage.getItem("darkMode") === "true";
  setDarkMode(saved);
  document.documentElement.classList.toggle("dark", saved);
}, []);

const handleDarkModeChange = (checked: boolean) => {
  setDarkMode(checked);
  localStorage.setItem("darkMode", String(checked));
  document.documentElement.classList.toggle("dark", checked);
};


  const handleActive = (Select: string) => {
    setSection(Select);
    if (Select === "perfil") {
      setPerfilActive(true);
      setIsActive(false);
    } else if (Select === "accesibilidad") {
      setIsActive(true);
      setPerfilActive(false);
    }
  };
  let navigate = useNavigate();

  // ----------------------------------
  // CONTENIDO DINÁMICO
  // ----------------------------------
  const renderContent = () => {
    switch (section) {
      case "accesibilidad":
        return (
          <>
            <DialogHeader className="">
              <DialogTitle>Accesibilidad</DialogTitle>
              <DialogDescription>
                Ajustes relacionados con accesibilidad.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-4 mt-4 ">
              <div className="flex items-center space-x-2">
                <Switch checked={darkMode} id="darkmode" onCheckedChange={handleDarkModeChange}/>
                <Label htmlFor="darkmode">Modo oscuro</Label>
              </div>
            </div>
          </>
        );

      case "perfil":
        return (
          <>
            <DialogHeader className="">
              <DialogTitle>Información del perfil</DialogTitle>
              <DialogDescription>
                Edita tu nombre, correo y preferencias.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3 ">
              <button
                className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary  bg-primary text-neutral  rounded-2xl w-50 h-10 m-5"
                onClick={() => (navigate("/"), supabase.auth.signOut())}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog>
      {/* TRIGGER */}
      <DialogTrigger>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-6 cursor-pointer hover:text-primary hover:bg-neutral rounded-4xl transition-colors duration-200"
        >
          <path d="M18 20a6 6 0 0 0-12 0" />
          <circle cx="12" cy="10" r="4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </DialogTrigger>

      {/* CONTENIDO PRINCIPAL */}
      <DialogContent className="max-w-xl p-0 overflow-hidden ">
        <div className="flex h-full">
          {/* SIDEBAR */}
          <aside className="w-40 bg-muted/50 border-r p-4 flex flex-col space-y-3">
            <button
              onClick={() => handleActive("accesibilidad")}
              className={`block px-4 py-2 rounded transition-colors duration-200
          ${
            AccesisActive
              ? "bg-neutral text-primary font-semibold shadow-md"
              : "text-black hover:bg-neutral hover:text-primary"
          }`}
            >
              Accesibilidad
            </button>

            <button
              onClick={() => handleActive("perfil")}
              className={`block px-4 py-2 rounded  transition-colors duration-200
          ${
            PerfilActive
              ? "bg-neutral text-primary font-semibold shadow-md"
              : "text-black hover:bg-neutral hover:text-primary"
          }`}
            >
              Perfil
            </button>
          </aside>

          {/* CONTENIDO DINÁMICO */}
          <main className="flex-1 p-6">{renderContent()}</main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
