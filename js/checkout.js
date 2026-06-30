// ============================================================
// EMUNÁ · Checkout
// ============================================================
import { getCart, getCartTotal, formatBRL, clearCart } from "./cart.js";
import { initLayout } from "./layout.js";
import { onCustomerAuthChange, getMyProfile } from "./customer-auth.js";
import { createOrder } from "./firestore-service.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

function prefillFromCustomer(session) {
  if (!session) return;
  getMyProfile(session).then((profile) => {
    if (!profile) return;
    if (profile.name) $("#ck-name").value = profile.name;
    $("#ck-email").value = session.email;
    if (profile.phone) $("#ck-phone").value = profile.phone;
    const address = profile.addresses?.[profile.addresses.length - 1];
    if (address) {
      $("#ck-cep").value = address.cep || "";
      $("#ck-city").value = address.city || "";
      $("#ck-state").value = address.state || "";
      $("#ck-address").value = address.street || "";
      $("#ck-number").value = address.number || "";
      $("#ck-complement").value = address.complement || "";
    }
  });
}

function renderOrderSummary() {
  const items = getCart();
  if (!items.length) {
    $("#checkout-empty").hidden = false;
    $("#checkout-layout").hidden = true;
    return false;
  }
  $("#checkout-empty").hidden = true;
  $("#checkout-layout").hidden = false;

  $("#checkout-items").innerHTML = items
    .map(
      (i) => `
      <div class="checkout-item-row">
        <span>${i.qty}× ${i.name}</span>
        <span>${formatBRL(i.price * i.qty)}</span>
      </div>
    `
    )
    .join("");

  const subtotal = getCartTotal();
  $("#ck-subtotal").textContent = formatBRL(subtotal);
  $("#ck-total").textContent = formatBRL(subtotal);
  return true;
}

function initForm() {
  $("#checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = $("#confirm-order-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Confirmando…";

    const items = getCart().map((i) => ({ name: i.name, qty: i.qty, price: i.price }));
    const payment = document.querySelector('input[name="payment"]:checked')?.value || "pix";

    const orderId = await createOrder({
      customerName: $("#ck-name").value.trim(),
      customerEmail: $("#ck-email").value.trim(),
      customerPhone: $("#ck-phone").value.trim(),
      address: {
        cep: $("#ck-cep").value.trim(),
        city: $("#ck-city").value.trim(),
        state: $("#ck-state").value.trim(),
        street: $("#ck-address").value.trim(),
        number: $("#ck-number").value.trim(),
        complement: $("#ck-complement").value.trim(),
      },
      items,
      total: getCartTotal(),
      payment,
      trackingCode: "",
    });

    $("#success-order-id").textContent = `#${orderId}`;
    $("#checkout-layout").hidden = true;
    $("#checkout-success").hidden = false;
    clearCart();
  });
}

async function init() {
  await initLayout();
  const hasItems = renderOrderSummary();
  if (hasItems) {
    initForm();
    onCustomerAuthChange((session) => prefillFromCustomer(session));
  }
}

init();
