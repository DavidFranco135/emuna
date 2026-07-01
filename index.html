// ============================================================
// EMUNÁ · Loja (catálogo com filtros)
// ============================================================
import { getAllProducts, getCategories } from "./firestore-service.js";
import { initLayout } from "./layout.js";
import { renderProductGrid } from "./product-card.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

let allProducts = [];
let categories = [];

function getParams() {
  return new URLSearchParams(window.location.search);
}

function renderCategoryFilters(selectedCategory) {
  const list = $("#filter-categories");
  list.innerHTML = "";
  categories.forEach((c) => {
    const id = `cat-${c.id}`;
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" id="${id}" value="${c.id}" ${c.id === selectedCategory ? "checked" : ""} />
      ${c.icon || ""} ${c.name}
    `;
    list.appendChild(label);
  });
}

function currentFilters() {
  const checkedCategories = $$('#filter-categories input[type=checkbox]:checked').map((i) => i.value);
  return {
    categories: checkedCategories,
    minPrice: parseFloat($("#price-min").value) || null,
    maxPrice: parseFloat($("#price-max").value) || null,
    inStockOnly: $("#filter-instock").checked,
    promoOnly: $("#filter-promo").checked,
    featuredOnly: getParams().get("destaque") === "1",
    sort: $("#sort-select").value,
    q: getParams().get("q") || "",
  };
}

function applyFilters() {
  const f = currentFilters();
  let result = [...allProducts];

  if (f.categories.length) {
    result = result.filter((p) => f.categories.includes(p.categoryId));
  }
  if (f.minPrice != null) {
    result = result.filter((p) => (p.promoPrice || p.price) >= f.minPrice);
  }
  if (f.maxPrice != null) {
    result = result.filter((p) => (p.promoPrice || p.price) <= f.maxPrice);
  }
  if (f.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }
  if (f.promoOnly) {
    result = result.filter((p) => !!p.promoPrice);
  }
  if (f.featuredOnly) {
    result = result.filter((p) => !!p.featured);
  }
  if (f.q) {
    const needle = f.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.shortDescription || "").toLowerCase().includes(needle)
    );
  }

  switch (f.sort) {
    case "price-asc":
      result.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
      break;
    case "price-desc":
      result.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
      break;
    case "newest":
      result.sort((a, b) => (b.isNew === true) - (a.isNew === true));
      break;
    case "bestseller":
      result.sort((a, b) => (b.bestSeller === true) - (a.bestSeller === true));
      break;
    default:
      break;
  }

  $("#results-count").textContent = `${result.length} produto${result.length === 1 ? "" : "s"} encontrado${result.length === 1 ? "" : "s"}`;
  $("#shop-empty").hidden = result.length > 0;
  renderProductGrid("shop-grid", result, "Nenhum produto encontrado com esses filtros.");
}

function bindFilterEvents() {
  $("#shop-filters").addEventListener("change", applyFilters);
  $("#price-min").addEventListener("input", debounce(applyFilters, 350));
  $("#price-max").addEventListener("input", debounce(applyFilters, 350));
  $("#sort-select").addEventListener("change", applyFilters);
  $("#clear-filters").addEventListener("click", () => {
    $$('#filter-categories input[type=checkbox]').forEach((i) => (i.checked = false));
    $("#price-min").value = "";
    $("#price-max").value = "";
    $("#filter-instock").checked = false;
    $("#filter-promo").checked = false;
    applyFilters();
  });
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function applyTitleFromParams() {
  const params = getParams();
  const q = params.get("q");
  const categoryId = params.get("categoria");
  const destaque = params.get("destaque") === "1";
  if (q) {
    $("#shop-title").textContent = `Resultados para "${q}"`;
    $("#shop-subtitle").textContent = "";
  } else if (categoryId) {
    const cat = categories.find((c) => c.id === categoryId);
    $("#shop-title").textContent = cat ? cat.name : "Loja";
  } else if (destaque) {
    $("#shop-title").textContent = "Destaques";
    $("#shop-subtitle").textContent = "Selecionados a dedo pra você.";
  } else {
    $("#shop-title").textContent = "Loja";
    $("#shop-subtitle").textContent = "Todas as peças Emuná, em um só lugar.";
  }
}

async function init() {
  await initLayout();

  const params = getParams();
  const categoryFromUrl = params.get("categoria");
  const sortFromUrl = params.get("ordenar");

  [allProducts, categories] = await Promise.all([getAllProducts(), getCategories()]);

  renderCategoryFilters(categoryFromUrl);
  applyTitleFromParams();

  if (sortFromUrl === "vendidos") $("#sort-select").value = "bestseller";
  if (sortFromUrl === "novos") $("#sort-select").value = "newest";

  bindFilterEvents();
  applyFilters();
}

init();
