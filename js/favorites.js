// ============================================================
// EMUNÁ · Favoritos
// ============================================================
const FAV_KEY = "emuna_favorites_v1";

function read() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  document.dispatchEvent(new CustomEvent("favorites:updated", { detail: { ids } }));
}

export function isFavorite(productId) {
  return read().includes(productId);
}

export function toggleFavorite(productId) {
  const ids = read();
  const idx = ids.indexOf(productId);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(productId);
  }
  write(ids);
  return ids.includes(productId);
}

export function getFavorites() {
  return read();
}
