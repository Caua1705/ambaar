/* O que fica · 04h — seção nova, e é a última hora da noite.

   O porquê está no HTML. Aqui está o tempo, e ele tem uma peça que não
   existe em nenhuma outra tela do site: A LUZ ANDA.

   ── O gesto ─────────────────────────────────────────────────────────────

   A fotografia é um anel esquecido sobre mármore, atravessado por uma
   réstia de luz. A réstia não é da fotografia: é um elemento por cima dela,
   uma faixa clara inclinada, e ela ATRAVESSA a imagem devagar, sozinha, do
   canto de cima ao canto de baixo — como a luz de um poste atravessa uma
   mesa quando alguém abre a porta lá fora, ou como o sol de fim de
   madrugada anda por uma sala vazia.

   É classe 3: corre desde que a seção entre em cena e para quando ela sai.
   Ninguém pede, ninguém controla. É a única coisa viva numa tela cujo
   assunto é não haver mais ninguém.

   ── E ela é a emenda para o fecho ───────────────────────────────────────

   A réstia sai do quadro pelo pé, e é isso que entrega a tela seguinte: o
   que fica no fim desta seção é mármore escuro sem luz nenhuma, e o fecho
   sobe desse escuro. A emenda 03h → 04h era a mais fraca do site (uma
   troca de fundo e nada mais); agora tem um dispositivo que nenhuma
   vizinha usa — a luz indo embora.

   ── Sem título, sem rótulo ──────────────────────────────────────────────

   Como a hora sem nome das 01h. O relógio é o único carimbo, e ele marca
   04h — a única hora do site fora do horário de funcionamento. */

import { gsap, reducedMotion, EASE, autonomo, laco } from './motion.js'

const secao = document.querySelector('.fica')

if (secao) {
  const quadro = secao.querySelector('.fica__quadro')
  const luz = secao.querySelector('.fica__luz')
  const linha = secao.querySelector('.fica__linha')

  if (reducedMotion) {
    gsap.set(quadro, { clipPath: 'inset(0% 0% 0% 0%)' })
    gsap.set(linha, { opacity: 1, y: 0 })
    gsap.set(luz, { opacity: 0 })
  } else {
    gsap.set(linha, { opacity: 0, y: 18 })

    /* A imagem abre por uma janela que cresce do centro para as duas
       bordas laterais — o eixo horizontal, que nenhuma outra abertura do
       site usa (a 01h abre no vertical, a pausa pelas bordas, as 17h de
       baixo para cima, a cabine em duas direções opostas). */
    autonomo(secao, (t) => {
      t.fromTo(quadro,
        { clipPath: 'inset(0% 50% 0% 50%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: EASE }, 0)
        .fromTo(quadro.querySelector('img'),
          { scale: 1.12 }, { scale: 1, duration: 2.2, ease: EASE }, 0)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.1)
    }, { start: 'top 80%' })

    /* ── A réstia atravessa ──────────────────────────────

       Um ciclo de 26 segundos, que é longo de propósito: numa tela que fala
       de uma sala vazia, o movimento tem de ser mais lento do que o olho
       espera. A faixa entra por cima à direita, cruza o quadro e sai por
       baixo à esquerda; a opacidade sobe e desce com ela, então ela nunca
       aparece nem some com aresta.

       `translate` e `opacity` só. */
    if (luz) {
      let t = 0
      const CICLO = 26
      laco(secao, (dt) => {
        t = (t + dt) % CICLO
        const u = t / CICLO
        gsap.set(luz, {
          xPercent: -60 + u * 120,
          yPercent: -70 + u * 150,
          opacity: Math.sin(u * Math.PI) * 0.5
        })
      })
    }
  }
}
