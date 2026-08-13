/* Seção: .pausa — a hora virando entre dois ambientes.

   A montagem e o porquê da seção estão em pausa.css. Aqui mora o que se
   move, e agora são três coisas:

   1. A BORDA ABRE. Cada quadro nasce como um filete na própria borda de
      sangria e se desdobra até o formato cheio, por clipPath. A pausa é a
      única composição do site com bordas visíveis — é o que a distingue das
      vizinhas antes de qualquer animação —, e até agora a borda era só um
      contorno. Agora ela é o gesto de entrada: a moldura ABRE, e o que ela
      revela é a fotografia.

      A direção segue a sangria de cada quadro: o que sangra pela direita
      abre da direita para a esquerda, o que sangra pela esquerda abre ao
      contrário. Cada quadro parece estar entrando pela borda por onde ele
      já sai da tela.

   2. Os dois quadros correm lateralmente em SENTIDOS CONTRÁRIOS enquanto a
      seção atravessa a tela, com amplitudes diferentes. É isso que faz a
      dupla ler como composição em vez de duas camadas de paralaxe: quando
      dois elementos andam juntos o olho vê profundidade, quando andam
      contra o olho vê montagem.

      Cada foto ainda anda dentro do próprio quadro, ao contrário do quadro,
      com um terço da amplitude. São três velocidades numa tela de duas
      imagens.

   3. A frase entra por gatilho, no tempo dela — como todo texto do site.

   A hora não está mais aqui: é o relógio da casa (relogio.js), que passa
   por TRÁS dos dois quadros. Era a última peça que faltava para a pausa
   deixar de ser uma montagem plana.

   Sem pin: uma passada de dedo atravessa a seção inteira, que é o que uma
   pausa tem de ser. O curso do deslocamento é a própria travessia. */

import { gsap, reducedMotion, EASE, entrada } from './motion.js'

/* deslocamento em vw: [quadro, foto dentro do quadro] */
const CURSO = {
  um: { retrato: [-9, 4], detalhe: [13, -5] },
  dois: { retrato: [8, -3], detalhe: [-12, 5] }
}

/* De que borda cada quadro abre. É a borda por onde ele sangra: a abertura
   e a sangria passam a ser o mesmo eixo. */
const ABRE = {
  um: { retrato: 'dir', detalhe: 'esq' },
  dois: { retrato: 'esq', detalhe: 'dir' }
}

const FECHADO = {
  esq: 'inset(0% 0% 0% 100%)',
  dir: 'inset(0% 100% 0% 0%)'
}

const ABERTO = 'inset(0% 0% 0% 0%)'

for (const pausa of document.querySelectorAll('.pausa')) {
  const retrato = pausa.querySelector('.pausa__quadro--retrato')
  const detalhe = pausa.querySelector('.pausa__quadro--detalhe')
  const linha = pausa.querySelector('.pausa__linha')

  const dois = pausa.classList.contains('pausa--dois')
  const curso = CURSO[dois ? 'dois' : 'um']
  const abre = ABRE[dois ? 'dois' : 'um']

  if (reducedMotion) {
    gsap.set(linha, { opacity: 1, y: 0 })
    continue
  }

  gsap.set(linha, { opacity: 0, y: 20 })
  gsap.set(retrato, { clipPath: FECHADO[abre.retrato] })
  gsap.set(detalhe, { clipPath: FECHADO[abre.detalhe] })

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

  /* ── A abertura e a frase, por gatilho ───────────────── */

  /* O retrato abre primeiro e devagar; o detalhe entra atrás dele, mais
     curto — é o mesmo intervalo de uma respiração. A frase fecha o grupo:
     a pausa mostra a sala e só então diz o que está acontecendo nela. */
  entrada(pausa, (t) => {
    t.to(retrato, { clipPath: ABERTO, duration: 1.5, ease: EASE }, 0)
      .to(detalhe, { clipPath: ABERTO, duration: 1.2, ease: EASE }, 0.28)
      .to(linha, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 0.62)
  }, { start: 'top 72%' })
}
