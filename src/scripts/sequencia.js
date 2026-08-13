/* Seção: .sequencia — o copo enchendo.

   A segunda sequência de quadros do site, e o contrário da primeira. No
   Jardim a rolagem É o tempo: cada posição corresponde a uma hora do
   entardecer, e por isso lá o scrub é o efeito. Aqui não. O líquido tem o
   tempo dele, e amarrá-lo ao dedo tinha duas consequências ruins:

     · custava 4,2 telas de rolagem — a seção mais cara do site — para
       entregar três frases curtas;
     · quem parava de rolar parava o líquido no meio do copo, o que é
       exatamente a leitura errada. Um líquido que para no ar é um defeito,
       não uma pausa.

   Agora ela dispara quando a seção chega e corre sozinha, em dois
   segundos. Uma passada de dedo entrega o copo cheio. O curso caiu de 320%
   para 110%, e as três frases entram por gatilho, uma por vez, sem nunca
   coexistirem: a tela tem uma frase de cada vez, e a posição e a escala
   mudam a cada uma para o olho não se acomodar.

   Sem movimento: nada disso roda. A seção vira os três blocos empilhados e
   legíveis, sem canvas e sem pin. */

import { gsap, ScrollTrigger, reducedMotion, EASE, entrada, prioridadeRefresh } from './motion.js'
import { criarSequencia } from './frames.js'

const TOTAL = 24
const CURSO = 0.95 // fração de tela do curso pinado
const DURACAO = 2 // segundos de reprodução, ~12 quadros por segundo
const caminho = (i) => `/frames/pour/p_${String(i + 1).padStart(3, '0')}.webp`

const secao = document.querySelector('.sequencia')

if (secao) {
  const stage = secao.querySelector('.sequencia__stage')
  const canvas = secao.querySelector('.sequencia__canvas')
  const blocos = [...secao.querySelectorAll('.sequencia__bloco')]

  if (reducedMotion) {
    secao.classList.add('is-estatica')
    gsap.set(blocos, { opacity: 1, y: 0 })
    canvas.remove()
  } else {
    const player = criarSequencia({
      palco: stage,
      canvas,
      total: TOTAL,
      caminho,
      // ela corre sozinha e não espera o dedo: os quadros precisam estar
      // todos em casa antes do play, não chegando durante
      frente: 8
    })

    player.carregarPerto(secao, '200%')

    /* ── O pin: só para segurar a cena enquanto o texto passa ── */

    gsap.timeline({
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: '+=95%',
        pin: stage,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: prioridadeRefresh(secao)
      }
    })

    /* ── O líquido, no tempo dele ────────────────────── */

    const quadro = { v: 0 }
    const correr = gsap.to(quadro, {
      v: TOTAL - 1,
      duration: DURACAO,
      ease: 'none',
      paused: true,
      onUpdate: () => player.desenhar(quadro.v)
    })

    ScrollTrigger.create({
      trigger: secao,
      start: 'top 70%',
      once: true,
      onEnter: () => correr.play()
    })

    /* ── As três frases, uma por vez ─────────────────── */

    /* Cada bloco tem o seu gatilho dentro do curso pinado, medido em fração
       de tela rolada. Entram e saem no tempo deles; o dedo escolhe quando,
       não quanto. */
    const momentos = [0.02, 0.4, 0.76]

    blocos.forEach((bloco, i) => {
      gsap.set(bloco, { opacity: 0, y: 28 })

      entrada(secao, (t) => {
        t.to(bloco, { opacity: 1, y: 0, duration: 0.8, ease: EASE }, 0)
      }, { start: () => `top top-=${Math.round(window.innerHeight * CURSO * momentos[i])}` })

      // a saída de cada bloco é a entrada do seguinte: o último fica
      if (i === blocos.length - 1) return

      const sai = gsap.timeline({ paused: true })
      sai.to(bloco, { opacity: 0, y: -22, duration: 0.6, ease: EASE })

      ScrollTrigger.create({
        trigger: secao,
        start: () => `top top-=${Math.round(window.innerHeight * CURSO * (momentos[i + 1] - 0.06))}`,
        invalidateOnRefresh: true,
        onEnter: () => sai.play(),
        onLeaveBack: () => sai.reverse()
      })
    })
  }
}
