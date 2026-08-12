/* Seção: .outro — o fechamento.

   O rodapé deixa de ser um bloco parado no fim: as partículas convergem para
   o centro, o losango cresce girando, o wordmark entra letra a letra e os
   horários e o @ambar.bar assentam por último.

   Sem pin — a timeline corre entre a entrada do rodapé e o fim da página, que
   é exatamente o curso que sobra. Pinar aqui roubaria o fim do documento. */

import { gsap, reducedMotion, EASE, splitChars } from './motion.js'

const outro = document.querySelector('.outro')

if (outro) {
  const bg = outro.querySelector('.outro__bg')
  const marca = outro.querySelector('.outro__mark')
  const nome = outro.querySelector('.outro__name')
  const cauda = [
    outro.querySelector('.outro__line'),
    outro.querySelector('.outro__foot')
  ].filter(Boolean)

  const chars = splitChars(nome)

  if (reducedMotion) {
    gsap.set([...chars, ...cauda, marca], { opacity: 1, y: 0, scale: 1 })
  } else {
    gsap.set(chars, { opacity: 0, y: 18 })
    gsap.set(cauda, { opacity: 0, y: 16 })
    gsap.set(marca, { opacity: 0, scale: 0.2, rotate: -90 })

    gsap.timeline({
      scrollTrigger: {
        trigger: outro,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1
      }
    })
      // as partículas fecham para dentro
      .fromTo(bg,
        { scale: 1.45, opacity: 0.12 },
        { scale: 1, opacity: 0.25, duration: 1, ease: 'none' }, 0)
      .to(marca, { opacity: 1, scale: 1, rotate: 0, duration: 0.3, ease: EASE }, 0.2)
      .to(chars, { opacity: 1, y: 0, duration: 0.25, ease: EASE, stagger: 0.03 }, 0.38)
      .to(cauda, { opacity: 1, y: 0, duration: 0.25, ease: EASE, stagger: 0.08 }, 0.62)
  }
}
