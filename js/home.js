// ============================================================
// EMUNÁ · Home
// ============================================================
import {
  getBanners,
  getPromoBanners,
  getCategories,
  getFeaturedProducts,
  getBestSellers,
  getNewProducts,
  getTestimonials,
  getStoreSettings,
  submitTestimonial,
} from "./firestore-service.js";
import { initLayout } from "./layout.js";
import { renderProductGrid, renderSkeletonGrid } from "./product-card.js";
import { initDragScroll } from "./drag-scroll.js";
import { onCustomerAuthChange } from "./customer-auth.js";
import { revealOnScroll } from "./scroll-reveal.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ---------- hero slider ----------
let heroIndex = 0;
let heroTimer = null;

function renderHero(banners) {
  const track = $("#hero-track");
  const dotsWrap = $("#hero-dots");
  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  banners.forEach((b, i) => {
    const hasText = !!(b.title || b.subtitle);
    track.appendChild(
      el(`
        <div class="hero-slide" style="background-image:url('${b.image}')">
          ${
            hasText
              ? `
            <div class="hero-slide__scrim"></div>
            <div class="hero-slide__content">
              ${b.title ? `<h1>${b.title}</h1>` : ""}
              ${b.subtitle ? `<p class="hero-slide__subtitle">${b.subtitle}</p>` : ""}
              ${b.ctaLabel ? `<a class="btn btn--gold" href="${b.ctaLink || "#"}">${b.ctaLabel}</a>` : ""}
            </div>
          `
              : ""
          }
        </div>
      `)
    );
    dotsWrap.appendChild(
      el(`<button class="hero-dot" data-i="${i}" aria-label="Slide ${i + 1}"></button>`)
    );
  });

  goToHero(0);
  $$(".hero-dot").forEach((dot) =>
    dot.addEventListener("click", () => goToHero(Number(dot.dataset.i)))
  );

  $("#hero-prev")?.addEventListener("click", () => goToHero(heroIndex - 1));
  $("#hero-next")?.addEventListener("click", () => goToHero(heroIndex + 1));

  startHeroAutoplay(banners.length);
}

function goToHero(i) {
  const track = $("#hero-track");
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dot");
  if (!slides.length) return;
  heroIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${heroIndex * 100}%)`;
  dots.forEach((d, idx) => d.classList.toggle("is-active", idx === heroIndex));
}

function startHeroAutoplay(count) {
  clearInterval(heroTimer);
  if (count <= 1) return;
  heroTimer = setInterval(() => goToHero(heroIndex + 1), 6000);
}

// ---------- promo strip ----------
let promoTimer = null;

function renderPromoStrip(promos) {
  const track = $("#promo-track");
  const dotsWrap = $("#promo-dots");
  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  if (!promos.length) return;

  promos.forEach((p) => {
    track.appendChild(
      el(`
        <a class="promo-card" href="${p.link || "#"}" style="background-image:url('${p.image}')">
          ${p.title ? `<span class="promo-card__label">${p.title}</span>` : ""}
        </a>
      `)
    );
  });

  promos.forEach((_, i) => {
    dotsWrap.appendChild(el(`<button class="promo-dot" data-i="${i}" aria-label="Banner ${i + 1}"></button>`));
  });

  const syncActiveDot = () => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    $$(".promo-dot").forEach((d, i) => d.classList.toggle("is-active", i === index));
  };
  syncActiveDot();

  $$(".promo-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: track.clientWidth * Number(dot.dataset.i), behavior: "smooth" });
    });
  });

  track.addEventListener("scroll", debounce(syncActiveDot, 100));

  // avança sozinho a cada 5s, só se houver mais de um banner
  clearInterval(promoTimer);
  if (promos.length > 1) {
    promoTimer = setInterval(() => {
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % promos.length;
      track.scrollTo({ left: track.clientWidth * next, behavior: "smooth" });
    }, 5000);
  }
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ---------- categories ----------
function renderCategories(categories) {
  const grid = $("#categories-grid");
  grid.innerHTML = "";
  categories.forEach((c) => {
    grid.appendChild(
      el(`
        <a class="category-card" href="loja.html?categoria=${c.id}">
          <div class="category-card__image" style="background-image:url('${c.image}')"></div>
          <span class="category-card__icon">${c.icon || ""}</span>
          <span class="category-card__name">${c.name}</span>
        </a>
      `)
    );
  });
  revealOnScroll(".category-card", grid);
}

// ---------- testimonials ----------
function stitchSvg() {
  return `<svg viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12c6-10 12 10 18 0s12-10 18 0 12 10 18 0 12-10 18 0 12 10 18 0 12-10 18 0"
      stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function renderTestimonials(items) {
  const wrap = $("#testimonials-track");
  wrap.innerHTML = "";
  items.forEach((t) => {
    wrap.appendChild(
      el(`
        <figure class="testimonial-card">
          <span class="testimonial-card__stitch" aria-hidden="true">${stitchSvg()}</span>
          <blockquote>${t.text}</blockquote>
          <figcaption>
            <span class="testimonial-card__stars">${"★".repeat(t.rating || 5)}</span>
            <span class="testimonial-card__name">${t.name}</span>
          </figcaption>
        </figure>
      `)
    );
  });
  revealOnScroll(".testimonial-card", wrap);
}

// ---------- newsletter ----------
function initNewsletter() {
  const form = $("#newsletter-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("#newsletter-msg");
    msg.textContent = "Obrigada por se juntar a nós! ✦";
    form.reset();
  });
}

// ---------- footer / settings ----------
function applySettings(settings) {
  $$("[data-whatsapp]").forEach((a) => (a.href = `https://wa.me/${settings.whatsapp}`));
  $$("[data-instagram]").forEach((a) => (a.href = settings.instagram));
  $$("[data-facebook]").forEach((a) => (a.href = settings.facebook));
  $$("[data-email]").forEach((a) => (a.href = `mailto:${settings.email}`));
  $$("[data-phone-text]").forEach((node) => (node.textContent = settings.phone));
  $$("[data-address-text]").forEach((node) => (node.textContent = settings.address));

  if (settings.aboutEyebrow) $("#about-eyebrow").textContent = settings.aboutEyebrow;
  if (settings.aboutTitle) $("#about-title").textContent = settings.aboutTitle;
  if (settings.aboutImage) $("#about-image").src = settings.aboutImage;
  if (settings.aboutText) {
    $("#about-text").innerHTML = settings.aboutText
      .split("\n")
      .filter((p) => p.trim())
      .map((p) => `<p>${p}</p>`)
      .join("");
  }
}

// ---------- formulário público de depoimento ----------
function initTestimonialForm() {
  const cta = $("#open-testimonial-form-btn");
  const form = $("#testimonial-form");
  const ctaWrap = $("#testimonial-cta");
  let selectedStar = 5;

  onCustomerAuthChange((session) => {
    if (session?.name) $("#tf-pub-name").value = session.name;
  });

  const stars = $$("#tf-pub-stars button");
  const syncStars = () =>
    stars.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.star) <= selectedStar));
  syncStars();
  stars.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedStar = Number(btn.dataset.star);
      syncStars();
    });
  });

  cta?.addEventListener("click", () => {
    ctaWrap.hidden = true;
    form.hidden = false;
  });
  $("#cancel-testimonial-form-btn")?.addEventListener("click", () => {
    form.hidden = true;
    ctaWrap.hidden = false;
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    await submitTestimonial({
      name: $("#tf-pub-name").value.trim(),
      text: $("#tf-pub-text").value.trim(),
      rating: selectedStar,
    });

    form.reset();
    selectedStar = 5;
    syncStars();
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar depoimento";
    $("#testimonial-form-msg").textContent =
      "Obrigada! Seu depoimento foi enviado e vai aparecer aqui assim que aprovarmos. ✦";
    setTimeout(() => {
      form.hidden = true;
      ctaWrap.hidden = false;
      $("#testimonial-form-msg").textContent = "";
    }, 3200);
  });
}

// ---------- init ----------
async function init() {
  await initLayout();
  initNewsletter();
  initTestimonialForm();

  renderSkeletonGrid("featured-grid", 4);
  renderSkeletonGrid("bestsellers-grid", 4);
  renderSkeletonGrid("new-grid", 4);

  const [banners, promos, categories, featured, bestSellers, newProducts, testimonials, settings] =
    await Promise.all([
      getBanners(),
      getPromoBanners(),
      getCategories(),
      getFeaturedProducts(),
      getBestSellers(),
      getNewProducts(),
      getTestimonials(),
      getStoreSettings(),
    ]);

  renderHero(banners);
  renderPromoStrip(promos);
  renderCategories(categories);
  renderProductGrid("featured-grid", featured, "Em breve novidades por aqui.");
  renderProductGrid("bestsellers-grid", bestSellers, "Em breve novidades por aqui.");
  renderProductGrid("new-grid", newProducts, "Em breve novidades por aqui.");
  renderTestimonials(testimonials);
  applySettings(settings);

  [
    "featured-grid",
    "bestsellers-grid",
    "new-grid",
    "categories-grid",
  ].forEach((id) => initDragScroll($(`#${id}`)));

  document.body.classList.add("is-loaded");
}

init();
