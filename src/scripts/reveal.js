const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

/* ── Reveal na entrada ─────────────────────────────────── */

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    }
  },
  { threshold: 0.25 }
)

const CHAR_STEP = 40 // ms entre um caractere e o seguinte

/* Quebra o texto em caracteres. O rótulo original vira aria-label:
   sem isso o leitor de tela soletraria a palavra letra a letra. */
const prepararCaracteres = (el) => {
  const texto = el.textContent
  el.setAttribute('aria-label', texto)
  el.textContent = ''

  ;[...texto].forEach((caractere, i) => {
    const span = document.createElement('span')
    span.className = 'char'
    span.textContent = caractere === ' ' ? ' ' : caractere
    span.style.transitionDelay = `${i * CHAR_STEP}ms`
    el.append(span)
  })
}

/* Embrulha o texto para que ele possa entrar depois do traço do ::before. */
const prepararLinha = (el) => {
  const span = document.createElement('span')
  span.className = 'reveal__text'
  span.append(...el.childNodes)
  el.append(span)
}

// a preparação precisa vir antes de observar: se .is-visible chegasse primeiro,
// os pedaços nasceriam já no estado final e apareceriam de uma vez
if (!reducedMotion.matches) {
  for (const el of document.querySelectorAll('.reveal--chars')) prepararCaracteres(el)
  for (const el of document.querySelectorAll('.reveal--line')) prepararLinha(el)
}

for (const el of document.querySelectorAll('.reveal')) {
  observer.observe(el)
}

/* ── Crossfade e deslocamento das imagens do capítulo ──── */

const SHIFT = 8 // deslocamento lateral máximo, em % da largura da imagem
const OVERLAP = 0.25 // fatia da janela compartilhada com a vizinha
// a escala precisa cobrir o translateX: em p=1 a imagem desloca 8% da própria
// largura, então o excedente de cada lado não pode ficar abaixo disso
const SCALE_FROM = 1.28
const SCALE_TO = 1.18

const clamp01 = (n) => Math.min(Math.max(n, 0), 1)

const chapters = [...document.querySelectorAll('.chapter')]
  .map((section) => ({ section, imgs: [...section.querySelectorAll('.chapter__img')] }))
  .filter(({ imgs }) => imgs.length)

if (chapters.length) {
  let ticking = false

  const update = () => {
    ticking = false
    const viewport = window.innerHeight
    const moves = !reducedMotion.matches

    for (const { section, imgs } of chapters) {
      const rect = section.getBoundingClientRect()

      // fora da viewport: nada a calcular
      if (rect.bottom <= 0 || rect.top >= viewport) continue

      // curso disponível = altura da seção menos a tela fixa
      const travel = rect.height - viewport
      const progress = travel > 0 ? clamp01(-rect.top / travel) : 0

      const window_ = 1 / imgs.length
      const overlap = OVERLAP * window_

      imgs.forEach((img, i) => {
        const start = i * window_

        // entra ao longo da sobreposição, montada em cima da vizinha de baixo
        const fadeFrom = start - overlap / 2
        img.style.opacity = i === 0 ? 1 : clamp01((progress - fadeFrom) / overlap)

        if (moves) {
          // a escala percorre a janela da própria imagem; o translateX é global
          const local = clamp01((progress - start) / window_)
          const scale = SCALE_FROM + (SCALE_TO - SCALE_FROM) * local
          img.style.transform = `translateX(${-SHIFT * progress}%) scale(${scale})`
        }
      })
    }
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
}
