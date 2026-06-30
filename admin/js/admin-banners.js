// ============================================================
// EMUNÁ ADMIN · Página Inicial (banners)
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
} from "../../js/firestore-service.js";
import { uploadImageToImgBB } from "../../js/imgbb-upload.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let heroBanners = [];
let promoBanners = [];
let currentHeroImage = "";
let currentPromoImage = "";

// ---------- helpers de upload de imagem (reutilizados nos dois formulários) ----------
function renderThumb(wrapId, url, onRemove) {
  const wrap = $(`#${wrapId}`);
  wrap.innerHTML = url
    ? `<div class="image-thumb"><img src="${url}" alt="" /><button type="button" aria-label="Remover">×</button></div>`
    : "";
  wrap.querySelector("button")?.addEventListener("click", onRemove);
}

async function handleUpload(e, statusId, onSuccess) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = $(`#${statusId}`);
  statusEl.className = "upload-status";
  statusEl.textContent = "Enviando imagem…";
  try {
    const url = await uploadImageToImgBB(file);
    onSuccess(url);
    statusEl.textContent = "Imagem enviada com sucesso.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  } catch (err) {
    statusEl.className = "upload-status is-error";
    statusEl.textContent = err.message;
  }
  e.target.value = "";
}

// ---------- banners principais ----------
async function loadHero() {
  heroBanners = await getAllBanners();
  heroBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderHeroTable() {
  const body = $("#hero-body");
  if (!heroBanners.length) {
    body.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhum banner cadastrado.</td></tr>`;
    return;
  }
  body.innerHTML = heroBanners
    .map(
      (b) => `
      <tr data-id="${b.id}">
        <td><img class="table-thumb" src="${b.image || ""}" alt="" /></td>
        <td>${b.title}</td>
        <td>${b.subtitle || "—"}</td>
        <td>${b.order ?? "—"}</td>
        <td>${b.active !== false ? '<span class="badge badge--green">Ativo</span>' : '<span class="badge badge--gray">Inativo</span>'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn--ghost btn--sm" data-edit-hero="${b.id}">Editar</button>
            <button class="btn btn--danger btn--sm" data-delete-hero="${b.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function openHeroForm(banner = null) {
  $("#hero-form-title").textContent = banner ? "Editar banner" : "Novo banner";
  $("#hf-id").value = banner?.id || "";
  $("#hf-title").value = banner?.title || "";
  $("#hf-subtitle").value = banner?.subtitle || "";
  $("#hf-cta-label").value = banner?.ctaLabel || "";
  $("#hf-cta-link").value = banner?.ctaLink || "";
  $("#hf-order").value = banner?.order ?? heroBanners.length + 1;
  $("#hf-active").checked = banner?.active !== false;
  currentHeroImage = banner?.image || "";
  renderThumb("hf-image-thumb", currentHeroImage, () => {
    currentHeroImage = "";
    renderThumb("hf-image-thumb", "", () => {});
  });
  $("#hf-upload-status").textContent = "";
  $("#hero-backdrop").classList.add("is-open");
  $("#hero-slideover").classList.add("is-open");
}

function closeHeroForm() {
  $("#hero-backdrop").classList.remove("is-open");
  $("#hero-slideover").classList.remove("is-open");
}

async function handleHeroSubmit(e) {
  e.preventDefault();
  const id = $("#hf-id").value;
  const data = {
    title: $("#hf-title").value.trim(),
    subtitle: $("#hf-subtitle").value.trim(),
    ctaLabel: $("#hf-cta-label").value.trim(),
    ctaLink: $("#hf-cta-link").value.trim() || "#",
    order: parseInt($("#hf-order").value, 10) || 1,
    active: $("#hf-active").checked,
    image: currentHeroImage,
  };
  if (id) {
    await updateBanner(id, data);
    showToast("Banner atualizado.");
  } else {
    await createBanner(data);
    showToast("Banner criado.");
  }
  closeHeroForm();
  await loadHero();
  renderHeroTable();
}

async function handleHeroTableClick(e) {
  const editId = e.target.closest("[data-edit-hero]")?.dataset.editHero;
  const delId = e.target.closest("[data-delete-hero]")?.dataset.deleteHero;
  if (editId) {
    openHeroForm(heroBanners.find((b) => b.id === editId));
  } else if (delId) {
    if (!confirm("Excluir este banner?")) return;
    await deleteBanner(delId);
    showToast("Banner excluído.");
    await loadHero();
    renderHeroTable();
  }
}

// ---------- banners de promoção ----------
async function loadPromo() {
  promoBanners = await getPromoBanners();
  promoBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderPromoTable() {
  const body = $("#promo-body");
  if (!promoBanners.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum banner cadastrado.</td></tr>`;
    return;
  }
  body.innerHTML = promoBanners
    .map(
      (b) => `
      <tr data-id="${b.id}">
        <td><img class="table-thumb" src="${b.image || ""}" alt="" /></td>
        <td>${b.title}</td>
        <td>${b.link || "—"}</td>
        <td>${b.order ?? "—"}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn--ghost btn--sm" data-edit-promo="${b.id}">Editar</button>
            <button class="btn btn--danger btn--sm" data-delete-promo="${b.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function openPromoForm(banner = null) {
  $("#promo-form-title").textContent = banner ? "Editar banner" : "Novo banner";
  $("#pmf-id").value = banner?.id || "";
  $("#pmf-title").value = banner?.title || "";
  $("#pmf-link").value = banner?.link || "";
  $("#pmf-order").value = banner?.order ?? promoBanners.length + 1;
  currentPromoImage = banner?.image || "";
  renderThumb("pmf-image-thumb", currentPromoImage, () => {
    currentPromoImage = "";
    renderThumb("pmf-image-thumb", "", () => {});
  });
  $("#pmf-upload-status").textContent = "";
  $("#promo-backdrop").classList.add("is-open");
  $("#promo-slideover").classList.add("is-open");
}

function closePromoForm() {
  $("#promo-backdrop").classList.remove("is-open");
  $("#promo-slideover").classList.remove("is-open");
}

async function handlePromoSubmit(e) {
  e.preventDefault();
  const id = $("#pmf-id").value;
  const data = {
    title: $("#pmf-title").value.trim(),
    link: $("#pmf-link").value.trim() || "#",
    order: parseInt($("#pmf-order").value, 10) || 1,
    image: currentPromoImage,
  };
  if (id) {
    await updatePromoBanner(id, data);
    showToast("Banner atualizado.");
  } else {
    await createPromoBanner(data);
    showToast("Banner criado.");
  }
  closePromoForm();
  await loadPromo();
  renderPromoTable();
}

async function handlePromoTableClick(e) {
  const editId = e.target.closest("[data-edit-promo]")?.dataset.editPromo;
  const delId = e.target.closest("[data-delete-promo]")?.dataset.deletePromo;
  if (editId) {
    openPromoForm(promoBanners.find((b) => b.id === editId));
  } else if (delId) {
    if (!confirm("Excluir este banner?")) return;
    await deletePromoBanner(delId);
    showToast("Banner excluído.");
    await loadPromo();
    renderPromoTable();
  }
}

async function init() {
  await initAdminLayout("banners", "Página Inicial");

  await Promise.all([loadHero(), loadPromo()]);
  renderHeroTable();
  renderPromoTable();

  $("#new-hero-btn").addEventListener("click", () => openHeroForm());
  $("#hero-form-close").addEventListener("click", closeHeroForm);
  $("#hero-form-cancel").addEventListener("click", closeHeroForm);
  $("#hero-backdrop").addEventListener("click", closeHeroForm);
  $("#hero-form").addEventListener("submit", handleHeroSubmit);
  $("#hf-image-upload").addEventListener("change", (e) =>
    handleUpload(e, "hf-upload-status", (url) => {
      currentHeroImage = url;
      renderThumb("hf-image-thumb", url, () => {
        currentHeroImage = "";
        renderThumb("hf-image-thumb", "", () => {});
      });
    })
  );
  $("#hero-body").addEventListener("click", handleHeroTableClick);

  $("#new-promo-btn").addEventListener("click", () => openPromoForm());
  $("#promo-form-close").addEventListener("click", closePromoForm);
  $("#promo-form-cancel").addEventListener("click", closePromoForm);
  $("#promo-backdrop").addEventListener("click", closePromoForm);
  $("#promo-form").addEventListener("submit", handlePromoSubmit);
  $("#pmf-image-upload").addEventListener("change", (e) =>
    handleUpload(e, "pmf-upload-status", (url) => {
      currentPromoImage = url;
      renderThumb("pmf-image-thumb", url, () => {
        currentPromoImage = "";
        renderThumb("pmf-image-thumb", "", () => {});
      });
    })
  );
  $("#promo-body").addEventListener("click", handlePromoTableClick);
}

init();
