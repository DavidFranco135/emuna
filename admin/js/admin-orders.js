// ============================================================
// EMUNÁ ADMIN · Pedidos
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import { getOrders, updateOrderStatus, updateOrderTracking } from "../../js/firestore-service.js";
import { formatBRL } from "../../js/cart.js";
import { toWhatsAppNumber } from "../../js/phone-utils.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

const STATUS_LABELS = { pendente: "Pendente", pago: "Pago", enviado: "Enviado", cancelado: "Cancelado" };
const STATUS_BADGE = { pendente: "orange", pago: "violet", enviado: "green", cancelado: "red" };
const PAYMENT_LABELS = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };

let orders = [];
let activeOrderId = null;

async function loadData() {
  orders = await getOrders();
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function currentFilters() {
  return {
    q: $("#order-search").value.trim().toLowerCase(),
    status: $("#order-status-filter").value,
    payment: $("#order-payment-filter").value,
  };
}

function renderTable() {
  const f = currentFilters();
  let list = [...orders];
  if (f.q) {
    list = list.filter(
      (o) => o.id.toLowerCase().includes(f.q) || o.customerName.toLowerCase().includes(f.q)
    );
  }
  if (f.status) list = list.filter((o) => o.status === f.status);
  if (f.payment) list = list.filter((o) => o.payment === f.payment);

  const body = $("#orders-body");
  if (!list.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty-state">Nenhum pedido encontrado.</td></tr>`;
    return;
  }

  body.innerHTML = list
    .map(
      (o) => `
      <tr data-id="${o.id}">
        <td data-label="Pedido">#${o.id}</td>
        <td data-label="Data">${new Date(o.createdAt).toLocaleDateString("pt-BR")}</td>
        <td data-label="Cliente">${o.customerName}</td>
        <td data-label="Pagamento">${PAYMENT_LABELS[o.payment] || o.payment}</td>
        <td data-label="Total">${formatBRL(o.total)}</td>
        <td data-label="Status"><span class="badge badge--${STATUS_BADGE[o.status] || "gray"}">${STATUS_LABELS[o.status] || o.status}</span></td>
        <td class="cell-actions"><button class="btn btn--ghost btn--sm" data-view="${o.id}">Ver pedido</button></td>
      </tr>
    `
    )
    .join("");
}

function openOrderDetail(order) {
  activeOrderId = order.id;
  $("#order-detail-title").textContent = `Pedido #${order.id}`;
  $("#order-detail-body").innerHTML = `
    <p style="font-size:13px;color:var(--gray-mid);margin-bottom:14px">
      ${new Date(order.createdAt).toLocaleString("pt-BR")} · ${PAYMENT_LABELS[order.payment] || order.payment}
    </p>
    <p style="font-weight:600;margin-bottom:2px">${order.customerName}</p>
    <p style="font-size:13px;color:var(--gray-mid);margin-bottom:16px">${order.customerEmail}</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Item</th><th>Qtd.</th><th>Valor</th></tr></thead>
        <tbody>
          ${order.items
            .map(
              (i) => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${formatBRL(i.price * i.qty)}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p style="text-align:right;font-weight:700;color:var(--violet-deep);margin-top:12px;font-size:16px">
      Total: ${formatBRL(order.total)}
    </p>
  `;
  $("#order-status-select").value = order.status;
  setupWhatsAppButton(order);
  $("#order-tracking-input").value = order.trackingCode || "";

  $("#order-backdrop").classList.add("is-open");
  $("#order-slideover").classList.add("is-open");
  $("#order-slideover").setAttribute("aria-hidden", "false");
}

function setupWhatsAppButton(order) {
  const btn = $("#order-whatsapp-btn");
  const number = toWhatsAppNumber(order.customerPhone);

  if (!number) {
    btn.classList.add("btn--ghost");
    btn.classList.remove("btn--gold");
    btn.textContent = "Sem telefone cadastrado";
    btn.removeAttribute("href");
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.5";
    return;
  }

  btn.classList.add("btn--gold");
  btn.classList.remove("btn--ghost");
  btn.textContent = "💬 Confirmar com o cliente";
  btn.style.pointerEvents = "";
  btn.style.opacity = "";

  let message = `Olá, ${order.customerName}! Aqui é da Emuná. `;
  if (order.status === "pendente") {
    message += `Seu pedido #${order.id} (${formatBRL(order.total)}) está registrado e aguardando o pagamento.`;
  } else if (order.status === "pago") {
    message += `Recebemos o pagamento do seu pedido #${order.id}. Já estamos preparando para envio! 💜`;
  } else if (order.status === "enviado") {
    message += `Seu pedido #${order.id} foi enviado!${order.trackingCode ? ` Código de rastreio: ${order.trackingCode}.` : ""}`;
  } else {
    message += `Sobre o seu pedido #${order.id}: `;
  }

  btn.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function closeOrderDetail() {
  $("#order-backdrop").classList.remove("is-open");
  $("#order-slideover").classList.remove("is-open");
  $("#order-slideover").setAttribute("aria-hidden", "true");
  activeOrderId = null;
}

async function saveOrderChanges() {
  if (!activeOrderId) return;
  await updateOrderStatus(activeOrderId, $("#order-status-select").value);
  await updateOrderTracking(activeOrderId, $("#order-tracking-input").value.trim());
  showToast("Pedido atualizado.");
  closeOrderDetail();
  await loadData();
  renderTable();
}

async function cancelOrder() {
  if (!activeOrderId) return;
  if (!confirm("Cancelar este pedido?")) return;
  await updateOrderStatus(activeOrderId, "cancelado");
  showToast("Pedido cancelado.");
  closeOrderDetail();
  await loadData();
  renderTable();
}

function printOrder() {
  window.print();
}

async function init() {
  await initAdminLayout("pedidos", "Pedidos");
  await loadData();
  renderTable();

  $("#order-search").addEventListener("input", renderTable);
  $("#order-status-filter").addEventListener("change", renderTable);
  $("#order-payment-filter").addEventListener("change", renderTable);

  $("#orders-body").addEventListener("click", (e) => {
    const id = e.target.closest("[data-view]")?.dataset.view;
    if (id) openOrderDetail(orders.find((o) => o.id === id));
  });

  $("#order-detail-close").addEventListener("click", closeOrderDetail);
  $("#order-backdrop").addEventListener("click", closeOrderDetail);
  $("#order-save-btn").addEventListener("click", saveOrderChanges);
  $("#order-cancel-btn").addEventListener("click", cancelOrder);
  $("#order-print-btn").addEventListener("click", printOrder);

  const refreshWhatsAppMessage = () => {
    const current = orders.find((o) => o.id === activeOrderId);
    if (!current) return;
    setupWhatsAppButton({
      ...current,
      status: $("#order-status-select").value,
      trackingCode: $("#order-tracking-input").value.trim(),
    });
  };
  $("#order-status-select").addEventListener("change", refreshWhatsAppMessage);
  $("#order-tracking-input").addEventListener("input", refreshWhatsAppMessage);
}

init();
