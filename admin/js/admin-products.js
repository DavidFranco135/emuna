// ============================================================
// EMUNÁ ADMIN · Produtos
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getAllProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
} from "../../js/firestore-service.js";
import { formatBRL } from "../../js/cart.js";
import { uploadMultipleToImgBB } from "../../js/imgbb-upload.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let products = [];
let categories = [];

async function loadData() {
  [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
}

function categoryName(id) {
  return categories.find((c) => c.id === id)?.name || "—";
}

function populateCategorySelects() {
  const options = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  $("#pf-category").innerHTML = options;
  $("#product-category-filter").innerHTML = `<option value="">Todas as categorias</option>${options}`;
}

function currentFilters() {
  return {
    q: $("#product-search").value.trim().toLowerCase(),
    category: $("#product-category-filter").value,
    stock: $("#product-stock-filter").value,
  };
}

function renderTable() {
  const f = currentFilters();
  let list = [...products];

  if (f.q) {
    list = list.filter(
      (p) => p.name.toLowerCase().includes(f.q) || (p.sku || "").toLowerCase().includes(f.q)
    );
  }
  if (f.category) list = list.filter((p) => p.categoryId === f.category);
  if (f.stock === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 5);
  if (f.stock === "out") list = list.filter((p) => p.stock === 0);

  const body = $("#products-body");
  if (!list.length) {
    body.innerHTML = `<tr><td colspan="8" class="empty-state">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  body.innerHTML = list
    .map((p) => {
      const isActive = p.active !== false;
      const badges = [
        p.featured ? '<span class="badge badge--violet">Destaque</span>' : "",
        p.promoPrice ? '<span class="badge badge--orange">Promoção</span>' : "",
        p.isNew ? '<span class="badge badge--green">Novidade</span>' : "",
        !isActive ? '<span class="badge badge--gray">Inativo</span>' : "",
      ].join(" ");
      const stockBadge =
        p.stock === 0
          ? '<span class="badge badge--red">Esgotado</span>'
          : p.stock <= 5
          ? '<span class="badge badge--orange">Baixo</span>'
          : "";

      return `
        <tr data-id="${p.id}">
          <td><img class="table-thumb" src="${p.images?.[0] || ""}" alt="" /></td>
          <td>${p.name}</td>
          <td>${p.sku || "—"}</td>
          <td>${categoryName(p.categoryId)}</td>
          <td>${p.promoPrice ? `<s style="opacity:.5">${formatBRL(p.price)}</s> ${formatBRL(p.promoPrice)}` : formatBRL(p.price)}</td>
          <td>${p.stock} ${stockBadge}</td>
          <td>${badges || "—"}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--ghost btn--sm" data-edit="${p.id}">Editar</button>
              <button class="btn btn--ghost btn--sm" data-duplicate="${p.id}">Duplicar</button>
              <button class="btn btn--ghost btn--sm" data-toggle="${p.id}">${isActive ? "Desativar" : "Ativar"}</button>
              <button class="btn btn--danger btn--sm" data-delete="${p.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ---------- slide-over form ----------
function openSlideover(product = null) {
  $("#product-form-title").textContent = product ? "Editar produto" : "Novo produto";
  $("#pf-id").value = product?.id || "";
  $("#pf-name").value = product?.name || "";
  $("#pf-short-desc").value = product?.shortDescription || "";
  $("#pf-description").value = product?.description || "";
  $("#pf-category").value = product?.categoryId || categories[0]?.id || "";
  $("#pf-sku").value = product?.sku || "";
  $("#pf-price").value = product?.price ?? "";
  $("#pf-promo-price").value = product?.promoPrice ?? "";
  $("#pf-stock").value = product?.stock ?? 0;
  $("#pf-weight").value = product?.weight ?? "";
  $("#pf-dimensions").value = product?.dimensions || "";
  $("#pf-video").value = product?.video || "";
  $("#pf-active").checked = product?.active !== false;
  $("#pf-featured").checked = !!product?.featured;
  $("#pf-bestseller").checked = !!product?.bestSeller;
  $("#pf-new").checked = !!product?.isNew;

  currentImages = product?.images ? [...product.images] : [];
  renderImageThumbs();
  $("#pf-upload-status").textContent = "";

  $("#product-backdrop").classList.add("is-open");
  $("#product-slideover").classList.add("is-open");
  $("#product-slideover").setAttribute("aria-hidden", "false");
}

function closeSlideover() {
  $("#product-backdrop").classList.remove("is-open");
  $("#product-slideover").classList.remove("is-open");
  $("#product-slideover").setAttribute("aria-hidden", "true");
}

let currentImages = [];

function renderImageThumbs() {
  const wrap = $("#pf-images-list");
  wrap.innerHTML = "";
  currentImages.forEach((url, i) => {
    const thumb = document.createElement("div");
    thumb.className = "image-thumb";
    thumb.innerHTML = `<img src="${url}" alt="" /><button type="button" aria-label="Remover">×</button>`;
    thumb.querySelector("button").addEventListener("click", () => {
      currentImages.splice(i, 1);
      renderImageThumbs();
    });
    wrap.appendChild(thumb);
  });
}

async function handleImageUpload(e) {
  const files = e.target.files;
  if (!files.length) return;

  const statusEl = $("#pf-upload-status");
  statusEl.className = "upload-status";
  statusEl.textContent = `Enviando ${files.length} foto${files.length > 1 ? "s" : ""}…`;

  // miniaturas de carregamento, para feedback visual imediato
  const placeholders = Array.from(files).map(() => {
    const div = document.createElement("div");
    div.className = "image-thumb is-uploading";
    div.textContent = "Enviando…";
    $("#pf-images-list").appendChild(div);
    return div;
  });

  const urls = await uploadMultipleToImgBB(files);
  placeholders.forEach((p) => p.remove());

  const failed = urls.filter((u) => !u).length;
  urls.forEach((url) => {
    if (url) currentImages.push(url);
  });
  renderImageThumbs();

  if (failed) {
    statusEl.className = "upload-status is-error";
    statusEl.textContent = `${failed} foto${failed > 1 ? "s" : ""} falharam ao enviar. Tente novamente.`;
  } else {
    statusEl.textContent = "Fotos enviadas com sucesso.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  }
  e.target.value = "";
}

function readForm() {
  return {
    name: $("#pf-name").value.trim(),
    shortDescription: $("#pf-short-desc").value.trim(),
    description: $("#pf-description").value.trim(),
    categoryId: $("#pf-category").value,
    sku: $("#pf-sku").value.trim(),
    price: parseFloat($("#pf-price").value) || 0,
    promoPrice: $("#pf-promo-price").value ? parseFloat($("#pf-promo-price").value) : null,
    stock: parseInt($("#pf-stock").value, 10) || 0,
    weight: $("#pf-weight").value ? parseFloat($("#pf-weight").value) : null,
    dimensions: $("#pf-dimensions").value.trim(),
    video: $("#pf-video").value.trim() || null,
    images: currentImages,
    active: $("#pf-active").checked,
    featured: $("#pf-featured").checked,
    bestSeller: $("#pf-bestseller").checked,
    isNew: $("#pf-new").checked,
  };
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = $("#pf-id").value;
  const data = readForm();

  if (id) {
    await updateProduct(id, data);
    showToast("Produto atualizado.");
  } else {
    await createProduct(data);
    showToast("Produto cadastrado.");
  }

  closeSlideover();
  await loadData();
  renderTable();
}

// ---------- table actions ----------
async function handleTableClick(e) {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const dupId = e.target.closest("[data-duplicate]")?.dataset.duplicate;
  const toggleId = e.target.closest("[data-toggle]")?.dataset.toggle;
  const delId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    openSlideover(products.find((p) => p.id === editId));
  } else if (dupId) {
    await duplicateProduct(dupId);
    showToast("Produto duplicado.");
    await loadData();
    renderTable();
  } else if (toggleId) {
    const product = products.find((p) => p.id === toggleId);
    await updateProduct(toggleId, { active: product.active === false });
    showToast(product.active === false ? "Produto ativado." : "Produto desativado.");
    await loadData();
    renderTable();
  } else if (delId) {
    if (!confirm("Excluir este produto? Essa ação não pode ser desfeita.")) return;
    await deleteProduct(delId);
    showToast("Produto excluído.");
    await loadData();
    renderTable();
  }
}

async function init() {
  await initAdminLayout("produtos", "Produtos");
  await loadData();
  populateCategorySelects();
  renderTable();

  $("#new-product-btn").addEventListener("click", () => openSlideover());
  $("#product-form-close").addEventListener("click", closeSlideover);
  $("#product-form-cancel").addEventListener("click", closeSlideover);
  $("#product-backdrop").addEventListener("click", closeSlideover);
  $("#product-form").addEventListener("submit", handleSubmit);
  $("#pf-image-upload").addEventListener("change", handleImageUpload);

  $("#product-search").addEventListener("input", renderTable);
  $("#product-category-filter").addEventListener("change", renderTable);
  $("#product-stock-filter").addEventListener("change", renderTable);

  $("#products-body").addEventListener("click", handleTableClick);
}

init();
