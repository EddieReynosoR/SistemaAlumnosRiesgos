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

// ======================================================
// 🔴 FUNCIÓN PARA APLICAR MODO PARKINSON 
// ======================================================
let parkinsonCursorListener: ((e: MouseEvent) => void) | null = null;
let parkinsonClickListener: ((e: MouseEvent) => void) | null = null;
let cursorElement: HTMLDivElement | null = null;

function applyParkinsonStyles() {
  const enabled = localStorage.getItem("parkinsonEnabled") === "true";
  const size = Number(localStorage.getItem("cursorSize")) || 30;

  if (parkinsonCursorListener) {
    window.removeEventListener('mousemove', parkinsonCursorListener);
    parkinsonCursorListener = null;
  }
  if (parkinsonClickListener) {
    window.removeEventListener('click', parkinsonClickListener, true);
    parkinsonClickListener = null;
  }

  if (!enabled) {
    const domElement = document.getElementById('parkinson-cursor');
    if (domElement) domElement.remove();
    if (cursorElement) cursorElement.remove();
    cursorElement = null;
    return;
  }

  if (!cursorElement) {
    const existing = document.getElementById('parkinson-cursor');
    if (existing) {
      cursorElement = existing as HTMLDivElement;
    } else {
      cursorElement = document.createElement('div');
      cursorElement.id = 'parkinson-cursor';
      cursorElement.style.position = 'fixed';
      cursorElement.style.pointerEvents = 'none'; 
      cursorElement.style.zIndex = '9999';
      cursorElement.style.borderRadius = '50%';
      cursorElement.style.border = '2px solid red';
      cursorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
      cursorElement.style.transform = 'translate(-50%, -50%)';
      cursorElement.style.transition = 'width 0.1s, height 0.1s, left 0.02s, top 0.02s';
      document.body.appendChild(cursorElement);
    }
  }

  cursorElement.style.width = `${size}px`;
  cursorElement.style.height = `${size}px`;

  parkinsonCursorListener = (e: MouseEvent) => {
    if (cursorElement) {
      cursorElement.style.left = `${e.clientX}px`;
      cursorElement.style.top = `${e.clientY}px`;
    }
  };
  window.addEventListener('mousemove', parkinsonCursorListener);

  parkinsonClickListener = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    const isInteractive = target.closest('button, a, input, select, textarea, [role="button"]');
    if (isInteractive) return;

    const clickX = e.clientX;
    const clickY = e.clientY;
    const radio = size / 2;

    const candidates = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
    
    let closestElement: HTMLElement | null = null;
    let minDistance = Infinity;

    candidates.forEach((el) => {
        const element = el as HTMLElement;
        const rect = element.getBoundingClientRect();

        if (rect.width === 0 && rect.height === 0) return;

        const closestX = Math.max(rect.left, Math.min(clickX, rect.right));
        const closestY = Math.max(rect.top, Math.min(clickY, rect.bottom));

        const distance = Math.sqrt(Math.pow(clickX - closestX, 2) + Math.pow(clickY - closestY, 2));

        if (distance < minDistance) {
            minDistance = distance;
            closestElement = element;
        }
    });

    if (closestElement && minDistance <= radio) {
        
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          e.preventDefault();
          
          (closestElement as HTMLElement).click();
          (closestElement as HTMLElement).focus();

          if (cursorElement) {
              cursorElement.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
              cursorElement.style.borderColor = '#00ff00';
              setTimeout(() => { 
                  if(cursorElement) {
                      cursorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.15)'; 
                      cursorElement.style.borderColor = 'red';
                  }
              }, 300);
          }
    }
  };
  
  window.addEventListener('click', parkinsonClickListener, true);
}

const shortcutsData = [
  {
    category: "General",
    items: [
      { action: "Refrescar", keys: ["Alt", "R"] },
    ]
  },
  {
    category: "Estudiantes",
    items: [
      { action: "Agregar estudiante", keys: ["Alt", "E"] },
    ]
  },
  {
    category: "Factores de Riesgo",
    items: [
      { action: "Agregar factor", keys: ["Alt", "R"] },
    ]
  },
  {
    category: "Materias",
    items: [
      { action: "Agregar materia", keys: ["Alt", "M"] },
    ]
  },
  {
    category: "Carreras",
    items: [
      { action: "Agregar carrera", keys: ["Alt", "C"] },
    ]
  },
  {
    category: "Gráficas",
    items: [
      { action: "Exportar Excel", keys: ["Alt", "E"] },
      { action: "Exportar CSV", keys: ["Alt", "C"] },
      { action: "Exportar PDF", keys: ["Alt", "P"] },
      { action: "Exportar Todos", keys: ["Alt", "T"] },
    ]
  },
  {
    category: "Exportar Datos",
    items: [
      { action: "Elegir carpeta", keys: ["Alt", "C"] },
      { action: "Exportar", keys: ["Alt", "E"] },
      { action: "Cancelar", keys: ["Alt", "X"] },
    ]
  },
  {
    category: "Importar Datos",
    items: [
      { action: "Guardar", keys: ["Alt", "G"] },
      { action: "Cancelar", keys: ["Alt", "X"] },
    ]
  }
];

export default function Settings() {

  const [section, setSection] = useState("accesibilidad");

  const [subSection, setSubSection] = useState<"pantalla" | "sonido" | "dislexia" | "parkinson" | "atajos">("pantalla");

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

  // 🤲 PARKINSON
  const [parkinsonEnabled, setParkinsonEnabled] = useState(false);
  const [cursorSize, setCursorSize] = useState(50);

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

    // PARKINSON
    const savedParkinson = localStorage.getItem("parkinsonEnabled") === "true";
    setParkinsonEnabled(savedParkinson);

    const savedCursorSize = localStorage.getItem("cursorSize");
    if (savedCursorSize) setCursorSize(Number(savedCursorSize));

    applyParkinsonStyles();

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

  // ---------- PARKINSON ----------
  const handleParkinsonToggle = (value: boolean) => {
    setParkinsonEnabled(value);
    localStorage.setItem("parkinsonEnabled", String(value));
    setTimeout(applyParkinsonStyles, 0);
  };

  const handleCursorSizeChange = (value: number) => {
    setCursorSize(value);
    localStorage.setItem("cursorSize", String(value));
    setTimeout(applyParkinsonStyles, 0);
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

      // 🤲 PARKINSON
      case "parkinson":
        return (
          <div className="flex flex-col space-y-6 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={parkinsonEnabled}
                id="parkinsonToggle"
                onCheckedChange={handleParkinsonToggle}
              />
              <Label htmlFor="parkinsonToggle">Modo Parkinson</Label>
            </div>

            {parkinsonEnabled && (
              <>
                <div>
                  <Label className="font-semibold">Tamaño del indicador</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs">Pequeño</span>
                    <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={cursorSize}
                        onChange={(e) => handleCursorSizeChange(Number(e.target.value))}
                        className="flex-1 cursor-pointer"
                    />
                    <span className="text-xs">Grande</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Actual: {cursorSize}px</p>
                </div>
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-200">
                  <p>Si haces click cerca de un botón dentro del círculo rojo, el sistema lo presionará por ti automáticamente.</p>
                </div>
              </>
            )}
          </div>
        );

      // ⌨️ ATAJOS (NUEVA SECCIÓN)
      case "atajos":
        return (
            <div className="space-y-6 mt-4 pr-2">
                <div className="grid gap-6">
                    {shortcutsData.map((section, idx) => (
                        <div key={idx} className="bg-secondary/20 p-4 rounded-lg border border-secondary/50">
                            <h3 className="font-semibold text-primary mb-3 text-lg border-b border-secondary/50 pb-1">{section.category}</h3>
                            <div className="space-y-3">
                                {section.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="text-foreground">{item.action}</span>
                                        <div className="flex gap-1">
                                            {item.keys.map((k, kIdx) => (
                                                <span key={kIdx} className="px-2 py-1 bg-muted border rounded font-mono text-xs font-bold shadow-sm">
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
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
                Ajustes visuales, auditivos, lectura y atajos.
              </DialogDescription>
            </DialogHeader>

            {/* SUBMENÚ AJUSTADO */}
            <div className="flex gap-2 border-b pb-2 mt-4 flex-wrap">

              <button
                onClick={() => setSubSection("pantalla")}
                className={`px-4 py-2 rounded whitespace-nowrap flex-shrink-0 ${
                  subSection === "pantalla"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Pantalla
              </button>

              <button
                onClick={() => setSubSection("sonido")}
                className={`px-4 py-2 rounded whitespace-nowrap flex-shrink-0 ${
                  subSection === "sonido"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Sonido
              </button>

              <button
                onClick={() => setSubSection("dislexia")}
                className={`px-4 py-2 rounded whitespace-nowrap flex-shrink-0 ${
                  subSection === "dislexia"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Dislexia
              </button>

              <button
                onClick={() => setSubSection("parkinson")}
                className={`px-4 py-2 rounded whitespace-nowrap flex-shrink-0 ${
                  subSection === "parkinson"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Parkinson
              </button>
              
              {/* ✅ NUEVO BOTÓN ATAJOS */}
              <button
                onClick={() => setSubSection("atajos")}
                className={`px-4 py-2 rounded whitespace-nowrap flex-shrink-0 ${
                  subSection === "atajos"
                    ? "bg-neutral text-primary font-semibold shadow"
                    : "hover:bg-neutral hover:text-primary"
                }`}
              >
                Atajos
              </button>

            </div>

            <div className="pb-10">{renderAccesibilidadSubcontent()}</div>
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

      <DialogContent className="max-w-2xl p-0 overflow-hidden">
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

          <main className="flex-1 p-6 overflow-y-auto max-h-[80vh]">
            {renderContent()}
          </main>

        </div>
      </DialogContent>
    </Dialog>
  );
}