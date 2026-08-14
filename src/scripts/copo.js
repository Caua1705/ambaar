/* O primeiro copo · 19h.

   O porquê está no HTML e a composição em copo.css. Aqui está o tempo, e
   ele é CLASSE 2 (motion.js) do começo ao fim: dispara na entrada, corre na
   velocidade dele, termina com o dedo parado. Esta tela não tem estado
   intermediário — ou o copo está na mão de alguém ou não está.

   ── O gesto, em quatro batidas ──────────────────────────────────────────

     0,00  a fotografia de fundo assenta: 1,12 → 1,02 de escala. Não é uma
           abertura, é uma câmera parando de andar — a tela anterior
           terminou escurecendo e esta chega já acesa
     0,20  o traço do rótulo cresce
     0,55  O INSET DESLIZA da borda direita para dentro. A moldura entra
           por clipPath e a fotografia de dentro anda em sentido contrário:
           sem isso, o que se vê é um retângulo aparecendo em vez de uma
           coisa chegando
     1,40  a frase

   ── Por que a de baixo não abre ─────────────────────────────────────────

   Duas fotografias abrindo na mesma tela seriam duas aberturas, e a
   composição inteira é sobre uma estar POR CIMA da outra. A de baixo
   precisa já estar lá para a de cima poder chegar.

   É a mesma razão de a escala do fundo ser pequena (10%) e curta: ela é o
   assentamento de uma coisa que já existe, não a entrada de uma coisa nova.

   ── A saída ─────────────────────────────────────────────────────────────

   O inset volta para fora pela mesma borda e a frase sobe. A de baixo não
   se mexe: quem chegou é quem vai embora. */

import { gsap, ScrollTrigger, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.copo')

if (secao) {
  const dash = secao.querySelector('.copo__dash')
  const fundo = secao.querySelector('.copo__fundo img')
  const inset = secao.querySelector('.copo__inset')
  const insetImg = secao.querySelector('.copo__inset img')
  const linha = secao.querySelector('.copo__linha')

  const ABERTO = 'inset(0% 0% 0% 0%)'
  const FECHADO = 'inset(0% 0% 0% 100%)'

  if (reducedMotion) {
    /* O estado fechado mora no CSS, como todo estado de entrada do site, e
       precisa ser desfeito AQUI além da media query: o caminho sem
       movimento também é alcançado pelo ?reduce=1 de desenvolvimento, que
       não aciona media query nenhuma. */
    gsap.set(inset, { clipPath: ABERTO })
    gsap.set(linha, { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
  } else {
    gsap.set(linha, { opacity: 0, y: 20 })
    gsap.set(inset, { clipPath: FECHADO })

    autonomo(secao, (t) => {
      t.fromTo(fundo,
        { scale: 1.12 },
        { scale: 1.02, duration: 2.4, ease: EASE }, 0)
        .to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0.2)
        .to(inset, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.55)
        // e a fotografia de dentro anda ao contrário da moldura
        .fromTo(insetImg,
          { xPercent: 12 },
          { xPercent: 0, duration: 1.8, ease: EASE }, 0.55)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.4)
    }, {
      /* Cedo, como todas as entradas desta passada: a composição termina de
         se montar enquanto a seção ainda sobe, e o que toma a tela é uma
         coisa pronta em vez de uma coisa se montando. */
      start: 'top 82%'
    })

    /* ── A saída ─────────────────────────────────────────
       O inset se recolhe pela borda por onde entrou. É o único gesto de
       saída do site que desfaz literalmente o de entrada, e ele pode fazer
       isso porque a seção seguinte (a cabine) sobe do carvão: não há nada
       por baixo para descobrir, então a tela pode simplesmente se
       desmontar. */
    const saida = gsap.timeline({ paused: true })
    saida.to(linha, { opacity: 0, y: -18, duration: 0.7, ease: EASE }, 0)
      .to(inset, { clipPath: FECHADO, duration: 1, ease: EASE }, 0.1)
      .to(dash, { scaleX: 0, duration: 0.6, ease: EASE }, 0.1)

    ScrollTrigger.create({
      trigger: secao,
      start: 'bottom 62%',
      invalidateOnRefresh: true,
      onEnter: () => saida.play(),
      onLeaveBack: () => saida.reverse()
    })
  }
}
