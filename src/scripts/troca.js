/* A troca · 17h.

   O porquê da seção está no HTML e a composição em troca.css. Aqui está o
   tempo dela, e ele é uma timeline só: CLASSE 2 (motion.js) do começo ao
   fim. Nada aqui é preso ao dedo, e não deveria ser — esta tela não tem
   estado intermediário. É um minuto, não um percurso.

   ── O gesto ─────────────────────────────────────────────────────────────

     0,00  o traço do rótulo cresce
     0,35  A FRESTA SOBE. A janela se abre de baixo para cima e, dentro
           dela, a fotografia desce um pouco — a imagem e a moldura andam
           em sentidos contrários, que é o que impede a abertura de parecer
           um retângulo crescendo
     0,95  os dados entram
     1,25  a frase

   ── Por que de baixo para cima ──────────────────────────────────────────

   O inventário de aberturas do site já tinha quatro direções ocupadas: da
   esquerda para a direita (o texto), das bordas para dentro (as molduras da
   pausa), do centro para fora (a fresta da 01h) e a faixa de luz subindo (o
   poente). Uma quinta seção precisava de uma quinta direção, e a que
   sobrava é a única que também SIGNIFICA aqui: o que se vê dentro da fresta
   é um balcão com uma fita de luz na base. A janela sobe a partir da linha
   em que a luz está. A casa acende de baixo.

   ── A saída ─────────────────────────────────────────────────────────────

   Não tem. E é a única seção da página assim, de propósito.

   O que vem depois é o capítulo 01, que sobe DO PRETO — a batida de preto
   que faz a chegada dele ser um corte. Se esta tela também tivesse um gesto
   de saída, os dois aconteceriam em cima um do outro e nenhum dos dois
   seria lido. Aqui a seção simplesmente rola para fora, e o preto que ela
   deixa é o que o Jardim usa. É a única emenda do site em que o dispositivo
   pertence inteiro ao lado de baixo. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.troca')

if (secao) {
  const dash = secao.querySelector('.troca__dash')
  const quadro = secao.querySelector('.troca__quadro')
  const foto = secao.querySelector('.troca__quadro img')
  const dados = secao.querySelector('.troca__dados')
  const linha = secao.querySelector('.troca__linha')

  if (reducedMotion) {
    /* O estado fechado mora no CSS, como todo estado de entrada do site, e
       precisa ser desfeito AQUI além da media query: o caminho sem
       movimento também é alcançado pelo ?reduce=1 de desenvolvimento, que
       não aciona media query nenhuma. */
    gsap.set(quadro, { clipPath: 'inset(0% 0% 0% 0%)' })
    gsap.set([dados, linha], { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
  } else {
    gsap.set([dados, linha], { opacity: 0, y: 18 })

    autonomo(secao, (t) => {
      t.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .fromTo(quadro,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: EASE }, 0.35)
        // a fotografia desce enquanto a janela sobe
        .fromTo(foto,
          { yPercent: -7, scale: 1.06 },
          { yPercent: 0, scale: 1, duration: 1.9, ease: EASE }, 0.35)
        .to(dados, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 0.95)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.25)
    }, {
      /* Cedo, como todas as entradas desta passada: a composição termina de
         se montar enquanto a seção ainda sobe, e o que toma a tela é uma
         coisa pronta em vez de uma coisa se montando. */
      start: 'top 82%'
    })
  }
}
