// ============================================================
// EMUNÁ ADMIN · Financeiro
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getOrders,
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../../js/firestore-service.js";
import { formatBRL } from "../../js/cart.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let orders = [];
let transactions = [];
let chartInstance = null;

function getPeriodRange() {
  const value = $("#period-select").value;
  const now = new Date();
  let from, to;

  if (value === "today") {
    from = new Date(now);
    to = new Date(now);
  } else if (value === "yesterday") {
    from = new Date(now);
    from.setDate(from.getDate() - 1);
    to = new Date(from);
  } else if (value === "week") {
    from = new Date(now);
    from.setDate(from.getDate() - from.getDay());
    to = new Date(now);
  } else if (value === "month") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date(now);
  } else if (value === "year") {
    from = new Date(now.getFullYear(), 0, 1);
    to = new Date(now);
  } else {
    from = new Date($("#period-from").value || now);
    to = new Date($("#period-to").value || now);
  }
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function inRange(dateStr, from, to) {
  const d = new Date(dateStr);
  return d >= from && d <= to;
}

function statCard(label, value, extraClass = "") {
  return `
    <div class="stat-card ${extraClass}">
      <div class="stat-card__label">${label}</div>
      <div class="stat-card__value">${value}</div>
    </div>
  `;
}

function renderStats(entradas, saidas, aReceber) {
  $("#finance-stats").innerHTML = [
    statCard("Entradas", formatBRL(entradas)),
    statCard("Saídas", formatBRL(saidas), saidas ? "is-warning" : ""),
    statCard("Lucro líquido", formatBRL(entradas - saidas)),
    statCard("Contas a receber", formatBRL(aReceber), aReceber ? "is-warning" : ""),
  ].join("");
}

function renderChart(from, to, periodOrders, periodTransactions) {
  const days = [];
  const entradasArr = [];
  const saidasArr = [];

  const msPerDay = 24 * 60 * 60 * 1000;
  const spanDays = Math.max(1, Math.round((to - from) / msPerDay));

  for (let i = 0; i <= spanDays; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));

    entradasArr.push(
      periodOrders
        .filter((o) => o.createdAt.slice(0, 10) === key && o.status !== "cancelado" && o.status !== "pendente")
        .reduce((sum, o) => sum + o.total, 0)
    );
    saidasArr.push(
      periodTransactions.filter((t) => t.date === key).reduce((sum, t) => sum + t.amount, 0)
    );
  }

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(document.getElementById("finance-chart"), {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        { label: "Entradas", data: entradasArr, backgroundColor: "#6F3CC3" },
        { label: "Saídas", data: saidasArr, backgroundColor: "#B9572E" },
      ],
    },
    options: { scales: { y: { beginAtZero: true } } },
  });
}

function renderTransactionsTable(periodTransactions) {
  const body = $("#transactions-body");
  if (!periodTransactions.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum lançamento neste período.</td></tr>`;
    return;
  }
  body.innerHTML = periodTransactions
    .map(
      (t) => `
      <tr data-id="${t.id}">
        <td>${new Date(t.date).toLocaleDateString("pt-BR")}</td>
        <td>${t.description}</td>
        <td>${t.category || "—"}</td>
        <td>${formatBRL(t.amount)}</td>
        <td><button class="btn btn--danger btn--sm" data-delete="${t.id}">Excluir</button></td>
      </tr>
    `
    )
    .join("");
}

function refresh() {
  const { from, to } = getPeriodRange();
  const periodOrders = orders.filter((o) => inRange(o.createdAt, from, to));
  const periodTransactions = transactions.filter((t) => inRange(t.date, from, to));

  const entradas = periodOrders
    .filter((o) => o.status === "pago" || o.status === "enviado")
    .reduce((sum, o) => sum + o.total, 0);
  const saidas = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
  const aReceber = periodOrders.filter((o) => o.status === "pendente").reduce((sum, o) => sum + o.total, 0);

  renderStats(entradas, saidas, aReceber);
  renderChart(from, to, periodOrders, periodTransactions);
  renderTransactionsTable(periodTransactions);
}

function exportCSV() {
  const { from, to } = getPeriodRange();
  const periodOrders = orders.filter((o) => inRange(o.createdAt, from, to));
  const periodTransactions = transactions.filter((t) => inRange(t.date, from, to));

  let csv = "Tipo,Data,Descrição,Categoria/Pagamento,Valor\n";
  periodOrders.forEach((o) => {
    csv += `Entrada,${o.createdAt.slice(0, 10)},Pedido #${o.id} — ${o.customerName},${o.payment},${o.total.toFixed(2)}\n`;
  });
  periodTransactions.forEach((t) => {
    csv += `Saída,${t.date},${t.description},${t.category || ""},${t.amount.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `emuna-financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

function initSlideover() {
  const backdrop = $("#transaction-backdrop");
  const panel = $("#transaction-slideover");
  const open = () => {
    $("#tf-date").value = new Date().toISOString().slice(0, 10);
    backdrop.classList.add("is-open");
    panel.classList.add("is-open");
  };
  const close = () => {
    backdrop.classList.remove("is-open");
    panel.classList.remove("is-open");
  };

  $("#new-transaction-btn").addEventListener("click", open);
  $("#transaction-form-close").addEventListener("click", close);
  $("#transaction-form-cancel").addEventListener("click", close);
  backdrop.addEventListener("click", close);

  $("#transaction-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await createTransaction({
      description: $("#tf-description").value.trim(),
      category: $("#tf-category").value.trim(),
      amount: parseFloat($("#tf-amount").value) || 0,
      date: $("#tf-date").value,
      type: "saida",
    });
    showToast("Lançamento adicionado.");
    close();
    $("#transaction-form").reset();
    transactions = await getTransactions();
    refresh();
  });
}

async function init() {
  await initAdminLayout("financeiro", "Financeiro");
  [orders, transactions] = await Promise.all([getOrders(), getTransactions()]);
  refresh();

  $("#period-select").addEventListener("change", () => {
    const custom = $("#period-select").value === "custom";
    $("#period-from").hidden = !custom;
    $("#period-to").hidden = !custom;
    if (!custom) refresh();
  });
  $("#period-from").addEventListener("change", refresh);
  $("#period-to").addEventListener("change", refresh);

  $("#export-csv-btn").addEventListener("click", exportCSV);
  $("#export-pdf-btn").addEventListener("click", () => window.print());

  $("#transactions-body").addEventListener("click", async (e) => {
    const id = e.target.closest("[data-delete]")?.dataset.delete;
    if (!id) return;
    if (!confirm("Excluir este lançamento?")) return;
    await deleteTransaction(id);
    showToast("Lançamento excluído.");
    transactions = await getTransactions();
    refresh();
  });

  initSlideover();
}

init();
