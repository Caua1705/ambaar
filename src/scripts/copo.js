/* A carta · 19h.

   O porquê está no HTML e a composição em copo.css. Aqui está o tempo, e
   ele tem duas partes com contratos diferentes (motion.js):

     CLASSE 2  a entrada da tela — o rótulo, a chamada e a chegada da
               carta como objeto. Dispara no gatilho e corre sozinha.
     CLASSE 1  a TROCA entre os três drinks. Presa à rolagem, sem folga.

   ╔══════════════════════════════════════════════════════════════════════╗
   ║ O SEXTO SCRUB DA PÁGINA, E POR QUE ELE PASSA NO TESTE                ║
   ║                                                                      ║
   ║ A regra do site é que scrub é raro, e o teste dela é uma pergunta:   ║
   ║ "que ESTADO da cena esta posição de rolagem representa?". Um         ║
   ║ paralaxe não passa — "a foto está 8vw à direita" é consequência de o ║
   ║ dedo ter andado, não um estado.                                      ║
   ║                                                                      ║
   ║ Aqui a resposta é direta: QUAL DRINK. A posição dentro da seção é a  ║
   ║ posição dentro da carta, do mesmo jeito que a posição dentro do      ║
   ║ Jardim é a hora do dia. Passa.                                       ║
   ║                                                                      ║
   ║ E `scrub: true`, sem número: o número é um atraso, não uma           ║
   ║ suavização — com ele a chapa continuaria deslizando depois de o dedo ║
   ║ parar. O argumento medido está no bloco do scrub em chapters.js.     ║
   ╚══════════════════════════════════════════════════════════════════════╝

   ── O gesto da troca: elas DESLIZAM, não dissolvem ──────────────────────

   Os dois vizinhos desta seção são capítulos, e capítulos dissolvem — uma
   matéria vira outra por opacidade, com véu e câmera andando. Se a carta
   dissolvesse também, três telas seguidas usariam o mesmo dispositivo e a
   emenda deixaria de ser um acontecimento.

   Aqui a chapa que sai vai para a ESQUERDA e a que entra vem da DIREITA,
   uma empurrando a outra dentro de uma janela que não se mexe. É um copo
   sendo passado no balcão, e é o único deslocamento lateral com essa
   função na página.

   ── E a troca não é uniforme ────────────────────────────────────────────

   Se os três drinks dividissem o curso em três fatias iguais, dois terços
   da rolagem seriam gastos com uma chapa em trânsito — e uma fotografia
   que quase nunca está parada não é uma fotografia, é uma transição. A
   linha do tempo abaixo dá a cada drink um PATAMAR e faz a passagem curta:

     0,00 — 0,90   Fitzgerald parado
     0,90 — 1,25   passagem
     1,25 — 2,15   Melancita parado
     2,15 — 2,50   passagem
     2,50 — 3,00   Gin Tropical parado

   São 0,70 de 3,00 em movimento — 23% do curso. O resto do tempo a pessoa
   está olhando um copo, que é o que ela veio fazer. */

import { gsap, ScrollTrigger, reducedMotion, EASE, autonomo, splitWords } from './motion.js'

const secao = document.querySelector('.copo')

if (secao) {
  const dash = secao.querySelector('.copo__dash')
  const linha = secao.querySelector('.copo__linha')
  const carta = secao.querySelector('.carta')
  const itens = [...secao.querySelectorAll('.carta__item')]

  /* Os alvos deixaram de ser os itens. A JANELA não viaja — ela é a
     abertura, e uma abertura que se desloca é um slide de apresentação. O
     que viaja é a chapa dentro dela (recortada pelo `overflow` da janela) e,
     em outro tempo, a legenda. */
  const chapas = itens.map((it) => it.querySelector('.carta__quadro img'))
  const legendas = itens.map((it) => [
    it.querySelector('.carta__nome'),
    it.querySelector('.carta__nota')
  ])

  /* A chamada é partida em palavras, cada uma na própria máscara
     (motion.js). As do `<b class="ouro">` têm tempo próprio: é o acento da
     tela e ele chega sozinho, depois de a primeira metade assentar. */
  const palavras = splitWords(linha)
  const acento = linha ? [...linha.querySelectorAll('.ouro .word__in')] : []
  const brancas = palavras.filter((p) => !acento.includes(p))

  if (reducedMotion) {
    /* O estado fechado mora no CSS, e precisa ser desfeito AQUI além da
       media query: o caminho sem movimento também é alcançado pelo
       ?reduce=1 de desenvolvimento, que não aciona media query nenhuma.

       `y: 0` junto com `yPercent` — sem ele o GSAP herda como base os 110%
       que o CSS já resolveu em pixels. A conta inteira está abaixo. */
    /* A classe é o que troca o layout para a pilha vertical (copo.css).
       Ela vem daqui e não de uma media query porque `reducedMotion` é a
       única autoridade sobre este estado, e ela inclui o ?reduce=1. */
    secao.classList.add('copo--lista')

    gsap.set(palavras, { y: 0, yPercent: 0 })
    gsap.set(dash, { scaleX: 1 })
    gsap.set(carta, { autoAlpha: 1, x: 0 })
    gsap.set(itens, { autoAlpha: 1 })
    gsap.set(chapas, { xPercent: 0, scale: 1, autoAlpha: 1 })
    gsap.set(legendas.flat(), { x: 0, autoAlpha: 1 })
  } else {
    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ `y: 0` JUNTO COM `yPercent` — e sem ele a chamada não sai da      ║
       ║ máscara                                                           ║
       ║                                                                  ║
       ║ O estado fechado das palavras mora no CSS:                        ║
       ║ `.word__in { transform: translateY(110%) }`. O GSAP, ao tocar no  ║
       ║ transform pela primeira vez, lê o valor COMPUTADO — e o navegador ║
       ║ já resolveu a porcentagem em pixels, `matrix(1,0,0,1,0,35.25)`.   ║
       ║ Não há como ele saber que aquilo era 110%.                        ║
       ║                                                                  ║
       ║ Então o 35,25px vira a BASE (`y`) e o `yPercent` da timeline      ║
       ║ passa a ser um segundo deslocamento por cima dela. A timeline     ║
       ║ corria inteira, chegava a progress 1, e as palavras ficavam       ║
       ║ exatamente onde nasceram. Medido:                                 ║
       ║                                                                  ║
       ║   translate(0%, 0.0078%) translate3d(0px, 35.2516px, 0px)         ║
       ║                                                                  ║
       ║ A regra vale para o site todo: transform em PORCENTAGEM no CSS    ║
       ║ que o GSAP vá animar em porcentagem precisa ser zerado em pixels  ║
       ║ na primeira escrita.                                              ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    gsap.set(palavras, { y: 0, yPercent: 110 })

    /* Os três itens ficam SEMPRE presentes e visíveis: quem esconde a chapa
       que não é a da vez é o recorte da janela, não a opacidade dela. É essa
       troca que permite as duas chapas coexistirem dentro da abertura
       durante a passagem — sem isso não há uma empurrando a outra, há uma
       apagando e outra acendendo.

       A legenda é o contrário: ela mora FORA da janela, nada a recorta, e
       por isso é ela que carrega o `autoAlpha`. */
    gsap.set(itens, { autoAlpha: 1 })
    gsap.set(chapas, { xPercent: 100, scale: 1.06 })
    gsap.set(chapas[0], { xPercent: 0, scale: 1 })
    gsap.set(legendas.flat(), { autoAlpha: 0, x: 22 })
    gsap.set(legendas[0], { autoAlpha: 1, x: 0 })

    /* ── A entrada da tela (classe 2) ──────────────────── */

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ A ENTRADA NÃO ENCOSTA NAS CHAPAS — uma propriedade, um dono      ║
       ║                                                                  ║
       ║ A primeira versão disto fazia a chapa 1 chegar da direita na      ║
       ║ entrada, para que a abertura da seção e a troca entre drinks      ║
       ║ fossem o mesmo gesto. A ideia é boa e o encaixe estava errado:    ║
       ║ o `xPercent` das chapas passou a ter DOIS donos, a timeline de    ║
       ║ entrada e o scrub da carta.                                       ║
       ║                                                                  ║
       ║ Medido a 3.900px de rolagem, com a carta já no terceiro drink:    ║
       ║                                                                  ║
       ║   item 0  translate(0px, 0px)   opacity 1   <<< devia estar fora  ║
       ║   item 1  translate(-110%, 0%)  opacity 0                         ║
       ║   item 2  translate(0px, 0px)   opacity 1                         ║
       ║                                                                  ║
       ║ O scrub levou a chapa 1 para -110% e ali PAROU de reescrever (um  ║
       ║ tween que terminou não escreve mais). A entrada, que toca depois, ║
       ║ escreveu 0 por cima e ganhou. Na tela: os três nomes empilhados   ║
       ║ no mesmo lugar, ilegíveis.                                        ║
       ║                                                                  ║
       ║ Agora o scrub é dono ÚNICO da posição das três chapas, e a        ║
       ║ entrada anima a LISTA inteira — outro elemento, nenhuma disputa.  ║
       ║ A carta chega como um objeto só, que é o que ela é.               ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    gsap.set(carta, { autoAlpha: 0, x: 26 })

    autonomo(secao, (t) => {
      t.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .to(carta, { autoAlpha: 1, x: 0, duration: 1.3, ease: EASE }, 0.1)
        .to(brancas, { yPercent: 0, duration: 0.95, ease: EASE, stagger: 0.06 }, 0.5)
        .to(acento, { yPercent: 0, duration: 1.05, ease: EASE, stagger: 0.075 }, 1.5)
    }, {
      /* Cedo: a composição termina de se montar enquanto a seção ainda
         sobe, e o que toma a tela é uma coisa pronta. */
      start: 'top 78%'
    })

    /* ── A troca entre os três (classe 1) ──────────────── */

    /* O curso do scrub é o mesmo `--run` que o CSS usa para dar altura à
       seção, lido do HTML: uma fonte só para os dois, ou a timeline e o
       layout discordam sobre onde a carta acaba. */
    const curso = Number(secao.dataset.run) || 150

    const passar = gsap.timeline({
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: `+=${curso}%`,
        scrub: true,
        invalidateOnRefresh: true
      }
    })

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ A PASSAGEM FOI REFEITA — era um slide, virou uma travessia        ║
       ║                                                                  ║
       ║ A queixa: "está travado, passa rápido, meio forçado, não é suave  ║
       ║ e premium". Três causas, e nenhuma era a duração sozinha.         ║
       ║                                                                  ║
       ║ 1. A JANELA VIAJAVA. Quem deslizava era o `.carta__item` inteiro, ║
       ║    e a moldura vai dentro dele — então a abertura atravessava a   ║
       ║    tela junto com a fotografia. Isso é um slide de apresentação:  ║
       ║    o quadro sai de cena e outro quadro entra.                     ║
       ║                                                                  ║
       ║    Agora a janela é FIXA. Ela é uma abertura, e o que passa é a   ║
       ║    chapa por dentro dela, recortada pelo `overflow`. O olho tem   ║
       ║    um ponto de apoio parado enquanto a matéria corre — que é a    ║
       ║    diferença entre uma vitrine e um carrossel.                    ║
       ║                                                                  ║
       ║ 2. AS DUAS ANDAVAM JUNTAS, NO MESMO PASSO. Dois planos na mesma   ║
       ║    velocidade não têm profundidade: leem como um retângulo só.    ║
       ║    A que SAI anda 45% e cresce 6%; a que ENTRA anda os 100% e     ║
       ║    assenta de 1,06 para 1. A de trás fica para trás e a da frente ║
       ║    desliza por cima dela — é paralaxe, e é o que faz uma          ║
       ║    passagem parecer cara.                                         ║
       ║                                                                  ║
       ║ 3. `ease: 'none'`. O argumento anterior era "quem dá a curva é o  ║
       ║    dedo". Está errado na tela: uma translação linear tem partida  ║
       ║    e chegada DURAS, e é exatamente isso que se lê como travado.   ║
       ║    `power2.inOut` põe uma curva na passagem sem tirar o controle  ║
       ║    do dedo — a posição continua sendo a rolagem, o que muda é a   ║
       ║    taxa com que ela é gasta.                                      ║
       ║                                                                  ║
       ║ E a legenda chega DEPOIS da chapa. Nome e ingredientes não são    ║
       ║ parte da fotografia: a chapa assenta, e só então o nome dela      ║
       ║ aparece. Um cardápio não anuncia antes de servir.                 ║
       ╚══════════════════════════════════════════════════════════════════╝

       ── E o curso da passagem dobrou ────────────────────────────────────

       Era 0,35 de 3,00 — a 150% de curso numa tela de 896, 157px de
       rolagem para atravessar a tela inteira. Um polegar gasta isso em um
       terço de segundo, e daí "passa rápido".

       Agora são 0,60, e o curso subiu de 150 para 175: 314px por passagem,
       o dobro. O tempo em movimento vai de 23% para 40% do curso — a tela
       deixa de ser "parada, tranco, parada". */
    const PASSAGENS = [[0.70, 1.30], [2.00, 2.60]]

    PASSAGENS.forEach(([entra, sai], i) => {
      const dur = sai - entra

      /* ╔════════════════════════════════════════════════════════════════╗
         ║ `fromTo` NAS DUAS PONTAS + `immediateRender: false`             ║
         ║                                                                ║
         ║ As duas metades da mesma armadilha, e as duas custaram uma      ║
         ║ medição nesta seção.                                            ║
         ║                                                                ║
         ║ `fromTo` porque um `to` dentro de um scrub grava o valor de     ║
         ║ PARTIDA no instante em que a timeline é criada, e nesse         ║
         ║ instante nenhuma chapa está no estado de cena.                  ║
         ║                                                                ║
         ║ `immediateRender: false` porque `fromTo` faz o contrário e é    ║
         ║ pior: por padrão ele ESCREVE o estado de partida na criação. A  ║
         ║ segunda volta deste laço cria a saída da chapa 2, cujo `from` é ║
         ║ "visível e no lugar" — e isso era escrito no elemento antes de  ║
         ║ qualquer rolagem, apagando o `gsap.set` que a tinha posto fora  ║
         ║ de cena.                                                       ║
         ║                                                                ║
         ║ Medido a 3.200px, no meio da primeira passagem:                 ║
         ║                                                                ║
         ║   Fitzgerald  opacity 0.486   (correto, saindo)                 ║
         ║   Melancita   opacity 1       <<< devia ser 0, entra só em 1,03 ║
         ║   Gin Tropical opacity 0                                        ║
         ║                                                                ║
         ║ Na tela: os dois nomes legíveis um por cima do outro no meio do ║
         ║ gesto. Com `false`, quem manda no estado inicial são os         ║
         ║ `gsap.set` lá de cima, e a timeline só escreve quando a         ║
         ║ rolagem chega nela.                                             ║
         ╚════════════════════════════════════════════════════════════════╝ */
      const cru = { immediateRender: false, ease: 'power2.inOut' }

      // a que sai: anda menos da metade, e cresce — ela fica para trás
      passar.fromTo(chapas[i],
        { xPercent: 0, scale: 1 },
        { xPercent: -45, scale: 1.06, duration: dur, ...cru },
        entra)

      // a que entra: atravessa a abertura inteira e ASSENTA na escala
      passar.fromTo(chapas[i + 1],
        { xPercent: 100, scale: 1.06 },
        { xPercent: 0, scale: 1, duration: dur, ...cru },
        entra)

      /* A legenda que sai vai embora na PRIMEIRA metade da passagem, e a
         que entra chega na última — nunca as duas ao mesmo tempo, ou os
         dois nomes se leem sobrepostos no meio do gesto. */
      passar.fromTo(legendas[i],
        { x: 0, autoAlpha: 1 },
        { x: -22, autoAlpha: 0, duration: dur * 0.45, ease: 'power1.in', immediateRender: false },
        entra)

      passar.fromTo(legendas[i + 1],
        { x: 22, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: dur * 0.55, ease: 'power2.out', immediateRender: false },
        entra + dur * 0.55)
    })

    // o patamar final: sem ele a timeline acabaria em 2,60 e o resto do
    // curso não teria dono — a carta ficaria parada esperando a rolagem
    passar.to({}, { duration: 0.4 }, 2.6)

    /* ── A saída ───────────────────────────────────────── */

    /* A chamada sobe e sai; a carta fica. O que a seção mostrou é uma
       lista, e uma lista não precisa de gesto de despedida — a rolagem já a
       leva embora. Sai só o que é dito.

       `bottom 76%`: primeiro esta tela se desfaz, depois a de baixo se
       arma. O capítulo 02 bate o preto dele em `top 78%` e monta a
       composição em `top 40%`. */
    const saida = gsap.timeline({ paused: true })
    saida.to(linha, { opacity: 0, y: -18, duration: 0.7, ease: EASE }, 0)
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
