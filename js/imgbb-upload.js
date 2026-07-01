// ============================================================
// EMUNÁ · Upload de imagens (ImgBB)
// ============================================================
// Todas as imagens do sistema (produtos, categorias, banners) são
// enviadas para o ImgBB e o que se guarda no Firestore é só a URL
// pública retornada. Isso evita depender do Firebase Storage.
//
// Documentação: https://api.imgbb.com/
// ============================================================

const IMGBB_API_KEY = "24fdf2dc907cc3b17492621921d8af42";
const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

// Fotos de celular costumam vir com 4-12 MB — isso é o que deixa o upload
// lento. Redimensionamos para no máximo 1600px no lado maior e comprimimos
// em JPEG antes de enviar: some para ~200-500KB sem perda visível de
// qualidade, e o upload fica muito mais rápido.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Redimensiona e comprime uma imagem no navegador antes do upload.
 * Se o arquivo já for pequeno/leve, ou não for possível processar
 * (ex: GIF animado), retorna o arquivo original sem modificar. */
async function compressImage(file) {
  // GIFs animados perderiam a animação se passassem pelo canvas — mantém como está
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

    // já é pequena o suficiente e leve — não vale a pena reprocessar
    if (scale === 1 && file.size < 400 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file; // se não compensou, usa o original

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // navegador sem suporte a createImageBitmap/canvas, ou arquivo corrompido
    return file;
  }
}

/** Envia um arquivo de imagem (File) para o ImgBB e retorna a URL pública.
 * Lança um erro com mensagem amigável em caso de falha. */
export async function uploadImageToImgBB(file) {
  if (!file) throw new Error("Nenhum arquivo selecionado.");
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPG, PNG, WEBP, GIF…).");
  }
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Imagem muito grande (limite do ImgBB: 32 MB).");
  }

  const optimized = await compressImage(file);

  const formData = new FormData();
  formData.append("image", optimized);

  let response;
  try {
    response = await fetch(`${IMGBB_ENDPOINT}?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new Error("Falha de conexão ao enviar a imagem. Tente novamente.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.error?.message || "Não foi possível enviar a imagem ao ImgBB.");
  }

  // url: link direto e estável para a imagem hospedada
  return data.data.url;
}

/** Envia vários arquivos em paralelo e retorna as URLs na mesma ordem.
 * Uploads que falharem retornam `null` na posição correspondente. */
export async function uploadMultipleToImgBB(files) {
  const results = await Promise.allSettled(Array.from(files).map((f) => uploadImageToImgBB(f)));
  return results.map((r) => (r.status === "fulfilled" ? r.value : null));
}
