// ============================================================
// EMUNÁ · Configuração do Firebase
// ============================================================
// 1. Crie um projeto em https://console.firebase.google.com
// 2. Ative: Authentication (e-mail/senha), Firestore Database, Storage
// 3. Copie as credenciais do seu projeto (Configurações do projeto > Geral
//    > Seus apps > SDK do Firebase) e cole abaixo, substituindo os valores
//    de exemplo.
// 4. Veja README.md para a estrutura de coleções esperada no Firestore.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// SUBSTITUA pelos dados do SEU projeto Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyCEEvlIGW4qrDpTQisaHfqDDtHGVSjpqNA",
  authDomain: "emuna-276ae.firebaseapp.com",
  projectId: "emuna-276ae",
  storageBucket: "emuna-276ae.firebasestorage.app",
  messagingSenderId: "615948468648",
  appId: "1:615948468648:web:54a1567d5474ebefdd5d9d",
};

// Detecta se as credenciais ainda são o placeholder de exemplo.
// Isso permite que o resto do app saiba quando deve usar dados
// de demonstração em vez de tentar falar com um Firebase inexistente.
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "SUA_API_KEY_AQUI" &&
  !firebaseConfig.apiKey.includes("SUA_API_KEY");

let app, db, auth, storage;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  console.info(
    "%c[Emuná] Firebase ainda não configurado — exibindo dados de demonstração.\nPreencha js/firebase-config.js com as credenciais do seu projeto.",
    "color:#6F3CC3;font-weight:bold;"
  );
}

export { app, db, auth, storage };
