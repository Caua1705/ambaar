/* Seção: .curtain — as emendas entre capítulos.

   No lugar do gradiente que derretia uma seção na outra, um painel sólido em
   --carvao varre a tela: desce cobrindo o capítulo que sai e continua descendo
   para revelar o que entra. Nunca há dois ambientes visíveis ao mesmo tempo.

   A varredura é amarrada ao scroll, não ao relógio: o painel fecha exatamente
   quando o capítulo seguinte chega ao topo, que é quando ele começa a ser
   pinado. Cada cortina cuida da seção que vem logo depois dela no HTML. */

import { gsap, reducedMotion, prioridadeRefresh, EASE_VARRE_ENTRA, EASE_VARRE_SAI } from './motion.js'

for (const curtain of document.querySelectorAll('.curtain')) {
  const proxima = curtain.nextElementSibling
  if (!proxima) continue

  if (reducedMotion) {
    gsap.set(curtain, { display: 'none' })
    continue
  }

  gsap.set(curtain, { yPercent: -100 })

  const fumaca = curtain.querySelector('.curtain__fumaca')

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: proxima,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      // a emenda tem de ser remedida junto com o capítulo que ela anuncia
      refreshPriority: prioridadeRefresh(proxima),
      // fora da emenda o painel não precisa nem existir para o compositor
      onToggle: ({ isActive }) => gsap.set(curtain, { visibility: isActive ? 'visible' : 'hidden' })
    }
  })
  tl.to(curtain, { yPercent: 0, duration: 0.5, ease: EASE_VARRE_ENTRA })
    .to(curtain, { yPercent: 100, duration: 0.5, ease: EASE_VARRE_SAI })

  /* O clarão abre e fecha defasado do painel: enquanto a cortina ainda está
     descendo ele já cresceu, e ele volta a fechar antes de ela sair. É essa
     defasagem que dá movimento interno à emenda — sem ela a fumaça seria um
     adesivo viajando junto com o painel. */
  if (fumaca) {
    tl.fromTo(fumaca,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: EASE_VARRE_SAI }, 0.15)
      .to(fumaca, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.35, ease: EASE_VARRE_ENTRA }, 0.62)
  }
}
