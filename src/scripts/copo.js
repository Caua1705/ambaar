/* A carta · 19h.

   O porquê está no HTML e a composição em copo.css. Aqui está o tempo, e
   ele é CLASSE 2 (motion.js) do começo ao fim: dispara na entrada, corre na
   velocidade dele, termina com o dedo parado. Mais um laço de ambiente
   (classe 3) que não pergunta nada à rolagem.

   ── O gesto é o próprio despejo ─────────────────────────────────────────

   A tela tinha dois gestos disputando: o fundo assentando em escala e o
   inset deslizando pela margem. O inset saiu (copo.css tem a conta), e o
   que sobrou não foi meio gesto — foi a chance de o gesto ser o assunto.

   A fotografia é um líquido caindo de cima para baixo. A moldura abre por
   uma aresta que desce pelo quadro na mesma direção: o que se vê não é uma
   imagem aparecendo, é a tela sendo PREENCHIDA de cima para baixo, na
   velocidade em que se enche uma taça.

     0,00  A ARESTA DESCE. `inset(0 0 100% 0)` → `inset(0)`, 1,7s. Ela
           nasce no alto, que é onde o mixing glass está, e termina no pé,
           que é onde a mão está
     0,00  e a fotografia sobe contra ela: entra empurrada 4% para baixo e
           assenta em 0. Sem a contramão, o que se vê é um retângulo
           crescendo em vez de uma coisa chegando — é o mesmo princípio que
           o inset usava, e é a única coisa dele que sobreviveu
     0,25  o traço do rótulo cresce
     1,35  a frase

   ── Por que não há escala na entrada ────────────────────────────────────

   A versão anterior assentava o fundo de 1,12 para 1,02. Com a aresta
   descendo, uma escala simultânea é um segundo movimento na mesma imagem,
   e dois movimentos numa fotografia só se anulam: o olho não sabe se a
   coisa está chegando ou recuando. A escala foi para o laço, onde ela não
   compete com nada.

   ╔══════════════════════════════════════════════════════════════════════╗
   ║ A SAÍDA FOI CONSTRUÍDA, MEDIDA E DESMONTADA NA MESMA PASSADA         ║
   ║                                                                      ║
   ║ A ideia era boa no papel e ruim na tela, e vale ficar escrita para   ║
   ║ ninguém a ter de novo.                                               ║
   ║                                                                      ║
   ║ Como a entrada é uma aresta que DESCE enchendo o quadro, a saída     ║
   ║ seria a mesma aresta seguindo em frente: `inset(0)` →                ║
   ║ `inset(100% 0 0 0)`, o líquido escorrendo para fora pelo pé.         ║
   ║ Entrada e saída viravam um movimento só.                             ║
   ║                                                                      ║
   ║ Fotografada a 414×896 com rolagem em degraus, a 3050px: a tela       ║
   ║ inteira em carvão, com o "19h" e o rótulo da cabine boiando nela. O  ║
   ║ dreno dispara a `bottom 76%`, isto é, quando a seção ainda ocupa     ║
   ║ três quartos da altura — e é isso o que ele esvazia.                 ║
   ║                                                                      ║
   ║ E a seção seguinte não tem como socorrer: a cabine guarda 32svh de   ║
   ║ carvão acima da faixa dela de propósito (cabine.css), então a faixa  ║
   ║ só chega ao meio da tela uns 400px de rolagem depois. Somados, dava  ║
   ║ quase uma tela e meia de preto seguido — que é, palavra por palavra, ║
   ║ a queixa que esta região do site já levou uma passada inteira para   ║
   ║ resolver.                                                            ║
   ║                                                                      ║
   ║ Adiar o dreno não salva: a `bottom 45%` ele passa a acontecer DEPOIS ║
   ║ de a cabine abrir, e aí são duas seções se mexendo ao mesmo tempo —  ║
   ║ o defeito que o próprio escalonamento 76/58 existe para evitar.      ║
   ║ Encurtá-lo pela metade deixa uma faixa de fotografia cortada reta no ║
   ║ alto, que é pior que as duas coisas.                                 ║
   ║                                                                      ║
   ║ O que ficou: a fotografia NÃO sai. Ela é o que a seção é, e a        ║
   ║ rolagem já a leva embora. Sai o que é dito — a frase sobe, o traço   ║
   ║ se recolhe — e a fotografia desce 4% atrás deles, o resto do curso   ║
   ║ que a entrada deixou em reserva (copo.css). O escuro que a cabine    ║
   ║ precisa antes do corte ela ganha da própria goteira dela.            ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

import { gsap, ScrollTrigger, reducedMotion, EASE, autonomo, laco } from './motion.js'

const secao = document.querySelector('.copo')

if (secao) {
  const dash = secao.querySelector('.copo__dash')
  const quadro = secao.querySelector('.copo__quadro')
  const foto = secao.querySelector('.copo__quadro img')
  const linha = secao.querySelector('.copo__linha')

  /* ╔══════════════════════════════════════════════════════════════════╗
     ║ POR QUE OS DOIS CLIPS SÃO `fromTo` E NÃO `to`                    ║
     ║                                                                  ║
     ║ Não é estilo. Um `to` a partir do estado cheio é um NO-OP        ║
     ║ silencioso, e a saída desta seção era isso desde que ela existe. ║
     ║                                                                  ║
     ║ `inset(0% 0% 0% 0%)` tem quatro valores iguais, e o CSSOM        ║
     ║ serializa isso como `inset(0%)` — um número só. Não importa o    ║
     ║ que se escreveu: depois de o GSAP aplicar o valor, tanto         ║
     ║ `el.style.clipPath` quanto o computado devolvem `inset(0%)`.     ║
     ║                                                                  ║
     ║ Um `to` lê o valor atual para montar a interpolação. Ele então   ║
     ║ compara `inset(0%)` (um número) com `inset(100% 0% 0% 0%)`       ║
     ║ (quatro): as duas cadeias não têm a mesma forma, o GSAP não      ║
     ║ consegue parear os números e o tween não escreve nada. A         ║
     ║ timeline roda inteira, chega a `progress() === 1`, e o elemento  ║
     ║ termina exatamente como começou. Sem erro, sem aviso.            ║
     ║                                                                  ║
     ║ Medido: com `to`, a 3200px de rolagem a timeline de saída        ║
     ║ marcava progress=1 / time=1.40 e o `style.clipPath` do quadro    ║
     ║ continuava `inset(0%)`.                                          ║
     ║                                                                  ║
     ║ Com `fromTo` o GSAP não pergunta nada ao CSS: as duas pontas     ║
     ║ vêm do objeto, as duas têm quatro números, e a interpolação      ║
     ║ existe.                                                          ║
     ║                                                                  ║
     ║ A regra que sai daqui vale para o site inteiro, e é a razão de   ║
     ║ este bloco continuar aqui mesmo depois de a saída que o          ║
     ║ descobriu ter sido desmontada: UM CLIP QUE PARTE DO ESTADO       ║
     ║ CHEIO PRECISA DE `fromTo`. Hoje nenhum clip da página faz isso   ║
     ║ — hero, pausa, pista e quem fica só CHEGAM em `inset(0)`,        ║
     ║ partindo de valores desiguais que o CSSOM não colapsa —, então   ║
     ║ o defeito não existe em lugar nenhum e some sem avisar no dia    ║
     ║ em que alguém escrever o primeiro.                               ║
     ╚══════════════════════════════════════════════════════════════════╝ */
  const CHEIO = 'inset(0% 0% 0% 0%)'
  /* fechado no ALTO: a aresta que revela desce */
  const VAZIO = 'inset(0% 0% 100% 0%)'

  if (reducedMotion) {
    /* O estado fechado mora no CSS, como todo estado de entrada do site, e
       precisa ser desfeito AQUI além da media query: o caminho sem
       movimento também é alcançado pelo ?reduce=1 de desenvolvimento, que
       não aciona media query nenhuma. */
    gsap.set(quadro, { clipPath: CHEIO })
    gsap.set(linha, { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
  } else {
    gsap.set(linha, { opacity: 0, y: 20 })
    gsap.set(quadro, { clipPath: VAZIO })

    autonomo(secao, (t) => {
      t.fromTo(quadro,
        { clipPath: VAZIO },
        { clipPath: CHEIO, duration: 1.7, ease: EASE }, 0)
        // e a fotografia anda ao contrário da aresta que a revela
        .fromTo(foto,
          { yPercent: 4 },
          { yPercent: 0, duration: 2.2, ease: EASE }, 0)
        .to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0.25)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.35)
    }, {
      /* Cedo, como todas as entradas desta passada: a composição termina de
         se montar enquanto a seção ainda sobe, e o que toma a tela é uma
         coisa pronta em vez de uma coisa se montando. */
      start: 'top 82%'
    })

    /* ── O líquido não pára de se mexer ────────────────────────────────

       Sem isto a tela é um cartaz depois que a entrada acaba, que é o
       defeito que esta mesma passada corrigiu na cabine.

       Classe 3 (motion.js): não pergunta nada ao dedo, corre enquanto a
       seção está em cena e para quando ela sai. Período de ~59s (0,107
       rad/s), longo de propósito — não é para ser visto como movimento, é
       para a fotografia não ficar morta.

       ── Por que ESCALA, e só ela ────────────────────────────────────────

       `yPercent` desta mesma imagem pertence à timeline de entrada e à de
       saída. Duas timelines na mesma propriedade é o defeito que custou o
       véu do Jardim uma passada atrás. A escala não é usada por nenhuma
       das duas, então o laço pode tê-la inteira.

       1,3% sobre uma caixa que já tem 7% de sobra em cima e embaixo
       (copo.css): o curso nunca chega perto de descobrir borda, nem
       somado aos 4% da entrada. */
    let t = 0
    laco(secao, (dt) => {
      t += dt
      gsap.set(foto, { scale: 1.03 + Math.sin(t * 0.107) * 0.013 })
    })

    /* ── 62% → 76%: a saída daqui e a entrada da cabine ESBARRAVAM ──────

       A cabine é a seção seguinte, então o topo dela é o pé desta. Ela
       montava a composição em `top 82%` e esta se desmontava em `bottom
       62%` — vinte por cento de tela DEPOIS. Traduzido para o que se via:
       a cabine abria embaixo enquanto esta ainda se desfazia no alto. Duas
       seções se mexendo ao mesmo tempo, em direções diferentes, sem
       relação uma com a outra.

       A ordem certa é a ordem da leitura: primeiro esta tela se desfaz,
       depois a próxima se arma. Aqui sobe para 76% (a seção ainda tem a
       tela, e é ela quem se desmonta) e a cabine desce para 58%
       (cabine.js). Dezoito por cento de tela entre um gesto e o outro —
       o bastante para não coincidirem, pouco para não virar espera. */
    const saida = gsap.timeline({ paused: true })
    saida.to(linha, { opacity: 0, y: -18, duration: 0.7, ease: EASE }, 0)
      /* A frase sobe e a fotografia desce. É a mesma contramão da entrada,
         só que agora entre o texto e a imagem em vez de entre a imagem e a
         aresta: o que é dito vai embora por cima, o que é mostrado afunda.

         4% é o resto do curso — a entrada gastou 4 dos 7% de sobra que a
         caixa reserva em cima e embaixo (copo.css), e estes são os que
         faltavam. A fotografia nunca descobre borda em nenhum ponto do
         percurso, nem somada à respiração do laço. */
      .to(foto, { yPercent: 4, duration: 1.3, ease: EASE }, 0.1)
      .to(dash, { scaleX: 0, duration: 0.6, ease: EASE }, 0.1)

    ScrollTrigger.create({
      trigger: secao,
      start: 'bottom 76%',
      invalidateOnRefresh: true,
      onEnter: () => saida.play(),
      onLeaveBack: () => saida.reverse()
    })
  }
}
