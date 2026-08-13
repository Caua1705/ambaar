/* Seção: .pausa — a hora virando entre dois ambientes.

   A montagem e o porquê da seção estão em pausa.css. Aqui mora o que se
   move, e são duas coisas:

   1. Os dois quadros correm lateralmente em SENTIDOS CONTRÁRIOS enquanto a
      seção atravessa a tela, com amplitudes diferentes. É isso que faz a
      dupla ler como composição em vez de duas camadas de paralaxe: quando
      dois elementos andam juntos o olho vê profundidade, quando andam
      contra o olho vê montagem. O retrato abre para dentro do quadro, o
      detalhe corre para fora — no fim da seção a composição está mais
      aberta do que começou.

      Cada foto ainda anda dentro do próprio quadro, ao contrário do
      quadro, com um terço da amplitude. São três velocidades numa tela de
      duas imagens.

   2. A hora e a frase entram por gatilho, no tempo delas — como todo texto
      do site. O algarismo primeiro, a frase atrás: a pausa diz que horas
      são e só então diz o que está acontecendo.

   Sem pin: uma passada de dedo atravessa a seção inteira, que é o que uma
   pausa tem de ser. O curso do deslocamento é a própria travessia. */

import { gsap, reducedMotion, EASE, entrada } from './motion.js'

/* deslocamento em vw: [quadro, foto dentro do quadro] */
const CURSO = {
  um: { retrato: [-9, 4], detalhe: [13, -5] },
  dois: { retrato: [8, -3], detalhe: [-12, 5] }
}

for (const pausa of document.querySelectorAll('.pausa')) {
  const retrato = pausa.querySelector('.pausa__quadro--retrato')
  const detalhe = pausa.querySelector('.pausa__quadro--detalhe')
  const hora = pausa.querySelector('.pausa__hora')
  const linha = pausa.querySelector('.pausa__linha')

  const curso = CURSO[pausa.classList.contains('pausa--dois') ? 'dois' : 'um']

  if (reducedMotion) {
    gsap.set([hora, linha], { opacity: 1, y: 0 })
    continue
  }

  gsap.set([hora, linha], { opacity: 0, y: 20 })

  /* ── Os quadros, presos ao dedo ──────────────────────── */

  const deriva = (quadro, [fora, dentro]) => {
    if (!quadro) return

    const comum = {
      ease: 'none',
      scrollTrigger: {
        trigger: pausa,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    }

    gsap.fromTo(quadro,
      { xPercent: -fora * 0.5 },
      { xPercent: fora * 0.5, ...comum })

    gsap.fromTo(quadro.querySelector('img'),
      { xPercent: -dentro * 0.5 },
      { xPercent: dentro * 0.5, ...comum })
  }

  deriva(retrato, curso.retrato)
  deriva(detalhe, curso.detalhe)

  /* ── O algarismo e a frase, por gatilho ──────────────── */

  entrada(pausa, (t) => {
    t.to(hora, { opacity: 1, y: 0, duration: 1.1, ease: EASE }, 0)
      .to(linha, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 0.35)
  }, { start: 'top 58%' })
}
