/* Seção: .cartaz — o cartaz da noite, reconstruído em tipografia.

   Uma ideia por tela: três palavras, grandes, e nada mais. Cada palavra mora
   numa janela com overflow hidden e sobe de dentro dela — o corte é limpo
   porque quem anda é o span interno, nunca a janela.

   A entrada é ao scroll mas não é scrub: as palavras sobem uma vez, no tempo
   delas, quando a seção chega. Amarrar as três ao dedo do usuário tiraria
   delas o peso de cartaz — um cartaz não se monta devagar, ele aparece. */

import { gsap, reducedMotion, EASE, DUR_TEXTO, STAGGER } from './motion.js'

const cartaz = document.querySelector('.cartaz')

if (cartaz) {
  const eyebrow = cartaz.querySelector('.cartaz__eyebrow')
  const words = [...cartaz.querySelectorAll('.cartaz__word > span')]
  const mark = cartaz.querySelector('.cartaz__mark')
  const foot = cartaz.querySelector('.cartaz__foot')
  const bg = cartaz.querySelector('.cartaz__bg')

  if (reducedMotion) {
    gsap.set([eyebrow, ...words, mark, foot], { opacity: 1, yPercent: 0, scale: 1 })
  } else {
    gsap.set([eyebrow, foot], { opacity: 0, y: 14 })
    gsap.set(words, { yPercent: 115 })
    gsap.set(mark, { opacity: 0, scale: 0.4, rotate: -45 })

    gsap.timeline({
      scrollTrigger: { trigger: cartaz, start: 'top 65%', once: true }
    })
      .to(eyebrow, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE }, 0)
      // as palavras caem uma de cada vez, não juntas
      .to(words, { yPercent: 0, duration: DUR_TEXTO, ease: EASE, stagger: STAGGER }, 0.2)
      .to(mark, { opacity: 0.75, scale: 1, rotate: 0, duration: DUR_TEXTO, ease: EASE }, 0.85)
      .to(foot, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE }, 1)

    /* ── O fundo desfocado anda devagar enquanto a seção passa ── */

    // a escala é repetida nos dois estados de propósito: ela vem do CSS e é o
    // que impede a borda desfocada de descobrir os cantos — deixá-la implícita
    // dependeria de o GSAP decompor a matriz do jeito certo
    gsap.fromTo(bg,
      { yPercent: -6, scale: 1.2 },
      {
        yPercent: 6,
        scale: 1.2,
        ease: 'none',
        scrollTrigger: {
          trigger: cartaz,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      })
  }
}
