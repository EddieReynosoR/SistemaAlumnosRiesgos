"use client";

import { useState } from "react";
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

export default function Settings() {
  const [section, setSection] = useState("accesibilidad");
 
  
  const [AccesisActive, setIsActive] = useState(false);
  const [PerfilActive, setPerfilActive] = useState(false);

  const handleActive = (Select: string) => {
    setSection(Select);
    if (Select === "perfil") {
      setPerfilActive(true);
        setIsActive(false);
    }
    else if (Select === "accesibilidad") {
      setIsActive(true);
        setPerfilActive(false);
    }
  };
   
  // ----------------------------------
  // CONTENIDO DINÁMICO
  // ----------------------------------
  const renderContent = () => {
    switch (section) {
      case "accesibilidad":
        return (
          <>
            <DialogHeader className="text-Neutral">
              <DialogTitle>Accesibilidad</DialogTitle>
              <DialogDescription>
                Ajustes relacionados con accesibilidad.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-4 mt-4 text-Neutral">
              <div className="flex items-center space-x-2">
                <Switch id="darkmode" />
                <Label htmlFor="darkmode">Modo oscuro</Label>
              </div>

          

              <div className="flex items-center space-x-2">
                <Switch id="contrast" />
                <Label htmlFor="contrast">Alto contraste</Label>
              </div>
            </div>
          </>
        );

      case "perfil":
        return (
          <>
            <DialogHeader className="text-Neutral">
              <DialogTitle>Información del perfil</DialogTitle>
              <DialogDescription>
                Edita tu nombre, correo y preferencias.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3 text-Neutral">
              <label className="flex flex-col text-sm">
                Nombre
                <input
                  className="p-2 border rounded-md"
                  placeholder="Javier Rosas"
                />
              </label>

              <label className="flex flex-col text-sm">
                Correo
                <input
                  className="p-2 border rounded-md"
                  placeholder="email@correo.com"
                />
              </label>

              <button className="cursor-pointer hover:border-2 hover:border-Primary hover:bg-Neutral hover:text-Primary  bg-Primary text-Neutral border-2 border-Neutral  rounded-2xl w-50 h-10 m-5">
                Guardar cambios
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
          className="mr-6 cursor-pointer"
        >
          <path d="M18 20a6 6 0 0 0-12 0" />
          <circle cx="12" cy="10" r="4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </DialogTrigger>

      {/* CONTENIDO PRINCIPAL */}
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-Primary">
        <div className="flex h-full">
          {/* SIDEBAR */}
          <aside className="w-40 bg-muted/50 border-r p-4 flex flex-col space-y-3">
            <button
              onClick={() => (handleActive("accesibilidad"))}
              className={`block px-4 py-2 rounded transition-colors duration-200
          ${
            AccesisActive
              ? "bg-Neutral text-Primary font-semibold shadow-md"
              : "text-Neutral hover:bg-Neutral hover:text-Primary"
          }`}
            >
              Accesibilidad
            </button>

            <button
              onClick={() => (handleActive("perfil"))}
              className={`block px-4 py-2 rounded  transition-colors duration-200
          ${
            PerfilActive
              ? "bg-Neutral text-Primary font-semibold shadow-md"
              : "text-Neutral hover:bg-Neutral hover:text-Primary"
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
