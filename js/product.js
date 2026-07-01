// ============================================================
// EMUNÁ · Página de produto
// ============================================================
import {
  getProductById,
  getRelatedProducts,
  getCategories,
  getStoreSettings,
} from "./firestore-service.js";
import { addItem, formatBRL } from "./cart.js";
import { isFavorite, toggleFavorite } from "./favorites.js";
import { initLayout } from "./layout.js";
import { renderProductGrid } from "./product-card.js";
import { toWhatsAppNumber } from "./phone-utils.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function getProductId() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderBreadcrumb(product, category) {
  $("#breadcrumb").innerHTML = `
    <a href="index.html">Início</a><span>/</span>
    <a href="loja.html">Loja</a><span>/</span>
    ${category ? `<a href="loja.html?categoria=${category.id}">${category.name}</a><span>/</span>` : ""}
    <span>${product.name}</span>
  `;
}

function renderGallery(product) {
  const images = product.images?.length ? product.images : [""];
  $("#gallery-main-img").src = images[0];
  $("#gallery-main-img").alt = product.name;

  const thumbs = $("#gallery-thumbs");
  thumbs.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${product.name} — foto ${i + 1}`;
    if (i === 0) img.classList.add("is-active");
    img.addEventListener("click", () => {
      $("#gallery-main-img").src = src;
      $$(".product-gallery__thumbs img").forEach((t) => t.classList.remove("is-active"));
      img.classList.add("is-active");
    });
    thumbs.appendChild(img);
  });

  if (product.video) {
    const videoWrap = $("#gallery-video");
    videoWrap.hidden = false;
    videoWrap.innerHTML = `<iframe src="${product.video}" title="Vídeo do produto" allowfullscreen></iframe>`;
  }
}

function installmentsText(value) {
  const max = 6;
  const installments = Math.min(max, Math.max(1, Math.floor(value / 30)) || 1);
  const per = value / installments;
  return installments > 1
    ? `ou ${installments}x de ${formatBRL(per)} sem juros`
    : "à vista";
}

function renderInfo(product, category) {
  document.title = `${product.name} — Emuná`;
  $("#page-title").textContent = `${product.name} — Emuná`;
  $("#product-category").textContent = category?.name || "";
  $("#product-name").textContent = product.name;
  $("#product-short-desc").textContent = product.shortDescription || "";
  $("#product-long-desc").textContent = product.description || product.shortDescription || "";

  const finalPrice = product.promoPrice || product.price;
  $("#product-price").innerHTML = product.promoPrice
    ? `<span class="price-old">${formatBRL(product.price)}</span><span class="price-new">${formatBRL(product.promoPrice)}</span>`
    : `<span class="price-new">${formatBRL(product.price)}</span>`;
  $("#product-installments").textContent = installmentsText(finalPrice);

  const ratingWrap = $("#product-rating");
  if (product.rating) {
    ratingWrap.innerHTML = `${"★".repeat(Math.round(product.rating))}${"☆".repeat(5 - Math.round(product.rating))} <span class="count">${product.rating.toFixed(1)} · ${product.reviews?.length || 0} avaliações</span>`;
  }

  const stockWrap = $("#product-stock");
  if (product.stock === 0) {
    stockWrap.textContent = "Produto esgotado";
    stockWrap.className = "product-stock out-stock";
    $("#add-to-cart-btn").disabled = true;
    $("#buy-now-btn").disabled = true;
  } else if (product.stock <= 5) {
    stockWrap.textContent = `Últimas ${product.stock} unidades em estoque`;
    stockWrap.className = "product-stock low-stock";
  } else {
    stockWrap.textContent = "Em estoque";
    stockWrap.className = "product-stock in-stock";
  }

  $("#qty-input").max = product.stock || 999;

  $("#product-meta").innerHTML = `
    <dt>SKU</dt><dd>${product.sku || "—"}</dd>
    <dt>Categoria</dt><dd>${category?.name || "—"}</dd>
    <dt>Peso</dt><dd>${product.weight ? `${product.weight} kg` : "—"}</dd>
    <dt>Dimensões</dt><dd>${product.dimensions || "—"}</dd>
  `;

  const favBtn = $("#fav-btn");
  const syncFav = () => {
    const fav = isFavorite(product.id);
    favBtn.textContent = fav ? "♥" : "♡";
    favBtn.classList.toggle("is-active", fav);
  };
  syncFav();
  favBtn.addEventListener("click", () => {
    toggleFavorite(product.id);
    syncFav();
  });
}

function renderReviews(product) {
  const list = $("#reviews-list");
  const reviews = product.reviews || [];
  if (!reviews.length) {
    list.innerHTML = `<p class="empty-state">Ainda não há avaliações — seja a primeira a avaliar.</p>`;
    return;
  }
  list.innerHTML = reviews
    .map(
      (r) => `
      <div class="review-item">
        <div class="review-item__stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <div class="review-item__name">${r.name}</div>
        <p class="review-item__text">${r.text}</p>
      </div>
    `
    )
    .join("");
}

function initTabs() {
  $$(".tab-header").forEach((header) => {
    header.addEventListener("click", () => {
      $$(".tab-header").forEach((h) => h.classList.remove("is-active"));
      $$(".tab-panel").forEach((p) => p.classList.remove("is-active"));
      header.classList.add("is-active");
      $(`#tab-${header.dataset.tab}`).classList.add("is-active");
    });
  });
}

function initReviewForm(product) {
  let selectedStar = 5;
  const stars = $$("#review-stars button");
  stars.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedStar = Number(btn.dataset.star);
      stars.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.star) <= selectedStar));
    });
  });
  stars.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.star) <= selectedStar));

  $("#review-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#review-name").value.trim();
    const text = $("#review-text").value.trim();
    if (!name || !text) return;

    product.reviews = product.reviews || [];
    product.reviews.unshift({ name, rating: selectedStar, text, date: new Date().toISOString() });
    renderReviews(product);
    $("#review-form").reset();
    $("#review-form-msg").textContent =
      "Obrigada pela avaliação! (exibida aqui nesta sessão — quando o Firestore estiver conectado, ela será salva de verdade)";
    setTimeout(() => ($("#review-form-msg").textContent = ""), 5000);
  });
}

function initQtyStepper(product) {
  const input = $("#qty-input");
  $("#qty-minus").addEventListener("click", () => {
    input.value = Math.max(1, Number(input.value) - 1);
  });
  $("#qty-plus").addEventListener("click", () => {
    const max = product.stock || 999;
    input.value = Math.min(max, Number(input.value) + 1);
  });
}

function initActions(product, settings) {
  const getQty = () => Math.max(1, Number($("#qty-input").value) || 1);

  $("#add-to-cart-btn").addEventListener("click", () => {
    addItem(product, getQty());
    const btn = $("#add-to-cart-btn");
    btn.textContent = "Adicionado ✓";
    setTimeout(() => (btn.textContent = "Adicionar ao carrinho"), 1400);
  });

  $("#buy-now-btn").addEventListener("click", () => {
    addItem(product, getQty());
    window.location.href = "cart.html";
  });

  $("#whatsapp-btn").href = `https://wa.me/${toWhatsAppNumber(settings.whatsapp)}?text=${encodeURIComponent(
    `Olá! Tenho interesse no produto "${product.name}" (${window.location.href})`
  )}`;

  $("#share-btn").addEventListener("click", async () => {
    const shareData = { title: product.name, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* usuário cancelou */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      const btn = $("#share-btn");
      const original = btn.textContent;
      btn.textContent = "✓";
      setTimeout(() => (btn.textContent = original), 1200);
    }
  });
}

async function init() {
  await initLayout();

  const id = getProductId();
  const product = id ? await getProductById(id) : null;

  if (!product) {
    $("#product-section").innerHTML = `
      <div class="container">
        <p class="empty-state">Produto não encontrado. <a href="loja.html">Voltar para a loja</a>.</p>
      </div>
    `;
    return;
  }

  const [categories, related, settings] = await Promise.all([
    getCategories(),
    getRelatedProducts(product.categoryId, product.id),
    getStoreSettings(),
  ]);
  const category = categories.find((c) => c.id === product.categoryId);

  renderBreadcrumb(product, category);
  renderGallery(product);
  renderInfo(product, category);
  renderReviews(product);
  initTabs();
  initReviewForm(product);
  initQtyStepper(product);
  initActions(product, settings);
  renderProductGrid("related-grid", related, "Sem produtos relacionados no momento.");
}

init();
