/* Seção: .som — o silêncio.

   É a única seção sem pin, sem scrub e sem mídia, e o script reflete isso:
   quase não há o que animar. As frases entram pelo reveal.js genérico, como
   qualquer texto do site; o que mora aqui é só o filete vertical da nota
   final, que cresce de cima para baixo antes de o texto miúdo aparecer.

   Deliberadamente não há mais nada. Amarrar esta seção ao scroll devolveria a
   ela o ritmo das outras e ela deixaria de ser o respiro que justifica o resto. */

import { gsap, reducedMotion, EASE, DUR_TRACO } from './motion.js'

const rule = document.querySelector('.som__rule')

if (rule) {
  if (reducedMotion) {
    gsap.set(rule, { scaleY: 1 })
  } else {
    gsap.fromTo(rule,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: DUR_TRACO,
        ease: EASE,
        scrollTrigger: { trigger: rule, start: 'top 85%', once: true }
      })
  }
}
