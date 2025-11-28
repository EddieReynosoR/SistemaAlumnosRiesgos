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
import { useSession } from "../context/SessionContext";

export default function Settings() {
  const { session } = useSession();
  const [section, setSection] = useState("accesibilidad");
  const [subSection, setSubSection] = useState<"pantalla" | "sonido">("pantalla");

  const [AccActive, setAccActive] = useState(true);
  const [PerfilActive, setPerfilActive] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  // SONIDO
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceType, setVoiceType] = useState<"female" | "male">("female");
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsVolume, setTtsVolume] = useState(1);

  let navigate = useNavigate();

  // CARGAR AJUSTES GUARDADOS
  useEffect(() => {

    // Pantalla
    const savedDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDark);
    document.documentElement.classList.toggle("dark", savedDark);

    // Sonido
    const savedTTS = localStorage.getItem("ttsHover") === "true";
    setTtsEnabled(savedTTS);

    const savedVoice = localStorage.getItem("ttsVoice") as "female" | "male" | null;
    if (savedVoice) setVoiceType(savedVoice);

    const savedRate = localStorage.getItem("ttsRate");
    if (savedRate) setTtsRate(Number(savedRate));

    const savedVolume = localStorage.getItem("ttsVolume");
    if (savedVolume) setTtsVolume(Number(savedVolume));

    if (savedTTS) enableAutomaticTTS();

  }, []);

  // HANDLERS

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

  // SUBSECCIONES DE ACCESIBILIDAD
  const renderAccesibilidadSubcontent = () => {
    switch (subSection) {

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

      case "sonido":
        return (
          <div className="flex flex-col space-y-6 mt-4">

            {/* ACTVAR LECTURA */}
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
                {/* TIPO DE VOZ */}
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
                      👩 Femenina
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="voiceType"
                        value="male"
                        checked={voiceType === "male"}
                        onChange={() => handleVoiceSelection("male")}
                      />
                      👨 Masculina
                    </label>

                  </div>
                </div>

                {/* VELOCIDAD */}
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

                {/* VOLUMEN */}
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
    }
  };

  const renderContent = () => {
    switch (section) {

      case "accesibilidad":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Accesibilidad</DialogTitle>
              <DialogDescription>Controla cómo se ve y se escucha la aplicación.</DialogDescription>
            </DialogHeader>

            {/* SUBMENÚ DE ACCESIBILIDAD */}
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

            </div>

            {/* CONTENIDO DE LA SUBSECCIÓN */}
            <div>{renderAccesibilidadSubcontent()}</div>
          </>
        );

      case "perfil":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Perfil</DialogTitle>
              <DialogDescription>Configuración de tu cuenta.</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
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

          {/* SIDEBAR PRINCIPAL */}
          <aside className="w-40 bg-muted/50 border-r p-4 flex flex-col space-y-3">

            <button
              onClick={() => handleSection("accesibilidad")}
              className={`block px-4 py-2 rounded transition-colors duration-200 ${
                AccActive ? "bg-neutral text-primary font-semibold shadow-md" : "hover:bg-neutral hover:text-primary"
              }`}
            >
              Accesibilidad
            </button>
            {session?(

              <button
              onClick={() => handleSection("perfil")}
              className={`block px-4 py-2 rounded transition-colors duration-200 ${
                PerfilActive ? "bg-neutral text-primary font-semibold shadow-md" : "hover:bg-neutral hover:text-primary"
                }`}
                >
              Perfil
            </button>
            ):null}

          </aside>

          {/* CONTENIDO */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
