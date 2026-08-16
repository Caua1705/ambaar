/* A cabine · 20h.

   O porquê está no HTML e a composição em cabine.css. Aqui está o tempo, e
   ele é CLASSE 2 do começo ao fim, mais um laço de ambiente (classe 3).

   ── O gesto: a faixa abre do meio para as duas pontas ───────────────────

   A tela é uma fotografia deitada cortando a tela de lado a lado, e ela
   nasce fechada no CENTRO: `inset(0 50% 0 50%)` → `inset(0)`. Duas arestas
   saindo do mesmo ponto em direções opostas, até sangrar pelos dois cortes.

   O díptico anterior tinha um argumento bom que nunca chegou à tela: duas
   molduras abrindo uma CONTRA a outra lêem como duas coisas que se
   encontram. O argumento estava certo e o veículo, errado — eram duas
   fotografias, e a 414 elas eram dois retângulos escuros do tamanho de
   miniaturas. Aqui as duas arestas continuam andando em sentidos opostos,
   só que agora elas pertencem à MESMA imagem, e o que se encontra no meio
   não é uma costura entre duas chapas: é o ponto de onde a sala nasce.

   ── Por que o eixo é horizontal ─────────────────────────────────────────

   A seção anterior (a carta) abre por uma aresta que desce. Duas emendas
   vizinhas não usam o mesmo dispositivo, e esta é a razão mecânica de o
   eixo ser outro — mas ele também é o certo por assunto: uma sala se abre
   para os lados, e o que a faixa faz ao chegar às duas bordas é dizer que
   ela continua fora da tela.

   ── As quatro batidas ───────────────────────────────────────────────────

     0,00  o traço do rótulo cresce
     0,30  AS DUAS ARESTAS. 1,4s do centro até as bordas — e o que elas
           descobrem, do meio para fora, é a pessoa: ela está no centro do
           recorte, então é a primeira coisa que aparece e a última que
           acaba de aparecer
     0,30  e a fotografia assenta de 1,12 para 1,04 — a contramão: as
           arestas andam para fora, a imagem recolhe para dentro. Sem isso
           o que se vê é uma cortina abrindo sobre um cartaz parado
     1,15  A SALA SOBE. O poço de âmbar da parede do fundo vai de 0 a 1,
           DEPOIS de a faixa terminar de abrir.

           Este beat mudou de assunto quando a chapa mudou (index.html).
           Com a sala vazia, ele era o acontecimento da tela — "alguém
           ligou aquilo", dito por luz porque não havia ninguém para
           dizê-lo. Agora o acontecimento é a figura, e a luz é a sala
           subindo em volta dela: primeiro alguém está tocando, depois a
           sala em volta existe. A ordem é a mesma e o que ela diz é outro.
     1,45  a frase, que passa a ser a legenda de uma coisa que a tela já
           mostrou

   ── E o dedo não faz nada aqui ──────────────────────────────────────────

   Nenhum scrub, nenhum pin. Esta é uma das telas em que a rolagem só serve
   para chegar e sair, e ela fica entre duas seções que correm sozinhas (o
   entardecer e a sala enchendo). */

import { gsap, reducedMotion, EASE, autonomo, laco } from './motion.js'

const secao = document.querySelector('.cabine')

if (secao) {
  const dash = secao.querySelector('.cabine__dash')
  const faixa = secao.querySelector('.cabine__faixa')
  const foto = secao.querySelector('.cabine__faixa img')
  const luz = secao.querySelector('.cabine__luz')
  const linha = secao.querySelector('.cabine__linha')

  const ABERTA = 'inset(0% 0% 0% 0%)'
  /* fechada no meio: as duas arestas nascem no mesmo ponto */
  const FECHADA = 'inset(0% 50% 0% 50%)'

  if (reducedMotion) {
    /* O estado fechado mora no CSS, como todo estado de entrada do site, e
       precisa ser desfeito AQUI além da media query: o caminho sem
       movimento também é alcançado pelo ?reduce=1 de desenvolvimento, que
       não aciona media query nenhuma. */
    gsap.set(faixa, { clipPath: ABERTA })
    gsap.set(foto, { scale: 1.04 })
    gsap.set(linha, { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
    gsap.set(luz, { opacity: 1 })
  } else {
    gsap.set(linha, { opacity: 0, y: 18 })
    gsap.set(faixa, { clipPath: FECHADA })

    autonomo(secao, (t) => {
      t.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .to(faixa, { clipPath: ABERTA, duration: 1.4, ease: EASE }, 0.3)
        // e a fotografia recolhe enquanto as arestas se afastam
        .fromTo(foto,
          { scale: 1.12 }, { scale: 1.04, duration: 2, ease: EASE }, 0.3)
        .to(luz, { opacity: 1, duration: 1.5, ease: 'none' }, 1.15)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.45)
    }, {
      /* ── 82% → 58%: era cedo DEMAIS, e não por si ────────────────────

         O argumento antigo era bom sozinho — montar a composição enquanto
         a seção ainda sobe, para que o que tome a tela seja uma coisa
         pronta em vez de uma coisa se montando. O que ele não olhava era a
         seção de cima.

         O pé da carta é o topo desta. A 82% esta abria quando a carta
         ainda tinha a tela inteira, e a saída dela só disparava 20% de
         tela depois: duas seções se mexendo ao mesmo tempo, sem relação
         uma com a outra.

         A 58% a ordem fica sequencial — a carta se desmonta a 76%
         (copo.js), esta se arma 18% de tela depois — e o argumento antigo
         sobrevive: a 58% a seção ainda tem 42% de tela pela frente, e a
         faixa termina de abrir antes de chegar ao meio. */
      start: 'top 58%'
    })

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ UMA FOTOGRAFIA PARADA NÃO É UMA CENA PARADA                      ║
       ║                                                                  ║
       ║ Esta seção era a única do site em que NADA se movia depois que o ║
       ║ gesto de entrada terminava, e uma versão deste arquivo defendia   ║
       ║ isso como "a batida de silêncio entre dois movimentos". O         ║
       ║ argumento tem um furo: silêncio entre dois movimentos é uma      ║
       ║ pausa; quinze segundos de cartaz parado é uma tela que acabou.   ║
       ║                                                                  ║
       ║ Vale ainda mais com a chapa nova: um cômodo vazio pode passar   ║
       ║ por imóvel, uma PESSOA no meio de um gesto não. A deriva é o que ║
       ║ mantém a diferença entre a fotografia de alguém tocando e        ║
       ║ alguém tocando.                                                  ║
       ║                                                                  ║
       ║ Classe 3 (motion.js): não pergunta nada ao dedo, corre enquanto  ║
       ║ a seção está em cena e para quando ela sai. Período de ~86s      ║
       ║ (0,073 rad/s) — primo dos outros ambientes do site, como o pó do ║
       ║ fecho e o arrasto da pista, então o desenho nunca fecha o ciclo. ║
       ║                                                                  ║
       ║ ── Por que só `xPercent` ──────────────────────────────────────── ║
       ║                                                                  ║
       ║ Não é escolha de gosto: `scale` desta mesma imagem pertence à    ║
       ║ timeline de entrada (ela recolhe de 1,12 a 1,04 enquanto a faixa ║
       ║ abre). Duas timelines na mesma propriedade é o defeito que custou ║
       ║ o véu do Jardim uma passada atrás. Aqui cada uma tem a sua.      ║
       ║                                                                  ║
       ║ A amplitude é minúscula de propósito — 1,2% de deriva sobre os   ║
       ║ 4% de escala que a folha reserva (cabine.css), isto é, metade da ║
       ║ folga de cada lado. O curso nunca descobre a borda; e o efeito   ║
       ║ não é para ser visto, é para ser a diferença entre a fotografia  ║
       ║ de uma sala e uma sala esperando encher.                         ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    let t = 0

    laco(secao, (dt) => {
      t += dt
      gsap.set(foto, { xPercent: Math.sin(t * 0.073) * 1.2 })
    })
  }
}
