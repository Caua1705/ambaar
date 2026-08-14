/* A pista · 22h.

   O porquê está no HTML e a composição em pista.css. Aqui está o tempo, e
   ele mistura duas classes de movimento (motion.js) na mesma tela — o que
   acontece em três seções do site inteiro, e sempre pela mesma razão: há
   uma coisa que o usuário faz acontecer e uma coisa que acontece sozinha.

     CLASSE 2  os dois quadros e a frase. Disparados na entrada, correm na
               velocidade deles, terminam com o dedo parado.
     CLASSE 3  o arrasto do fundo. Deriva sozinho enquanto a seção está em
               cena e para quando ela sai.

   ── Por que o fundo é classe 3 ──────────────────────────────────────────

   Porque ele é o único elemento da tela que não é um instante. Os dois
   quadros são fotografias paradas — eles chegam e ficam. O arrasto é a
   sala continuando a se mexer atrás deles, e uma coisa que continua não
   pode ter fim de animação: se ele parasse, os três elementos ficariam
   igualmente imóveis e a montagem viraria uma colagem.

   Duas senoides de períodos primos entre si, amplitude pequena. Não é
   paralaxe — ninguém olha para o arrasto — é uma coisa que não está parada.

   ── Os dois quadros chegam de fora, cada um pelo seu lado ───────────────

     0,00  o traço do rótulo
     0,25  O DE CIMA entra pela esquerda, deslizando: 22% de deslocamento
           mais um clipPath que abre da esquerda para a direita. Ele é o
           plano geral, e planos gerais chegam antes
     0,85  O DE PERTO entra pela direita, no sentido contrário. A
           sobreposição das quinas acontece durante os últimos 0,4s do
           primeiro: as duas fotografias se cruzam em movimento, e é esse
           cruzamento que faz a montagem ler como profundidade em vez de
           como duas caixas
     1,70  a frase

   Direções opostas, como no díptico da cabine — e a diferença é que lá as
   duas aberturas se ENCONTRAM num filete e param; aqui elas se ATRAVESSAM.

   ── A saída ─────────────────────────────────────────────────────────────

   Os dois quadros continuam na direção em que vinham e saem pelos lados
   opostos aos de onde entraram, o que abre o arrasto por um instante antes
   de a seção sair — a matéria embaixo da montagem fica sozinha na tela por
   meio segundo. É a única saída do site que revela uma camada em vez de
   esconder uma. */

import { gsap, ScrollTrigger, reducedMotion, EASE, autonomo, laco } from './motion.js'

const secao = document.querySelector('.pista')

if (secao) {
  const dash = secao.querySelector('.pista__dash')
  const arrasto = secao.querySelector('.pista__arrasto')
  const alto = secao.querySelector('.pista__quadro--alto')
  const perto = secao.querySelector('.pista__quadro--perto')
  const linha = secao.querySelector('.pista__linha')

  const ABERTO = 'inset(0% 0% 0% 0%)'
  const DA_ESQUERDA = 'inset(0% 0% 0% 100%)'
  const DA_DIREITA = 'inset(0% 100% 0% 0%)'

  if (reducedMotion) {
    gsap.set([alto, perto], { clipPath: ABERTO, x: 0 })
    gsap.set(linha, { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
  } else {
    gsap.set(linha, { opacity: 0, y: 20 })
    gsap.set(alto, { clipPath: DA_ESQUERDA })
    gsap.set(perto, { clipPath: DA_DIREITA })

    /* ── O arrasto deriva ────────────────────────────────
       Períodos de 7,7s e 11,3s: o desenho nunca fecha o ciclo, então nunca
       se repete visivelmente. É o mesmo princípio do pó do fecho, aplicado
       a uma imagem que está atrás de outras duas. */
    let t = 0
    laco(secao, (dt) => {
      t += dt
      gsap.set(arrasto, {
        xPercent: Math.sin(t * 0.13) * 3.2,
        yPercent: Math.cos(t * 0.088) * 2.4,
        scale: 1.18 + Math.sin(t * 0.061) * 0.035
      })
    })

    autonomo(secao, (t2) => {
      t2.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .fromTo(alto,
          { xPercent: -22 },
          { xPercent: 0, duration: 1.6, ease: EASE }, 0.25)
        .to(alto, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.25)
        .fromTo(perto,
          { xPercent: 22 },
          { xPercent: 0, duration: 1.6, ease: EASE }, 0.85)
        .to(perto, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.85)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.7)
    }, { start: 'top 82%' })

    /* ── A saída: os quadros continuam ─────────────────── */

    const saida = gsap.timeline({ paused: true })
    saida.to(linha, { opacity: 0, y: -16, duration: 0.7, ease: EASE }, 0)
      .to(alto, { xPercent: -30, opacity: 0, duration: 1.1, ease: EASE }, 0.05)
      .to(perto, { xPercent: 30, opacity: 0, duration: 1.1, ease: EASE }, 0.15)

    ScrollTrigger.create({
      trigger: secao,
      start: 'bottom 58%',
      invalidateOnRefresh: true,
      onEnter: () => saida.play(),
      onLeaveBack: () => saida.reverse()
    })
  }
}
