/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   ── As três classes de movimento, aplicadas ─────────────────────────────

   A regra do site está em motion.js. Aqui está como ela cai nos capítulos, e
   nesta passada ela ficou mais estrita em um ponto e mais solta em outro:

     CLASSE 1 · preso ao dedo
       os quadros do entardecer, os quadros da sala enchendo, a foto
       respirando, a demão de céu ganhando corpo, o relógio contando, e —
       novo — o poente subindo em cima do Jardim. Em todos, a posição da
       rolagem corresponde literalmente a um estado da cena.

     CLASSE 2 · disparado
       todo o texto, todas as entradas, todas as saídas. Corre na velocidade
       dele e termina com o dedo parado.

     CLASSE 3 · ambiente
       o vídeo do Reservado — e, novo, a SALA DO SALÃO depois de o dedo
       soltá-la. Ver "a soltura", abaixo.

   ── Os três ambientes ───────────────────────────────────────────────────

     01 Jardim    22 quadros de um plano fixo, presos ao dedo: o entardecer
                  acontece de verdade — as luzinhas acendem, a vela aparece
                  na mesa, o céu perde a luz. E no fim o poente ENGOLE a
                  tela (ver .poente, no HTML).
     02 Salão     34 quadros de um plano fixo. A sala começa vazia e ENCHE,
                  e a certa altura o dedo a SOLTA: ela passa a correr
                  sozinha. Depois, o único corte duro do site.
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
   poente do Jardim precisa de um quarto do curso para subir, o Salão se
   parte em um segundo. */
const SAIDA_EM = { engolir: 0.72, parte: 0.9, fecha: 0.84 }

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
  /* O mapa do curso do Salão, e ele tem quatro tempos:

       0.05 — 0.52   o dedo enche a sala (quadros 0 → 26)
       0.56          o dedo SOLTA: a sala passa a correr sozinha
       0.78          CORTE para a fotografia de flash
       0.90          a saída do capítulo

     A folga entre a soltura e o corte é deliberada e é a maior do site:
     um quinto do curso pinado, e mais o tempo que o usuário quiser passar
     parado ali — porque parado é justamente onde este trecho recompensa.
     Se ele colar no corte, a sala corre livre por meio segundo e o gesto
     não chega a ser lido; e a fotografia, por sua vez, precisa de posse do
     quadro antes de o texto começar a se partir por cima dela, senão o
     corte vira parte da saída em vez de um acontecimento próprio. */
  sala: {
    total: 34,
    janela: [0.05, 0.52],
    ate: 26,
    laco: [24, 33],
    fps: 6,
    caminho: (i) => `/frames/sala/s_${String(i + 1).padStart(3, '0')}.webp`
  }
}

/* `y: 0` junto com `yPercent: 50`, e sem ele o poente não sobe.

   O CSS declara `transform: translate3d(0, 50%, 0)` para que o elemento
   esteja fora de cena antes de o JavaScript existir. O GSAP, ao tocar num
   elemento pela primeira vez, LÊ o transform computado — e o navegador
   devolve percentagem de translate já resolvida em pixels, num matrix().
   O GSAP interpreta esse valor como `y` em pixels e o mantém.

   O resultado é que `gsap.set(el, { yPercent: 50 })` compõe y(950px) +
   yPercent(50%), e o `.to({ yPercent: -50 })` seguinte anima só a segunda
   metade: o elemento termina o percurso em y = +950px − 950px = 0, ou seja
   com o topo na borda de cima da tela e o âmbar sólido inteiro fora dela.
   O poente subia meia tela e parava.

   Zerar `y` explicitamente descarta o valor lido e deixa a posição inteira
   nas mãos da percentagem, que é a única unidade que sobrevive a uma troca
   de altura de tela. */
const poente = document.querySelector('.poente')
if (poente && !reducedMotion) gsap.set(poente, { y: 0, yPercent: 50, opacity: 1 })

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
  const losango = chapter.querySelector('.chapter__losango')
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
    gsap.set(losango, { opacity: 0.5 })
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
      caminho: seq.caminho
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

     Duas gramáticas, e o data-montagem do HTML escolhe.

     CORTE (Salão), e é o único corte duro da página inteira.

     No fim do curso o capítulo CORTA para uma fotografia: a pista vista de
     trás da cabine, com flash e grão. Zero duração, zero dissolução, zero
     deslocamento.

     E ele corta MOVIMENTO VIVO. Antes o corte trocava um quadro parado por
     uma foto parada, o que é uma troca de imagem; agora ele interrompe uma
     sala que está se mexendo sozinha, o que é uma troca de REGISTRO — num
     quadro a sala é gerada, lisa e silenciosa e no seguinte ela é uma
     fotografia de flash de uma noite que aconteceu.

     Cortes valem pela raridade: três cortes num capítulo são uma montagem,
     um corte na página inteira é um acontecimento.

     DISSOLUÇÃO (o resto). Janelas de crossfade, uma imagem entrando sobre
     a anterior. */
  if (camadas.length > 1) {
    gsap.set(camadas, { opacity: (i) => (i === 0 ? 1 : 0) })

    if (chapter.dataset.montagem === 'corte') {
      tl.set(camadas[1], { opacity: 1 }, 0.78)
        .set(camadas[0], { opacity: 0 }, 0.78)
    } else {
      const janela = 1 / camadas.length
      const cruzamento = OVERLAP * janela

      camadas.forEach((camada, i) => {
        if (i === 0) return
        tl.to(camada, { opacity: 1, duration: cruzamento, ease: 'none' }, i * janela - cruzamento / 2)
      })
    }
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
  if (dusk) {
    tl.fromTo(dusk, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'none' }, 0.2)

    /* ── A batida de preto ──────────────────────────────

       A emenda hero → Jardim é a única do site em que duas fotografias de
       sangria total se encontram, e são fotografias DO MESMO LUGAR: uma
       parada, na hora dourada, e a mesma em movimento. O corte entre as
       duas é a ideia da casa, e o corte tem de ser preto no meio.

       As duas pontas se apagam contra o mesmo carvão: a hero some no meio
       do percurso dela (hero.js) e o Jardim sobe do preto enquanto ainda
       está na metade de baixo da tela. Onde as duas se cruzam não há
       fotografia nenhuma, só o fundo da página. */
    gsap.fromTo(media, { opacity: 0 }, {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: chapter,
        start: 'top 62%',
        end: 'top 6%',
        scrub: true
      }
    })
  }

  /* ── O poente engolindo o Jardim ────────────────────

     Preso ao dedo, e é a única transição do site que é. O motivo está em
     poente.css: isto não é uma transição entre seções, é o último quarto do
     mesmo sol que o capítulo inteiro vem baixando. Trocar de motor no meio
     de um movimento contínuo seria a costura que o gesto existe para
     evitar.

     `power2.in`: um nível que sobe acelera. Começa a se insinuar no pé da
     tela e chega de uma vez — que é a diferença entre uma luz que aumenta e
     uma coisa que ENGOLE.

     A fotografia apaga por baixo dele, no último décimo. É invisível — está
     debaixo de âmbar sólido — e é o que garante que, quando o pin soltar e
     o palco rolar para fora, não haja um jardim aceso passando por trás da
     seção que chega. */
  if (tipoSaida === 'engolir' && poente) {
    /* Gatilho PRÓPRIO, e não uma faixa dentro de `tl`, por causa do atraso
       do scrub.

       A timeline do capítulo corre com `scrub: 1` — um segundo de inércia,
       que é o que dá ao entardecer a maciez de uma luz mudando. Aplicado ao
       poente, esse mesmo segundo é um risco: se o usuário atravessar o fim
       do capítulo depressa, o âmbar ainda estará a caminho quando a emenda
       entre as duas seções passar, e a emenda é justamente o que ele existe
       para cobrir.

       Aqui a inércia é 0,3s: o suficiente para o movimento não ser digital,
       curto o bastante para o âmbar nunca chegar atrasado ao próprio
       compromisso. Duas velocidades de scrub na mesma seção não é
       inconsistência — é a diferença entre uma luz e uma cortina. */
    gsap.timeline({
      scrollTrigger: {
        trigger: chapter,
        start: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * 0.66)}`,
        end: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * 0.99)}`,
        scrub: 0.3,
        invalidateOnRefresh: true
      }
    })
      // um nível que sobe acelera: começa a se insinuar no pé da tela e
      // chega de uma vez, que é a diferença entre uma luz que aumenta e uma
      // coisa que ENGOLE
      .to(poente, { yPercent: -50, duration: 1, ease: 'power2.in' }, 0)
      /* A fotografia apaga por baixo dele, no fim. É invisível — está sob
         âmbar sólido — e é o que garante que, quando o pin soltar e o palco
         rolar para fora, não haja um jardim aceso passando por trás da
         seção que chega: o que sobra acima do Salão é carvão. */
      .to(media, { opacity: 0, duration: 0.12, ease: 'none' }, 0.88)
  }

  /* O drenar. Classe 2, e pertence à seção que CHEGA.

     Dispara quando o topo do Salão cruza 26% da tela: a essa altura ele
     ocupa quase todo o quadro e o que o âmbar levanta de cima é a sala já
     posta, e não uma sala entrando. Levantar antes disso mostraria a
     emenda, que é justamente a coisa que o poente existe para esconder. */
  if (poente && chapter.dataset.montagem === 'corte') {
    autonomo(chapter, (t) => {
      t.to(poente, { opacity: 0, duration: 1.3, ease: 'power2.out' })
    }, { start: 'top 26%' })
  }

  /* ── O texto: gatilho, não dedo ────────────────────── */

  entrada(chapter, (t) => {
    t.to(dash, { scaleX: 1, duration: 0.7, ease: EASE }, 0)
      .to(losango, { opacity: 0.5, duration: 0.7, ease: EASE }, 0)
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

  saida.to(meta, { opacity: 0, duration: 0.6, ease: 'none' }, 0)

  if (tipoSaida === 'engolir') {
    /* O texto sobe e some — na direção contrária à da luz que vem subindo,
       de modo que os dois se cruzam. Antes ele apenas subia e a "luz" era
       um gradiente escalando de 1 para 1,4, que não produz movimento
       visível nenhum. */
    saida.to([title, text], { y: -80, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.06 }, 0)
      .to(dusk, { opacity: 0.7, duration: 0.9, ease: 'none' }, 0)
  } else if (tipoSaida === 'fecha') {
    saida.to([title, text], { scale: 0.94, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08 }, 0)
      .to(media, { opacity: 0.18, duration: 1, ease: EASE }, 0.1)
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
       a de cima (o poente) usa o oposto exato dele. */
    /* O empurrão vai no PLANO DO CORTE, não no .chapter__media — e a
       distinção não é de gosto, é de propriedade disputada.

       O .chapter__media é escrito a cada quadro pela timeline pinada, que o
       leva de scale(1.16) a scale(1.02) ao longo do capítulo inteiro. Uma
       segunda timeline escrevendo escala no MESMO elemento perde sempre: o
       scrub reescreve o transform no próximo evento de rolagem e a saída é
       apagada quadro a quadro. Foi por isso que a primeira versão disto
       deixava a fotografia subir sem crescer — e uma foto que sobe sem
       crescer descobre a própria borda de baixo, que é a aresta horizontal
       dura que esta saída existe para não cometer.

       O plano do corte não é tocado por ninguém além daqui. A 1,22 de
       escala sobram 11% de folga de cada lado, e os 12% de subida cabem
       dentro deles: a foto sai inteira, e o que aparece por baixo dela é a
       pausa, não carvão. */
    const alvoSaida = camadas[1] ?? media

    saida.to(title, { xPercent: -14, opacity: 0, duration: 0.8, ease: EASE }, 0)
      .to(text, { xPercent: 14, opacity: 0, duration: 0.8, ease: EASE }, 0.08)
      .to(alvoSaida, { yPercent: -12, scale: 1.22, duration: 1.4, ease: EASE }, 0.1)
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
