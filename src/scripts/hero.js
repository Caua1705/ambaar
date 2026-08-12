/* Seção: .hero — a máscara de texto e a saída ligada à rolagem.

   O wordmark deixa de ser âmbar sólido e vira janela: a foto da hero aparece
   dentro das letras (background-clip: text). A camada da máscara ocupa a hero
   inteira, então o recorte cai exatamente sobre a foto do fundo; o que separa
   um do outro é o brightness aplicado só ao fundo, no CSS.

   Onde background-clip: text não existe, o CSS devolve o âmbar sólido e aqui
   se desliga só o deslocamento do fundo — o resto da coreografia continua. */

import { gsap, reducedMotion, EASE } from './motion.js'
import { preloaded } from './preloader.js'

const hero = document.querySelector('.hero')
const mark = document.querySelector('.hero__mark')

const temMascara =
  CSS.supports('background-clip', 'text') || CSS.supports('-webkit-background-clip', 'text')

if (hero && mark) {
  if (temMascara) hero.classList.add('has-mask')

  if (!reducedMotion) {
    const secundarios = [
      hero.querySelector('.hero__place'),
      hero.querySelector('.hero__sub'),
      hero.querySelector('.hero__scroll')
    ].filter(Boolean)

    // partir a palavra em caracteres quebraria a máscara: cada transform
    // criaria uma caixa nova e o recorte da foto pularia junto. O varrimento
    // por clipPath entrega as letras na mesma ordem, sem tocar no layout
    gsap.set(mark, { clipPath: 'inset(0% 100% 0% 0%)' })
    gsap.set(secundarios, { opacity: 0, y: 16 })

    preloaded.then(() => {
      gsap.timeline()
        .to(mark, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE })
        .to(secundarios, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.12 }, 0.6)

      /* ── Saída: a foto corre dentro das letras ───────── */

      // A timeline de saída nasce aqui, e não junto com a de entrada, porque
      // ela grava o valor inicial de cada alvo no momento em que é criada:
      // criada antes, gravaria o opacity 0 do estado de espera e apagaria a
      // entrada a cada quadro.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })

      tl.to(mark, { scale: 1.15, duration: 1, ease: 'none' }, 0)
        .to(secundarios, { opacity: 0, duration: 0.35, ease: 'none', immediateRender: false }, 0)
        // o wordmark só apaga no fim: é a última coisa a deixar a tela
        .to(hero.querySelector('.hero__content'), { opacity: 0, duration: 0.4, ease: 'none' }, 0.6)

      // paralaxe da imagem dentro do recorte das letras
      if (temMascara) {
        tl.to(mark, { backgroundPositionY: '75%', duration: 1, ease: 'none' }, 0)
      }
    })
  }
}
