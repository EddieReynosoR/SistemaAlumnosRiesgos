
let active = false;
let naturalVoice: SpeechSynthesisVoice | null = null;
const synth = window.speechSynthesis;

let observer: MutationObserver | null = null;

function loadVoicesWithRetry() {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let voices = synth.getVoices();

    if (voices.length > 0) return resolve(voices);

    let tries = 0;
    const interval = setInterval(() => {
      voices = synth.getVoices();
      tries++;

      if (voices.length > 0 || tries > 25) {
        clearInterval(interval);
        resolve(voices);
      }
    }, 150);
  });
}

async function selectNaturalVoice() {
  const voices = await loadVoicesWithRetry();
  const preferred = localStorage.getItem("ttsVoice") || "female";

  if (!voices || voices.length === 0) return;

  const isFemale = preferred === "female";

  naturalVoice =
    voices.find((v) =>
      v.lang.startsWith("es") &&
      (
        (isFemale && (
          v.name.toLowerCase().includes("sabina") ||
          v.name.toLowerCase().includes("paulina") ||
          v.name.toLowerCase().includes("helena") ||
          v.name.toLowerCase().includes("laura") ||
          v.name.toLowerCase().includes("female")
        )) ||
        (!isFemale && (
          v.name.toLowerCase().includes("raul") ||
          v.name.toLowerCase().includes("jorge") ||
          v.name.toLowerCase().includes("male")
        ))
      )
    ) ||
    voices.find((v) => v.lang.startsWith("es")) ||
    voices[0];
}

export async function enableAutomaticTTS() {
  // 👉 Siempre recargar voz aunque ya esté activo
  await selectNaturalVoice();

  // Si ya está activo, NO re-crees listeners
  if (active) return;

  active = true;

  // Observer de cambios en la UI (DOM dinámico)
  observer = new MutationObserver(() => attachListeners());
  observer.observe(document.body, { childList: true, subtree: true });

  attachListeners();
}

function attachListeners() {
  if (!active) return;

  document.querySelectorAll<HTMLElement>(
    "[data-tts], h1, h2, h3, p, button, span, a, label"
  )
    .forEach((element) => {
      if (!element.dataset.ttsBound) {
        element.dataset.ttsBound = "true";
        element.addEventListener("mouseenter", speakEvent);
      }
    });
}

function speakEvent(this: HTMLElement) {
  if (!active) return;

  const text = this.getAttribute("data-tts") || this.innerText;
  if (!text?.trim()) return;

  // 🔥 Evitar acumulación de audios
  synth.cancel();

  // Velocidad y volumen dinámicos
  const rate = Number(localStorage.getItem("ttsRate")) || 1;
  const volume = Number(localStorage.getItem("ttsVolume")) || 1;

  // Crear lectura
  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = rate;
  speech.volume = volume;

  speech.lang = naturalVoice?.lang || "es-MX";
  speech.voice = naturalVoice || null;
  speech.pitch = 1;

  synth.speak(speech);
}

export function disableAutomaticTTS() {
  active = false;

  synth.cancel();

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  document.querySelectorAll("[data-ttsBound]").forEach((el: any) => {
    delete el.dataset.ttsBound;
    el.removeEventListener("mouseenter", speakEvent);
  });
}
