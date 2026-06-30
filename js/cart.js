// ============================================================
// EMUNÁ · Carrinho de compras
// ============================================================
// Estado local (localStorage). Quando o login do cliente for
// implementado, este módulo pode passar a sincronizar o carrinho
// com um documento em /carts/{uid} no Firestore sem mudar a API
// pública (addItem, removeItem, updateQty, getCart...).
// ============================================================

const CART_KEY = "emuna_cart_v1";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent("cart:updated", { detail: { items } }));
}

export function getCart() {
  return readCart();
}

export function addItem(product, qty = 1) {
  const items = readCart();
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: product.promoPrice || product.price,
      image: product.images?.[0] || "",
      qty,
    });
  }
  writeCart(items);
}

export function removeItem(productId) {
  writeCart(readCart().filter((i) => i.id !== productId));
}

export function updateQty(productId, qty) {
  const items = readCart();
  const item = items.find((i) => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount() {
  return readCart().reduce((sum, i) => sum + i.qty, 0);
}

export function getCartTotal() {
  return readCart().reduce((sum, i) => sum + i.qty * i.price, 0);
}

export function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
