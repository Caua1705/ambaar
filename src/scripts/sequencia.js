/* Seção: .sequencia — o copo enchendo. O clímax do site.

   ── O que estava errado ────────────────────────────────────────────────

   Três coisas, e todas eram minhas, não do material:

   1. Qualidade. Eu tinha empilhado três degradações sobre uma fonte de
      720px: reduzi para 520, passei um desfoque antes de encodar e cortei
      cada quadro em 20 kB. O líquido perdia definição e o copo perdia a
      aresta. Agora são 18 quadros em resolução nativa, sem desfoque
      nenhum, com teto de 52 kB (scripts/frames.mjs). Menos quadros, mais
      quadro.

   2. Ritmo. A sequência disparava sozinha e corria em dois segundos: o
      acontecimento tinha relógio próprio e terminava antes de o leitor
      olhar. Agora ela é presa à rolagem. Foi um erro meu na passada
      anterior tirá-la do scrub com o argumento de que "líquido parado no
      ar é defeito" — nos quadros reais o fio é uma fita contínua de luz,
      e parado ele lê como fotografia de longa exposição, que é
      exatamente o que a imagem é. Preso ao dedo, o acontecimento não pode
      ser perdido: ele É a rolagem do leitor.

   3. Apresentação. Eram três blocos de texto por cima de um vídeo. Agora a
      tipografia tem a mesma mecânica da imagem: cada linha é REVELADA DE
      BAIXO PARA CIMA, com um clipPath que sobe — a palavra enche como o
      copo enche. É a relação entre texto e imagem que faltava, e ela
      distingue esta seção do entardecer, onde o texto entra e fica
      enquanto a imagem muda em volta.

   Sem movimento: nada disso roda. A seção vira os três blocos empilhados e
   legíveis, sem canvas e sem pin. */

import { gsap, ScrollTrigger, reducedMotion, EASE, entrada, prioridadeRefresh } from './motion.js'
import { criarSequencia } from './frames.js'

const TOTAL = 18
const CURSO = 1.35 // frações de tela do curso pinado
const caminho = (i) => `/frames/pour/p_${String(i + 1).padStart(3, '0')}.webp`

/* estados do clipPath: fechado embaixo → aberto → fechado em cima.
   Tudo sobe, sempre, como o líquido. */
const FECHADO_BAIXO = 'inset(100% 0% 0% 0%)'
const ABERTO = 'inset(0% 0% 0% 0%)'
const FECHADO_CIMA = 'inset(0% 0% 100% 0%)'

const secao = document.querySelector('.sequencia')

if (secao) {
  const stage = secao.querySelector('.sequencia__stage')
  const canvas = secao.querySelector('.sequencia__canvas')
  const blocos = [...secao.querySelectorAll('.sequencia__bloco')]

  if (reducedMotion) {
    secao.classList.add('is-estatica')
    gsap.set(secao.querySelectorAll('.sequencia__bloco span'), { clipPath: ABERTO })
    canvas.remove()
  } else {
    const player = criarSequencia({
      palco: stage,
      canvas,
      total: TOTAL,
      caminho,
      frente: 6
    })

    player.carregarPerto(secao, '150%')

    /* ── O copo, preso ao dedo ───────────────────────── */

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: `+=${CURSO * 100}%`,
        pin: stage,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: prioridadeRefresh(secao)
      }
    })

    /* O copo enche em 84% do curso e fica cheio no resto: a última frase
       cai sobre o copo já cheio, que é onde ela quer cair. */
    const quadro = { v: 0 }
    tl.to(quadro, {
      v: TOTAL - 1,
      duration: 0.84,
      ease: 'none',
      onUpdate: () => player.desenhar(quadro.v)
    }, 0)

    /* ── As frases, subindo ──────────────────────────── */

    /* Cada LINHA é revelada por conta própria, escalonada: revelando o
       parágrafo inteiro de baixo para cima, a segunda linha apareceria
       antes da primeira e a frase seria lida ao contrário. */
    const momentos = [0.03, 0.36, 0.66]
    const saidas = [0.3, 0.6, null]

    blocos.forEach((bloco, i) => {
      const linhas = [...bloco.querySelectorAll('span')]
      gsap.set(linhas, { clipPath: FECHADO_BAIXO })

      entrada(secao, (t) => {
        t.to(linhas, { clipPath: ABERTO, duration: 1.1, ease: EASE, stagger: 0.16 }, 0)
      }, { start: () => `top top-=${Math.round(window.innerHeight * CURSO * momentos[i])}` })

      if (saidas[i] === null) return

      const sai = gsap.timeline({ paused: true })
      sai.to(linhas, { clipPath: FECHADO_CIMA, duration: 0.8, ease: EASE, stagger: 0.08 })

      ScrollTrigger.create({
        trigger: secao,
        start: () => `top top-=${Math.round(window.innerHeight * CURSO * saidas[i])}`,
        invalidateOnRefresh: true,
        onEnter: () => sai.play(),
        onLeaveBack: () => sai.reverse()
      })
    })
  }
}
