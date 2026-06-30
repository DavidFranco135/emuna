// ============================================================
// EMUNÁ ADMIN · Layout compartilhado
// ============================================================
import { requireAdmin, adminLogout } from "./admin-auth-guard.js";

async function injectSidebar() {
  const host = document.getElementById("sidebar-placeholder");
  if (!host) return;
  const res = await fetch("partials/sidebar.html");
  host.innerHTML = await res.text();
}

function markActiveNav(current) {
  document.querySelectorAll(".admin-nav a").forEach((a) => {
    a.classList.toggle("is-active", a.dataset.nav === current);
  });
}

function initSidebarToggle() {
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("admin-sidebar-overlay");
  const toggle = document.getElementById("admin-menu-toggle");
  toggle?.addEventListener("click", () => {
    sidebar.classList.toggle("is-open");
    overlay.classList.toggle("is-open");
  });
  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
  });
}

function initLogout() {
  document.getElementById("admin-logout-btn")?.addEventListener("click", adminLogout);
}

/** Inicializa o shell do painel (sidebar + topbar + guarda de auth) e
 * retorna os dados do usuário autenticado. `pageKey` deve bater com o
 * atributo data-nav do link correspondente na sidebar. `pageTitle` é
 * exibido na barra superior. */
export async function initAdminLayout(pageKey, pageTitle) {
  const user = await requireAdmin();
  await injectSidebar();
  markActiveNav(pageKey);
  initSidebarToggle();
  initLogout();

  const titleEl = document.getElementById("admin-page-title");
  if (titleEl) titleEl.textContent = pageTitle;

  const emailEl = document.getElementById("admin-user-email");
  if (emailEl) emailEl.textContent = user.demo ? "Modo demonstração" : user.email;

  return user;
}
