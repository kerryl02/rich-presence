/**
 * Discord Rich Presence — Storytelling multi-histoires
 * ----------------------------------------------------
 * ✅ Plusieurs histoires (scénarios) avec 4 étapes chacune
 * ✅ Rotation automatique des étapes
 * ✅ Rotation automatique des histoires
 * ✅ Boutons fixes (CTA agence)
 * ✅ Timer qui redémarre à chaque nouvelle histoire
 * ✅ Gestion des erreurs + reconnexion
 *
 * Dépendances : npm i discord-rpc
 */

const RPC = require("discord-rpc");

// ─────────────────────────────────────────────────────────────
// 🎛️ CONFIGURATION
// ─────────────────────────────────────────────────────────────
const CLIENT_ID = "1042055853903188109"; // ⚠️ Remplace par ton App ID Discord

// Durées (en secondes)
const STEP_SECONDS = 10;   // durée d’une étape
const STORY_PAUSE = 5;     // pause entre deux histoires

// Boutons (max 2)
const BUTTONS = [
  { label: "🌐 Découvrir mon agence", url: "https://hexwebdigital.com" }, // TODO
  { label: "📩 Créer ton site", url: "https://hexwebdigital.com/contact" }, // TODO
];

// Histoires (tu peux en ajouter d’autres facilement)
const STORIES = [
  [
    { details: "💡 Un entrepreneur a une vision…", state: "Je l’aide à clarifier son idée", largeImageKey: "idea", largeImageText: "De l’idée au plan" },
    { details: "🛠️ Je transforme son idée en site web", state: "Design, contenu, SEO", largeImageKey: "build", largeImageText: "Conception" },
    { details: "🚀 Son business prend vie en ligne !", state: "Site rapide & SEO-friendly", largeImageKey: "launch", largeImageText: "Lancement réussi" },
    { details: "🌟 Et si c’était ton tour ?", state: "Sites modernes & performants", largeImageKey: "call", largeImageText: "Contacte ton agence" },
  ],
  [
    { details: "✈️ Un entrepreneur de Lisbonne a un rêve…", state: "Une idée ambitieuse", largeImageKey: "lisbon", largeImageText: "Lisbonne digitale" },
    { details: "📱 Je crée son site mobile-friendly", state: "Expérience fluide", largeImageKey: "mobile", largeImageText: "Mobile-first" },
    { details: "🌐 Son projet atteint le monde entier", state: "Internationalisation", largeImageKey: "world", largeImageText: "Expansion mondiale" },
    { details: "🌟 Pourquoi pas ton business ?", state: "Lance ton projet maintenant", largeImageKey: "call", largeImageText: "Travaillons ensemble" },
  ],
  [
    { details: "📊 Un client me confie son projet…", state: "Site vitrine PME", largeImageKey: "project", largeImageText: "Projet client" },
    { details: "⚡ Site prêt en 10 jours chrono", state: "Rapidité & qualité", largeImageKey: "speed", largeImageText: "Livraison express" },
    { details: "📈 Résultat : +120% de visiteurs", state: "SEO au top", largeImageKey: "growth", largeImageText: "Croissance" },
    { details: "🌟 Ton succès est le prochain", state: "Contacte ton agence", largeImageKey: "call", largeImageText: "Prochain projet : le tien" },
  ],
];

// ─────────────────────────────────────────────────────────────
// 🔌 SETUP RPC
// ─────────────────────────────────────────────────────────────
const rpc = new RPC.Client({ transport: "ipc" });
RPC.register(CLIENT_ID);

let storyIndex = 0;
let stepIndex = 0;
let cycleStart = Date.now();
let stepTimer = null;

// Met à jour l’activité Discord
function setPresence(step) {
  const payload = {
    details: step.details,
    state: step.state,
    startTimestamp: Math.floor(cycleStart / 1000),
    largeImageKey: step.largeImageKey,
    largeImageText: step.largeImageText,
    smallImageKey: "logo_agence", // TODO: upload un logo générique dans Art Assets
    smallImageText: "Mon agence web",
    buttons: BUTTONS,
    instance: false,
  };

  return rpc.setActivity(payload).catch((e) =>
    console.error("[setActivity] erreur:", e?.message || e)
  );
}

// Passe à l’étape suivante
function nextStep() {
  const story = STORIES[storyIndex];

  stepIndex++;
  if (stepIndex >= story.length) {
    // Fin de l’histoire → pause → histoire suivante
    clearInterval(stepTimer);
    setTimeout(() => {
      storyIndex = (storyIndex + 1) % STORIES.length;
      stepIndex = 0;
      cycleStart = Date.now();
      setPresence(STORIES[storyIndex][stepIndex]);
      stepTimer = setInterval(nextStep, STEP_SECONDS * 1000);
    }, STORY_PAUSE * 1000);
    return;
  }

  setPresence(story[stepIndex]);
}

// Lance la boucle storytelling
function startStories() {
  stepIndex = 0;
  storyIndex = 0;
  cycleStart = Date.now();
  setPresence(STORIES[storyIndex][stepIndex]);
  stepTimer = setInterval(nextStep, STEP_SECONDS * 1000);
}

// ─────────────────────────────────────────────────────────────
// ÉVÉNEMENTS RPC
// ─────────────────────────────────────────────────────────────
rpc.on("ready", () => {
  console.log("✅ Rich Presence connecté à Discord.");
  startStories();
});

rpc.on("disconnected", () => {
  console.warn("⚠️ Déconnecté du client Discord, reconnexion…");
  setTimeout(() => rpc.login({ clientId: CLIENT_ID }).catch(console.error), 5000);
});

rpc.on("error", (err) => {
  console.error("❌ RPC error:", err?.message || err);
});

// ─────────────────────────────────────────────────────────────
// SORTIE PROPRE
// ─────────────────────────────────────────────────────────────
async function shutdown(code = 0) {
  try {
    clearInterval(stepTimer);
    await rpc.clearActivity().catch(() => {});
  } finally {
    process.exit(code);
  }
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

// ─────────────────────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────────────────────
(async () => {
  if (!CLIENT_ID || CLIENT_ID === "TON_APPLICATION_ID") {
    console.error("👉 CONFIG manquante: mets ton Application ID dans CLIENT_ID.");
    process.exit(1);
  }
  try {
    await rpc.login({ clientId: CLIENT_ID });
  } catch (e) {
    console.error("❌ Impossible de se connecter au client Discord.");
    console.error("Assure-toi que Discord Desktop est lancé.");
    console.error("Erreur:", e?.message || e);
  }
})();








