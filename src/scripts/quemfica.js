/* Quem fica · 03h.

   O porquê está no HTML e a composição em quemfica.css. Aqui está o tempo.
   CLASSE 2 (motion.js), inteira.

   ── O gesto, e ele é uma citação sendo aberta ───────────────────────────

     0,00  "DISSEMOS LÁ EM CIMA"  entra sozinha, e fica sozinha na tela por
           quase um segundo. É a única vez que o site põe um rótulo antes de
           qualquer imagem: a citação precisa ser anunciada antes de ter uma
           prova ao lado
     0,55  A FAIXA CRESCE da borda direita para a esquerda, e a fotografia
           dentro dela anda no sentido contrário — a imagem se descobre em
           vez de deslizar para dentro
     1,25  "Quem escuta, fica."   a mesma frase da segunda tela, na mesma
           serifada, com a mesma palavra em âmbar
     1,95  "São três da manhã / e ela ainda está aqui."

   ── Por que a frase não usa a máscara da tese ───────────────────────────

   Lá em cima ela EMERGE — sobe por dentro de uma máscara, com a letra
   crescendo, no gesto mais lento da página. Aqui ela apenas acende, com um
   deslocamento de 14px e nada mais.

   A diferença é o argumento. Na segunda tela a frase é uma afirmação sendo
   feita pela primeira vez, e uma afirmação precisa de peso. Aqui ela é uma
   CITAÇÃO — a mesma coisa dita de novo, seis horas depois, ao lado de
   alguém que a está cumprindo. Repetir o gesto seria repetir a ênfase, e
   uma prova que insiste é uma prova fraca. A ênfase, desta vez, está na
   fotografia ao lado.

   ── Sem saída ───────────────────────────────────────────────────────────

   O que vem depois é a seção de reservas, que abre com "São 03h" — a mesma
   hora desta tela. As duas são a mesma batida do relógio, e um gesto de
   saída entre elas romperia isso: a página passa de uma para a outra sem
   dispositivo nenhum, o que só acontece aqui e é o motivo de ser legível
   como continuação em vez de como descuido. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.quemfica')

if (secao) {
  const quadro = secao.querySelector('.quemfica__quadro')
  const foto = secao.querySelector('.quemfica__quadro img')
  const eyebrow = secao.querySelector('.quemfica__eyebrow')
  const linha = secao.querySelector('.quemfica__linha')
  const nota = secao.querySelector('.quemfica__nota')

  const ABERTO = 'inset(0% 0% 0% 0%)'
  const FECHADO = 'inset(0% 0% 0% 100%)'

  if (reducedMotion) {
    /* O estado fechado mora no CSS, como todo estado de entrada do site, e
       precisa ser desfeito AQUI além da media query: o caminho sem
       movimento também é alcançado pelo ?reduce=1 de desenvolvimento. */
    gsap.set(quadro, { clipPath: ABERTO })
    gsap.set([eyebrow, linha, nota], { opacity: 1, y: 0 })
  } else {
    gsap.set([eyebrow, linha, nota], { opacity: 0, y: 14 })

    autonomo(secao, (t) => {
      t.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: EASE }, 0)
        .fromTo(quadro,
          { clipPath: FECHADO },
          { clipPath: ABERTO, duration: 1.5, ease: EASE }, 0.55)
        // a fotografia anda ao contrário da faixa: ela se descobre
        .fromTo(foto,
          { xPercent: 10, scale: 1.06 },
          { xPercent: 0, scale: 1, duration: 2.2, ease: EASE }, 0.55)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.25)
        .to(nota, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 1.95)
    }, { start: 'top 80%' })
  }
}
