/* Seção: .hero — a marca entrando e o bastão passado ao manifesto.

   A entrada continua sendo um varrimento por clipPath: partir a palavra em
   caracteres criaria uma caixa por letra e o tracking largo se desfaria.
   O filete e a assinatura abrem depois, do centro para fora, no eixo em que
   o lockup está construído.

   A saída não é um apagamento. O nome e a assinatura recolhem na direção do
   filete, e o filete — livre dos dois — se estica de ponta a ponta da tela e
   é a última coisa a sumir. É ele que reaparece no manifesto: um objeto que
   atravessa a emenda em vez de duas seções que se sucedem. */

import { gsap, reducedMotion, EASE, DUR_TEXTO, STAGGER } from './motion.js'
import { preloaded } from './preloader.js'

const hero = document.querySelector('.hero')
const mark = document.querySelector('.hero__mark')

if (hero && mark && !reducedMotion) {
  const rule = hero.querySelector('.hero__rule')
  const tag = hero.querySelector('.hero__tag')
  const bg = hero.querySelector('.hero__bg img')
  const cantos = [
    hero.querySelector('.hero__place'),
    hero.querySelector('.hero__scroll')
  ].filter(Boolean)

  gsap.set(mark, { clipPath: 'inset(0% 100% 0% 0%)' })
  gsap.set(tag, { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0 })
  gsap.set(cantos, { opacity: 0, y: 16 })

  preloaded.then(() => {
    gsap.timeline()
      // o varrimento da marca é a única duração própria do site: é a
      // abertura, e ela precisa durar mais que qualquer entrada interna
      .to(mark, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE })
      .to(rule, { scaleX: 1, duration: DUR_TEXTO, ease: EASE }, 0.9)
      .to(tag, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: DUR_TEXTO, ease: EASE }, 1.05)
      .to(cantos, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE, stagger: STAGGER }, 0.7)

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
        scrub: 1,
        // o esticão do filete é medido em largura de tela
        invalidateOnRefresh: true
      }
    })
      // a foto recua enquanto o lockup fica: profundidade sem paralaxe de
      // duas velocidades brigando entre si
      .to(bg, { scale: 1.14, duration: 1, ease: 'none' }, 0)
      .to(cantos, { opacity: 0, duration: 0.3, ease: 'none', immediateRender: false }, 0)
      // nome e assinatura recolhem na direção do filete
      .to(mark, { y: 42, opacity: 0, duration: 0.45, ease: 'none', immediateRender: false }, 0.3)
      .to(tag, { y: -30, opacity: 0, duration: 0.45, ease: 'none', immediateRender: false }, 0.3)
      // e o filete, sozinho, vira a linha do horizonte antes de apagar.
      // scaleX e não width: largura é layout, e este site não anima layout
      .to(rule, {
        scaleX: () => window.innerWidth / (rule.offsetWidth || 1),
        duration: 0.4,
        ease: 'none',
        immediateRender: false
      }, 0.5)
      .to(rule, { opacity: 0, duration: 0.15, ease: 'none' }, 0.85)
  })
}
