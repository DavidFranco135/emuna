// ============================================================
// EMUNÁ · Minha conta
// ============================================================
import { initLayout } from "./layout.js";
import {
  onCustomerAuthChange,
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMyProfile,
  updateMyProfile,
  addMyAddress,
  removeMyAddress,
} from "./customer-auth.js";
import { getOrdersByEmail } from "./firestore-service.js";
import { formatBRL } from "./cart.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const STATUS_LABELS = { pendente: "Pendente", pago: "Pago", enviado: "Enviado", cancelado: "Cancelado" };
const STATUS_BADGE = { pendente: "orange", pago: "violet", enviado: "green", cancelado: "red" };

// Sessão ativa, lida pelos handlers de formulário no momento do envio
// (evitamos rebinder os listeners a cada mudança de sessão).
let currentSession = null;

// ---------- auth gate (login / cadastro) ----------
function initAuthTabs() {
  $$(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".auth-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      $("#login-form").hidden = tab.dataset.tab !== "login";
      $("#register-form").hidden = tab.dataset.tab !== "register";
    });
  });
}

function initAuthForms() {
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = $("#login-error");
    errorEl.textContent = "";
    try {
      await loginCustomer({
        email: $("#login-email").value.trim(),
        password: $("#login-password").value,
      });
    } catch (err) {
      errorEl.textContent = err.message || "Não foi possível entrar.";
    }
  });

  $("#register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = $("#register-error");
    errorEl.textContent = "";
    try {
      await registerCustomer({
        name: $("#register-name").value.trim(),
        email: $("#register-email").value.trim(),
        phone: $("#register-phone").value.trim(),
        password: $("#register-password").value,
      });
    } catch (err) {
      errorEl.textContent = err.message || "Não foi possível criar a conta.";
    }
  });
}

// ---------- account dashboard ----------
function initAccountTabs() {
  $$(".account-tab[data-panel]").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".account-tab").forEach((t) => t.classList.remove("is-active"));
      $$(".account-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      $(`#panel-${tab.dataset.panel}`).classList.add("is-active");
    });
  });
  $("#logout-tab").addEventListener("click", () => logoutCustomer());
}

function renderAddresses(addresses) {
  const wrap = $("#address-list");
  if (!addresses.length) {
    wrap.innerHTML = `<p class="empty-state">Nenhum endereço cadastrado ainda.</p>`;
    return;
  }
  wrap.innerHTML = addresses
    .map(
      (a, i) => `
      <div class="address-card">
        <span>${a.street}, ${a.number}${a.complement ? ` — ${a.complement}` : ""} · ${a.city}/${a.state} · CEP ${a.cep}</span>
        <button type="button" data-remove-address="${i}">Remover</button>
      </div>
    `
    )
    .join("");
}

async function loadProfile(session) {
  const profile = await getMyProfile(session);
  $("#account-greeting").textContent = `Olá, ${profile?.name || session.email}!`;
  $("#profile-name").value = profile?.name || "";
  $("#profile-email").value = session.email;
  $("#profile-phone").value = profile?.phone || "";
  renderAddresses(profile?.addresses || []);
}

async function loadOrders(session) {
  const orders = await getOrdersByEmail(session.email);
  const wrap = $("#orders-list");
  if (!orders.length) {
    wrap.innerHTML = `<p class="empty-state">Você ainda não fez nenhum pedido. <a href="loja.html">Ver produtos</a>.</p>`;
    return;
  }
  wrap.innerHTML = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(
      (o) => `
      <div class="order-card">
        <div class="order-card__header">
          <span>Pedido #${o.id} · ${new Date(o.createdAt).toLocaleDateString("pt-BR")}</span>
          <span class="acc-badge acc-badge--${STATUS_BADGE[o.status] || "violet"}">${STATUS_LABELS[o.status] || o.status}</span>
        </div>
        <p class="order-card__items">${o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
        <p style="margin-top:8px;font-weight:700;color:var(--violet-deep)">${formatBRL(o.total)}</p>
      </div>
    `
    )
    .join("");
}

// Listeners ligados uma única vez; sempre operam sobre `currentSession`.
function initProfileForm() {
  $("#profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentSession) return;
    await updateMyProfile(currentSession, {
      name: $("#profile-name").value.trim(),
      phone: $("#profile-phone").value.trim(),
    });
    $("#profile-msg").textContent = "Dados salvos!";
    setTimeout(() => ($("#profile-msg").textContent = ""), 2500);
  });
}

function initAddressForm() {
  $("#address-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentSession) return;
    const addresses = await addMyAddress(currentSession, {
      cep: $("#addr-cep").value.trim(),
      city: $("#addr-city").value.trim(),
      state: $("#addr-state").value.trim(),
      street: $("#addr-street").value.trim(),
      number: $("#addr-number").value.trim(),
      complement: $("#addr-complement").value.trim(),
    });
    renderAddresses(addresses);
    $("#address-form").reset();
  });

  $("#address-list").addEventListener("click", async (e) => {
    const idx = e.target.closest("[data-remove-address]")?.dataset.removeAddress;
    if (idx === undefined || !currentSession) return;
    const addresses = await removeMyAddress(currentSession, Number(idx));
    renderAddresses(addresses);
  });
}

async function showDashboard(session) {
  currentSession = session;
  $("#auth-gate").hidden = true;
  $("#account-dashboard").hidden = false;
  await loadProfile(session);
  await loadOrders(session);
}

function showAuthGate() {
  currentSession = null;
  $("#auth-gate").hidden = false;
  $("#account-dashboard").hidden = true;
}

async function init() {
  await initLayout();
  initAuthTabs();
  initAuthForms();
  initAccountTabs();
  initProfileForm();
  initAddressForm();

  onCustomerAuthChange((session) => {
    if (session) {
      showDashboard(session);
    } else {
      showAuthGate();
    }
  });
}

init();
