/* Seção: .carta — os quatro drinks, um por vez.

   A peça impressa mostra os quatro juntos numa página. Aqui cada um tem a sua
   tela: o filete cresce da esquerda, o nome sobe e a receita vem atrás. Ler a
   carta vira um percurso, que é a única coisa que o papel não conseguia fazer.

   O vídeo do líquido abre a seção e sai antes do primeiro drink — é a abertura
   da carta, não papel de parede. Quem carrega o arquivo é o video.js; aqui só
   se trata da opacidade dele. */

import { gsap, reducedMotion, EASE } from './motion.js'

const carta = document.querySelector('.carta')

if (carta) {
  const video = carta.querySelector('.carta__video')
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
      .to(head, { opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.18 })

    // o líquido acende e apaga com a tela de abertura: nunca acompanha a lista
    if (video) {
      gsap.fromTo(video,
        { opacity: 0 },
        {
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: {
            trigger: carta.querySelector('.carta__open'),
            start: 'top bottom',
            end: 'top top',
            scrub: 1
          }
        })

      gsap.to(video, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: carta.querySelector('.carta__open'),
          start: 'bottom 80%',
          end: 'bottom top',
          scrub: 1
        }
      })
    }

    /* ── Um drink por vez ────────────────────────────── */

    for (const drink of drinks) {
      const rule = drink.querySelector('.drink__rule')
      const name = drink.querySelector('.drink__name')
      const mix = drink.querySelector('.drink__mix')

      gsap.set([name, mix], { opacity: 0, y: 26 })

      gsap.timeline({
        scrollTrigger: { trigger: drink, start: 'top 78%', once: true }
      })
        .to(rule, { scaleX: 1, duration: 1.4, ease: EASE }, 0)
        .to(name, { opacity: 1, y: 0, duration: 1, ease: EASE }, 0.18)
        .to(mix, { opacity: 1, y: 0, duration: 1, ease: EASE }, 0.38)
    }
  }
}
