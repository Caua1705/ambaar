/* A cabine · 20h — seção nova.

   O porquê está no HTML e a composição em cabine.css. Aqui está o tempo, e
   ele é CLASSE 2 do começo ao fim: dispara na entrada, corre na velocidade
   dele, termina com o dedo parado.

   ── O gesto, e ele é um só ──────────────────────────────────────────────

   Os dois quadros do díptico não entram juntos e não entram iguais. A sala
   vazia abre primeiro, de cima para baixo. A cabine abre depois, de baixo
   para cima. As duas aberturas se encontram no filete tracejado que as
   separa — e é esse encontro que faz o par ler como UMA frase em vez de
   duas fotografias lado a lado.

   A ordem também é a frase: primeiro o lugar sem ninguém, depois quem vai
   enchê-lo. Invertida, a seção diria outra coisa.

   ── Por que direções opostas ────────────────────────────────────────────

   Duas molduras abrindo no mesmo sentido lêem como um efeito aplicado a um
   grupo. Abrindo uma contra a outra, lêem como duas coisas que se
   encontram — o que é literalmente o assunto: alguém escolheu o que vai
   tocar naquela sala.

   ── E o dedo não faz nada aqui ──────────────────────────────────────────

   Nenhum scrub, nenhum pin. Esta é uma das cinco telas do site em que a
   rolagem só serve para chegar e sair, e ela fica entre duas seções que
   correm sozinhas (o entardecer e a sala enchendo). É a batida de silêncio
   entre dois movimentos. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.cabine')

if (secao) {
  const dash = secao.querySelector('.cabine__dash')
  const antes = secao.querySelector('.cabine__quadro--antes')
  const fonte = secao.querySelector('.cabine__quadro--fonte')
  const linha = secao.querySelector('.cabine__linha')
  const credito = secao.querySelector('.cabine__credito')

  const ABERTO = 'inset(0% 0% 0% 0%)'
  // a sala vazia abre de cima para baixo; a cabine, de baixo para cima
  const FECHADO_ANTES = 'inset(0% 0% 100% 0%)'
  const FECHADO_FONTE = 'inset(100% 0% 0% 0%)'

  if (reducedMotion) {
    /* O estado fechado mora no CSS, como todo estado de entrada do site, e
       precisa ser desfeito AQUI além da media query: o caminho sem
       movimento também é alcançado pelo ?reduce=1 de desenvolvimento, que
       não aciona media query nenhuma. */
    gsap.set([antes, fonte], { clipPath: ABERTO })
    gsap.set([linha, credito], { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
  } else {
    gsap.set(linha, { opacity: 0, y: 18 })
    gsap.set(credito, { opacity: 0, y: 10 })
    gsap.set(antes, { clipPath: FECHADO_ANTES })
    gsap.set(fonte, { clipPath: FECHADO_FONTE })

    autonomo(secao, (t) => {
      t.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .to(antes, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.3)
        // e a fotografia dentro dela desce enquanto a moldura abre
        .fromTo(antes.querySelector('img'),
          { yPercent: -6 }, { yPercent: 0, duration: 1.7, ease: EASE }, 0.3)
        .to(fonte, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.62)
        .fromTo(fonte.querySelector('img'),
          { yPercent: 6 }, { yPercent: 0, duration: 1.7, ease: EASE }, 0.62)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.35)
        // o crédito assina depois da frase: obra primeiro, ficha depois
        .to(credito, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 1.6)
    }, {
      /* ── 82% → 58%: era cedo DEMAIS, e não por si ────────────────────

         O argumento antigo era bom sozinho — montar o díptico enquanto a
         seção ainda sobe, para que o que tome a tela seja uma coisa pronta
         em vez de uma coisa se montando. O que ele não olhava era a seção
         de cima.

         O pé do copo é o topo desta. A 82% o díptico começava a abrir
         quando o copo ainda tinha a tela inteira, e a saída dele só
         disparava 20% de tela depois: o inset se fechava no alto enquanto
         estes dois quadros abriam embaixo. Dois gestos sem relação
         acontecendo juntos.

         A 58% a ordem fica sequencial — o copo se desmonta a 76%
         (copo.js), esta se arma 18% de tela depois — e o argumento antigo
         sobrevive: a 58% a seção ainda tem 42% de tela pela frente, e o
         par termina de abrir antes de chegar ao meio. */
      start: 'top 58%'
    })
  }
}
