/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   ── A divisão que reorganizou o site ────────────────────────────────────

   Cada capítulo passou a ter DUAS timelines, e a fronteira entre elas é a
   regra de leitura da página inteira:

     · presa ao dedo (scrub) fica só a matéria que É o efeito — os quadros
       do entardecer, o relógio contando, a foto respirando, a demão de céu
       ganhando corpo. Casos em que a posição da rolagem corresponde
       literalmente a um estado da cena;

     · o texto entra por gatilho, corre na velocidade dele e fica. Antes o
       rótulo, o título e o parágrafo eram três alvos do mesmo scrub: para
       ler uma frase de duas linhas era preciso passar o dedo cinco vezes,
       porque a rolagem entregava a animação em fatias proporcionais. Agora
       uma passada entrega a frase inteira, e a seção pode encolher sem que
       nada fique ilegível.

   Foi essa divisão, e não corte de conteúdo, que fez o site cair de ~25
   telas de rolagem para ~16: os cursos pinados existiam para dar tempo ao
   texto, e o texto não precisava deles.

   ── Os três ambientes, três matérias diferentes ─────────────────────────

     01 Jardim    22 quadros de um plano fixo, presos ao scroll: o
                  entardecer acontece de verdade — as luzinhas acendem, a
                  vela aparece na mesa. Antes eram duas fotos em crossfade
                  sob uma demão colorida, que lia como troca de filtro.
     02 Salão     três planos que trocam secos, com o intervalo encurtando:
                  a cabine vista de cima, as mãos nos faders e o corpo
                  arrastado pelo obturador. É o único capítulo em que nada
                  ACONTECE — montagem é edição, não evento —, e é o que
                  falta resolver nele.
     03 Reservado vídeo em plano fixo a meia velocidade, só as chamas se
                  mexendo. É o fim da noite, não o clímax dela.

   ── O relógio saiu daqui ────────────────────────────────────────────────

   Cada capítulo tinha o seu, e as pausas tinham os delas: seis objetos que
   se pareciam e nunca se encontravam. Agora é um algarismo só para a página
   inteira (relogio.js), e o que o capítulo declara é apenas a faixa de
   horas dele e onde o algarismo deve se acomodar — data-hora e data-hora-em
   no HTML. A noite passou a avançar entre as seções, e não só dentro
   delas. */

import {
  gsap, ScrollTrigger, reducedMotion, EASE, entrada, splitChars, splitLine, prioridadeRefresh
} from './motion.js'
import { criarSequencia } from './frames.js'

const NATURAL = { opacity: 1, y: 0, x: 0, scaleX: 1 }
const OVERLAP = 0.3 // fatia da janela compartilhada com a vizinha

const SEQUENCIAS = {
  dusk: { total: 22, caminho: (i) => `/frames/dusk/d_${String(i + 1).padStart(3, '0')}.webp` },
  /* O plano geral do Salão: a sala enchendo, em plano fixo. Declarada e
     inerte — nenhum elemento do HTML pede 'sala' ainda. Ela acende sozinha
     no dia em que o vídeo existir e o data-seq for posto no HTML (o
     index.html diz onde). Ver scripts/frames.mjs para o outro lado. */
  sala: { total: 22, caminho: (i) => `/frames/sala/s_${String(i + 1).padStart(3, '0')}.webp` }
}

for (const chapter of document.querySelectorAll('.chapter')) {
  const stage = chapter.querySelector('.chapter__stage')
  const media = chapter.querySelector('.chapter__media')
  const imgs = [...chapter.querySelectorAll('.chapter__img')]
  /* As camadas da montagem são os PLANOS quando eles existem, e as fotos
     quando não. O plano é um embrulho cuja única função é andar: a foto
     dentro dele guarda a própria escala e âncora no CSS, e as duas coisas
     precisam de transform ao mesmo tempo — o corte que empurra escreveria
     por cima do scale(2.05) das mãos se fossem o mesmo elemento. */
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

  /* Quadro a quadro (Jardim). O canvas ocupa o mesmo lugar do cartaz que
     já está em cena; quando o primeiro quadro é pintado, o cartaz apaga por
     baixo dele. Assim a seção nunca é uma tela preta esperando arquivo. */
  /* Quem declara a sequência é o elemento que a HOSPEDA, não o capítulo: no
     Jardim é o .chapter__media inteiro (a sequência É a tela); no Salão será
     um .chapter__plano, porque lá ela é um plano entre outros e precisa
     poder ser empurrada para fora como os vizinhos. */
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
       terceira seção da página, então uma antecedência maior põe os 22
       quadros na fila junto com a foto da hero — que é a única imagem que
       o usuário está esperando nesse momento. Assim a fila começa depois
       da primeira rolagem e tem a passagem inteira (uma tela) para chegar. */
    player.carregarPerto(chapter, '80%')

    const quadro = { v: 0 }
    tl.to(quadro, {
      v: seq.total - 1,
      duration: 1,
      ease: 'none',
      onUpdate: () => player.desenhar(quadro.v)
    }, 0)
  }

  /* ── Montagem ───────────────────────────────────────

     Duas gramáticas, e o data-montagem do HTML escolhe.

     EMPURRA (Salão). Três enquadramentos que trocam SECOS — sem
     dissolução, sem fade, opacidade nenhuma — e a troca acontece de lado:
     o plano novo entra pela direita e empurra o anterior para fora.

       1. a cabine vista de cima: a pessoa chega;
       2. as mãos nos faders, em corte fechado de verdade;
       3. o corpo arrastado pelo obturador.

     Eram quatro. O primeiro plano era o bar do Jardim na hora azul, aberto
     num capítulo que o relógio marca como 20—23h: o capítulo começava
     mostrando o cômodo anterior, na hora anterior. Saiu.

     Por que de lado, e por que aqui e em lugar nenhum mais. A saída deste
     capítulo (data-saida="parte") já é horizontal — o título vai para um
     lado e o texto para o outro. O eixo lateral já é a gramática do Salão;
     a montagem passou a falar a mesma língua que a saída dele.

     O que sai anda a um terço do que entra. Duas camadas na mesma
     velocidade leem como um slide trocando; em velocidades diferentes o
     olho vê PROFUNDIDADE, e a troca lê como a sala girando em volta de
     quem olha. É o mesmo princípio dos dois quadros da pausa, ao contrário.

     E continua sendo um corte: 0.07 do curso, com ease de saída dura. Não
     é uma transição que se assiste, é o instante em que o quadro já é
     outro — só que com direção. Nada aqui anima opacidade: são dois
     translates, que é o que o telefone sabe fazer de graça.

     Os intervalos: 0.34, depois 0.26 — o corte acelera, que é o que o
     texto do capítulo promete. O terceiro plano fica os 40% finais porque
     é sobre ele que a saída acontece (o capítulo se parte ao meio em 84%
     do curso), e a saída precisa de uma imagem já desfeita embaixo dela.

     DISSOLUÇÃO (o resto). Janelas de crossfade, uma imagem entrando sobre
     a anterior. */
  if (camadas.length > 1) {
    if (chapter.dataset.montagem === 'empurra') {
      const cortes = [0.34, 0.6]
      const TROCA = 0.07

      /* Quem entra espera fora do palco, à direita. O palco tem
         overflow:hidden, então "fora" é invisível sem custar opacidade —
         e a ordem do DOM já põe cada plano acima do anterior, que é o que
         faz o novo cobrir o velho sem uma linha de z-index. */
      gsap.set(camadas, { xPercent: (i) => (i === 0 ? 0 : 100) })

      camadas.forEach((plano, i) => {
        const em = cortes[i - 1]
        if (i === 0 || em === undefined) return

        tl.to(plano, { xPercent: 0, duration: TROCA, ease: 'power4.out' }, em)
          .to(camadas[i - 1], { xPercent: -34, duration: TROCA, ease: 'power4.out' }, em)
      })
    } else {
      gsap.set(camadas, { opacity: (i) => (i === 0 ? 1 : 0) })

      const janela = 1 / camadas.length
      const cruzamento = OVERLAP * janela

      camadas.forEach((camada, i) => {
        if (i === 0) return
        tl.to(camada, { opacity: 1, duration: cruzamento, ease: 'none' }, i * janela - cruzamento / 2)
      })
    }
  }

  /* O vídeo (Reservado) não é preso ao scroll: buscar quadro em vídeo no
     telefone é caro e irregular, e a seção pede movimento contínuo e quase
     imperceptível, não um estado por posição de rolagem. Ele só entra em
     cena quando a seção se aproxima, e para quando ela sai. */
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
       duas é a ideia da casa (âmbar é o instante guardado, a noite é o
       instante correndo), e o corte tem de ser preto no meio.

       A versão anterior apagava só a foto de CIMA, no último quarto do
       percurso — e a de baixo subia acesa desde o primeiro pixel. O
       resultado era uma linha horizontal dura atravessando a tela durante
       toda a saída da hero: o corte que o comentário descrevia nunca
       chegava a existir.

       Agora as duas pontas se apagam contra o mesmo carvão. A hero some no
       meio do percurso dela (hero.js) e o Jardim sobe do preto enquanto
       ainda está na metade de baixo da tela: onde as duas se cruzam não há
       fotografia nenhuma, só o fundo da página. */
    gsap.fromTo(media, { opacity: 0 }, {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: chapter,
        /* A janela é tardia de propósito: enquanto o topo do capítulo está
           na metade de baixo da tela ele é quase carvão puro, e a
           fotografia só toma corpo quando a seção já é dona do quadro.
           Numa janela larga as duas fotos ficam meio visíveis ao mesmo
           tempo e o que se vê é uma dissolução — que é justamente a
           gramática que este join não pode ter. */
        start: 'top 62%',
        end: 'top 6%',
        scrub: true
      }
    })
  }

  /* ── O texto: gatilho, não dedo ────────────────────── */

  /* Começa antes de a seção prender, enquanto ela ainda sobe: quando o pin
     assume, a frase já está posta. Uma passada de dedo, uma frase. */

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

       luz   — o Jardim não se apaga, ele é engolido pelo entardecer;
       parte — o Salão se parte ao meio, título para um lado e texto para o
               outro, como a pista abrindo;
       fecha — o Reservado contrai para o centro e escurece: a noite se
               fecha em si mesma, que é literalmente o que o texto diz.

     Também por gatilho, e no fim do curso pinado: a saída é um gesto, e um
     gesto entregue em fatias proporcionais ao dedo deixa de ser gesto. */

  const saida = gsap.timeline({ paused: true })

  saida.to(meta, { opacity: 0, duration: 0.6, ease: 'none' }, 0)

  if (chapter.dataset.saida === 'luz') {
    saida.to([title, text], { y: -70, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.06 }, 0)
      // o céu já está cheio: o que cresce agora é a mancha de luz dentro
      // dele, e a última coisa do capítulo passa a ser o próprio poente
      .to(dusk, { scale: 1.4, duration: 1.2, ease: EASE }, 0)
  } else if (chapter.dataset.saida === 'fecha') {
    saida.to([title, text], { scale: 0.94, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08 }, 0)
      .to(media, { opacity: 0.18, duration: 1, ease: EASE }, 0.1)
  } else {
    saida.to(title, { xPercent: -14, opacity: 0, duration: 0.8, ease: EASE }, 0)
      .to(text, { xPercent: 14, opacity: 0, duration: 0.8, ease: EASE }, 0.08)
      /* E a fotografia DRENA. O que vem depois do Salão é a única tela do
         site sem imagem, e ela precisa de escuridão para existir: antes, o
         arrasto ficava aceso até a seção rolar para fora e "A escuta"
         chegava como o próximo slide. Agora o capítulo apaga a luz antes de
         sair, e o silêncio começa aqui — na porta, não depois dela. */
      .to(media, { opacity: 0, duration: 1.1, ease: EASE }, 0.2)
  }

  ScrollTrigger.create({
    trigger: chapter,
    // 84% do curso pinado: o gesto de saída cabe inteiro antes de o pin
    // soltar, e não é o dedo que o desenha
    start: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * 0.84)}`,
    invalidateOnRefresh: true,
    onEnter: () => saida.play(),
    onLeaveBack: () => saida.reverse()
  })
}
