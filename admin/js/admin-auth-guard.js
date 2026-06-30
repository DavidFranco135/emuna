// ============================================================
// EMUNÁ ADMIN · Guarda de autenticação
// ============================================================
// Toda página do painel deve chamar `await requireAdmin()` antes
// de renderizar qualquer dado. Se não houver usuário autenticado,
// redireciona de volta para a loja. Em modo demonstração (Firebase
// não configurado), deixa passar com um aviso, para permitir testar
// o painel inteiro sem credenciais reais.
// ============================================================

import { auth, isFirebaseConfigured } from "../../js/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { DEMO_ADMIN_EMAIL, DEMO_SESSION_KEY } from "../../js/admin-credentials-demo.js";

export function requireAdmin() {
  return new Promise((resolve) => {
    if (!isFirebaseConfigured) {
      if (sessionStorage.getItem(DEMO_SESSION_KEY) !== "true") {
        window.location.href = "../index.html";
        return;
      }
      showDemoBanner();
      resolve({ email: DEMO_ADMIN_EMAIL, demo: true });
      return;
    }
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "../index.html";
        return;
      }
      resolve({ email: user.email, demo: false });
    });
  });
}

function showDemoBanner() {
  if (document.getElementById("demo-mode-banner")) return;
  const bar = document.createElement("div");
  bar.id = "demo-mode-banner";
  bar.className = "demo-mode-banner";
  bar.innerHTML =
    "Modo demonstração — Firebase não configurado. Os dados deste painel existem só nesta sessão. <a href=\"../README.md\">Ver instruções de configuração</a>.";
  document.body.prepend(bar);
}

export async function adminLogout() {
  if (isFirebaseConfigured) {
    await signOut(auth);
  } else {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
  window.location.href = "../index.html";
}
