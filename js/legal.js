// ============================================================
// EMUNÁ · Páginas institucionais (política, trocas, termos)
// ============================================================
import { initLayout } from "./layout.js";
import { getStoreSettings } from "./firestore-service.js";

async function init() {
  await initLayout();
  const settings = await getStoreSettings();
  document.querySelectorAll("[data-email]").forEach((a) => (a.href = `mailto:${settings.email}`));
}

init();
