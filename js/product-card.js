// ============================================================
// EMUNÁ · Componente: card de produto
// ============================================================
import { addItem, formatBRL } from "./cart.js";
import { isFavorite, toggleFavorite } from "./favorites.js";

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function productCard(p) {
  const hasPromo = !!p.promoPrice;
  const lowStock = p.stock > 0 && p.stock <= 5;
  const outOfStock = p.stock === 0;
  return el(`
    <article class="product-card" data-id="${p.id}">
      <a class="product-card__media" href="produto.html?id=${p.id}">
        <img src="${p.images?.[0] || ""}" alt="${p.name}" loading="lazy" />
        ${p.isNew ? '<span class="tag tag--new">Novidade</span>' : ""}
        ${hasPromo ? '<span class="tag tag--sale">Promoção</span>' : ""}
        ${outOfStock ? '<span class="tag tag--out">Esgotado</span>' : ""}
      </a>
      <button class="icon-btn product-card__fav ${isFavorite(p.id) ? "is-active" : ""}" aria-label="Favoritar" data-fav="${p.id}">${isFavorite(p.id) ? "♥" : "♡"}</button>
      <div class="product-card__body">
        <a href="produto.html?id=${p.id}"><h3 class="product-card__name">${p.name}</h3></a>
        <p class="product-card__desc">${p.shortDescription || ""}</p>
        <div class="product-card__price">
          ${
            hasPromo
              ? `<span class="price-old">${formatBRL(p.price)}</span><span class="price-new">${formatBRL(p.promoPrice)}</span>`
              : `<span class="price-new">${formatBRL(p.price)}</span>`
          }
        </div>
        ${lowStock ? `<p class="stock-warning">Últimas ${p.stock} unidades</p>` : ""}
        <button class="btn btn--primary btn--full" ${outOfStock ? "disabled" : ""} data-add="${p.id}">
          ${outOfStock ? "Indisponível" : "Adicionar ao carrinho"}
        </button>
      </div>
    </article>
  `);
}

/** Renderiza uma lista de produtos dentro de #containerId e liga o botão
 * "adicionar ao carrinho" de cada card. */
export function renderProductGrid(containerId, products, emptyMessage = "Nenhum produto encontrado.") {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = "";
  if (!products.length) {
    wrap.appendChild(el(`<p class="empty-state">${emptyMessage}</p>`));
    return;
  }
  products.forEach((p) => wrap.appendChild(productCard(p)));
  wrap.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      const product = products.find((p) => p.id === addBtn.dataset.add);
      addItem(product, 1);
      addBtn.textContent = "Adicionado ✓";
      setTimeout(() => (addBtn.textContent = "Adicionar ao carrinho"), 1400);
      return;
    }
    const favBtn = e.target.closest("[data-fav]");
    if (favBtn) {
      const isFav = toggleFavorite(favBtn.dataset.fav);
      favBtn.textContent = isFav ? "♥" : "♡";
      favBtn.classList.toggle("is-active", isFav);
    }
  });
}
