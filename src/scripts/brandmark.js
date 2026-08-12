/* Losango fixo: gira de 0 a 180 graus ao longo da página inteira.

   A rotação anda em degraus em vez de acompanhar cada quadro — a transição
   de 1.2s do CSS costura um degrau no seguinte, e o giro fica lento e
   contínuo em vez de colado no dedo do usuário. */

const brandmark = document.querySelector('.brandmark')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

if (brandmark && !reducedMotion.matches) {
  const PASSOS = 24 // 7,5 graus por degrau

  const clamp01 = (n) => Math.min(Math.max(n, 0), 1)

  let ticking = false
  let passo = -1

  const update = () => {
    ticking = false

    const curso = document.documentElement.scrollHeight - window.innerHeight
    const progresso = curso > 0 ? clamp01(window.scrollY / curso) : 0

    const proximo = Math.round(progresso * PASSOS)
    if (proximo === passo) return

    passo = proximo
    brandmark.style.transform = `rotate(${(passo / PASSOS) * 180}deg)`
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
