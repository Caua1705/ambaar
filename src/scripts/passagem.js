/* A passagem · 23h — seção nova, e ela era o fim do capítulo 02.

   ── Por que ela saiu de lá ──────────────────────────────────────────────

   A passagem funcionava e estava enfiada dentro do curso do Salão,
   disputando os mesmos pixels de rolagem com a sala enchendo. Duas ideias
   num curso só: a sala enche E a câmera entra. O capítulo pagava por ambas
   e não tinha comprimento para nenhuma — que é metade da razão de ele
   custar cinco passadas de dedo.

   Separada, cada uma tem o seu. E a hora que faltava aparece: o site ia de
   20—23h direto para 00h e pulava justamente o pico da noite.

   ── Três estágios, uma distância ────────────────────────────────────────

     1. o plano da sala, correndo sozinho, ESCALA — a multidão cresce e
        perde legibilidade
     2. no ponto de menor legibilidade, dissolve num corpo desfeito por um
        giro de obturador: a MESMA matéria dos 34 quadros, a um metro em vez
        de a seis
     3. e o borrão resolve num rosto

   Nada troca de assunto. Só de distância. É por isso que a emenda pode ser
   uma dissolução em vez do corte seco que havia aqui duas passadas atrás:
   o que muda entre um estágio e o seguinte não é O QUE se vê, é DE ONDE.

   ── Classe 2, e por quê ─────────────────────────────────────────────────

   Disparada. Isto é um GESTO — uma câmera andando —, e um gesto entregue
   em fatias proporcionais ao dedo deixa de ser gesto: pararia no meio do
   percurso, com a sala meio dissolvida no borrão, que é a única posição em
   que a composição não significa nada.

   A sala continua correndo sozinha por baixo (classe 3, `sala-2`), então
   mesmo com o polegar parado no meio da dissolução há movimento na tela.

   ── E o rosto é empurrado para fora ─────────────────────────────────────

   A pausa das 00h é descoberta por baixo de uma pessoa. É deslocamento, e
   nenhuma emenda vizinha usa este dispositivo. */

import {
  gsap, ScrollTrigger, reducedMotion, EASE, autonomo, laco, relogioComPiso
} from './motion.js'
import { criarSequencia } from './frames.js'

const secao = document.querySelector('.passagem')

if (secao) {
  const plano = secao.querySelector('.passagem__plano--sala')
  const luz = secao.querySelector('.passagem__plano--luz')
  const rosto = secao.querySelector('.passagem__plano--rosto')
  const linha = secao.querySelector('.passagem__linha')
  const canvas = secao.querySelector('canvas')

  if (reducedMotion) {
    // estado final legível: o rosto, e a frase
    gsap.set([luz], { opacity: 0 })
    gsap.set([rosto, linha], { opacity: 1, y: 0 })
    if (canvas) canvas.remove()
  } else {
    gsap.set([luz, rosto], { opacity: 0 })
    gsap.set(linha, { opacity: 0, y: 20 })

    /* ── A sala, ainda correndo ──────────────────────────

       Os mesmos 34 quadros do capítulo anterior, retomados no trecho
       cheio. Não é um segundo arquivo: é a MESMA sequência, e é por isso
       que a emenda entre as duas seções não tem costura — o que sai de uma
       e o que entra na outra são o mesmo plano.

       Ele começa no quadro 24 e respira em vaivém desde o primeiro
       instante: aqui a sala não enche mais, ela já está cheia. */
    if (canvas) {
      const player = criarSequencia({
        palco: plano,
        canvas,
        total: 34,
        ancora: 0.58,
        caminho: (i) => `/frames/sala/s_${String(i + 1).padStart(3, '0')}.webp`
      })
      player.carregarPerto(secao, '120%')

      const [de, para] = [24, 33]
      let v = 29
      let sentido = 1
      laco(secao, (dt) => {
        v += dt * 6 * sentido
        if (v >= para) { v = para; sentido = -1 }
        else if (v <= de) { v = de; sentido = 1 }
        player.desenhar(v)
      })
    }

    /* ── A aproximação ─────────────────────────────────── */

    /* 3,4 segundos, e o número foi medido contra a permanência.

       A primeira versão desta seção tinha 50svh de sticky e a saída
       disparando em `bottom 78%`. Medido na tela: a saída acontecia com a
       seção ainda 78% visível, e o rosto — a única fotografia de uma cara
       em tela cheia da página — ia embora antes de ter sido olhado.

       Agora são 80svh de permanência e a saída dispara em `bottom 35%`. O
       gesto termina aos 3,4s; o que vem depois é silêncio com um rosto
       nele, que é a seção. */
    autonomo(secao, (t) => {
      t.to(plano, { scale: 1.42, duration: 3.0, ease: EASE }, 0)
        .fromTo(luz, { scale: 1.28 }, { scale: 1.02, duration: 2.6, ease: EASE }, 0.5)
        .to(luz, { opacity: 1, duration: 1, ease: 'none' }, 0.5)
        .to(plano, { opacity: 0, duration: 0.8, ease: 'none' }, 1)
        .fromTo(rosto, { scale: 1.18 }, { scale: 1, duration: 2.4, ease: EASE }, 1.5)
        .to(rosto, { opacity: 1, duration: 1, ease: 'none' }, 1.5)
        .to(luz, { opacity: 0, duration: .9, ease: 'none' }, 1.9)
        .to(linha, { opacity: 1, y: 0, duration: .9, ease: EASE }, 2.6)
    }, { start: 'top 80%' })

    /* ── E a saída: o rosto abandona o quadro ──────────── */

    const saida = gsap.timeline({ paused: true })
    saida.to(linha, { opacity: 0, y: -16, duration: 0.7, ease: EASE }, 0)
      .to(rosto, { yPercent: -16, scale: 1.22, duration: 1.4, ease: EASE }, 0.1)

    ScrollTrigger.create({
      trigger: secao,
      start: 'bottom 35%',
      invalidateOnRefresh: true,
      onEnter: () => saida.play(),
      onLeaveBack: () => saida.reverse()
    })
  }
}
