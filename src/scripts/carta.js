/* Seção: .carta — os quatro drinks, um por vez.

   A peça impressa mostra os quatro juntos numa página. Aqui cada um tem a sua
   tela: o filete cresce da esquerda, o nome sobe e a receita vem atrás. Ler a
   carta vira um percurso, que é a única coisa que o papel não conseguia fazer.

   A abertura é só tipografia. Havia ali um vídeo de líquido dourado; saiu, e
   o que sobrou — duas linhas centradas no escuro — é mais próximo do que a
   peça impressa fazia, que era abrir a carta com o nome dela e nada mais. */

import { gsap, reducedMotion, EASE, DUR_TEXTO, DUR_TRACO, STAGGER } from './motion.js'

const carta = document.querySelector('.carta')

if (carta) {
  const head = [...carta.querySelectorAll('.carta__eyebrow, .carta__note')]
  const drinks = [...carta.querySelectorAll('.drink')]

  if (reducedMotion) {
    gsap.set(head, { opacity: 1, y: 0 })
    for (const drink of drinks) {
      gsap.set(drink.querySelectorAll('.drink__name, .drink__mix'), { opacity: 1, y: 0 })
      gsap.set(drink.querySelector('.drink__rule'), { scaleX: 1 })
    }
  } else {
    /* ── Abertura ────────────────────────────────────── */

    gsap.set(head, { opacity: 0, y: 22 })

    gsap.timeline({
      scrollTrigger: { trigger: carta, start: 'top 70%', once: true }
    })
      .to(head, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE, stagger: STAGGER })

    /* ── Um drink por vez ────────────────────────────── */

    for (const drink of drinks) {
      const rule = drink.querySelector('.drink__rule')
      const name = drink.querySelector('.drink__name')
      const mix = drink.querySelector('.drink__mix')

      gsap.set([name, mix], { opacity: 0, y: 26 })

      gsap.timeline({
        scrollTrigger: { trigger: drink, start: 'top 78%', once: true }
      })
        .to(rule, { scaleX: 1, duration: DUR_TRACO, ease: EASE }, 0)
        .to(name, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE }, 0.18)
        .to(mix, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE }, 0.38)
    }
  }
}
