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
import { enableAutomaticTTS, disableAutomaticTTS } from "../utils/ttsAuto";

// ======================================================
// 🔵 FUNCIÓN PARA APLICAR MODO DISLEXIA
// ======================================================
function applyDyslexiaStyles() {
  const enabled = localStorage.getItem("dyslexiaEnabled") === "true";
  const font = localStorage.getItem("dyslexiaFont") || "lexend";
  const spacing = Number(localStorage.getItem("dyslexiaSpacing")) || 1;
  const lineH = Number(localStorage.getItem("dyslexiaLineHeight")) || 1.2;

  const html = document.documentElement;

  if (!enabled) {
    html.classList.remove("dyslexia-mode");
    html.style.removeProperty("--dys-font");
    html.style.removeProperty("--dys-spacing");
    html.style.removeProperty("--dys-lineh");
    return;
  }

  html.classList.add("dyslexia-mode");

  if (font === "open") {
    html.style.setProperty("--dys-font", "'OpenDyslexic'");
  } else {
    html.style.setProperty("--dys-font", "'Lexend'");
  }

  html.style.setProperty("--dys-spacing", `${spacing}px`);
  html.style.setProperty("--dys-lineh", `${lineH}`);
}

export default function Settings() {

  const [section, setSection] = useState("accesibilidad");
  const [subSection, setSubSection] = useState<"pantalla" | "sonido" | "dislexia">("pantalla");

  const [AccActive, setAccActive] = useState(true);
  const [PerfilActive, setPerfilActive] = useState(false);

  // 🖥️ PANTALLA
  const [darkMode, setDarkMode] = useState(false);

  // 🔊 SONIDO
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceType, setVoiceType] = useState<"female" | "male">("female");
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsVolume, setTtsVolume] = useState(1);

  // 🧠 DISLEXIA
  const [dyslexiaEnabled, setDyslexiaEnabled] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState("lexend");
  const [dyslexiaSpacing, setDyslexiaSpacing] = useState(1);
  const [dyslexiaLineHeight, setDyslexiaLineHeight] = useState(1.2);

  let navigate = useNavigate();

  // ======================================================
  // CARGAR AJUSTES GUARDADOS
  // ======================================================
  useEffect(() => {

    // PANTALLA
    const savedDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDark);
    document.documentElement.classList.toggle("dark", savedDark);

    // SONIDO
    const savedTTS = localStorage.getItem("ttsHover") === "true";
    setTtsEnabled(savedTTS);

    const savedVoice = localStorage.getItem("ttsVoice") as "female" | "male" | null;
    if (savedVoice) setVoiceType(savedVoice);

    const savedRate = localStorage.getItem("ttsRate");
    if (savedRate) setTtsRate(Number(savedRate));

    const savedVolume = localStorage.getItem("ttsVolume");
    if (savedVolume) setTtsVolume(Number(savedVolume));

    if (savedTTS) enableAutomaticTTS();

    // DISLEXIA
    const savedDyslexia = localStorage.getItem("dyslexiaEnabled") === "true";
    setDyslexiaEnabled(savedDyslexia);

    const savedFont = localStorage.getItem("dyslexiaFont");
    if (savedFont) setDyslexiaFont(savedFont);

    const savedSpacing = localStorage.getItem("dyslexiaSpacing");
    if (savedSpacing) setDyslexiaSpacing(Number(savedSpacing));

    const savedLine = localStorage.getItem("dyslexiaLineHeight");
    if (savedLine) setDyslexiaLineHeight(Number(savedLine));

    applyDyslexiaStyles();

  }, []);


  // ======================================================
  // HANDLERS
  // ======================================================

  const handleSection = (Select: string) => {
    setSection(Select);
    setAccActive(Select === "accesibilidad");
    setPerfilActive(Select === "perfil");
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", String(checked));
    document.documentElement.classList.toggle("dark", checked);
  };

  const handleTextToSpeech = (checked: boolean) => {
    setTtsEnabled(checked);
    localStorage.setItem("ttsHover", String(checked));

    if (checked) enableAutomaticTTS();
    else disableAutomaticTTS();
  };

  const handleVoiceSelection = async (type: "female" | "male") => {
    setVoiceType(type);
    localStorage.setItem("ttsVoice", type);
    await enableAutomaticTTS();
  };

  const handleRateChange = (value: number) => {
    setTtsRate(value);
    localStorage.setItem("ttsRate", String(value));
  };

  const handleVolumeChange = (value: number) => {
    setTtsVolume(value);
    localStorage.setItem("ttsVolume", String(value));
  };

  // ---------- DISLEXIA ----------
  const handleDyslexiaToggle = (value: boolean) => {
    setDyslexiaEnabled(value);
    localStorage.setItem("dyslexiaEnabled", String(value));
    applyDyslexiaStyles();
  };

  const handleDyslexiaFontChange = (font: string) => {
    setDyslexiaFont(font);
    localStorage.setItem("dyslexiaFont", font);
    applyDyslexiaStyles();
  };

  const handleSpacingChange = (value: number) => {
    setDyslexiaSpacing(value);
    localStorage.setItem("dyslexiaSpacing", String(value));
    applyDyslexiaStyles();
  };

  const handleLineHeightChange = (value: number) => {
    setDyslexiaLineHeight(value);
    localStorage.setItem("dyslexiaLineHeight", String(value));
    applyDyslexiaStyles();
  };

  // ======================================================
  // SUBCONTENIDO DE ACCESIBILIDAD
  // ======================================================
  const renderAccesibilidadSubcontent = () => {
    switch (subSection) {

      // 🖥️ PANTALLA
      case "pantalla":
        return (
          <div className="flex flex-col space-y-6 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeChange}
                id="darkmode"
              />
              <Label htmlFor="darkmode">Modo oscuro</Label>
            </div>
          </div>
        );

      // 🔊 SONIDO
      case "sonido":
        return (
          <div className="flex flex-col space-y-6 mt-4">

            <div className="flex items-center space-x-2">
              <Switch
                checked={ttsEnabled}
                id="ttsHover"
                onCheckedChange={handleTextToSpeech}
              />
              <Label htmlFor="ttsHover">Lectura por voz</Label>
            </div>

            {ttsEnabled && (
              <>
                <div>
                  <Label className="font-semibold">Tipo de voz</Label>
                  <div className="mt-2 flex gap-4">

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="voiceType"
                        value="female"
                        checked={voiceType === "female"}
                        onChange={() => handleVoiceSelection("female")}
                      />
                      Femenina
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="voiceType"
                        value="male"
                        checked={voiceType === "male"}
                        onChange={() => handleVoiceSelection("male")}
                      />
                      Masculina
                    </label>

                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Velocidad</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ttsRate}
                    onChange={(e) => handleRateChange(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">Actual: {ttsRate.toFixed(1)}</p>
                </div>

                <div>
                  <Label className="font-semibold">Volumen</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={ttsVolume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">Actual: {ttsVolume.toFixed(1)}</p>
                </div>

              </>
            )}

          </div>
        );

      case "dislexia":
        return (
          <div className="flex flex-col space-y-6 mt-4">

            <div className="flex items-center space-x-2">
              <Switch
                checked={dyslexiaEnabled}
                id="dyslexiaToggle"
                onCheckedChange={handleDyslexiaToggle}
              />
              <Label htmlFor="dyslexiaToggle">Modo Dislexia</Label>
            </div>

            {dyslexiaEnabled && (
              <>
                <div>
                  <Label className="font-semibold">Tipo de fuente</Label>
                  <div className="mt-2 flex gap-4">

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dysFont"
                        value="lexend"
                        checked={dyslexiaFont === "lexend"}
                        onChange={() => handleDyslexiaFontChange("lexend")}
                      />
                      Lexend
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dysFont"
                        value="open"
                        checked={dyslexiaFont === "open"}
                        onChange={() => handleDyslexiaFontChange("open")}
                      />
                      OpenDyslexic
                    </label>

                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Espaciado entre letras</Label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={dyslexiaSpacing}
                    onChange={(e) => handleSpacingChange(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">Actual: {dyslexiaSpacing}px</p>
                </div>

                <div>
                  <Label className="font-semibold">Interlineado</Label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={dyslexiaLineHeight}
                    onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">Actual: {dyslexiaLineHeight}</p>
                </div>

              </>
            )}

          </div>
        );
    }
  };


  // ======================================================
  // CONTENIDO PRINCIPAL
  // ======================================================
  const renderContent = () => {
    switch (section) {

      case "accesibilidad":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Accesibilidad</DialogTitle>
              <DialogDescription>
                Ajustes visuales, auditivos y de lectura.
              </DialogDescription>
            </DialogHeader>

            {/* SUBMENÚ */}
            <div className="flex gap-4 border-b pb-2 mt-4">

              <button
                onClick={() => setSubSection("pantalla")}
                className={`px-4 py-2 rounded ${
                  subSection === "pantalla"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Pantalla
              </button>

              <button
                onClick={() => setSubSection("sonido")}
                className={`px-4 py-2 rounded ${
                  subSection === "sonido"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Sonido
              </button>

              <button
                onClick={() => setSubSection("dislexia")}
                className={`px-4 py-2 rounded ${
                  subSection === "dislexia"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Dislexia
              </button>

            </div>

            <div>{renderAccesibilidadSubcontent()}</div>
          </>
        );


      case "perfil":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Perfil</DialogTitle>
              <DialogDescription>Opciones de cuenta.</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <button
                className="cursor-pointer hover:border-2 hover:border-primary hover:bg-neutral hover:text-primary bg-primary text-neutral rounded-2xl w-50 h-10 m-5"
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

      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="flex h-full">

          {/* SIDEBAR */}
          <aside className="w-40 bg-muted/50 border-r p-4 flex flex-col space-y-3">

            <button
              onClick={() => handleSection("accesibilidad")}
              className={`block px-4 py-2 rounded transition-colors duration-200 ${
                AccActive ? "bg-neutral text-primary font-semibold shadow-md" : "hover:bg-neutral hover:text-primary"
              }`}
            >
              Accesibilidad
            </button>

            <button
              onClick={() => handleSection("perfil")}
              className={`block px-4 py-2 rounded transition-colors duration-200 ${
                PerfilActive ? "bg-neutral text-primary font-semibold shadow-md" : "hover:bg-neutral hover:text-primary"
              }`}
            >
              Perfil
            </button>

          </aside>

          <main className="flex-1 p-6">
            {renderContent()}
          </main>

        </div>
      </DialogContent>
    </Dialog>
  );
}
