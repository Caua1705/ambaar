/* Seção: .curtain — as emendas entre capítulos.

   No lugar do gradiente que derretia uma seção na outra, um painel sólido em
   --carvao varre a tela: desce cobrindo o capítulo que sai e continua descendo
   para revelar o que entra. Nunca há dois ambientes visíveis ao mesmo tempo.

   A varredura é amarrada ao scroll, não ao relógio: o painel fecha exatamente
   quando o capítulo seguinte chega ao topo, que é quando ele começa a ser
   pinado. Cada cortina cuida da seção que vem logo depois dela no HTML. */

import { gsap, reducedMotion } from './motion.js'

for (const curtain of document.querySelectorAll('.curtain')) {
  const proxima = curtain.nextElementSibling
  if (!proxima) continue

  if (reducedMotion) {
    gsap.set(curtain, { display: 'none' })
    continue
  }

  gsap.set(curtain, { yPercent: -100 })

  gsap.timeline({
    scrollTrigger: {
      trigger: proxima,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      // fora da emenda o painel não precisa nem existir para o compositor
      onToggle: ({ isActive }) => gsap.set(curtain, { visibility: isActive ? 'visible' : 'hidden' })
    }
  })
    .to(curtain, { yPercent: 0, duration: 0.5, ease: 'power2.in' })
    .to(curtain, { yPercent: 100, duration: 0.5, ease: 'power2.out' })
}
