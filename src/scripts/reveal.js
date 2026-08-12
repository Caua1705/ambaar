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

for (const el of document.querySelectorAll('.reveal')) {
  observer.observe(el)
}

/* ── Crossfade e deslocamento das imagens do capítulo ──── */

const SHIFT = 8 // deslocamento lateral máximo, em % da largura da imagem
const OVERLAP = 0.25 // fatia da janela compartilhada com a vizinha
const SCALE_FROM = 1.14
const SCALE_TO = 1.02

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
