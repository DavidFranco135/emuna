// ============================================================
// EMUNÁ ADMIN · Clientes
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import { getCustomersSummary, saveCustomerFlags } from "../../js/firestore-service.js";
import { formatBRL } from "../../js/cart.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let customers = [];
let activeEmail = null;

async function loadData() {
  customers = await getCustomersSummary();
}

function currentFilters() {
  return {
    q: $("#customer-search").value.trim().toLowerCase(),
    status: $("#customer-status-filter").value,
  };
}

function renderTable() {
  const f = currentFilters();
  let list = [...customers];
  if (f.q) {
    list = list.filter(
      (c) => c.name.toLowerCase().includes(f.q) || c.email.toLowerCase().includes(f.q)
    );
  }
  if (f.status === "active") list = list.filter((c) => !c.blocked);
  if (f.status === "blocked") list = list.filter((c) => c.blocked);

  const body = $("#customers-body");
  if (!list.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty-state">Nenhum cliente encontrado.</td></tr>`;
    return;
  }

  body.innerHTML = list
    .map(
      (c) => `
      <tr data-email="${c.email}">
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.ordersCount}</td>
        <td>${formatBRL(c.totalSpent)}</td>
        <td>${new Date(c.lastOrderAt).toLocaleDateString("pt-BR")}</td>
        <td>${c.blocked ? '<span class="badge badge--red">Bloqueado</span>' : '<span class="badge badge--green">Ativo</span>'}</td>
        <td><button class="btn btn--ghost btn--sm" data-view="${c.email}">Ver</button></td>
      </tr>
    `
    )
    .join("");
}

function openDetail(customer) {
  activeEmail = customer.email;
  $("#customer-detail-name").textContent = customer.name;
  $("#customer-detail-email").textContent = customer.email;
  $("#customer-notes").value = customer.notes || "";
  $("#customer-block-btn").textContent = customer.blocked ? "Desbloquear cliente" : "Bloquear cliente";

  $("#customer-backdrop").classList.add("is-open");
  $("#customer-slideover").classList.add("is-open");
}

function closeDetail() {
  $("#customer-backdrop").classList.remove("is-open");
  $("#customer-slideover").classList.remove("is-open");
  activeEmail = null;
}

async function saveNotes() {
  if (!activeEmail) return;
  await saveCustomerFlags(activeEmail, { notes: $("#customer-notes").value.trim() });
  showToast("Observações salvas.");
  closeDetail();
  await loadData();
  renderTable();
}

async function toggleBlock() {
  if (!activeEmail) return;
  const customer = customers.find((c) => c.email === activeEmail);
  await saveCustomerFlags(activeEmail, { blocked: !customer.blocked });
  showToast(customer.blocked ? "Cliente desbloqueado." : "Cliente bloqueado.");
  closeDetail();
  await loadData();
  renderTable();
}

async function init() {
  await initAdminLayout("clientes", "Clientes");
  await loadData();
  renderTable();

  $("#customer-search").addEventListener("input", renderTable);
  $("#customer-status-filter").addEventListener("change", renderTable);

  $("#customers-body").addEventListener("click", (e) => {
    const email = e.target.closest("[data-view]")?.dataset.view;
    if (email) openDetail(customers.find((c) => c.email === email));
  });

  $("#customer-form-close").addEventListener("click", closeDetail);
  $("#customer-backdrop").addEventListener("click", closeDetail);
  $("#customer-save-btn").addEventListener("click", saveNotes);
  $("#customer-block-btn").addEventListener("click", toggleBlock);
}

init();
