// ============================================================
// EMUNÁ ADMIN · Cupons
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../js/firestore-service.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

const TYPE_LABELS = { percent: "Percentual", shipping: "Frete grátis" };

let coupons = [];

async function loadData() {
  coupons = await getAllCoupons();
}

function renderTable() {
  const body = $("#coupons-body");
  if (!coupons.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum cupom cadastrado.</td></tr>`;
    return;
  }
  body.innerHTML = coupons
    .map(
      (c) => `
      <tr data-id="${c.id}">
        <td data-label="Código"><strong>${c.code}</strong></td>
        <td data-label="Tipo">${TYPE_LABELS[c.type] || c.type}</td>
        <td data-label="Valor">${c.type === "percent" ? `${c.value}%` : "—"}</td>
        <td data-label="Descrição">${c.label || "—"}</td>
        <td class="cell-actions">
          <div class="table-actions">
            <button class="btn btn--ghost btn--sm" data-edit="${c.id}">Editar</button>
            <button class="btn btn--danger btn--sm" data-delete="${c.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function toggleValueField() {
  const isPercent = $("#cpf-type").value === "percent";
  $("#cpf-value-wrap").style.display = isPercent ? "flex" : "none";
}

function openSlideover(coupon = null) {
  $("#coupon-form-title").textContent = coupon ? "Editar cupom" : "Novo cupom";
  $("#cpf-id").value = coupon?.id || "";
  $("#cpf-code").value = coupon?.code || "";
  $("#cpf-type").value = coupon?.type || "percent";
  $("#cpf-value").value = coupon?.value ?? "";
  $("#cpf-label").value = coupon?.label || "";
  toggleValueField();
  $("#coupon-backdrop").classList.add("is-open");
  $("#coupon-slideover").classList.add("is-open");
  $("#coupon-slideover").setAttribute("aria-hidden", "false");
}

function closeSlideover() {
  $("#coupon-backdrop").classList.remove("is-open");
  $("#coupon-slideover").classList.remove("is-open");
  $("#coupon-slideover").setAttribute("aria-hidden", "true");
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = $("#cpf-id").value;
  const type = $("#cpf-type").value;
  const data = {
    code: $("#cpf-code").value.trim().toUpperCase(),
    type,
    value: type === "percent" ? parseFloat($("#cpf-value").value) || 0 : 0,
    label: $("#cpf-label").value.trim(),
  };

  if (id) {
    await updateCoupon(id, data);
    showToast("Cupom atualizado.");
  } else {
    await createCoupon(data);
    showToast("Cupom criado.");
  }

  closeSlideover();
  await loadData();
  renderTable();
}

async function handleTableClick(e) {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const delId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    openSlideover(coupons.find((c) => c.id === editId));
  } else if (delId) {
    if (!confirm("Excluir este cupom?")) return;
    await deleteCoupon(delId);
    showToast("Cupom excluído.");
    await loadData();
    renderTable();
  }
}

async function init() {
  await initAdminLayout("cupons", "Cupons");
  await loadData();
  renderTable();

  $("#new-coupon-btn").addEventListener("click", () => openSlideover());
  $("#coupon-form-close").addEventListener("click", closeSlideover);
  $("#coupon-form-cancel").addEventListener("click", closeSlideover);
  $("#coupon-backdrop").addEventListener("click", closeSlideover);
  $("#coupon-form").addEventListener("submit", handleSubmit);
  $("#cpf-type").addEventListener("change", toggleValueField);
  $("#coupons-body").addEventListener("click", handleTableClick);
}

init();
