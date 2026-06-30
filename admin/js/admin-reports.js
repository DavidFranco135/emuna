// ============================================================
// EMUNÁ ADMIN · Relatórios
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import {
  getAllProducts,
  getAllCategories,
  getOrders,
  getTransactions,
} from "../../js/firestore-service.js";
import { formatBRL } from "../../js/cart.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let products = [];
let categories = [];
let orders = [];
let transactions = [];
let currentReport = { columns: [], rows: [] };

function categoryName(id) {
  return categories.find((c) => c.id === id)?.name || "—";
}

const REPORT_BUILDERS = {
  "produtos-vendidos": () => {
    const tally = {};
    orders.forEach((o) =>
      o.items.forEach((i) => {
        tally[i.name] = tally[i.name] || { qty: 0, total: 0 };
        tally[i.name].qty += i.qty;
        tally[i.name].total += i.qty * i.price;
      })
    );
    return {
      columns: ["Produto", "Quantidade vendida", "Total (R$)"],
      rows: Object.entries(tally).map(([name, v]) => [name, v.qty, formatBRL(v.total)]),
    };
  },
  "mais-vendidos": () => {
    const tally = {};
    orders.forEach((o) => o.items.forEach((i) => (tally[i.name] = (tally[i.name] || 0) + i.qty)));
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return {
      columns: ["Posição", "Produto", "Unidades vendidas"],
      rows: sorted.map(([name, qty], i) => [i + 1, name, qty]),
    };
  },
  clientes: () => {
    const byEmail = {};
    orders.forEach((o) => {
      byEmail[o.customerEmail] = byEmail[o.customerEmail] || { name: o.customerName, orders: 0, total: 0 };
      byEmail[o.customerEmail].orders += 1;
      byEmail[o.customerEmail].total += o.total;
    });
    return {
      columns: ["Cliente", "E-mail", "Pedidos", "Total gasto (R$)"],
      rows: Object.entries(byEmail).map(([email, v]) => [v.name, email, v.orders, formatBRL(v.total)]),
    };
  },
  pedidos: () => ({
    columns: ["Pedido", "Data", "Cliente", "Status", "Total (R$)"],
    rows: orders.map((o) => [
      `#${o.id}`,
      new Date(o.createdAt).toLocaleDateString("pt-BR"),
      o.customerName,
      o.status,
      formatBRL(o.total),
    ]),
  }),
  estoque: () => ({
    columns: ["Produto", "SKU", "Categoria", "Estoque", "Situação"],
    rows: products.map((p) => [
      p.name,
      p.sku || "—",
      categoryName(p.categoryId),
      p.stock,
      p.stock === 0 ? "Esgotado" : p.stock <= 5 ? "Estoque baixo" : "Normal",
    ]),
  }),
  financeiro: () => {
    const entradas = orders
      .filter((o) => o.status === "pago" || o.status === "enviado")
      .map((o) => ["Entrada", o.createdAt.slice(0, 10), `Pedido #${o.id}`, formatBRL(o.total)]);
    const saidas = transactions.map((t) => ["Saída", t.date, t.description, formatBRL(t.amount)]);
    return {
      columns: ["Tipo", "Data", "Descrição", "Valor"],
      rows: [...entradas, ...saidas].sort((a, b) => new Date(b[1]) - new Date(a[1])),
    };
  },
};

function renderReport() {
  const key = $("#report-select").value;
  currentReport = REPORT_BUILDERS[key]();

  $("#report-head").innerHTML = `<tr>${currentReport.columns.map((c) => `<th>${c}</th>`).join("")}</tr>`;
  $("#report-body").innerHTML = currentReport.rows.length
    ? currentReport.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("")
    : `<tr><td colspan="${currentReport.columns.length}" class="empty-state">Sem dados para este relatório.</td></tr>`;
}

function exportCSV() {
  const key = $("#report-select").value;
  let csv = currentReport.columns.join(",") + "\n";
  currentReport.rows.forEach((row) => {
    csv += row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `emuna-relatorio-${key}.csv`;
  link.click();
}

async function init() {
  await initAdminLayout("relatorios", "Relatórios");
  [products, categories, orders, transactions] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getOrders(),
    getTransactions(),
  ]);

  renderReport();
  $("#report-select").addEventListener("change", renderReport);
  $("#export-current-csv").addEventListener("click", exportCSV);
  $("#export-current-pdf").addEventListener("click", () => window.print());
}

init();
