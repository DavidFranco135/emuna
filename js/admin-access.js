// ============================================================
// EMUNÁ · Acesso administrativo (discreto)
// ============================================================
// O gatilho visível é um pontinho quase invisível no rodapé
// (classe .admin-trigger). Também é possível abrir o login com
// o atalho Ctrl+Alt+E, sem precisar localizar o elemento na tela.
// Depois de logado, redirecione para /admin/ (painel administrativo
// — módulo separado, fora do escopo desta primeira entrega).
// ============================================================

import { auth, isFirebaseConfigured } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_SESSION_KEY } from "./admin-credentials-demo.js";

let bound = false;

/** Liga os listeners do modal de login. Chamar depois que o partial do
 * rodapé (que contém o modal e o gatilho) já estiver no DOM. */
export function initAdminAccess() {
  const modal = document.getElementById("admin-login-modal");
  const form = document.getElementById("admin-login-form");
  const errorEl = document.getElementById("admin-login-error");
  const closeBtn = document.getElementById("admin-login-close");
  if (!modal || !form) return;

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("admin-email")?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    errorEl.textContent = "";
    form.reset();
  }

  document.querySelectorAll(".admin-trigger").forEach((el) => {
    el.addEventListener("click", openModal);
  });

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value;
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando…";

    if (!isFirebaseConfigured) {
      // Modo demonstração: valida contra as credenciais fixas em
      // js/admin-credentials-demo.js (sem Firebase real ainda).
      if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
        sessionStorage.setItem(DEMO_SESSION_KEY, "true");
        window.location.href = "admin/index.html";
      } else {
        errorEl.textContent = "E-mail ou senha incorretos.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Entrar";
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin/index.html";
    } catch (err) {
      errorEl.textContent = "E-mail ou senha incorretos.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar";
    }
  });

  // atalho de teclado, registrado uma única vez globalmente
  if (!bound) {
    bound = true;
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "e") openModal();
      if (e.key === "Escape") closeModal();
    });
  }
}
