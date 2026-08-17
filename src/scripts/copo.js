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
    gsap.set(itens, { xPercent: 0, autoAlpha: 1 })
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

    /* As chapas nascem fora, à direita, menos a primeira. `autoAlpha` além
       do deslocamento: uma chapa a 110% ainda é pintada pelo navegador e
       ainda intercepta leitura de tela — e com três camadas de tela cheia
       empilhadas isso é trabalho por nada em todo quadro. */
    gsap.set(itens, { xPercent: 110, autoAlpha: 0 })
    gsap.set(itens[0], { xPercent: 0, autoAlpha: 1 })

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

    /* Duas passagens, e as duas são o mesmo par: a de fora sai pela
       esquerda, a de dentro entra pela direita. `ease: 'none'` porque quem
       dá a curva é o dedo — dentro de um patamar não há nada acontecendo, e
       a curva do gesto está na largura da janela de passagem, não na
       aceleração dela. */
    const PASSAGENS = [[0.90, 1.25], [2.15, 2.50]]

    PASSAGENS.forEach(([entra, sai], i) => {
      const dur = sai - entra

      /* `fromTo` também na que SAI. Um `to` dentro de um scrub grava o
         valor de partida no instante em que a timeline é criada — e nesse
         instante a chapa 1 ainda está no estado inicial (110%), não no de
         cena (0%). O tween interpolaria de 110 a -110, atravessando a tela
         de fora a fora. Com `fromTo` as duas pontas vêm do objeto. */
      passar.fromTo(itens[i],
        { xPercent: 0, autoAlpha: 1 },
        { xPercent: -110, autoAlpha: 0, duration: dur, ease: 'none' },
        entra)

      passar.fromTo(itens[i + 1],
        { xPercent: 110, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: dur, ease: 'none' },
        entra)
    })

    // o patamar final: sem ele a timeline acabaria em 2,50 e o último terço
    // do curso não teria dono — a carta ficaria parada esperando a rolagem
    passar.to({}, { duration: 0.5 }, 2.5)

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
