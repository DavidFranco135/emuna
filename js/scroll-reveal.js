// ============================================================
// EMUNÁ · Revelação ao rolar (scroll reveal)
// ============================================================
// Adiciona a classe "is-visible" a cada elemento quando ele entra
// na tela, disparando a transição de opacidade/deslocamento
// definida em CSS (.reveal-on-scroll). Usa IntersectionObserver,
// leve e nativo do navegador — sem bibliotecas externas.
// ============================================================

let observer = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  return observer;
}

/** Aplica a revelação a todos os elementos que casarem com o seletor,
 * dentro do container informado (padrão: documento inteiro). Chame
 * depois de renderizar o conteúdo dinâmico (produtos, categorias...). */
export function revealOnScroll(selector, container = document) {
  const els = container.querySelectorAll(selector);
  const obs = getObserver();
  els.forEach((el, i) => {
    el.classList.add("reveal-on-scroll");
    // pequeno atraso escalonado entre os itens de uma mesma vitrine,
    // para eles aparecerem em sequência em vez de todos de uma vez
    el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
    obs.observe(el);
  });
}
