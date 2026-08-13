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
     02 Salão     duas fotos do mesmo DJ, a nítida e a arrastada, cruzando
                  no miolo: a noite perdendo o contorno.
     03 Reservado vídeo em plano fixo a meia velocidade, só as chamas se
                  mexendo. É o fim da noite, não o clímax dela.

   ── O relógio ───────────────────────────────────────────────────────────

   17h → 20h → 00h → 03h, sempre na maior escala da tela, sempre preso ao
   scroll. No Jardim ele anda ~40% mais devagar por hora que no resto do
   site: é a seção em que o tempo é o assunto, e é a única em que a imagem
   conta a mesma hora que o algarismo. Salão e Reservado correm à mesma
   taxa entre si — a noite, depois que começa, passa em ritmo constante. */

import {
  gsap, ScrollTrigger, reducedMotion, EASE, entrada, splitChars, splitLine, prioridadeRefresh
} from './motion.js'
import { criarSequencia } from './frames.js'

const NATURAL = { opacity: 1, y: 0, x: 0, scaleX: 1 }
const OVERLAP = 0.3 // fatia da janela compartilhada com a vizinha

const SEQUENCIAS = {
  dusk: { total: 22, caminho: (i) => `/frames/dusk/d_${String(i + 1).padStart(3, '0')}.webp` }
}

/* "20—00" atravessa a meia-noite e conta 20, 21, 22, 23, 00. O texto
   escrito no HTML é só o estado inicial. */
const lerRelogio = (attr) => {
  const partes = String(attr).match(/^\s*(\d{1,2})\s*[—–-]\s*(\d{1,2})\s*$/)
  if (!partes) return null

  const inicio = Number(partes[1])
  const alvo = Number(partes[2])
  const fim = alvo <= inicio ? alvo + 24 : alvo

  const pad = (n) => String(Math.floor(n) % 24).padStart(2, '0')

  return {
    inicio,
    fim,
    render: (v) => `${pad(v)}h`,
    estatico: `${pad(inicio)}h — ${pad(fim)}h`
  }
}

for (const chapter of document.querySelectorAll('.chapter')) {
  const stage = chapter.querySelector('.chapter__stage')
  const media = chapter.querySelector('.chapter__media')
  const imgs = [...chapter.querySelectorAll('.chapter__img')]
  const canvas = chapter.querySelector('.chapter__canvas')
  const video = chapter.querySelector('.chapter__video')
  const dusk = chapter.querySelector('.chapter__dusk')
  const clock = chapter.querySelector('.chapter__clock')
  const label = chapter.querySelector('.chapter__label')
  const title = chapter.querySelector('.chapter__title')
  const text = chapter.querySelector('.chapter__text')
  const losango = chapter.querySelector('.chapter__losango')
  const meta = chapter.querySelector('.chapter__meta')

  const { dash, text: labelText } = splitLine(label)
  const chars = splitChars(title)
  const relogio = clock ? lerRelogio(clock.dataset.clock) : null
  const curso = Number(chapter.dataset.run) || 180

  gsap.set(label, NATURAL)

  /* ── Sem movimento ─────────────────────────────────── */

  if (reducedMotion) {
    // estado final legível: o cartaz parado do ambiente, o texto inteiro e
    // o horário como faixa em vez de contagem
    gsap.set([dash, labelText, title, text, ...chars], NATURAL)
    gsap.set(losango, { opacity: 0.5 })
    gsap.set(imgs, { opacity: (i) => (i === imgs.length - 1 ? 1 : 0) })
    if (dusk) gsap.set(dusk, { opacity: 1 })
    if (canvas) canvas.remove()
    if (video) video.remove()

    // a faixa inteira tem três vezes a largura de um horário só: na escala
    // do relógio animado ela sairia da tela
    if (relogio) {
      clock.textContent = relogio.estatico
      clock.classList.add('chapter__clock--faixa')
    }
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
  const seq = SEQUENCIAS[media?.dataset.seq]

  if (seq && canvas) {
    const player = criarSequencia({
      palco: media,
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

     CORTE (Salão). Quatro enquadramentos que trocam secos, sem
     dissolução: o plano aberto da cabine, um corte fechado nas mãos sobre
     a mesa, uma aproximação no mesmo plano aberto e o corpo arrastado pelo
     obturador. É a única seção do site que corta — todo o resto dissolve,
     acende ou deriva — e por isso o corte lê como montagem, não como
     defeito.

     Os intervalos ENCURTAM: 0.30, depois 0.22, depois 0.16. O capítulo diz
     que a noite encontra o próprio ritmo, e a montagem acelera junto. Era
     a ideia mais cinética do site entregue pela transição menos cinética
     que existe, um crossfade.

     Cada enquadramento tem escala e âncora próprias no CSS, então o corte
     troca de plano e não só de foto — que é o que um corte faz.

     DISSOLUÇÃO (o resto). Janelas de crossfade, uma imagem entrando sobre
     a anterior. */
  if (imgs.length > 1) {
    gsap.set(imgs, { opacity: (i) => (i === 0 ? 1 : 0) })

    if (chapter.dataset.montagem === 'corte') {
      const cortes = [0.3, 0.52, 0.68]

      imgs.forEach((img, i) => {
        if (i === 0) return
        const em = cortes[i - 1]
        if (em === undefined) return
        tl.set(imgs[i - 1], { opacity: 0 }, em)
        tl.set(img, { opacity: 1 }, em)
      })
    } else {
      const janela = 1 / imgs.length
      const cruzamento = OVERLAP * janela

      imgs.forEach((img, i) => {
        if (i === 0) return
        tl.to(img, { opacity: 1, duration: cruzamento, ease: 'none' }, i * janela - cruzamento / 2)
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
  }

  /* O relógio conta ao longo do curso.

     ── A hora final tem de caber ────────────────────────────────────────
     A contagem é linear e o que se lê é o piso dela, então a última hora
     só aparecia no instante exato em que a contagem terminava — e a
     saída começava logo em seguida. Na prática o Jardim ia de 17h a 20h e
     nunca chegava a mostrar 20h; o Salão morria em 23h.

     O conserto é contar até UMA HORA ALÉM do destino e travar a leitura no
     destino. Cada hora passa a ocupar uma fatia igual do percurso,
     inclusive a última: o capítulo fecha com a hora de chegada parada na
     tela pelo mesmo tempo que as outras ficaram, e não a virando na porta.

     ── A taxa ───────────────────────────────────────────────────────────
     Em telas de rolagem por hora: Jardim 0,29; Salão 0,19; Reservado 0,20.
     O entardecer corre 50% mais devagar por hora, de propósito — é a seção
     em que o tempo é o assunto e a única em que a imagem também diz a hora
     (as luzinhas acendem quando o relógio marca 19h porque as duas coisas
     andam no mesmo eixo). Depois que a noite começa ela passa em ritmo
     constante: Salão e Reservado ficam a 4% um do outro.

     É rápido, e é uma escolha: manter o Salão na mesma taxa do Jardim
     custaria mais uma tela e meia de rolagem só ali, e encurtar a rolagem
     é a prioridade que manda nesta passada. O que compensa é a hora andar
     em degraus visíveis em vez de deslizar — o algarismo fica parado e
     vira, como um relógio, em vez de escorrer como um contador. */
  if (relogio) {
    const conta = { v: relogio.inicio }
    tl.to(conta, {
      v: relogio.fim + 1,
      duration: 0.68,
      ease: 'none',
      onUpdate: () => {
        clock.textContent = relogio.render(Math.min(conta.v, relogio.fim))
      }
    }, 0.06)
  }

  /* ── O texto: gatilho, não dedo ────────────────────── */

  /* Começa antes de a seção prender, enquanto ela ainda sobe: quando o pin
     assume, a frase já está posta. Uma passada de dedo, uma frase. */
  gsap.set(clock, { opacity: 0 })

  entrada(chapter, (t) => {
    t.to(dash, { scaleX: 1, duration: 0.7, ease: EASE }, 0)
      .to(losango, { opacity: 0.5, duration: 0.7, ease: EASE }, 0)
      .to(labelText, { ...NATURAL, duration: 0.7, ease: EASE }, 0.2)
      .to(chars, { ...NATURAL, duration: 0.7, ease: EASE, stagger: 0.028 }, 0.34)
      .to(text, { ...NATURAL, duration: 0.9, ease: EASE }, 0.66)
      // o relógio é a última coisa a acender, e acende no capítulo a que
      // pertence: antes ele já estava na tela uma seção inteira antes de o
      // Jardim abrir, contando uma hora que ainda não era de ninguém
      .to(clock, { opacity: 1, duration: 0.9, ease: EASE }, 0.5)
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
    .to(clock, { opacity: 0, duration: 0.6, ease: 'none' }, 0.1)

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
