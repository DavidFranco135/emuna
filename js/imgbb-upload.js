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

  const formData = new FormData();
  formData.append("image", file);

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
