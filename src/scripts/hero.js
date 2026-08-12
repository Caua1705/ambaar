/* Seção: .hero — a entrada do wordmark e a saída ligada à rolagem.

   O wordmark é âmbar sólido sobre a foto. Havia aqui uma máscara com a foto
   recortada dentro das letras; saiu porque deixava a marca de densidade
   irregular, e com ela saíram as duas coisas que existiam só para sustentá-la:
   a checagem de suporte a background-clip e a paralaxe do fundo dentro do
   recorte, que era a única animação do site fora do trio
   transform/opacity/clipPath.

   A entrada continua sendo um varrimento por clipPath: partir a palavra em
   caracteres criaria uma caixa por letra e o tracking largo se desfaria. */

import { gsap, reducedMotion, EASE, DUR_TEXTO, STAGGER } from './motion.js'
import { preloaded } from './preloader.js'

const hero = document.querySelector('.hero')
const mark = document.querySelector('.hero__mark')

if (hero && mark && !reducedMotion) {
  const secundarios = [
    hero.querySelector('.hero__place'),
    hero.querySelector('.hero__sub'),
    hero.querySelector('.hero__scroll')
  ].filter(Boolean)

  gsap.set(mark, { clipPath: 'inset(0% 100% 0% 0%)' })
  gsap.set(secundarios, { opacity: 0, y: 16 })

  preloaded.then(() => {
    gsap.timeline()
      // o varrimento do wordmark é a única duração própria do site: é a
      // abertura, e ela precisa durar mais que qualquer entrada interna
      .to(mark, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE })
      .to(secundarios, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE, stagger: STAGGER }, 0.6)

    /* ── Saída ───────────────────────────────────────── */

    // A timeline de saída nasce aqui, e não junto com a de entrada, porque
    // ela grava o valor inicial de cada alvo no momento em que é criada:
    // criada antes, gravaria o opacity 0 do estado de espera e apagaria a
    // entrada a cada quadro.
    gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    })
      .to(mark, { scale: 1.15, duration: 1, ease: 'none' }, 0)
      .to(secundarios, { opacity: 0, duration: 0.35, ease: 'none', immediateRender: false }, 0)
      // o wordmark só apaga no fim: é a última coisa a deixar a tela
      .to(hero.querySelector('.hero__content'), { opacity: 0, duration: 0.4, ease: 'none' }, 0.6)
  })
}
