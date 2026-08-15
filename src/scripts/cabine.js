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

import { gsap, reducedMotion, EASE, autonomo, laco } from './motion.js'

const secao = document.querySelector('.cabine')

if (secao) {
  const dash = secao.querySelector('.cabine__dash')
  const antes = secao.querySelector('.cabine__quadro--antes')
  const fonte = secao.querySelector('.cabine__quadro--fonte')
  const filete = secao.querySelector('.cabine__filete')
  const luz = secao.querySelector('.cabine__luz')
  const linha = secao.querySelector('.cabine__linha')

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
    gsap.set(linha, { opacity: 1, y: 0 })
    gsap.set(dash, { scaleX: 1 })
    gsap.set(filete, { scaleY: 1 })
    gsap.set(luz, { opacity: 1 })
  } else {
    gsap.set(linha, { opacity: 0, y: 18 })
    gsap.set(antes, { clipPath: FECHADO_ANTES })
    gsap.set(fonte, { clipPath: FECHADO_FONTE })

    /* ── O gesto ganhou duas batidas, e as duas fecham argumentos que já
          estavam escritos e não aconteciam na tela ───────────────────────

       0,77  O FILETE. As duas molduras se encontram nele — é a frase deste
             arquivo desde a primeira versão —, só que ele já estava
             desenhado antes de qualquer uma abrir. Agora ele nasce do meio
             para as duas pontas no quadro em que elas se tocam: a única
             estrutura da tela passa a ser o RESULTADO do encontro.

             Ele começa 0,15 depois de a cabine abrir, não junto: se os dois
             correm no mesmo instante o filete lê como a borda de uma das
             fotografias, que é exatamente o que ele deixou de ser.

       1,05  A LUZ. A cabine acendeu; a sala vazia ao lado recebe âmbar pela
             borda de dentro. É a hierarquia da seção dita por luz em vez de
             por largura, e é a frase acontecendo ENTRE as duas fotografias
             — a frase escrita embaixo delas passa a ser a legenda de uma
             coisa que a tela já mostrou.

       Nenhuma das duas é um objeto novo em cena: as duas são propriedades
       de coisas que já estavam lá. A contagem de elementos da tela não
       mudou. */
    autonomo(secao, (t) => {
      t.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .to(antes, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.3)
        // e a fotografia dentro dela desce enquanto a moldura abre
        .fromTo(antes.querySelector('img'),
          { yPercent: -6 }, { yPercent: 0, duration: 1.7, ease: EASE }, 0.3)
        .to(fonte, { clipPath: ABERTO, duration: 1.3, ease: EASE }, 0.62)
        .fromTo(fonte.querySelector('img'),
          { yPercent: 6 }, { yPercent: 0, duration: 1.7, ease: EASE }, 0.62)
        .to(filete, { scaleY: 1, duration: 1.1, ease: EASE }, 0.77)
        .to(luz, { opacity: 1, duration: 1.4, ease: 'none' }, 1.05)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.35)
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

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ A SALA É UMA FOTOGRAFIA. A CABINE ESTÁ ACONTECENDO.              ║
       ║                                                                  ║
       ║ Esta seção era a única do site em que NADA se move depois que o  ║
       ║ gesto de entrada termina — e o cabeçalho deste arquivo defendia   ║
       ║ isso como "a batida de silêncio entre dois movimentos". O        ║
       ║ argumento tem um furo: silêncio entre dois movimentos é uma      ║
       ║ pausa; quinze segundos de cartaz parado é uma tela que acabou.   ║
       ║                                                                  ║
       ║ A saída não é fazer as duas se mexerem — isso mataria a          ║
       ║ comparação, que é a razão de o díptico existir. É fazer só UMA.  ║
       ║                                                                  ║
       ║ A frase da tela é "alguém escolheu o que você vai ouvir", e a    ║
       ║ composição inteira já separa as duas metades: à esquerda o lugar ║
       ║ que ainda vai ser preenchido, à direita quem o preenche. O       ║
       ║ movimento diz a mesma coisa numa terceira gramática — a sala     ║
       ║ vazia fica ABSOLUTAMENTE imóvel, como o retrato de um lugar sem  ║
       ║ ninguém, e a cabine respira. Uma é passado, a outra é presente.  ║
       ║                                                                  ║
       ║ Classe 3 (motion.js): não pergunta nada ao dedo, corre enquanto  ║
       ║ a seção está em cena e para quando ela sai. Períodos de 9,3s e   ║
       ║ 13,7s — primos entre si, como o pó do fecho e o arrasto da       ║
       ║ pista —, então o desenho nunca fecha o ciclo e nunca se repete.  ║
       ║                                                                  ║
       ║ ── Por que só `scale` e `xPercent` ───────────────────────────── ║
       ║                                                                  ║
       ║ Não é escolha de gosto: `yPercent` desta mesma imagem pertence à ║
       ║ timeline de entrada (ela desce 6% enquanto a moldura abre). Duas ║
       ║ timelines na mesma propriedade é o defeito que custou o véu do   ║
       ║ Jardim uma passada atrás. Aqui cada uma tem a sua, e por isso as ║
       ║ duas podem correr ao mesmo tempo sem se apagarem.                ║
       ║                                                                  ║
       ║ As amplitudes são minúsculas de propósito — 1,2% de deriva sobre ║
       ║ 4% de escala. A imagem está sempre maior que a moldura, então o  ║
       ║ curso nunca descobre a borda; e o efeito não é para ser visto,   ║
       ║ é para ser a diferença entre uma foto e uma sala com alguém      ║
       ║ dentro.                                                          ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    const fonteImg = fonte.querySelector('img')
    let t = 0

    laco(secao, (dt) => {
      t += dt
      gsap.set(fonteImg, {
        scale: 1.04 + Math.sin(t * 0.107) * 0.014,
        xPercent: Math.sin(t * 0.073) * 1.2
      })
    })
  }
}
