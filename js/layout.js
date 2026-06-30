// ============================================================
// EMUNÁ · Layout compartilhado
// ============================================================
// Carrega partials/header.html e partials/footer.html dentro dos
// placeholders #header-placeholder / #footer-placeholder, e liga
// toda a interação comum: menu mobile, busca, header sticky,
// contador do carrinho, ano do rodapé e acesso administrativo.
// Toda página deve chamar `await initLayout()` antes de qualquer
// renderização própria que dependa do header/footer.
// ============================================================

import { getCartCount } from "./cart.js";
import { initAdminAccess } from "./admin-access.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

async function injectPartial(url, placeholderId) {
  const host = document.getElementById(placeholderId);
  if (!host) return;
  try {
    const res = await fetch(url);
    host.innerHTML = await res.text();
  } catch (err) {
    console.error(`[Emuná] Não foi possível carregar ${url}`, err);
  }
}

function updateCartBadge() {
  const badge = $("#cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle("is-visible", count > 0);
}
document.addEventListener("cart:updated", updateCartBadge);

function initMobileMenu() {
  const toggle = $("#menu-toggle");
  const drawer = $("#mobile-drawer");
  const overlay = $("#drawer-overlay");
  if (!toggle || !drawer || !overlay) return;
  const close = () => {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const isOpen = drawer.classList.toggle("is-open");
    overlay.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  overlay.addEventListener("click", close);
  $$(".mobile-drawer a").forEach((a) => a.addEventListener("click", close));
}

function initSearch() {
  const trigger = $("#search-toggle");
  const bar = $("#search-bar");
  const form = $("#search-form");
  trigger?.addEventListener("click", () => {
    bar.classList.toggle("is-open");
    if (bar.classList.contains("is-open")) $("#search-input")?.focus();
  });
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input").value.trim();
    window.location.href = `loja.html${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  });
}

function initStickyHeader() {
  const header = $("#site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  });
}

function setYear() {
  const y = $("#current-year");
  if (y) y.textContent = new Date().getFullYear();
}

export async function initLayout() {
  await Promise.all([
    injectPartial("partials/header.html", "header-placeholder"),
    injectPartial("partials/footer.html", "footer-placeholder"),
  ]);

  initMobileMenu();
  initSearch();
  initStickyHeader();
  setYear();
  updateCartBadge();
  initAdminAccess();

  // marca o link da página atual no menu, se houver correspondência
  const current = window.location.pathname.split("/").pop() || "index.html";
  $$(".nav-main a, .mobile-drawer a").forEach((a) => {
    const href = a.getAttribute("href").split("?")[0].split("#")[0];
    if (href === current) a.classList.add("is-active");
  });
}
