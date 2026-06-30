// ============================================================
// EMUNÁ · Serviço de dados (Firestore)
// ============================================================
// Toda leitura de dados públicos da loja passa por aqui.
// Se o Firebase não estiver configurado, ou se a coleção
// estiver vazia, cada função retorna os dados de demonstração
// correspondentes — assim a Home nunca aparece quebrada.
// ============================================================

import { db, isFirebaseConfigured } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  demoBanners,
  demoPromoBanners,
  demoCategories,
  demoProducts,
  demoTestimonials,
  demoCoupons,
  demoOrders,
  demoTransactions,
  demoCustomerFlags,
  demoSettings,
} from "./demo-data.js";

/** Wrapper genérico: tenta o Firestore, cai para o fallback em caso de erro/vazio. */
async function fetchOrFallback(queryFn, fallbackData, label) {
  if (!isFirebaseConfigured) return fallbackData;
  try {
    const snap = await queryFn();
    if (snap.empty) return fallbackData;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`[Emuná] Falha ao buscar "${label}" no Firestore, usando demonstração.`, err);
    return fallbackData;
  }
}

export async function getBanners() {
  return fetchOrFallback(
    () =>
      getDocs(
        query(collection(db, "banners"), where("active", "==", true), orderBy("order"))
      ),
    demoBanners,
    "banners"
  );
}

export async function getAllBanners() {
  return fetchOrFallback(
    () => getDocs(query(collection(db, "banners"), orderBy("order"))),
    demoBanners,
    "allBanners"
  );
}

export async function getPromoBanners() {
  return fetchOrFallback(
    () => getDocs(query(collection(db, "promoBanners"), orderBy("order"))),
    demoPromoBanners,
    "promoBanners"
  );
}

export async function getCategories() {
  return fetchOrFallback(
    () => getDocs(query(collection(db, "categories"), orderBy("order"))),
    demoCategories,
    "categories"
  );
}

export async function getFeaturedProducts() {
  return fetchOrFallback(
    () =>
      getDocs(
        query(collection(db, "products"), where("featured", "==", true), limit(8))
      ),
    demoProducts.filter((p) => p.featured),
    "featuredProducts"
  );
}

export async function getBestSellers() {
  return fetchOrFallback(
    () =>
      getDocs(
        query(collection(db, "products"), where("bestSeller", "==", true), limit(8))
      ),
    demoProducts.filter((p) => p.bestSeller),
    "bestSellers"
  );
}

export async function getNewProducts() {
  return fetchOrFallback(
    () =>
      getDocs(query(collection(db, "products"), where("isNew", "==", true), limit(8))),
    demoProducts.filter((p) => p.isNew),
    "newProducts"
  );
}

export async function getTestimonials() {
  return fetchOrFallback(
    () => getDocs(query(collection(db, "testimonials"), limit(6))),
    demoTestimonials,
    "testimonials"
  );
}

/** Todos os produtos ativos — usado pela página de catálogo (loja.html),
 * que aplica filtros de categoria/preço/disponibilidade no cliente. */
export async function getAllProducts() {
  return fetchOrFallback(
    () => getDocs(collection(db, "products")),
    demoProducts,
    "allProducts"
  );
}

export async function getProductById(id) {
  if (!isFirebaseConfigured) {
    return demoProducts.find((p) => p.id === id) || null;
  }
  try {
    const snap = await getDocs(
      query(collection(db, "products"), where("__name__", "==", id))
    );
    if (snap.empty) return demoProducts.find((p) => p.id === id) || null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.warn("[Emuná] Falha ao buscar produto, usando demonstração.", err);
    return demoProducts.find((p) => p.id === id) || null;
  }
}

export async function getRelatedProducts(categoryId, excludeId) {
  const all = await getAllProducts();
  return all.filter((p) => p.categoryId === categoryId && p.id !== excludeId).slice(0, 4);
}

export async function getCoupon(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;

  if (!isFirebaseConfigured) {
    return demoCoupons.find((c) => c.code === normalized) || null;
  }
  try {
    const snap = await getDocs(
      query(collection(db, "coupons"), where("code", "==", normalized))
    );
    if (snap.empty) return demoCoupons.find((c) => c.code === normalized) || null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (err) {
    console.warn("[Emuná] Falha ao validar cupom, usando demonstração.", err);
    return demoCoupons.find((c) => c.code === normalized) || null;
  }
}

// ---------- clientes (visão administrativa) ----------
function slugEmail(email) {
  return (email || "").toLowerCase().replace(/[.#$/\[\]]/g, "_");
}

export async function getCustomerFlags(email) {
  const slug = slugEmail(email);
  if (!isFirebaseConfigured) {
    return demoCustomerFlags[slug] || { blocked: false, notes: "" };
  }
  try {
    const snap = await getDocs(query(collection(db, "customerFlags"), where("__name__", "==", slug)));
    if (snap.empty) return { blocked: false, notes: "" };
    return snap.docs[0].data();
  } catch (err) {
    console.warn("[Emuná] Falha ao buscar dados do cliente.", err);
    return { blocked: false, notes: "" };
  }
}

export async function saveCustomerFlags(email, data) {
  const slug = slugEmail(email);
  if (!isFirebaseConfigured) {
    demoCustomerFlags[slug] = { ...(demoCustomerFlags[slug] || {}), ...data };
    return;
  }
  await setDoc(doc(db, "customerFlags", slug), data, { merge: true });
}

/** Lista de clientes derivada dos pedidos (nome, e-mail, total de compras,
 * última compra), cruzada com o bloqueio/observações salvos em customerFlags. */
export async function getCustomersSummary() {
  const orders = await getOrders();
  const byEmail = {};
  orders.forEach((o) => {
    const key = o.customerEmail;
    if (!byEmail[key]) {
      byEmail[key] = { name: o.customerName, email: o.customerEmail, ordersCount: 0, totalSpent: 0, lastOrderAt: o.createdAt };
    }
    byEmail[key].ordersCount += 1;
    byEmail[key].totalSpent += o.total;
    if (new Date(o.createdAt) > new Date(byEmail[key].lastOrderAt)) {
      byEmail[key].lastOrderAt = o.createdAt;
    }
  });

  const list = Object.values(byEmail);
  for (const customer of list) {
    const flags = await getCustomerFlags(customer.email);
    customer.blocked = !!flags.blocked;
    customer.notes = flags.notes || "";
  }
  return list;
}

// ---------- perfil de cliente (área "Minha conta") ----------
export async function getCustomerProfile(uid) {
  if (!isFirebaseConfigured) return null; // tratado localmente em modo demonstração
  try {
    const snap = await getDocs(query(collection(db, "customers"), where("__name__", "==", uid)));
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (err) {
    console.warn("[Emuná] Falha ao buscar perfil do cliente.", err);
    return null;
  }
}

export async function saveCustomerProfile(uid, data) {
  if (!isFirebaseConfigured) return;
  await setDoc(doc(db, "customers", uid), data, { merge: true });
}

export async function getStoreSettings() {
  if (!isFirebaseConfigured) return demoSettings;
  try {
    const snap = await getDocs(collection(db, "settings"));
    if (snap.empty) return demoSettings;
    const found = snap.docs.find((d) => d.id === "store") || snap.docs[0];
    return { ...demoSettings, ...found.data() };
  } catch (err) {
    console.warn("[Emuná] Falha ao buscar configurações, usando demonstração.", err);
    return demoSettings;
  }
}

// ============================================================
// Escrita (painel administrativo)
// ============================================================
// Em modo demonstração (Firebase não configurado), as operações
// abaixo alteram diretamente os arrays de js/demo-data.js em
// memória — o que permite testar o painel inteiro sem um projeto
// Firebase real, mas as mudanças não sobrevivem a um F5.
// ============================================================

let demoIdCounter = 1000;
function nextDemoId(prefix) {
  demoIdCounter += 1;
  return `${prefix}-${demoIdCounter}`;
}

// ---------- produtos ----------
export async function createProduct(data) {
  if (!isFirebaseConfigured) {
    const id = nextDemoId("p");
    demoProducts.unshift({ id, ...data });
    return id;
  }
  const ref = await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateProduct(id, data) {
  if (!isFirebaseConfigured) {
    const idx = demoProducts.findIndex((p) => p.id === id);
    if (idx >= 0) demoProducts[idx] = { ...demoProducts[idx], ...data };
    return;
  }
  await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id) {
  if (!isFirebaseConfigured) {
    const idx = demoProducts.findIndex((p) => p.id === id);
    if (idx >= 0) demoProducts.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "products", id));
}

export async function duplicateProduct(id) {
  const original = await getProductById(id);
  if (!original) return null;
  const { id: _omit, ...rest } = original;
  return createProduct({ ...rest, name: `${rest.name} (cópia)` });
}

// ---------- categorias ----------
export async function getAllCategories() {
  return getCategories();
}

export async function createCategory(data) {
  if (!isFirebaseConfigured) {
    const id = nextDemoId("cat");
    demoCategories.push({ id, ...data });
    return id;
  }
  const ref = await addDoc(collection(db, "categories"), data);
  return ref.id;
}

export async function updateCategory(id, data) {
  if (!isFirebaseConfigured) {
    const idx = demoCategories.findIndex((c) => c.id === id);
    if (idx >= 0) demoCategories[idx] = { ...demoCategories[idx], ...data };
    return;
  }
  await updateDoc(doc(db, "categories", id), data);
}

export async function deleteCategory(id) {
  if (!isFirebaseConfigured) {
    const idx = demoCategories.findIndex((c) => c.id === id);
    if (idx >= 0) demoCategories.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "categories", id));
}

// ---------- pedidos ----------
// ---------- pedidos ----------
export async function createOrder(data) {
  const order = { ...data, status: data.status || "pendente", createdAt: new Date().toISOString() };

  if (!isFirebaseConfigured) {
    const orderId = `EMU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    demoOrders.unshift({ id: orderId, ...order });
    return orderId;
  }
  const ref = await addDoc(collection(db, "orders"), { ...order, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getOrders() {
  return fetchOrFallback(
    () => getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
    demoOrders,
    "orders"
  );
}

export async function getOrdersByEmail(email) {
  const all = await getOrders();
  return all.filter((o) => o.customerEmail?.toLowerCase() === (email || "").toLowerCase());
}

export async function updateOrderStatus(id, status) {
  if (!isFirebaseConfigured) {
    const idx = demoOrders.findIndex((o) => o.id === id);
    if (idx >= 0) demoOrders[idx].status = status;
    return;
  }
  await updateDoc(doc(db, "orders", id), { status });
}

export async function updateOrderTracking(id, trackingCode) {
  if (!isFirebaseConfigured) {
    const idx = demoOrders.findIndex((o) => o.id === id);
    if (idx >= 0) demoOrders[idx].trackingCode = trackingCode;
    return;
  }
  await updateDoc(doc(db, "orders", id), { trackingCode });
}

// ---------- configurações ----------
export async function saveStoreSettings(data) {
  if (!isFirebaseConfigured) {
    Object.assign(demoSettings, data);
    return;
  }
  await setDoc(doc(db, "settings", "store"), data, { merge: true });
}

// ---------- financeiro (lançamentos manuais) ----------
export async function getTransactions() {
  return fetchOrFallback(
    () => getDocs(query(collection(db, "transactions"), orderBy("date", "desc"))),
    demoTransactions,
    "transactions"
  );
}

export async function createTransaction(data) {
  if (!isFirebaseConfigured) {
    const id = nextDemoId("t");
    demoTransactions.unshift({ id, ...data });
    return id;
  }
  const ref = await addDoc(collection(db, "transactions"), data);
  return ref.id;
}

export async function deleteTransaction(id) {
  if (!isFirebaseConfigured) {
    const idx = demoTransactions.findIndex((t) => t.id === id);
    if (idx >= 0) demoTransactions.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "transactions", id));
}
export async function createBanner(data) {
  if (!isFirebaseConfigured) {
    const id = nextDemoId("banner");
    demoBanners.push({ id, ...data });
    return id;
  }
  const ref = await addDoc(collection(db, "banners"), data);
  return ref.id;
}

export async function updateBanner(id, data) {
  if (!isFirebaseConfigured) {
    const idx = demoBanners.findIndex((b) => b.id === id);
    if (idx >= 0) demoBanners[idx] = { ...demoBanners[idx], ...data };
    return;
  }
  await updateDoc(doc(db, "banners", id), data);
}

export async function deleteBanner(id) {
  if (!isFirebaseConfigured) {
    const idx = demoBanners.findIndex((b) => b.id === id);
    if (idx >= 0) demoBanners.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "banners", id));
}

export async function createPromoBanner(data) {
  if (!isFirebaseConfigured) {
    const id = nextDemoId("promo");
    demoPromoBanners.push({ id, ...data });
    return id;
  }
  const ref = await addDoc(collection(db, "promoBanners"), data);
  return ref.id;
}

export async function updatePromoBanner(id, data) {
  if (!isFirebaseConfigured) {
    const idx = demoPromoBanners.findIndex((b) => b.id === id);
    if (idx >= 0) demoPromoBanners[idx] = { ...demoPromoBanners[idx], ...data };
    return;
  }
  await updateDoc(doc(db, "promoBanners", id), data);
}

export async function deletePromoBanner(id) {
  if (!isFirebaseConfigured) {
    const idx = demoPromoBanners.findIndex((b) => b.id === id);
    if (idx >= 0) demoPromoBanners.splice(idx, 1);
    return;
  }
  await deleteDoc(doc(db, "promoBanners", id));
}
