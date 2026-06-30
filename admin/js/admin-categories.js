// ============================================================
// EMUNÁ ADMIN · Categorias
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../js/firestore-service.js";
import { uploadImageToImgBB } from "../../js/imgbb-upload.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let categories = [];

async function loadData() {
  categories = await getAllCategories();
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderTable() {
  const body = $("#categories-body");
  if (!categories.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhuma categoria cadastrada.</td></tr>`;
    return;
  }
  body.innerHTML = categories
    .map(
      (c) => `
      <tr data-id="${c.id}">
        <td><img class="table-thumb" src="${c.image || ""}" alt="" /></td>
        <td>${c.name}</td>
        <td>${c.icon || "—"}</td>
        <td>${c.order ?? "—"}</td>
        <td>
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

let currentImage = "";

function renderImageThumb() {
  const wrap = $("#cf-image-thumb");
  wrap.innerHTML = currentImage
    ? `<div class="image-thumb"><img src="${currentImage}" alt="" /><button type="button" aria-label="Remover">×</button></div>`
    : "";
  wrap.querySelector("button")?.addEventListener("click", () => {
    currentImage = "";
    renderImageThumb();
  });
}

async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = $("#cf-upload-status");
  statusEl.className = "upload-status";
  statusEl.textContent = "Enviando imagem…";
  try {
    currentImage = await uploadImageToImgBB(file);
    renderImageThumb();
    statusEl.textContent = "Imagem enviada com sucesso.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  } catch (err) {
    statusEl.className = "upload-status is-error";
    statusEl.textContent = err.message;
  }
  e.target.value = "";
}

function openSlideover(category = null) {
  $("#category-form-title").textContent = category ? "Editar categoria" : "Nova categoria";
  $("#cf-id").value = category?.id || "";
  $("#cf-name").value = category?.name || "";
  $("#cf-icon").value = category?.icon || "";
  $("#cf-order").value = category?.order ?? categories.length + 1;
  currentImage = category?.image || "";
  renderImageThumb();
  $("#cf-upload-status").textContent = "";
  $("#category-backdrop").classList.add("is-open");
  $("#category-slideover").classList.add("is-open");
  $("#category-slideover").setAttribute("aria-hidden", "false");
}

function closeSlideover() {
  $("#category-backdrop").classList.remove("is-open");
  $("#category-slideover").classList.remove("is-open");
  $("#category-slideover").setAttribute("aria-hidden", "true");
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = $("#cf-id").value;
  const data = {
    name: $("#cf-name").value.trim(),
    icon: $("#cf-icon").value.trim(),
    order: parseInt($("#cf-order").value, 10) || 1,
    image: currentImage,
  };

  if (id) {
    await updateCategory(id, data);
    showToast("Categoria atualizada.");
  } else {
    await createCategory(data);
    showToast("Categoria criada.");
  }

  closeSlideover();
  await loadData();
  renderTable();
}

async function handleTableClick(e) {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const delId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    openSlideover(categories.find((c) => c.id === editId));
  } else if (delId) {
    if (!confirm("Excluir esta categoria? Produtos associados não serão excluídos.")) return;
    await deleteCategory(delId);
    showToast("Categoria excluída.");
    await loadData();
    renderTable();
  }
}

async function init() {
  await initAdminLayout("categorias", "Categorias");
  await loadData();
  renderTable();

  $("#new-category-btn").addEventListener("click", () => openSlideover());
  $("#category-form-close").addEventListener("click", closeSlideover);
  $("#category-form-cancel").addEventListener("click", closeSlideover);
  $("#category-backdrop").addEventListener("click", closeSlideover);
  $("#category-form").addEventListener("submit", handleSubmit);
  $("#cf-image-upload").addEventListener("change", handleImageUpload);
  $("#categories-body").addEventListener("click", handleTableClick);
}

init();
