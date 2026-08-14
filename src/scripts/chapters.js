/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   ── As três classes de movimento, aplicadas ─────────────────────────────

   A regra do site está em motion.js. Aqui está como ela cai nos capítulos, e
   nesta passada ela ficou mais estrita em um ponto e mais solta em outro:

     CLASSE 1 · preso ao dedo
       a foto respirando, a demão de céu ganhando corpo, o relógio contando
       e o poente atravessando a tela. Em todos, a posição da rolagem
       corresponde literalmente a um estado da cena.

     CLASSE 2 · disparado
       todo o texto, todas as entradas, todas as saídas, a chegada de cada
       capítulo. Corre na velocidade dela e termina com o dedo parado.

     CLASSE 3 · ambiente
       o vídeo do Reservado — e, NOVO NESTA PASSADA, as duas sequências de
       quadros, que eram classe 1 e agora correm no relógio delas com piso
       de rolagem (`relogioComPiso`, motion.js).

   ── A mudança de classe, e por que ela é a passada inteira ──────────────

   As duas sequências eram o coração da classe 1: "a posição da rolagem É a
   hora do dia" e "é quanta gente há na sala". Continuam sendo verdades
   bonitas e, medidas na tela, produziam duas queixas:

     · o entardecer entregava a mudança em saltos de oito quadros por
       passada de polegar (a inércia do Lenis anda ~400px de uma vez), e
       exigia três passadas;
     · a sala respondia em 320px dentro de uma seção de 1926.

   Uma sequência de plano fixo não é um controle deslizante. O que ela
   quer é TEMPO — e o dedo, que é caro, deve ser gasto onde a posição
   significa mesmo alguma coisa. O relógio da casa continua preso à
   rolagem, e é ele que sustenta a premissa: o usuário rola e a noite
   avança. Os cômodos, esses, vivem sozinhos.

   ── Os três ambientes ───────────────────────────────────────────────────

     01 Jardim    22 quadros de um plano fixo em 9 segundos: o entardecer
                  acontece de verdade — as luzinhas acendem, a vela aparece
                  na mesa, o céu perde a luz. E no fim o poente ATRAVESSA a
                  tela (ver .poente, no HTML).
     02 Salão     34 quadros de um plano fixo em 5,5 segundos. A sala começa
                  vazia e ENCHE, e no fim respira em vaivém. A passagem que
                  vinha depois virou seção própria (.passagem).
     03 Reservado vídeo em plano fixo a meia velocidade, só as chamas se
                  mexendo. É o fim da noite, não o clímax dela.

   Os capítulos 01 e 02 são deliberadamente o MESMO mecanismo, e é isso que
   dá forma à noite: um é o que o sol faz com um lugar, o outro é o que as
   pessoas fazem com ele. Mesma câmera travada, mesmo relógio, assuntos
   opostos — a repetição é o argumento, não uma economia. */

import {
  gsap, ScrollTrigger, reducedMotion, EASE, entrada, autonomo, laco,
  splitChars, splitLine, relogioComPiso
} from './motion.js'
import { criarSequencia } from './frames.js'

const NATURAL = { opacity: 1, y: 0, x: 0, scaleX: 1 }
const OVERLAP = 0.3 // fatia da janela compartilhada com a vizinha

/* Onde a saída de cada capítulo dispara, em fração do curso pinado. Não é
   um número só porque as três saídas têm durações diferentes de gesto: o
   poente do Jardim ocupa o último terço, o Salão se parte em um segundo. */
const SAIDA_EM = { engolir: 0.74, parte: 0.9, fecha: 0.84 }

/* ── A declaração de cada sequência ──────────────────────────────────────

   dur     SEGUNDOS que a sequência leva para correr inteira com o dedo
           parado. É o único número que decide o ritmo agora — antes o
           ritmo era uma fração de um curso de rolagem, e por isso mudava
           com a altura da tela e com a inércia de cada passada.
   janela  a fatia do curso de PERMANÊNCIA em que o piso de rolagem age.
           Fora dela o piso satura em 0 e em 1, o que compra uma batida de
           espera na entrada e outra na saída sem pagar um byte a mais.
   laco    os quadros dentro dos quais a sequência respira depois de
           terminar, em vaivém.
   fps     a velocidade desse vaivém.
   ancora  onde o recorte do `cover` cai no eixo horizontal (frames.js). */
const SEQUENCIAS = {
  dusk: {
    total: 22,
    /* 9 segundos, e é o número mais importante desta passada.

       O entardecer é o melhor material do site e a premissa da narrativa
       inteira: o café fecha, o sol cai, a casa abre. Ele merecia o
       tratamento que faz a ideia chegar mais forte, e presa ao dedo ela
       não chegava — 130 unidades de mudança entregues em saltos de oito
       quadros por passada.

       Nove segundos é o tempo em que a mesma mudança vira uma rampa
       contínua: cerca de 14 unidades por segundo, abaixo do limiar em que
       o olho vê "corte" e acima daquele em que ele vê "parado". E é o
       tempo que uma pessoa passa de fato olhando para uma fotografia de
       tela cheia antes de rolar — não é uma duração inventada, é a
       duração que a seção já tinha na prática, agora gasta em luz em vez
       de em polegar.

       Com o piso de rolagem, quem não tiver nove segundos empurra. */
    dur: 9,
    janela: [0.02, 0.86],
    /* O jardim também respira no fim: os últimos quadros são a noite já
       posta, e o vaivém entre eles é o piscar das luzinhas na parreira. */
    laco: [19, 21],
    fps: 1.6,
    caminho: (i) => `/frames/dusk/d_${String(i + 1).padStart(3, '0')}.webp`
  },
  /* ── O Salão: cinco passadas viraram nenhuma ─────────────────────────

     "O vídeo do Salão leva cinco passadas de dedo para terminar."

     Medido no navegador: a sequência mudava de quadro entre as rolagens
     4720 e 5040 — 320px, exatamente o que o código prometia. E o usuário
     estava certo do mesmo jeito, porque ele não contava a SEQUÊNCIA: ele
     contava a SEÇÃO. 1926px de capítulo a ~350px por passada de polegar
     são 5,5 passadas, das quais uma fazia a matéria andar e as outras
     quatro eram um palco pinado que não respondia a nada.

     O conserto não foi encurtar a janela outra vez. Foi tirar a sequência
     do dedo (ver o cabeçalho deste arquivo) e cortar o capítulo pela
     metade: 115% de curso viraram 70%, e a passagem — que era a segunda
     ideia enfiada no mesmo curso — virou seção própria.

     O capítulo passou de 2,15 telas a 1,7, e das 1,7 nenhuma é exigida:
     a sala enche sozinha em 5,5s, e quem estiver com pressa empurra. */
  sala: {
    total: 34,
    /* 5,5s. Mais curto que o entardecer porque a matéria é outra: a luz
       caindo é uma rampa e pede tempo; gente atravessando um quadro é um
       acontecimento por segundo e pede ritmo. A 5,5s a sala enche a cerca
       de seis quadros por segundo, que é uma vez e meia o tempo real do
       original — depressa o bastante para ser inequivocamente movimento,
       devagar o bastante para o arrasto de obturador continuar fazendo
       sentido como arrasto. */
    dur: 5.5,
    janela: [0.06, 0.9],
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

   O resultado é que `gsap.set(el, { yPercent: 45.45 })` compõe y(900px) +
   yPercent(45.45%), e o `.to()` seguinte anima só a segunda metade: o
   elemento percorre menos do que deveria e a faixa sólida nunca chega a
   cobrir a tela.

   Zerar `y` explicitamente descarta o valor lido e deixa a posição inteira
   nas mãos da percentagem, que é a única unidade que sobrevive a uma troca
   de altura de tela. */
const poente = document.querySelector('.poente')
if (poente && !reducedMotion) gsap.set(poente, { y: 0, yPercent: 45.45, opacity: 1 })

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

  /* ── O curso de permanência: só a matéria ──────────── */

  /* Sem `pin`. O palco é sticky (sections.css) e esta timeline só lê a
     posição dentro do curso. O `end` é o mesmo `+=curso%` de sempre, então
     todas as contas de gatilho abaixo continuam valendo ao pixel — o que
     mudou é quem segura a tela. */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top top',
      end: `+=${curso}%`,
      scrub: 1,
      invalidateOnRefresh: true
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
       graça: a sequência não fica maior, só é lida mais devagar.

       Agora ela não é mais a janela de um SCRUB: é a janela do PISO. Ver o
       diagnóstico abaixo. */
    const quadro = { v: 0 }
    const total = seq.total - 1

    /* O piso de rolagem: onde o dedo está dentro do curso de permanência.
       Um gatilho sem scrub e sem timeline, só para publicar `progress`. */
    let progresso = 0
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top top',
      end: `+=${curso}%`,
      invalidateOnRefresh: true,
      onUpdate: (self) => { progresso = self.progress }
    })

    /* Em dev, o quadro atual à mão. O ritmo desta passada foi decidido por
       medição na tela, e sem isto não há como saber quantos pixels de
       rolagem ou quantos segundos a sequência realmente consome — o hash
       do canvas não distingue "enchendo" de "respirando no fim". */
    if (import.meta.env.DEV) (window.__seq ??= {})[palcoSeq.dataset.seq] = quadro

    const relogio = relogioComPiso(chapter, {
      dur: seq.dur ?? 6,
      piso: () => {
        const [a, b] = seq.janela ?? [0, 1]
        return (progresso - a) / (b - a)
      },
      passo: (v) => {
        quadro.v = v * total
        player.desenhar(quadro.v)
      }
    })

    /* E ela rebobina ao sair, pelos dois lados.

       É o que substitui a reversibilidade para uma sequência de classe 3.
       Quem volta ao Salão depois de ter descido até o fecho encontra a sala
       vazia de novo e a vê encher outra vez — em vez de encontrar um cartaz
       de uma sala cheia sem gesto nenhum que a explique.

       `top bottom` / `bottom top` é a seção inteira: o rebobinar acontece
       com a seção completamente fora da tela, então o salto do último
       quadro para o primeiro nunca é visto. */
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top bottom',
      end: 'bottom top',
      onLeave: relogio.rebobinar,
      onLeaveBack: relogio.rebobinar
    })

    /* ╔════════════════════════════════════════════════════════════════╗
       ║ POR QUE A SEQUÊNCIA SAIU DO DEDO                               ║
       ║                                                                ║
       ║ Medido no navegador a 414×896, antes desta passada:            ║
       ║                                                                ║
       ║   entardecer  130 unidades de mudança visível espalhadas por   ║
       ║               1100px de curso, e distribuídas de forma até     ║
       ║               regular — o defeito não estava na distribuição.  ║
       ║               Está em que uma passada de polegar com a inércia ║
       ║               do Lenis anda ~400px, o que salta OITO quadros   ║
       ║               de uma vez. O que devia ser luz caindo chega     ║
       ║               como corte, e são três passadas para atravessar. ║
       ║   sala        320px de mudança de quadro dentro de uma seção   ║
       ║               de 1926px. O código dizia 360 e estava certo; o  ║
       ║               usuário contava cinco passadas e também estava — ║
       ║               eram cinco passadas para a SEÇÃO, das quais uma  ║
       ║               fazia alguma coisa.                              ║
       ║                                                                ║
       ║ As duas queixas — "passa depressa demais para ser apreciado" e ║
       ║ "exige rolagem sustentada" — parecem contraditórias e são a    ║
       ║ mesma coisa dita duas vezes: cada passada entrega demais, e    ║
       ║ são muitas passadas.                                           ║
       ║                                                                ║
       ║ Tempo conserta os dois de uma vez, e o PISO DE ROLAGEM         ║
       ║ (motion.js) tira o risco de quem rola depressa ver 20% da      ║
       ║ sequência: quem para, assiste; quem corre, empurra. Nunca há   ║
       ║ um quadro congelado esperando o dedo, e nunca há um dedo       ║
       ║ obrigado a trabalhar.                                          ║
       ╚════════════════════════════════════════════════════════════════╝

       ── E no fim ela não para: ela RESPIRA ──────────────────────────

       Chegando ao último quadro, a sequência entra num vaivém dentro dos
       últimos quadros. Não volta ao começo — ela é monotônica, ela CONTA
       uma coisa, e voltar ao quadro 1 esvaziaria a sala. Em quadros de
       multidão arrastada o vaivém lê como agitação contínua: em plano
       longo com obturador aberto, o olho não distingue direção.

       É o que garante que, com o dedo parado no fim da seção, a sala
       continue viva em vez de virar um cartaz — e é o que sobrou da
       "soltura" da passada anterior, que agora é o estado normal da seção
       inteira em vez de um acontecimento no meio dela. */
    if (seq.laco) {
      const [de, para] = seq.laco
      const fps = seq.fps ?? 6
      let v = para
      let sentido = -1
      let solto = false

      laco(chapter, (dt) => {
        if (!solto) {
          // o relógio ainda está desenhando: espera ele chegar ao fim
          if (quadro.v < total - 0.02) return
          solto = true
          v = quadro.v
        } else if (quadro.v < total - 0.02) {
          // o piso puxou a sequência para trás (o usuário subiu): devolve
          solto = false
          return
        }
        v += dt * fps * sentido
        if (v >= para) { v = para; sentido = -1 }
        else if (v <= de) { v = de; sentido = 1 }
        player.desenhar(v)
      })
    }
  }

  /* ── Montagem ───────────────────────────────────────

     Empilhamento inicial: a primeira camada acesa, o resto fora de cena, e
     janelas de dissolução ao longo do curso.

     Hoje nenhum capítulo tem mais de uma camada — a passagem do Salão, que
     era a única, virou seção própria (.passagem). O bloco fica porque a
     gramática de um capítulo de várias camadas continua sendo parte do
     vocabulário da casa, e porque ele não custa nada quando não há o que
     empilhar. */
  if (camadas.length > 1) {
    gsap.set(camadas, { opacity: (i) => (i === 0 ? 1 : 0) })

    const janela = 1 / camadas.length
    const cruzamento = OVERLAP * janela

    camadas.forEach((camada, i) => {
      if (i === 0) return
      tl.to(camada, { opacity: 1, duration: cruzamento, ease: 'none' }, i * janela - cruzamento / 2)
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

     Disparada, não presa ao dedo: uma chegada não é um estado da cena. "A
     fotografia está 40% acesa" não responde à pergunta que separa a classe
     1 da 2 (motion.js) — só descreve o quanto o dedo andou. E presa ao
     scrub ela parava meio acesa quando o usuário parasse de rolar, o que
     não lê como chegada em curso, lê como carregamento travado. */
  autonomo(chapter, (t) => {
    t.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' })
  }, { start: 'top 64%' })

  /* ══════════════════════════════════════════════════════════════════════
     O POENTE — e é aqui que a tela dourada é consertada de verdade.

     O diagnóstico completo está no HTML, junto do elemento; o desenho, em
     poente.css. O resumo:

       A passada anterior mediu 677px de âmbar chapado, atribuiu o defeito
       à DURAÇÃO, reconstruiu a transição num gatilho contínuo e derrubou o
       número para 225px. Medido de novo neste navegador, a 414×896: o
       conserto aplicou, o número está certo, e o defeito continua lá.

       Porque a duração nunca foi a causa. A causa é que a faixa tinha um
       PLATÔ — 43% da altura dela era #C8892E a 100% — e sempre que esse
       platô cobria a tela, o quadro inteiro virava um valor só. Uma cor
       sólida de borda a borda não lê como luz; lê como erro de
       renderização. E isso é igualmente verdade em 225px e em 677.

     Agora não há platô: o perfil sobe até um núcleo quente e volta, sem um
     trecho constante, e o núcleo é mais estreito que a tela. O quadro tem
     SEMPRE um gradiente vertical dentro dele — que é, além do mais, a
     forma que um poente tem.

     ── O que este bloco faz ──────────────────────────────────────────────

     Um gatilho só, com as duas pontas em seções diferentes: `trigger` no
     Jardim e `endTrigger` na seção que chega. É a única maneira honesta de
     cobrir uma emenda — o objeto que a cobre não pode pertencer a nenhum
     dos dois lados dela.

     ── Três tempos, e o do meio é a travessia do núcleo ─────────────────

       0    → 0.42   INUNDA     yPercent +45,45 → −5    power2.in
       0.42 → 0.66   ATRAVESSA  yPercent −5     → −35   none
       0.66 → 1      DRENA      yPercent −35    → −100  power2.out

     Curva `none` no meio porque ali o que se quer é previsibilidade: a
     duração do momento mais quente tem de ser proporcional ao dedo, não à
     curva. Nas pontas as curvas ficam, e elas dão a direção — um nível que
     sobe acelera, uma luz que vai embora desacelera.

     ── E a fotografia do Jardim NÃO apaga mais ──────────────────────────

     Ela apagava por baixo da faixa sólida, para que o palco não passasse
     aceso por trás da seção seguinte. Duas coisas mudaram e as duas tiram
     a razão de ser disso: o pico deixou de ser opaco (então apagar a foto
     por baixo dele seria visível, e o que se veria é a coisa se apagando),
     e o que vem depois do poente é a cabine — carvão liso, sem costura
     para esconder.

     O jardim fica, e no pico ele é o que se vê ATRAVÉS da luz: silhueta
     contra contraluz, que é o que um fim de tarde é.
     ══════════════════════════════════════════════════════════════════════ */
  if (tipoSaida === 'engolir' && poente) {
    const chega = chapter.nextElementSibling

    gsap.timeline({
      scrollTrigger: {
        trigger: chapter,
        start: () => `top top-=${Math.round(window.innerHeight * (curso / 100) * 0.5)}`,
        endTrigger: chega ?? chapter,
        end: chega ? 'top 25%' : 'bottom top',
        /* A timeline de permanência corre com `scrub: 1` — um segundo de
           inércia, que é o que dá ao entardecer a maciez de uma luz
           mudando. Aqui a inércia é um terço disso: o suficiente para o
           movimento não ser digital, curto o bastante para a luz nunca
           chegar atrasada ao próprio compromisso. */
        scrub: 0.35,
        invalidateOnRefresh: true
      }
    })
      .to(poente, { yPercent: -5, duration: 0.42, ease: 'power2.in' }, 0)
      .to(poente, { yPercent: -35, duration: 0.24, ease: 'none' }, 0.42)
      .to(poente, { yPercent: -100, duration: 0.34, ease: 'power2.out' }, 0.66)

    /* ── A bruma deriva ──────────────────────────────────

       Classe 3. Ela é a resposta à pergunta que o defeito fazia: o que há
       DENTRO desta luz? Uma luz sem nada suspenso nela é uma cor.

       Duas senoides de períodos primos entre si, amplitude pequena — não é
       paralaxe, é uma coisa que não está parada. E o laço está preso ao
       CAPÍTULO, não ao poente: o poente é fixo e estaria sempre "em cena"
       para o observador, o que faria a bruma acordar o telefone durante a
       visita inteira. */
    const bruma = poente.querySelector('.poente__bruma')
    if (bruma) {
      let t = 0
      laco(chapter, (dt) => {
        t += dt
        gsap.set(bruma, {
          xPercent: Math.sin(t * 0.13) * 3.6,
          yPercent: Math.cos(t * 0.091) * 2.8,
          scale: 1.18 + Math.sin(t * 0.067) * 0.04
        })
      })
    }
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

  saida.to(meta, { opacity: 0, duration: 0.6, ease: 'none' }, 0)

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

       E o que sai por cima agora é a SALA CHEIA, correndo sozinha: o que a
       seção seguinte (.passagem) descobre por baixo dela é a mesma sala, um
       metro mais perto. A emenda deixa de ser uma troca de tema. */
    /* O empurrão vai no PLANO, não no .chapter__media — e a distinção não é
       de gosto, é de propriedade disputada.

       O .chapter__media é escrito a cada quadro pela timeline de
       permanência, que o leva de scale(1.16) a scale(1.02) ao longo do
       capítulo inteiro. Uma segunda timeline escrevendo escala no MESMO
       elemento perde sempre: o scrub reescreve o transform no próximo
       evento de rolagem e a saída é apagada quadro a quadro. Foi por isso
       que a primeira versão disto deixava a fotografia subir sem crescer —
       e uma foto que sobe sem crescer descobre a própria borda de baixo,
       que é a aresta horizontal dura que esta saída existe para não
       cometer. */
    const alvoSaida = camadas.at(-1) ?? media

    saida.to(title, { xPercent: -14, opacity: 0, duration: 0.8, ease: EASE }, 0)
      .to(text, { xPercent: 14, opacity: 0, duration: 0.8, ease: EASE }, 0.08)
      .to(alvoSaida, { yPercent: -14, scale: 1.2, duration: 1.4, ease: EASE }, 0.1)
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
