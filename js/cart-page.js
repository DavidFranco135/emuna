// ============================================================
// EMUNÁ · Página de carrinho
// ============================================================
import { getCart, removeItem, updateQty, getCartTotal, formatBRL } from "./cart.js";
import { getCoupon } from "./firestore-service.js";
import { initLayout } from "./layout.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 19.9;

let appliedCoupon = null;
let shippingCalculated = false;
let freeShippingCoupon = false;

function cartItemRow(item) {
  const div = document.createElement("div");
  div.className = "cart-item";
  div.dataset.id = item.id;
  div.innerHTML = `
    <img src="${item.image}" alt="${item.name}" />
    <div>
      <div class="cart-item__name">${item.name}</div>
      <div class="cart-item__price">${formatBRL(item.price)} cada</div>
    </div>
    <div class="cart-item__controls">
      <span class="cart-item__subtotal">${formatBRL(item.price * item.qty)}</span>
      <div class="cart-item__qty">
        <button type="button" data-qty-minus>−</button>
        <input type="number" min="1" value="${item.qty}" data-qty-input />
        <button type="button" data-qty-plus>+</button>
      </div>
      <button type="button" class="cart-item__remove" data-remove>Remover</button>
    </div>
  `;
  return div;
}

function renderItems() {
  const items = getCart();
  const wrap = $("#cart-items");
  const empty = $("#cart-empty");
  const layout = $("#cart-layout");

  if (!items.length) {
    empty.hidden = false;
    layout.hidden = true;
    return;
  }
  empty.hidden = true;
  layout.hidden = false;

  wrap.innerHTML = "";
  items.forEach((item) => wrap.appendChild(cartItemRow(item)));
}

function discountAmount(subtotal) {
  if (!appliedCoupon || appliedCoupon.type !== "percent") return 0;
  return (subtotal * appliedCoupon.value) / 100;
}

function shippingAmount(subtotal) {
  if (freeShippingCoupon) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return shippingCalculated ? FLAT_SHIPPING : null; // null = "a calcular"
}

function renderSummary() {
  const subtotal = getCartTotal();
  const discount = discountAmount(subtotal);
  const shipping = shippingAmount(subtotal);

  $("#summary-subtotal").textContent = formatBRL(subtotal);

  const discountRow = $("#summary-discount-row");
  if (discount > 0) {
    discountRow.hidden = false;
    $("#summary-discount").textContent = `− ${formatBRL(discount)}`;
  } else {
    discountRow.hidden = true;
  }

  $("#summary-shipping").textContent =
    shipping === null ? "A calcular" : shipping === 0 ? "Grátis" : formatBRL(shipping);

  const total = subtotal - discount + (shipping || 0);
  $("#summary-total").textContent = formatBRL(total);

  $("#checkout-btn").classList.toggle("btn--full", true);
}

function refresh() {
  renderItems();
  renderSummary();
  bindItemEvents();
}

function bindItemEvents() {
  document.querySelectorAll(".cart-item").forEach((row) => {
    const id = row.dataset.id;
    row.querySelector("[data-qty-minus]").addEventListener("click", () => {
      const input = row.querySelector("[data-qty-input]");
      updateQty(id, Math.max(1, Number(input.value) - 1));
    });
    row.querySelector("[data-qty-plus]").addEventListener("click", () => {
      const input = row.querySelector("[data-qty-input]");
      updateQty(id, Number(input.value) + 1);
    });
    row.querySelector("[data-qty-input]").addEventListener("change", (e) => {
      updateQty(id, Math.max(1, Number(e.target.value) || 1));
    });
    row.querySelector("[data-remove]").addEventListener("click", () => removeItem(id));
  });
}

function initCoupon() {
  $("#coupon-apply").addEventListener("click", async () => {
    const code = $("#coupon-input").value.trim();
    const msg = $("#coupon-msg");
    if (!code) return;

    const coupon = await getCoupon(code);
    if (!coupon) {
      appliedCoupon = null;
      freeShippingCoupon = false;
      msg.textContent = "Cupom inválido ou expirado.";
      msg.className = "coupon-msg is-error";
      renderSummary();
      return;
    }

    if (coupon.type === "shipping") {
      freeShippingCoupon = true;
      appliedCoupon = null;
      msg.textContent = `Cupom aplicado: ${coupon.label || "frete grátis"}.`;
    } else {
      appliedCoupon = coupon;
      msg.textContent = `Cupom aplicado: ${coupon.label || coupon.value + "% off"}.`;
    }
    msg.className = "coupon-msg is-success";
    renderSummary();
  });
}

function initShipping() {
  $("#cep-apply").addEventListener("click", () => {
    const cep = $("#cep-input").value.replace(/\D/g, "");
    const msg = $("#shipping-msg");
    if (cep.length !== 8) {
      msg.textContent = "Digite um CEP válido (8 dígitos).";
      msg.className = "shipping-msg is-error";
      shippingCalculated = false;
      renderSummary();
      return;
    }
    shippingCalculated = true;
    msg.textContent = "Frete calculado para o seu CEP (estimativa).";
    msg.className = "shipping-msg is-success";
    renderSummary();
  });
}

document.addEventListener("cart:updated", refresh);

async function init() {
  await initLayout();
  initCoupon();
  initShipping();
  refresh();
}

init();
