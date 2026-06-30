// ============================================================
// EMUNÁ ADMIN · Configurações
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import { getStoreSettings, saveStoreSettings } from "../../js/firestore-service.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

function fillForm(s) {
  $("#st-store-name").value = s.storeName || "";
  $("#st-email").value = s.email || "";
  $("#st-phone").value = s.phone || "";
  $("#st-whatsapp").value = s.whatsapp || "";
  $("#st-address").value = s.address || "";
  $("#st-logo").value = s.logo || "";
  $("#st-favicon").value = s.favicon || "";
  $("#st-instagram").value = s.instagram || "";
  $("#st-facebook").value = s.facebook || "";
  $("#st-seo-title").value = s.seoTitle || "";
  $("#st-seo-desc").value = s.seoDescription || "";
  $("#st-ga").value = s.googleAnalytics || "";
  $("#st-gtm").value = s.googleTagManager || "";
  $("#st-pixel").value = s.metaPixel || "";
  $("#st-privacy").value = s.privacyPolicyText || "";
  $("#st-returns").value = s.returnsPolicyText || "";
}

function readForm() {
  return {
    storeName: $("#st-store-name").value.trim(),
    email: $("#st-email").value.trim(),
    phone: $("#st-phone").value.trim(),
    whatsapp: $("#st-whatsapp").value.trim(),
    address: $("#st-address").value.trim(),
    logo: $("#st-logo").value.trim(),
    favicon: $("#st-favicon").value.trim(),
    instagram: $("#st-instagram").value.trim(),
    facebook: $("#st-facebook").value.trim(),
    seoTitle: $("#st-seo-title").value.trim(),
    seoDescription: $("#st-seo-desc").value.trim(),
    googleAnalytics: $("#st-ga").value.trim(),
    googleTagManager: $("#st-gtm").value.trim(),
    metaPixel: $("#st-pixel").value.trim(),
    privacyPolicyText: $("#st-privacy").value.trim(),
    returnsPolicyText: $("#st-returns").value.trim(),
  };
}

async function init() {
  await initAdminLayout("configuracoes", "Configurações");
  const settings = await getStoreSettings();
  fillForm(settings);

  $("#settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveStoreSettings(readForm());
    showToast("Configurações salvas.");
  });
}

init();
