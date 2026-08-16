/* O fio — o único elemento presente do topo ao rodapé.

   Substitui o par losango-fixo + trilha-de-pontos. Os pontos só existiam nos
   três capítulos e o losango não dizia nada sobre posição; o fio faz os dois
   trabalhos com um elemento e vale para a página inteira.

   Duas variáveis viajam para o CSS: --t (0 a 1, a altura do losango no fio) e
   --r (a rotação, meia volta ao longo do site). A rotação anda em degraus e a
   transition de 1.1s costura um degrau no seguinte: o giro fica lento e
   contínuo em vez de colado no dedo. A posição não tem degrau — ela é o
   progresso e precisa ser exata.

   Só toca custom properties consumidas por top e transform. Nenhuma leitura
   de layout no scroll: o curso é medido uma vez e no resize. */

import { reducedMotion, ScrollTrigger } from './motion.js'

const spine = document.querySelector('.spine')

if (spine) {
  const mark = spine.querySelector('.spine__mark')
  const PASSOS = 24 // 7,5 graus por degrau

  const clamp01 = (n) => Math.min(Math.max(n, 0), 1)

  let curso = 0
  let ticking = false
  let passo = -1

  const medir = () => {
    curso = document.documentElement.scrollHeight - window.innerHeight
  }

  const update = () => {
    ticking = false

    const progresso = curso > 0 ? clamp01(window.scrollY / curso) : 0
    mark.style.setProperty('--t', progresso.toFixed(4))

    const proximo = Math.round(progresso * PASSOS)
    if (proximo === passo) return

    passo = proximo
    mark.style.setProperty('--r', `${(passo / PASSOS) * 180}deg`)
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  medir()
  update()

  // o fio entra depois da cortina de carregamento, junto com a hero
  requestAnimationFrame(() => spine.classList.add('is-ready'))

  if (!reducedMotion) {
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  /* ── Quando remedir o curso ──────────────────────────────

     `medir()` lê `scrollHeight`, e ler `scrollHeight` força o navegador a
     assentar o layout na hora. Preso ao `resize` cru, isso acontecia a cada
     toque na barra de endereço do telefone — um reflow síncrono no meio da
     rolagem, que é o pior lugar possível para pedir um.

     E era pior do que caro: era errado. O curso mudava (`innerHeight` cresce
     quando a barra recolhe) sem que nada tivesse mudado no documento, então
     o losango recuava no fio sozinho enquanto a pessoa descia.

     Agora só a largura conta, e o recálculo pega carona no `refresh` do
     ScrollTrigger — que é, por definição, o momento em que a altura do
     documento mudou de verdade. Um só dono para "as medidas envelheceram". */
  let larguraMedida = window.innerWidth

  window.addEventListener('resize', () => {
    if (window.innerWidth === larguraMedida) return
    larguraMedida = window.innerWidth
    medir()
    onScroll()
  }, { passive: true })

  ScrollTrigger.addEventListener('refresh', () => {
    medir()
    onScroll()
  })

  // pin e faixa horizontal mudam a altura do documento depois do load
  window.addEventListener('load', () => {
    medir()
    onScroll()
  })
}
