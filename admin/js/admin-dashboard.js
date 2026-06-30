// ============================================================
// EMUNÁ ADMIN · Dashboard
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { getAllProducts, getOrders } from "../../js/firestore-service.js";
import { formatBRL } from "../../js/cart.js";

const STATUS_LABELS = { pendente: "Pendente", pago: "Pago", enviado: "Enviado", cancelado: "Cancelado" };
const STATUS_BADGE = { pendente: "orange", pago: "violet", enviado: "green", cancelado: "red" };

function statCard(label, value, extraClass = "") {
  return `
    <div class="stat-card ${extraClass}">
      <div class="stat-card__label">${label}</div>
      <div class="stat-card__value">${value}</div>
    </div>
  `;
}

function renderStats(products, orders) {
  const validOrders = orders.filter((o) => o.status !== "cancelado");
  const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const pending = orders.filter((o) => o.status === "pendente").length;
  const shipped = orders.filter((o) => o.status === "enviado").length;
  const cancelled = orders.filter((o) => o.status === "cancelado").length;

  document.getElementById("stat-grid").innerHTML = [
    statCard("Total em vendas", formatBRL(totalSales)),
    statCard("Pedidos", orders.length),
    statCard("Clientes", uniqueCustomers),
    statCard("Produtos cadastrados", products.length),
    statCard("Estoque baixo", lowStock, lowStock ? "is-warning" : ""),
    statCard("Sem estoque", outOfStock, outOfStock ? "is-danger" : ""),
    statCard("Pedidos pendentes", pending, pending ? "is-warning" : ""),
    statCard("Pedidos enviados", shipped),
    statCard("Pedidos cancelados", cancelled, cancelled ? "is-danger" : ""),
  ].join("");
}

function renderRecentOrders(orders) {
  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  document.getElementById("recent-orders-body").innerHTML = sorted
    .map(
      (o) => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customerName}</td>
        <td>${formatBRL(o.total)}</td>
        <td><span class="badge badge--${STATUS_BADGE[o.status] || "gray"}">${STATUS_LABELS[o.status] || o.status}</span></td>
      </tr>
    `
    )
    .join("") || `<tr><td colspan="4" class="empty-state">Nenhum pedido ainda.</td></tr>`;
}

function renderTopProducts(orders) {
  const tally = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      tally[item.name] = (tally[item.name] || 0) + item.qty;
    });
  });
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const wrap = document.getElementById("top-products-list");
  if (!sorted.length) {
    wrap.innerHTML = `<p class="empty-state">Ainda não há vendas registradas.</p>`;
    return;
  }
  const max = sorted[0][1];
  wrap.innerHTML = sorted
    .map(
      ([name, qty]) => `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
          <span>${name}</span><strong>${qty} un.</strong>
        </div>
        <div style="background:var(--lilac);border-radius:999px;height:6px;overflow:hidden">
          <div style="background:var(--violet);height:100%;width:${(qty / max) * 100}%"></div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderSalesChart(orders) {
  const days = [];
  const totals = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
    const dayTotal = orders
      .filter((o) => o.createdAt.slice(0, 10) === key && o.status !== "cancelado")
      .reduce((sum, o) => sum + o.total, 0);
    totals.push(dayTotal);
  }

  new Chart(document.getElementById("sales-chart"), {
    type: "line",
    data: {
      labels: days,
      datasets: [
        {
          label: "Vendas (R$)",
          data: totals,
          borderColor: "#6F3CC3",
          backgroundColor: "rgba(111,60,195,0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 2,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderStatusChart(orders) {
  const counts = { pendente: 0, pago: 0, enviado: 0, cancelado: 0 };
  orders.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));

  new Chart(document.getElementById("status-chart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(counts).map((k) => STATUS_LABELS[k] || k),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ["#B9572E", "#6F3CC3", "#2E7D4F", "#C0392B"],
        },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });
}

async function init() {
  await initAdminLayout("dashboard", "Dashboard");

  const [products, orders] = await Promise.all([getAllProducts(), getOrders()]);

  renderStats(products, orders);
  renderRecentOrders(orders);
  renderTopProducts(orders);
  renderSalesChart(orders);
  renderStatusChart(orders);
}

init();
