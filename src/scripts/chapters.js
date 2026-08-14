/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   ── As três classes de movimento, aplicadas ─────────────────────────────

   A regra do site está em motion.js. Aqui está como ela cai nos capítulos, e
   nesta passada ela ficou mais estrita em um ponto e mais solta em outro:

     CLASSE 1 · preso ao dedo
       os quadros do entardecer, os quadros da sala enchendo, a foto
       respirando, a demão de céu ganhando corpo, o relógio contando e o
       poente atravessando a tela. Em todos, a posição da rolagem
       corresponde literalmente a um estado da cena.

     CLASSE 2 · disparado
       todo o texto, todas as entradas, todas as saídas, a CHEGADA de cada
       capítulo (que era scrub e virou disparo nesta passada) e a PASSAGEM
       do Salão. Corre na velocidade dela e termina com o dedo parado.

     CLASSE 3 · ambiente
       o vídeo do Reservado e a SALA DO SALÃO depois de o dedo soltá-la.

   ── Os três ambientes ───────────────────────────────────────────────────

     01 Jardim    22 quadros de um plano fixo, presos ao dedo: o entardecer
                  acontece de verdade — as luzinhas acendem, a vela aparece
                  na mesa, o céu perde a luz. E no fim o poente ATRAVESSA a
                  tela (ver .poente, no HTML).
     02 Salão     34 quadros de um plano fixo. A sala começa vazia e ENCHE
                  em uma passada de dedo, e a 44% do curso ela é SOLTA:
                  passa a correr sozinha. Depois, a passagem — a câmera
                  chega perto até a sala virar luz, e a luz virar um rosto.
     03 Reservado vídeo em plano fixo a meia velocidade, só as chamas se
                  mexendo. É o fim da noite, não o clímax dela.

   Os capítulos 01 e 02 são deliberadamente o MESMO mecanismo, e é isso que
   dá forma à noite: um é o que o sol faz com um lugar, o outro é o que as
   pessoas fazem com ele. Mesma câmera travada, mesmo scrub, assuntos
   opostos — a repetição é o argumento, não uma economia.

   O 03 é o contrário dos dois: movimento que corre no tempo dele e não no
   do dedo. Depois de duas horas em que a rolagem controlava o mundo, a
   última sala se mexe sozinha e não pede nada — que é literalmente o que o
   texto dela diz. */

import {
  gsap, ScrollTrigger, reducedMotion, EASE, entrada, autonomo, laco,
  splitChars, splitLine, prioridadeRefresh
} from './motion.js'
import { criarSequencia } from './frames.js'

const NATURAL = { opacity: 1, y: 0, x: 0, scaleX: 1 }
const OVERLAP = 0.3 // fatia da janela compartilhada com a vizinha

/* Onde a saída de cada capítulo dispara, em fração do curso pinado. Não é
   um número só porque as três saídas têm durações diferentes de gesto: o
   poente do Jardim ocupa o último terço, o Salão se parte em um segundo. */
const SAIDA_EM = { engolir: 0.74, parte: 0.9, fecha: 0.84 }

/* janela: em que fatia do curso pinado a sequência é lida. Fora dela o
   canvas fica no primeiro ou no último quadro pedido — que é como se compra
   uma batida de espera sem pagar um único byte a mais.

   ate: o último quadro que o DEDO alcança. Quando é menor que o total, o
   que sobra é o material do laço livre (ver "a soltura").
   laco: o trecho que corre sozinho depois da soltura, em vaivém.
   fps: a velocidade do laço. Ver a conta no comentário da soltura. */
const SEQUENCIAS = {
  dusk: {
    total: 22,
    caminho: (i) => `/frames/dusk/d_${String(i + 1).padStart(3, '0')}.webp`
  },
  /* ── O mapa do curso do Salão, e ele encolheu ────────────────────────

     "O vídeo do Salão leva cinco passadas de dedo para terminar." Levava,
     e a conta explica por quê: o capítulo tinha 150% de curso pinado —
     1,5 tela — e a sala enchia ao longo de 47% dele, isto é, 0,7 tela de
     rolagem só para a matéria. Somando a folga da frente, a soltura, o
     corte e a saída, o capítulo inteiro custava 2,5 telas.

     Agora o curso é 115% e a sala enche em 35% dele:

       0.05 — 0.40   o dedo enche a sala (quadros 0 → 26)
       0.44          o dedo SOLTA: a sala passa a correr sozinha
       0.50          a PASSAGEM começa (a câmera chega perto)
       0.90          a saída do capítulo

     0,35 × 1030px = 360px. Uma passada de polegar num telefone move entre
     400 e 600px, então a sala inteira enche numa passada — contra as três
     ou quatro que custava.

     ── E por que o tempo continua passando ─────────────────────────────

     Encurtar o curso não encurta o ACONTECIMENTO, porque o que faz "o
     tempo passar" nesta seção nunca foi a distância de rolagem: é a
     sequência ser monotônica (a sala só enche, nunca esvazia), é o relógio
     contar 20h → 23h em cima dela, e — o que mais importa — é a sala
     continuar se mexendo depois que o dedo para.

     A soltura subiu de 0.56 para 0.44 justamente por isso. Metade do
     capítulo agora é tempo que corre sozinho. O usuário paga menos dedo e
     recebe MAIS duração, porque a duração deixou de ser cobrada dele. */
  sala: {
    total: 34,
    janela: [0.05, 0.40],
    ate: 26,
    laco: [24, 33],
    fps: 6,
    /* A âncora horizontal do desenho no canvas.

       O `cover` do canvas centrava os dois eixos, e num telefone ele joga
       fora 44% da largura do quadro (ver a conta em scripts/frames.mjs).
       Centrado, os 56% que sobravam caíam em cima do quadro na parede e da
       cabine — a multidão inteira ficava nas bordas do arquivo, fora da
       tela. A 0,58 a mesma janela cai em cima da porta por onde as pessoas
       entram e da faixa em que elas atravessam.

       Um número, e ele muda a seção de "uma sala escura onde alguém passa
       de vez em quando" para "uma sala enchendo". */
    ancora: 0.58,
    caminho: (i) => `/frames/sala/s_${String(i + 1).padStart(3, '0')}.webp`
  }
}

/* `y: 0` junto com o `yPercent`, e sem ele o poente não sobe.

   O CSS declara `transform: translate3d(0, 31.25%, 0)` para que o elemento
   esteja fora de cena antes de o JavaScript existir. O GSAP, ao tocar num
   elemento pela primeira vez, LÊ o transform computado — e o navegador
   devolve percentagem de translate já resolvida em pixels, num matrix().
   O GSAP interpreta esse valor como `y` em pixels e o mantém.

   O resultado é que `gsap.set(el, { yPercent: 31.25 })` compõe y(900px) +
   yPercent(31.25%), e o `.to()` seguinte anima só a segunda metade: o
   elemento percorre menos do que deveria e a faixa sólida nunca chega a
   cobrir a tela.

   Zerar `y` explicitamente descarta o valor lido e deixa a posição inteira
   nas mãos da percentagem, que é a única unidade que sobrevive a uma troca
   de altura de tela. */
const poente = document.querySelector('.poente')
if (poente && !reducedMotion) gsap.set(poente, { y: 0, yPercent: 31.25, opacity: 1 })

for (const chapter of document.querySelectorAll('.chapter')) {
  const stage = chapter.querySelector('.chapter__stage')
  const media = chapter.querySelector('.chapter__media')
  const imgs = [...chapter.querySelectorAll('.chapter__img')]
  /* As camadas da montagem são os PLANOS quando eles existem, e as fotos
     quando não. O plano é um embrulho cuja única função é andar: a foto
     dentro dele guarda a própria escala e âncora no CSS, e as duas coisas
     precisam de transform ao mesmo tempo. */
  const planos = [...chapter.querySelectorAll('.chapter__plano')]
  const camadas = planos.length ? planos : imgs
  const canvas = chapter.querySelector('.chapter__canvas')
  const video = chapter.querySelector('.chapter__video')
  const dusk = chapter.querySelector('.chapter__dusk')
  const label = chapter.querySelector('.chapter__label')
  const title = chapter.querySelector('.chapter__title')
  const text = chapter.querySelector('.chapter__text')
  const meta = chapter.querySelector('.chapter__meta')

  const { dash, text: labelText } = splitLine(label)
  const chars = splitChars(title)
  const curso = Number(chapter.dataset.run) || 180
  const tipoSaida = chapter.dataset.saida

  gsap.set(label, NATURAL)

  /* ── Sem movimento ─────────────────────────────────── */

  if (reducedMotion) {
    // estado final legível: o cartaz parado do ambiente e o texto inteiro
    gsap.set([dash, labelText, title, text, ...chars], NATURAL)
    gsap.set(camadas, { opacity: (i) => (i === camadas.length - 1 ? 1 : 0) })
    if (dusk) gsap.set(dusk, { opacity: 1 })
    if (canvas) canvas.remove()
    if (video) video.remove()
    continue
  }

  /* ── O curso pinado: só a matéria ──────────────────── */

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top top',
      end: `+=${curso}%`,
      pin: stage,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: prioridadeRefresh(chapter)
    }
  })

  // a imagem respira o capítulo inteiro. O meio grau de rotação e a escala
  // maior que 1 são o que impede a borda de descobrir os cantos
  tl.fromTo(media,
    { scale: 1.16, rotate: 0.4 },
    { scale: 1.02, rotate: 0, duration: 1, ease: 'none' }, 0)

  /* ── Quadro a quadro ───────────────────────────────── */

  /* Quem declara a sequência é o elemento que a HOSPEDA, não o capítulo: no
     Jardim é o .chapter__media inteiro (a sequência É a tela); no Salão é um
     .chapter__plano, porque lá ela é um plano entre dois. */
  const palcoSeq = chapter.querySelector('[data-seq]')
  const seq = SEQUENCIAS[palcoSeq?.dataset.seq]

  if (seq && canvas) {
    const player = criarSequencia({
      palco: palcoSeq,
      canvas,
      total: seq.total,
      caminho: seq.caminho,
      ancora: seq.ancora
    })

    /* Oitenta por cento de tela de antecedência, e não mais: o Jardim é a
       terceira seção da página, então uma antecedência maior põe os quadros
       na fila junto com a foto da hero — que é a única imagem que o usuário
       está esperando nesse momento. */
    player.carregarPerto(chapter, '80%')

    /* A janela do scrub não é o curso inteiro, e os dois capítulos usam a
       folga de maneiras diferentes:

         Jardim  0 → 1. O poente ocupa o capítulo todo; não há nada antes
                 nem depois dele.
         Salão   folga na frente (uma batida de sala vazia, que é o que faz
                 a primeira pessoa a entrar ser um acontecimento em vez do
                 estado inicial) e folga atrás — e a de trás não é espera:
                 é o trecho em que a sala corre sozinha.

       Fazer isso com a janela em vez de duplicar quadros no arquivo é de
       graça: a sequência não fica maior, só é lida mais devagar. */
    const janela = seq.janela ?? [0, 1]
    const ate = seq.ate ?? seq.total - 1
    const quadro = { v: 0 }

    // quem está desenhando: o dedo ou o relógio. Declarado antes da
    // timeline porque o onUpdate dela consulta a variável.
    let livre = false

    tl.to(quadro, {
      v: ate,
      duration: janela[1] - janela[0],
      ease: 'none',
      onUpdate: () => { if (!livre) player.desenhar(quadro.v) }
    }, janela[0])

    /* ── A soltura ───────────────────────────────────────

       O momento em que o site devolve o controle, e é o único da página.

       Durante todo o capítulo a sala enche porque o dedo empurra. A certa
       altura do curso o scrub é DESLIGADO e a mesma sequência passa a
       correr num relógio próprio (classe 3, motion.js): o usuário pode
       parar o polegar, e a sala continua se mexendo.

       É o argumento inteiro do site dito em um gesto. O dedo faz a noite
       CHEGAR; a casa faz a noite ACONTECER. E é a resposta direta ao pior
       defeito da versão anterior — um lugar cheio de gente que congelava no
       instante em que o usuário parava de rolar, que não lê como pausa, lê
       como travamento.

       ── A velocidade ─────────────────────────────────────────────────────

       6 quadros por segundo, e o número não é estético: é o tempo real. O
       original tem 8s; a curva de amostragem (scripts/frames.mjs) põe os
       quadros 12 a 33 sobre os últimos 5,6s de vídeo, o que dá 3,9 quadros
       por segundo de tempo REAL. A 6 a sala corre a uma vez e meia a
       velocidade original — depressa o bastante para ser inequivocamente
       movimento, devagar o bastante para o arrasto de obturador continuar
       fazendo sentido como arrasto.

       E o canvas mistura quadros vizinhos por alfa fracionário (frames.js),
       então o que se vê a 6/s não são seis imagens por segundo: é uma
       interpolação contínua entre elas.

       ── O vaivém ─────────────────────────────────────────────────────────

       O laço não volta ao começo: ele vai e volta dentro dos últimos nove
       quadros. Voltar ao começo esvaziaria a sala — a sequência é
       monotônica, ela CONTA uma coisa — e um corte de volta ao quadro 24
       seria visível. O vaivém, em quadros de multidão arrastada, lê como
       agitação contínua: em plano longo com obturador aberto, o olho não
       distingue direção.

       Subindo de volta, o cabo é cortado e o dedo recebe o desenho de
       volta exatamente no quadro em que o largou. */
    const solta = Number(chapter.dataset.solta)

    if (solta && seq.laco) {
      const [de, para] = seq.laco
      const fps = seq.fps ?? 6

      let v = ate
      let sentido = 1
      let cabo = null

      const soltar = () => {
        if (livre) return
        livre = true
        v = Math.max(de, Math.min(para, quadro.v))

        cabo = laco(chapter, (dt) => {
          v += dt * fps * sentido
          if (v >= para) { v = para; sentido = -1 }
          else if (v <= de) { v = de; sentido = 1 }
          player.desenhar(v)
        })
      }

      const prender = () => {
        if (!livre) return
        livre = false
        cabo?.parar()
        cabo = null
        player.desenhar(quadro.v)
      }

      ScrollTrigger.create({
        trigger: chapter,
        start: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * solta)}`,
        invalidateOnRefresh: true,
        onEnter: soltar,
        onLeaveBack: prender
      })
    }
  }

  /* ── Montagem ───────────────────────────────────────

     Empilhamento inicial: a primeira camada acesa, o resto fora de cena.
     Quem as move é a PASSAGEM (abaixo) quando o capítulo declara uma, e a
     dissolução genérica quando não declara. */
  if (camadas.length > 1) {
    gsap.set(camadas, { opacity: (i) => (i === 0 ? 1 : 0) })

    if (!chapter.dataset.passagem) {
      const janela = 1 / camadas.length
      const cruzamento = OVERLAP * janela

      camadas.forEach((camada, i) => {
        if (i === 0) return
        tl.to(camada, { opacity: 1, duration: cruzamento, ease: 'none' }, i * janela - cruzamento / 2)
      })
    }
  }

  /* ── A passagem do Salão ────────────────────────────

     O que estava aqui era um CORTE SECO para uma fotografia de flash, e
     era o defeito nº 3 da lista: uma imagem que chegava do nada, ficava um
     instante e ia embora sem resolver.

     ── Por que o corte não podia funcionar ────────────────────────────────

     Um corte é um acontecimento quando o que ele corta e o que ele revela
     têm alguma coisa em comum — uma continuidade que o corte quebra e que
     o olho reconstrói. Um plano gerado de UMA sala e uma fotografia de
     flash de OUTRA noite não têm nenhuma: não é um corte, é uma troca de
     arquivo. E como ele acontecia a 78% do curso e a saída a 90%, a
     fotografia tinha 12% de curso de vida — meia passada de dedo entre
     aparecer e ser empurrada para fora.

     ── O que é agora ──────────────────────────────────────────────────────

     Um gesto contínuo em três estágios, e ele não troca de assunto uma
     única vez. Só de DISTÂNCIA:

       1. a câmera chega perto      o plano da sala, ainda correndo
                                    sozinho, escala. A multidão cresce e
                                    perde legibilidade.
       2. e a sala vira luz         no ponto de menor legibilidade, ela
                                    dissolve num borrão de obturador —
                                    exatamente a mesma matéria dos 34
                                    quadros, a um metro em vez de a seis.
       3. e a luz vira um rosto     e do borrão sai uma pessoa.

     Cada dissolução acontece entre duas imagens que se parecem no instante
     em que ela acontece, que é a única condição para uma dissolução não
     ler como um fade de PowerPoint. E as três escalas correm juntas, então
     o que se lê não são três imagens: é um movimento só, para dentro.

     ── Classe 2, e por quê ────────────────────────────────────────────────

     Disparada. Este é um GESTO — uma câmera andando —, e um gesto entregue
     em fatias proporcionais ao dedo deixa de ser gesto. Além disso ele
     acontece depois da soltura, no trecho em que o site já devolveu o
     controle: prendê-lo à rolagem seria tomar de volta o que a soltura
     acabou de dar.

     Reversível: subindo, a câmera recua e a sala volta a ser a sala. */
  const passagemEm = Number(chapter.dataset.passagem)

  if (passagemEm && camadas.length === 3) {
    const [plano, luz, rosto] = camadas

    autonomo(chapter, (t) => {
      /* O TEXTO SAI NA MESMA BATIDA em que a câmera começa a andar.

         Ele saía só na saída do capítulo, a 90% do curso, e a passagem
         termina bem antes disso: sobravam 400px em que um rosto em tela
         cheia dividia o quadro com um título de 40px e três linhas de
         parágrafo por cima dele. Um rosto não divide quadro com texto —
         ou se lê a pessoa ou se lê a frase.

         E há uma razão além da legibilidade: o texto e a aproximação são o
         MESMO gesto. "House All Night / O DJ entra, a luz baixa" é o que a
         seção tinha a dizer, e a câmera só começa a andar depois de dito.
         O título se parte ao meio (o dispositivo da saída deste capítulo) e
         a sala fica sozinha — que é exatamente o que a frase descreve. */
      t.to(title, { xPercent: -14, opacity: 0, duration: 0.9, ease: EASE }, 0)
        .to(text, { xPercent: 14, opacity: 0, duration: 0.9, ease: EASE }, 0.08)
        .to(meta, { opacity: 0, duration: 0.7, ease: 'none' }, 0.2)

        .to(plano, { scale: 1.38, duration: 3.4, ease: EASE }, 0)
        .fromTo(luz, { scale: 1.26 }, { scale: 1.02, duration: 3.1, ease: EASE }, 0.55)
        .to(luz, { opacity: 1, duration: 1.2, ease: 'none' }, 0.55)
        .to(plano, { opacity: 0, duration: 0.9, ease: 'none' }, 1.1)
        .fromTo(rosto, { scale: 1.16 }, { scale: 1, duration: 2.6, ease: EASE }, 1.65)
        .to(rosto, { opacity: 1, duration: 1.1, ease: 'none' }, 1.65)
        .to(luz, { opacity: 0, duration: 1, ease: 'none' }, 2.1)
    }, {
      start: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * passagemEm)}`
    })
  }

  /* O vídeo (Reservado) é classe 3 e nunca foi outra coisa: buscar quadro
     em vídeo no telefone é caro e irregular, e a seção pede movimento
     contínuo e quase imperceptível, não um estado por posição de rolagem.
     Ele entra em cena quando a seção se aproxima e para quando ela sai. */
  if (video) {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top bottom+=100%',
      end: 'bottom top',
      onEnter: () => {
        if (!video.src) {
          video.src = video.dataset.src
          video.load()
        }
        video.play().then(() => media.classList.add('is-pintado')).catch(() => {})
      },
      onEnterBack: () => { video.play().catch(() => {}) },
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause()
    })
  }

  // a luz caindo: a demão de céu ganha corpo no miolo (só o Jardim)
  if (dusk) tl.fromTo(dusk, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'none' }, 0.2)

  /* ── A batida de preto ────────────────────────────────

     Todo capítulo sobe DO PRETO. Entre a seção anterior e a fotografia não
     há nada na tela por um instante — só o fundo da página —, e é essa
     batida que faz a chegada ser um corte em vez de uma emenda.

     ── Era só o Jardim, e agora são os três ────────────────────────────

     A batida existia apenas no capítulo 01, onde ela resolvia a emenda
     mais difícil do site (duas fotografias de sangria total do mesmo
     lugar, uma parada e uma em movimento). Os outros dois chegavam com a
     fotografia já acesa, e o que se via era a ARESTA DE CIMA do palco
     entrando pela tela — uma linha horizontal dura atravessando o quadro,
     que é exatamente o defeito que a batida existe para não cometer.

     Ficou visível quando o poente foi refeito: com a faixa de luz saindo
     mais cedo, a chegada do Salão passou a acontecer à vista, e a costura
     que o âmbar escondia apareceu.

     ── Era scrub, e virou disparo ──────────────────────────────────────

     Uma chegada não é um estado da cena. "A fotografia está 40% acesa" não
     responde à pergunta que separa a classe 1 da 2 (motion.js): ela só
     descreve o quanto o dedo andou. Presa ao scrub, ela parava no meio,
     meio acesa, no instante em que o usuário parasse de rolar — e uma
     fotografia congelada a 40% não lê como uma chegada em curso, lê como
     um carregamento que travou.

     Disparada, uma passada de dedo traz o capítulo inteiro. */
  autonomo(chapter, (t) => {
    t.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' })
  }, { start: 'top 64%' })

  /* ══════════════════════════════════════════════════════════════════════
     O POENTE — e é aqui que a tela dourada é consertada.

     O diagnóstico completo está no HTML, junto do elemento. O resumo:
     a subida estava presa ao curso do JARDIM e a descida disparada pela
     chegada do SALÃO, e entre um gatilho e outro havia 677px de rolagem em
     que ninguém escrevia no poente. Não era uma pausa desenhada — era um
     vão estrutural, e ele tinha de existir, porque entre o fim do curso de
     uma seção pinada e a chegada da seguinte a 26% da tela há
     obrigatoriamente uma tela inteira de rolagem comum que nenhum dos dois
     gatilhos alcança.

     ── Um gatilho só, com as duas pontas em seções diferentes ────────────

     `trigger` no Jardim, `endTrigger` no Salão. O curso começa a 60% do
     curso pinado do Jardim e termina quando o topo do Salão cruza 30% da
     tela — 1093px contínuos num aparelho de 896px, sem um único pixel sem
     dono no meio.

     É a única maneira honesta de cobrir uma emenda: o objeto que a cobre
     não pode pertencer a nenhum dos dois lados dela.

     ── E o gesto deixou de ser sobe-segura-apaga ─────────────────────────

     Agora a faixa de luz ATRAVESSA (ver a conta em poente.css): entra pelo
     pé, cobre o quadro por 9,5% do curso e sai por cima, tudo em
     translação, sem parar em ponto nenhum. O âmbar chapado passou de 677px
     a 104px, e passou de uma tela parada a uma batida em movimento.

     ── Três tempos, e o do meio é ONDE O NÚMERO É DECIDIDO ───────────────

     A primeira tentativa deste conserto usou dois tempos — `power2.in`
     entrando e `power2.out` saindo — e produziu o defeito oposto: com as
     duas curvas acelerando na direção do meio, o percurso é MAIS RÁPIDO
     justamente onde a faixa sólida cobre a tela, e a janela de âmbar
     chapado desabava para 58px. Âmbar por 58px não é uma batida, é um
     piscar — e um piscar de tela laranja lê como defeito exatamente do
     mesmo jeito que a tela parada lia.

     Então a janela virou um tempo PRÓPRIO, com duração declarada e curva
     linear:

       0    → 0.42   INUNDA    yPercent +31,25 → −28,1   power2.in
       0.42 → 0.58   ATRAVESSA yPercent −28,1  → −40,6   none
       0.58 → 1      DRENA     yPercent −40,6  → −100    power2.out

     Nos extremos de −28,1% e −40,6% a faixa sólida encosta exatamente nas
     duas bordas da tela (a conta está em poente.css), então o trecho do
     meio é, ao pixel, o trecho em que o quadro está INTEIRAMENTE âmbar. Ele
     ocupa 16% de um curso de 1116px: 179px, um quinto de tela.

       antes   677px   três quartos de tela, parados, sem dono
       agora   179px   um quinto de tela, e a faixa continua andando

     Curva `none` no meio porque ali o que se quer é previsibilidade: a
     duração do âmbar tem de ser proporcional ao dedo, não à curva. Nas
     pontas as curvas ficam, e elas dão a direção: um nível que sobe acelera
     (`in`), uma luz que vai embora desacelera (`out`). Simétrico, o gesto
     seria um pulso; assim ele tem sentido.

     ── E por que começa a 58% do curso do Jardim ─────────────────────────

     Porque o relógio precisa chegar às 20h antes de a luz cobrir a tela.
     A contagem do capítulo termina a 80% do curso e a faixa sólida fecha a
     91%: sobram 213px em que "20h" existe e é visto. Começando antes, o
     Jardim terminaria de contar debaixo do âmbar e a única coisa que o
     usuário levaria do fim do entardecer seria uma tela laranja.

     ── scrub 0.35 ────────────────────────────────────────────────────────

     A timeline do capítulo corre com `scrub: 1` — um segundo de inércia,
     que é o que dá ao entardecer a maciez de uma luz mudando. Aqui a
     inércia é um terço disso: o suficiente para o movimento não ser
     digital, curto o bastante para o âmbar nunca chegar atrasado ao
     próprio compromisso. Duas velocidades de scrub na mesma seção não é
     inconsistência — é a diferença entre uma luz e uma cortina.
     ══════════════════════════════════════════════════════════════════════ */
  if (tipoSaida === 'engolir' && poente) {
    const chega = chapter.nextElementSibling

    gsap.timeline({
      scrollTrigger: {
        trigger: chapter,
        start: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * 0.58)}`,
        endTrigger: chega ?? chapter,
        /* `top 12%` e não `top 30%`: a luz sai quando o palco do Salão já
           ocupa quase a tela inteira e o texto dele já começou a se
           escrever por baixo do âmbar. O que a faixa descobre é uma sala
           POSTA, não uma sala entrando. */
        end: chega ? 'top 12%' : 'bottom top',
        scrub: 0.35,
        invalidateOnRefresh: true
      }
    })
      .to(poente, { yPercent: -28.1, duration: 0.42, ease: 'power2.in' }, 0)
      .to(poente, { yPercent: -40.6, duration: 0.16, ease: 'none' }, 0.42)
      .to(poente, { yPercent: -100, duration: 0.42, ease: 'power2.out' }, 0.58)
      /* A fotografia do Jardim apaga por baixo da faixa sólida, no primeiro
         quadro em que ela cobre a tela inteira. É invisível — está sob
         âmbar chapado — e é o que garante que, quando o pin soltar e o
         palco rolar para fora, não haja um jardim aceso passando por trás
         da seção que chega: o que sobra acima do Salão é carvão.

         ── `fromTo` com immediateRender: false, e não `to` ──────────────

         Um `.to()` grava o valor inicial no primeiro RENDER. Numa timeline
         de scrub, o primeiro render acontece no recálculo da página, com
         progresso 0 — e nesse instante a fotografia está em opacidade 0,
         porque a batida de preto (a chegada, mais acima) já a pôs lá com
         `fromTo` de render imediato.

         O resultado era um tween de 0 para 0: silenciosamente inerte. A
         chegada acendia a foto depois, e ninguém a apagava mais — o jardim
         reaparecia inteiro por cima do Salão quando o âmbar ia embora.

         `fromTo` declara o valor de partida em vez de lê-lo, e
         `immediateRender: false` impede que ele seja escrito antes de a
         timeline chegar nele. */
      .fromTo(media,
        { opacity: 1 },
        { opacity: 0, duration: 0.05, ease: 'none', immediateRender: false }, 0.45)
  }

  /* ── O texto: gatilho, não dedo ────────────────────── */

  entrada(chapter, (t) => {
    t.to(dash, { scaleX: 1, duration: 0.7, ease: EASE }, 0)
      .to(labelText, { ...NATURAL, duration: 0.7, ease: EASE }, 0.2)
      .to(chars, { ...NATURAL, duration: 0.7, ease: EASE, stagger: 0.028 }, 0.34)
      .to(text, { ...NATURAL, duration: 0.9, ease: EASE }, 0.66)
  }, {
    /* A seção já subiu 60% da tela quando o texto começa: a composição
       anterior terminou de sair e a entrada não acontece por cima dela.
       Quando o pin assume, a frase já está posta — uma passada de dedo
       traz a seção E o texto. */
    start: 'top 40%'
  })

  /* ── Saída ─────────────────────────────────────────── */

  /* Três capítulos que se desfazem do mesmo jeito são três vezes a mesma
     seção. Cada um sai como o seu assunto pede, e o data-saida do HTML é
     quem escolhe:

       engolir — o Jardim não se apaga nem sai: ele é COMIDO. O texto se
                 recolhe na direção da luz que sobe, e o resto do gesto é
                 do poente, que é um objeto da página e não da seção.
       parte   — o Salão se parte ao meio, título para um lado e texto para
                 o outro, como a pista abrindo. E a fotografia FICA ACESA
                 (ver abaixo).
       fecha   — o Reservado contrai para o centro e escurece: a noite se
                 fecha em si mesma, que é literalmente o que o texto diz.

     Classe 2: a saída é um gesto, e um gesto entregue em fatias
     proporcionais ao dedo deixa de ser gesto. */

  const saida = gsap.timeline({ paused: true })

  // no Salão o rótulo já saiu com a passagem: escrever nele duas vezes faria
  // as duas timelines disputarem a mesma propriedade na volta
  if (!passagemEm) saida.to(meta, { opacity: 0, duration: 0.6, ease: 'none' }, 0)

  if (tipoSaida === 'engolir') {
    /* O texto sobe e some — na direção contrária à da luz que vem subindo,
       de modo que os dois se cruzam. Antes ele apenas subia e a "luz" era
       um gradiente escalando de 1 para 1,4, que não produz movimento
       visível nenhum. */
    /* A demão de céu vai a ZERO, e não a 0,7.

       Ela é um campo âmbar-bronze de tela cheia, e ela mora no PALCO — não
       na fotografia. Apagar a fotografia por baixo da faixa sólida (o
       poente faz isso) não apagava a demão: o que sobrava acima do Salão,
       quando a luz ia embora, era um campo marrom quente com uma aresta
       horizontal dura embaixo, onde o palco do capítulo seguinte começava.

       Era a costura que o poente existe para esconder, reaparecendo do
       lado errado do gesto. A 0 não sobra nada: o palco do Jardim vira
       carvão liso, e o Salão sobe do preto como todo capítulo deve subir. */
    saida.to([title, text], { y: -80, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.06 }, 0)
      .to(dusk, { opacity: 0, duration: 0.9, ease: 'none' }, 0)
  } else if (tipoSaida === 'fecha') {
    /* `fromTo` com immediateRender: false, pelo mesmo motivo do poente.

       A batida de preto (a chegada) é um `fromTo` de render imediato que
       põe a fotografia em opacidade 0 no momento em que a página é montada.
       Qualquer `.to()` posterior sobre a mesma propriedade grava esse 0
       como valor de partida — então esta saída, que existe para levar a
       imagem de 1 a 0,18, virava um tween de 0 a 0,18: em vez de escurecer
       o Reservado no fim, ela o deixava a 14% de opacidade DURANTE a
       leitura. O capítulo inteiro era um quarto escuro demais e ninguém
       tinha mexido no brilho.

       É um defeito silencioso e simétrico — descendo e subindo ele dava o
       mesmo valor errado, então não aparecia num teste de reversibilidade.
       Só aparece medindo o valor absoluto. */
    saida.to([title, text], { scale: 0.94, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08 }, 0)
      .fromTo(media,
        { opacity: 1 },
        { opacity: 0.18, duration: 1, ease: EASE, immediateRender: false }, 0.1)
  } else {
    /* ── A causa da imagem órfã, e o conserto ───────────

       A pausa das 00h chegava do nada, e a causa não estava nela: estava
       AQUI. Esta saída apagava a fotografia do Salão até a opacidade zero e
       então soltava o pin. O que o usuário via era uma tela preta sem dono
       e, no meio dela, duas fotografias subindo por rolagem crua — a única
       entrada do site que não era um acontecimento. Uma seção que chega
       sobre o nada não tem como não parecer órfã: não há de onde ela venha.

       O drenar existia por um motivo que deixou de valer. Quando "A escuta"
       vinha depois do Salão, a tela seguinte era a única sem imagem e
       precisava de escuridão para existir. "A escuta" mudou de lugar duas
       passadas atrás; o drenar ficou.

       Agora a fotografia FICA ACESA e SAI. Ela desliza para cima mais
       depressa do que a rolagem a levaria — a foto abandona o quadro — e a
       pausa aparece por baixo dela em vez de depois dela. É deslocamento,
       não dissolução: nenhuma outra emenda do site usa este dispositivo, e
       a de cima (o poente) usa o oposto exato dele.

       E o que sai agora é o ROSTO, não mais a foto de flash: a pausa das
       00h é descoberta por baixo de uma pessoa. As duas telas passam a ter
       o mesmo assunto — gente, à meia-noite — e a emenda deixa de ser uma
       troca de tema. */
    /* O empurrão vai no ÚLTIMO PLANO, não no .chapter__media — e a
       distinção não é de gosto, é de propriedade disputada.

       O .chapter__media é escrito a cada quadro pela timeline pinada, que o
       leva de scale(1.16) a scale(1.02) ao longo do capítulo inteiro. Uma
       segunda timeline escrevendo escala no MESMO elemento perde sempre: o
       scrub reescreve o transform no próximo evento de rolagem e a saída é
       apagada quadro a quadro. Foi por isso que a primeira versão disto
       deixava a fotografia subir sem crescer — e uma foto que sobe sem
       crescer descobre a própria borda de baixo, que é a aresta horizontal
       dura que esta saída existe para não cometer.

       ── E aqui há um segundo dono, que a passagem criou ─────────────────

       O plano do rosto TAMBÉM é escrito pela timeline da passagem, que o
       leva de scale(1.16) a scale(1) na chegada. Duas timelines escrevendo
       escala no mesmo elemento se apagariam — mas estas duas nunca correm
       juntas: a passagem dispara a 50% do curso e termina em 4,3s, e esta
       só dispara a 90%. A da passagem termina em scale(1) e esta parte de
       scale(1); a emenda entre elas é contínua.

       Se algum dia as duas se aproximarem no curso, a saída tem de mudar
       de alvo — não de valor. */
    /* Só o deslocamento. O título e o parágrafo já saíram na passagem — a
       saída deste capítulo virou uma coisa só: a fotografia abandonando o
       quadro. */
    const alvoSaida = camadas.at(-1) ?? media

    saida.to(alvoSaida, { yPercent: -14, scale: 1.2, duration: 1.4, ease: EASE }, 0)
  }

  ScrollTrigger.create({
    trigger: chapter,
    start: () => {
      const em = SAIDA_EM[tipoSaida] ?? 0.84
      return `top top-=${Math.round(window.innerHeight * (curso / 100) * em)}`
    },
    invalidateOnRefresh: true,
    onEnter: () => saida.play(),
    onLeaveBack: () => saida.reverse()
  })
}
