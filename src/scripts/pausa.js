/* Seção: .pausa — a meia-noite virando entre dois ambientes.

   A montagem e o porquê da seção estão em pausa.css. Aqui mora o que se
   move, e são três coisas:

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

   ── Uma pausa, não duas ─────────────────────────────────────────────────

   Este arquivo servia duas seções espelhadas, às 20h e às 00h. A das 20h
   foi absorvida pelo capítulo 02 — a sala agora enche na tela, e uma
   seção que descrevia o que a seguinte ia mostrar era uma legenda. O laço
   de vídeo que morava no detalhe dela saiu junto: sem aquela moldura ele
   não tinha onde ser pequeno e emoldurado, que eram as duas condições que
   o faziam funcionar.

   O laço percorre `document.querySelectorAll('.pausa')` de propósito: se
   um dia voltar a haver duas, nada aqui precisa mudar.

   Sem pin: uma passada de dedo atravessa a seção inteira, que é o que uma
   pausa tem de ser. O curso do deslocamento é a própria travessia. */

import { gsap, reducedMotion, EASE, entrada } from './motion.js'

/* deslocamento em vw: [quadro, foto dentro do quadro] */
const CURSO = { retrato: [8, -3], detalhe: [-12, 5] }

/* De que borda cada quadro abre. É a borda por onde ele sangra: a abertura
   e a sangria passam a ser o mesmo eixo. */
const ABRE = { retrato: 'esq', detalhe: 'dir' }

const FECHADO = {
  esq: 'inset(0% 0% 0% 100%)',
  dir: 'inset(0% 100% 0% 0%)'
}

const ABERTO = 'inset(0% 0% 0% 0%)'

for (const pausa of document.querySelectorAll('.pausa')) {
  const retrato = pausa.querySelector('.pausa__quadro--retrato')
  const detalhe = pausa.querySelector('.pausa__quadro--detalhe')
  const linha = pausa.querySelector('.pausa__linha')

  const curso = CURSO
  const abre = ABRE

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
     a pausa mostra a sala e só então diz o que está acontecendo nela.

     ── Por que o gatilho subiu de 72% para 94% ───────────────────────────

     Metade do conserto da imagem órfã, e a outra metade está na saída do
     capítulo 02 (chapters.js).

     A 72% as molduras só começavam a abrir quando a seção já ocupava um
     terço da tela. O que subia por baixo da fotografia do Salão, portanto,
     eram dois retângulos FECHADOS — nada, em cima de nada —, e a abertura
     acontecia depois, com a composição já parada no meio do quadro. A
     entrada era um evento que chegava atrasado em relação à própria
     chegada, e uma seção que se monta depois de já ter chegado parece ter
     caído ali.

     A 94% as molduras abrem enquanto a seção ainda está entrando pelo pé da
     tela. O que o usuário vê aparecer por baixo da fotografia que sai é uma
     coisa JÁ ACONTECENDO — e é isso que faz a diferença entre uma seção que
     chega e uma seção que é descoberta. */
  entrada(pausa, (t) => {
    t.to(retrato, { clipPath: ABERTO, duration: 1.5, ease: EASE }, 0)
      .to(detalhe, { clipPath: ABERTO, duration: 1.2, ease: EASE }, 0.28)
      .to(linha, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 0.62)
  }, { start: 'top 94%' })
}
