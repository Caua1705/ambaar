/* A carta · 19h.

   O porquê está no HTML e a composição em copo.css. Aqui está o tempo, e
   ele tem duas partes com contratos diferentes (motion.js):

     CLASSE 2  a entrada da tela — o rótulo, a chamada e a chegada da
               carta como objeto. Dispara no gatilho e corre sozinha.
     CLASSE 1  a FITA. Presa à rolagem, sem folga.

   ╔══════════════════════════════════════════════════════════════════════╗
   ║ O SEXTO SCRUB DA PÁGINA, E POR QUE ELE PASSA NO TESTE                ║
   ║                                                                      ║
   ║ A regra do site é que scrub é raro, e o teste dela é uma pergunta:   ║
   ║ "que ESTADO da cena esta posição de rolagem representa?". Um         ║
   ║ paralaxe não passa — "a foto está 8vw à direita" é consequência de o ║
   ║ dedo ter andado, não um estado.                                      ║
   ║                                                                      ║
   ║ Aqui a resposta é direta: ONDE A CARTA ESTÁ ABERTA. A posição dentro ║
   ║ da seção é a posição dentro da fita, do mesmo jeito que a posição    ║
   ║ dentro do Jardim é a hora do dia. Passa — e passa com folga, porque  ║
   ║ agora o estado é CONTÍNUO: não há "drink 1" e "drink 2" com um       ║
   ║ evento no meio, há um deslocamento e um número real.                 ║
   ║                                                                      ║
   ║ E `scrub: true`, sem número: o número é um atraso, não uma           ║
   ║ suavização — com ele a fita continuaria deslizando depois de o dedo  ║
   ║ parar. O argumento medido está no bloco do scrub em chapters.js.     ║
   ╚══════════════════════════════════════════════════════════════════════╝

   ╔══════════════════════════════════════════════════════════════════════╗
   ║ A TERCEIRA VERSÃO DA PASSAGEM, E ELA DEIXOU DE SER UMA PASSAGEM      ║
   ║                                                                      ║
   ║ 1ª  uma chapa empurrando a outra dentro de uma janela parada.        ║
   ║ 2ª  a janela fixa, paralaxe entre as duas, e uma linha âmbar         ║
   ║     varrendo a abertura para descobrir a próxima.                    ║
   ║                                                                      ║
   ║ A queixa voltou igual nas duas: "está travado, passa rápido, meio    ║
   ║ forçado, não é suave e premium". Duas passadas trataram isso como    ║
   ║ problema de ajuste — a duração, a curva, a distância — e o defeito   ║
   ║ não estava em nenhum dos três.                                       ║
   ║                                                                      ║
   ║ Estava na FORMA. As duas versões eram uma transição: estado, evento, ║
   ║ estado. Um evento tem começo e fim, e é o fim que se lê como tranco  ║
   ║ — não importa quanto se suavize o meio dele. E o evento era caro de  ║
   ║ ler: 240px de matéria trocando em 313px de rolagem, um terço de      ║
   ║ segundo de polegar.                                                  ║
   ║                                                                      ║
   ║ Esta versão não tem evento. As três chapas estão lado a lado numa    ║
   ║ fita e o que a rolagem faz é ANDAR COM ELA. Não há dois estados      ║
   ║ para emendar, então não há emenda para consertar. É o mesmo motivo   ║
   ║ pelo qual arrastar uma folha de papel no balcão nunca "trava".       ║
   ║                                                                      ║
   ║ ── E a razão entre dedo e matéria é o que faz pesar ──────────────── ║
   ║                                                                      ║
   ║   antes   240px de matéria  ÷  313px de dedo  =  0,77 : 1            ║
   ║   agora   302px de matéria  ÷  609px de dedo  =  0,50 : 1            ║
   ║                                                                      ║
   ║ Um objeto que anda METADE do que a mão anda tem inércia. Um que anda ║
   ║ quase o mesmo tem pressa. É esta conta — e não a curva de            ║
   ║ aceleração — que separa "premium" de "forçado", e ela é a razão de o ║
   ║ `--run` da seção ter subido de 175 para 200.                         ║
   ╚══════════════════════════════════════════════════════════════════════╝

   ── Onde a fita para, e por que ela para ────────────────────────────────

   Um cardápio tem itens, e item é coisa que se lê parado. A fita anda em
   68% do curso e descansa nos outros 32%, em três patamares:

     0,00 — 0,11   Fitzgerald aberto      (197px de rolagem)
     0,11 — 0,45   a fita anda um passo   (609px)
     0,45 — 0,58   Melancita aberto       (233px)
     0,58 — 0,92   a fita anda um passo   (609px)
     0,92 — 1,00   Gin Tropical aberto    (143px)

   Os patamares NÃO são o defeito antigo de volta. Antes eram dois estados
   com um corte entre eles; aqui são pausas dentro de um mesmo movimento —
   a fita desacelera, descansa e volta a andar, sem nunca trocar de
   natureza. `power1.inOut` faz a partida e a chegada de cada passo, que é
   o mínimo para o patamar não ter aresta.

   ── As três coisas que andam junto com a fita ───────────────────────────

     a chapa   deriva ±6% dentro da própria janela, contra o movimento.
               Dois planos com passos diferentes é o que dá profundidade —
               e é o teto que a escala 1,12 permite (a conta em copo.css).
     a janela  a que não é a da vez fica a 34%. É o degrau de luminância
               que separa duas fotografias feitas com a mesma luz, e é o
               que impede a espia de 72px de competir com o texto vertical.
     a legenda o nome sai no começo do passo e o próximo entra no fim
               dele. Nunca dois nomes legíveis ao mesmo tempo. */

import { gsap, ScrollTrigger, reducedMotion, EASE, autonomo, splitWords } from './motion.js'

const secao = document.querySelector('.copo')

if (secao) {
  const dash = secao.querySelector('.copo__dash')
  const linha = secao.querySelector('.copo__linha')
  const nota = secao.querySelector('.copo__nota')
  const trilho = secao.querySelector('.carta__trilho')
  const fita = secao.querySelector('.carta')
  const itens = [...secao.querySelectorAll('.carta__item')]

  const janelas = itens.map((it) => it.querySelector('.carta__quadro'))
  const chapas = itens.map((it) => it.querySelector('.carta__quadro img'))
  const legendas = itens.map((it) => [
    it.querySelector('.carta__nome'),
    it.querySelector('.carta__nota')
  ])

  /* A chamada é partida em palavras, cada uma na própria máscara
     (motion.js). As de um `<b class="ouro">`, se houver, têm tempo próprio:
     o acento chega sozinho, depois de a primeira metade assentar.

     ⚠︎ HOJE NÃO HÁ ACENTO NESTA FRASE. A disciplina do âmbar apertou e
     sobraram duas palavras douradas na página inteira — "house" no
     capítulo 01 e "noite" no fecho —, e "da casa" foi uma das que saíram.
     O mecanismo fica porque ele é a razão de esta seção usar `splitWords` e
     não `splitChars` (a nota está em motion.js), e porque a lista de dois
     não é uma lei da física. O que não pode ficar é um tween sem alvo: com
     `acento` vazio o GSAP avisa no console a cada carga, e um aviso por
     carga é o começo de um console que ninguém lê. Ver a guarda na
     timeline, abaixo. */
  const palavras = splitWords(linha)
  const acento = linha ? [...linha.querySelectorAll('.ouro .word__in')] : []
  const brancas = palavras.filter((p) => !acento.includes(p))

  /* A chapa é 12% maior do que a janela e a sobra é o curso do paralaxe:
     6% de folga de cada lado, 6% de deriva. Um ponto além e aparece o
     carvão do palco por dentro da moldura. A conta está em copo.css, e o
     par não pode ser desmembrado.

     E 12 é um TETO medido, não um gosto: a 18 o alecrim do Gin Tropical —
     o garnish mais alto das três chapas — saía cortado pela aresta de
     cima. O `object-position` da folha foi calibrado para o corte de uma
     janela sem escala, e ampliar a chapa gasta essa calibração. */
  const ESCALA = 1.12
  const DERIVA = 6
  const APAGADO = 0.34

  if (reducedMotion) {
    /* O estado fechado mora no CSS, e precisa ser desfeito AQUI além da
       media query: o caminho sem movimento também é alcançado pelo
       ?reduce=1 de desenvolvimento, que não aciona media query nenhuma.

       `y: 0` junto com `yPercent` — sem ele o GSAP herda como base os 110%
       que o CSS já resolveu em pixels. A conta inteira está abaixo. */
    /* A classe é o que levanta a fita e a transforma na pilha vertical
       (copo.css). Ela vem daqui e não de uma media query porque
       `reducedMotion` é a única autoridade sobre este estado, e ela inclui
       o ?reduce=1. */
    secao.classList.add('copo--lista')

    gsap.set(palavras, { y: 0, yPercent: 0 })
    gsap.set(dash, { scaleX: 1 })
    gsap.set(nota, { autoAlpha: 1, y: 0 })
    gsap.set(trilho, { autoAlpha: 1, x: 0 })
    gsap.set(fita, { x: 0 })
    /* Escala 1 e deriva 0: sem movimento não há paralaxe, e uma chapa 18%
       ampliada sem motivo é só um corte pior. */
    gsap.set(chapas, { xPercent: 0, scale: 1 })
    gsap.set(janelas, { opacity: 1 })
    gsap.set(legendas.flat(), { autoAlpha: 1 })
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

    /* Os três itens ficam SEMPRE presentes e visíveis — eles são a fita, e
       uma fita com dois terços apagados é um carrossel. O que distingue o
       drink da vez é o degrau de luminância na janela, não a presença.

       A legenda é o contrário: nome e nota pertencem a UM item, e dois
       nomes legíveis ao mesmo tempo é o defeito que a segunda versão desta
       seção produziu. Quem for a legenda da vez tem o `autoAlpha`. */
    gsap.set(fita, { x: 0 })
    gsap.set(janelas, { opacity: APAGADO })
    gsap.set(janelas[0], { opacity: 1 })

    /* A deriva inicial de cada chapa é a posição que ela terá quando o item
       dela CHEGAR ao lugar de leitura: zero. Quem ainda não chegou está em
       −DERIVA e vai subindo até zero; quem já passou fica em +DERIVA.

       Só as duas primeiras nascem diferentes porque a terceira, no primeiro
       passo, está fora da tela — dar paralaxe a ela ali seria gastar curso
       em algo que ninguém vê. */
    gsap.set(chapas, { scale: ESCALA, xPercent: (i) => (i === 0 ? 0 : -DERIVA) })

    gsap.set(legendas.flat(), { autoAlpha: 0 })
    gsap.set(legendas[0], { autoAlpha: 1 })

    /* ── A entrada da tela (classe 2) ──────────────────── */

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ DUAS COISAS ANDAM DE LADO NESTA TELA, E POR ISSO SÃO DOIS        ║
       ║ ELEMENTOS                                                        ║
       ║                                                                  ║
       ║ A entrada faz a carta chegar da direita; o scrub faz a fita andar ║
       ║ para a esquerda. As duas escrevem `x`. Quando escreviam no MESMO  ║
       ║ elemento, a última a tocar ganhava — medido a 3.900px de rolagem, ║
       ║ com a carta já no terceiro drink:                                 ║
       ║                                                                  ║
       ║   item 0  translate(0px, 0px)   opacity 1   <<< devia estar fora  ║
       ║   item 1  translate(-110%, 0%)  opacity 0                         ║
       ║   item 2  translate(0px, 0px)   opacity 1                         ║
       ║                                                                  ║
       ║ O scrub levava a chapa até o fim e ali PARAVA de reescrever (um   ║
       ║ tween que terminou não escreve mais); a entrada, que toca depois, ║
       ║ escrevia 0 por cima e ganhava. Na tela: os três nomes empilhados. ║
       ║                                                                  ║
       ║ O conserto é estrutural e está no HTML: `.carta__trilho` é o      ║
       ║ objeto que CHEGA, `.carta` é o objeto que ANDA. Uma propriedade,  ║
       ║ um dono, e nenhum dos dois precisa saber do outro.                ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    gsap.set(trilho, { autoAlpha: 0, x: 26 })

    /* A descrição não é partida em palavras. A chamada é — ela é a frase da
       tela e chega SERVIDA, palavra a palavra, dentro das máscaras. Esta é
       uma explicação, e explicação que chega palavra a palavra vira legenda
       de vídeo. Ela sobe inteira, uma vez, depois da chamada. */
    gsap.set(nota, { autoAlpha: 0, y: 12 })

    autonomo(secao, (t) => {
      t.to(dash, { scaleX: 1, duration: 0.8, ease: EASE }, 0)
        .to(trilho, { autoAlpha: 1, x: 0, duration: 1.3, ease: EASE }, 0.1)
        .to(brancas, { yPercent: 0, duration: 0.95, ease: EASE, stagger: 0.06 }, 0.5)
        // 1,45: depois de a última palavra da chamada ter assentado
        .to(nota, { autoAlpha: 1, y: 0, duration: 1.0, ease: EASE }, 1.45)

      // a guarda anotada lá em cima: sem `<b class="ouro">` na frase não há
      // segundo tempo, e um tween sem alvo é um aviso do GSAP por carga
      if (acento.length) {
        t.to(acento, { yPercent: 0, duration: 1.05, ease: EASE, stagger: 0.075 }, 1.5)
      }
    }, {
      /* Cedo: a composição termina de se montar enquanto a seção ainda
         sobe, e o que toma a tela é uma coisa pronta. */
      start: 'top 78%'
    })

    /* ── A fita (classe 1) ─────────────────────────────── */

    /* O curso do scrub é o mesmo `--run` que o CSS usa para dar altura à
       seção, lido do HTML: uma fonte só para os dois, ou a timeline e o
       layout discordam sobre onde a carta acaba. */
    const curso = Number(secao.dataset.run) || 200

    /* O PASSO É MEDIDO, NÃO DECLARADO. Ele é `--jan-w + --jan-gap`, e as
       duas são unidades de viewport que mudam com o telefone deitado, com a
       barra do navegador e com a media query de 900px. Perguntar ao layout
       (`offsetLeft` de um item para o outro) é a única fonte que não pode
       divergir da tela — e como é uma função, o `invalidateOnRefresh`
       recalcula tudo a cada mudança de medida. */
    const passo = () => itens[1].offsetLeft - itens[0].offsetLeft

    const fitaTl = gsap.timeline({
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: `+=${curso}%`,
        scrub: true,
        invalidateOnRefresh: true
      }
    })

    const VIAGENS = [[0.11, 0.45], [0.58, 0.92]]

    VIAGENS.forEach(([de, ate], k) => {
      const dur = ate - de

      /* `immediateRender: false` em TODOS. `fromTo` escreve o estado de
         partida na criação da timeline, e a segunda volta deste laço tem
         como `from` um item que ainda não chegou — isso seria escrito antes
         de qualquer rolagem e apagaria os `gsap.set` acima. Medido na
         versão anterior: no meio do primeiro passo os três nomes ficavam
         legíveis ao mesmo tempo. */
      const cru = { immediateRender: false, ease: 'power1.inOut' }

      /* 1 · A FITA. Alvo absoluto (`-(k+1) * passo`) e não incremento: um
         alvo absoluto é reversível e sobrevive a um refresh no meio do
         curso; um incremento acumula erro. */
      fitaTl.fromTo(fita,
        { x: () => -k * passo() },
        { x: () => -(k + 1) * passo(), duration: dur, ...cru },
        de)

      /* 2 · O paralaxe. A chapa que sai deriva para a direita, a que entra
         assenta em zero — dois planos, dois passos, e é isso que impede a
         fita de ler como um retângulo só. */
      fitaTl.fromTo(chapas[k],
        { xPercent: 0 },
        { xPercent: DERIVA, duration: dur, ...cru },
        de)

      fitaTl.fromTo(chapas[k + 1],
        { xPercent: -DERIVA },
        { xPercent: 0, duration: dur, ...cru },
        de)

      /* 3 · A luz troca de janela. Linear e por dentro do passo (começa a
         15% e acaba a 85%): a mudança de brilho não pode ter gesto próprio,
         ela é só a consequência de o item ter chegado. */
      fitaTl.fromTo(janelas[k],
        { opacity: 1 },
        { opacity: APAGADO, duration: dur * 0.7, ease: 'none', immediateRender: false },
        de + dur * 0.15)

      fitaTl.fromTo(janelas[k + 1],
        { opacity: APAGADO },
        { opacity: 1, duration: dur * 0.7, ease: 'none', immediateRender: false },
        de + dur * 0.15)

      /* 4 · A legenda que sai vai embora no primeiro terço do passo, e a
         que entra chega quando a fita já está quase parada. Um cardápio não
         anuncia antes de servir. */
      fitaTl.fromTo(legendas[k],
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: dur * 0.28, ease: 'power1.in', immediateRender: false },
        de)

      fitaTl.fromTo(legendas[k + 1],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: dur * 0.30, ease: 'power2.out', immediateRender: false },
        ate - dur * 0.14)
    })

    // o patamar final: sem ele a timeline acabaria em 0,92 e os últimos
    // 143px de curso não teriam dono — a fita ficaria parada esperando
    fitaTl.to({}, { duration: 0.08 }, 0.92)

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
