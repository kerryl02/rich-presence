const RPC = require("discord-rpc");

// ← Remplace par TON Application ID
const clientId = "1042055853903188109";

// Config personnalisable
const CONFIG = {
  details: "🚀 Développeur Web & SaaS",
  state: "💻 En train de coder",
  largeImageKey: "logo",       // correspond à un asset uploadé
  largeImageText: "Mon agence digitale",
  smallImageKey: "code",       // optionnel
  smallImageText: "JavaScript Lover ❤️",
  buttons: [
    { label: "🌐 Portfolio", url: "https://ton-site.com" },
    { label: "📦 GitHub",   url: "https://github.com/tonuser" },
  ],
  refreshMs: 15_000, // ping toutes les 15s (keepalive)
};

const rpc = new RPC.Client({ transport: "ipc" });
RPC.register(clientId);

function setActivity() {
  rpc.setActivity({
    details: CONFIG.details,
    state: CONFIG.state,
    startTimestamp: start, // affiche un timer depuis le lancement
    largeImageKey: CONFIG.largeImageKey,
    largeImageText: CONFIG.largeImageText,
    smallImageKey: CONFIG.smallImageKey,
    smallImageText: CONFIG.smallImageText,
    buttons: CONFIG.buttons,
    instance: false,
  }).catch((e) => {
    console.error("setActivity error:", e?.message || e);
  });
}

let start = new Date();

rpc.on("ready", () => {
  console.log("✅ Rich Presence connecté au client Discord.");
  setActivity();
  // Keepalive (certains clients expirent la présence si pas rafraîchie)
  setInterval(setActivity, CONFIG.refreshMs);
});

// Gestion des sorties propres
function cleanupAndExit(code = 0) {
  rpc.clearActivity().catch(() => {}).finally(() => process.exit(code));
}
process.on("SIGINT", () => cleanupAndExit(0));
process.on("SIGTERM", () => cleanupAndExit(0));
process.on("uncaughtException", (err) => {
  console.error("Uncaught:", err);
  cleanupAndExit(1);
});

// Connexion au client Discord local (doit être lancé)
rpc.login({ clientId }).catch((err) => {
  console.error("❌ Impossible de se connecter au client Discord via RPC.");
  console.error("Assure-toi que Discord Desktop est ouvert sur cette machine.");
  console.error("Erreur:", err?.message || err);
  process.exit(1);
});
