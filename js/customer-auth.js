// ============================================================
// EMUNÁ · Autenticação de clientes
// ============================================================
// Com Firebase configurado: usa Firebase Authentication de verdade,
// com o perfil estendido (telefone, endereços) salvo em /customers/{uid}.
// Sem Firebase: mantém uma conta de demonstração no localStorage,
// só para permitir testar a área "Minha conta" e o checkout
// preenchido automaticamente antes de você conectar um projeto real.
// ============================================================

import { auth, isFirebaseConfigured } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getCustomerProfile, saveCustomerProfile } from "./firestore-service.js";

const DEMO_ACCOUNTS_KEY = "emuna_customer_accounts_v1";
const DEMO_SESSION_KEY = "emuna_customer_session_v1";

function readDemoAccounts() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
}
function writeDemoAccounts(accounts) {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}
function notifyAuthChange() {
  document.dispatchEvent(new CustomEvent("customer-auth:changed"));
}

export async function registerCustomer({ name, email, password, phone }) {
  if (!isFirebaseConfigured) {
    const accounts = readDemoAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Já existe uma conta com este e-mail.");
    }
    accounts.push({ name, email, password, phone: phone || "", addresses: [] });
    writeDemoAccounts(accounts);
    localStorage.setItem(DEMO_SESSION_KEY, email);
    notifyAuthChange();
    return { email, name };
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await saveCustomerProfile(cred.user.uid, { name, email, phone: phone || "", addresses: [] });
  return { email, name, uid: cred.user.uid };
}

export async function loginCustomer({ email, password }) {
  if (!isFirebaseConfigured) {
    const accounts = readDemoAccounts();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) throw new Error("E-mail ou senha incorretos.");
    localStorage.setItem(DEMO_SESSION_KEY, email);
    notifyAuthChange();
    return account;
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return { email: cred.user.email, uid: cred.user.uid };
}

export async function logoutCustomer() {
  if (!isFirebaseConfigured) {
    localStorage.removeItem(DEMO_SESSION_KEY);
    notifyAuthChange();
    return;
  }
  await signOut(auth);
}

/** Assina mudanças de sessão. `callback` recebe `{ email, name, uid, demo }` ou `null`. */
export function onCustomerAuthChange(callback) {
  if (!isFirebaseConfigured) {
    const check = () => {
      const email = localStorage.getItem(DEMO_SESSION_KEY);
      if (!email) return callback(null);
      const account = readDemoAccounts().find((a) => a.email === email);
      callback(account ? { email: account.email, name: account.name, demo: true } : null);
    };
    check();
    document.addEventListener("customer-auth:changed", check);
    return;
  }
  onAuthStateChanged(auth, (user) => {
    callback(user ? { email: user.email, name: user.displayName, uid: user.uid, demo: false } : null);
  });
}

export async function getMyProfile(session) {
  if (session.demo) {
    return readDemoAccounts().find((a) => a.email === session.email) || null;
  }
  return getCustomerProfile(session.uid);
}

export async function updateMyProfile(session, data) {
  if (session.demo) {
    const accounts = readDemoAccounts();
    const idx = accounts.findIndex((a) => a.email === session.email);
    if (idx >= 0) accounts[idx] = { ...accounts[idx], ...data };
    writeDemoAccounts(accounts);
    notifyAuthChange();
    return;
  }
  await saveCustomerProfile(session.uid, data);
}

export async function addMyAddress(session, address) {
  const profile = await getMyProfile(session);
  const addresses = [...(profile?.addresses || []), address];
  await updateMyProfile(session, { addresses });
  return addresses;
}

export async function removeMyAddress(session, index) {
  const profile = await getMyProfile(session);
  const addresses = (profile?.addresses || []).filter((_, i) => i !== index);
  await updateMyProfile(session, { addresses });
  return addresses;
}
