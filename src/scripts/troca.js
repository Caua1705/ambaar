/* A troca · 17h.

   O porquê da seção está no HTML e a composição em troca.css. Aqui está o
   tempo dela, e ele é uma timeline só: CLASSE 2 (motion.js) do começo ao
   fim. Nada aqui é preso ao dedo, e não deveria ser — esta tela não tem
   estado intermediário. É um minuto, não um percurso.

   ── O gesto ─────────────────────────────────────────────────────────────

     0,00  o traço do rótulo cresce
     0,25  A TELA SOBE. A fotografia, agora de sangria total, se descobre de
           baixo para cima e, por dentro, a imagem desce um pouco — o quadro
           e o conteúdo andam em sentidos contrários, que é o que impede a
           abertura de parecer um retângulo crescendo
     1,10  os dados entram
     1,45  a frase

   ── Por que de baixo para cima ──────────────────────────────────────────

   O inventário de aberturas do site tem quatro direções ocupadas: da
   esquerda para a direita (o texto), das bordas para dentro (as molduras da
   pausa), do centro para fora (a fresta das 02h) e de cima e de baixo ao
   mesmo tempo (o díptico da cabine). Esta usa a quinta, e ela é a única que
   também SIGNIFICA aqui: o que se vê é um balcão com uma fita de luz na
   base, e uma calçada que ainda tem sol. A tela sobe a partir da linha em
   que a luz está. A casa acende de baixo.

   E a duração cresceu junto com a imagem: 1,4s virou 1,9s. Uma tarja de
   197px abre em um piscar; uma tela inteira precisa do tempo de uma
   persiana subindo, ou o gesto vira um corte.

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
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: EASE }, 0.25)
        // a fotografia desce enquanto a tela sobe
        .fromTo(foto,
          { yPercent: -6, scale: 1.1 },
          { yPercent: 0, scale: 1.02, duration: 2.6, ease: EASE }, 0.25)
        .to(dados, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 1.1)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.45)
    }, {
      /* Cedo, como todas as entradas desta passada: a composição termina de
         se montar enquanto a seção ainda sobe, e o que toma a tela é uma
         coisa pronta em vez de uma coisa se montando. */
      start: 'top 82%'
    })
  }
}
