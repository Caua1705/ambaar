/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   ── As três classes de movimento, aplicadas ─────────────────────────────

   A regra do site está em motion.js. Aqui está como ela cai nos capítulos, e
   nesta passada ela ficou mais estrita em um ponto e mais solta em outro:

     CLASSE 1 · preso ao dedo
       a foto respirando, a demão de céu ganhando corpo e o relógio
       contando. Em todos, a posição da rolagem corresponde literalmente a
       um estado da cena. (O poente estava nesta lista e saiu do site: ver
       o bloco abaixo dos imports.)

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

     01 Jardim    28 quadros de um plano fixo em 11 segundos, e é a única
                  seção em que duas coisas acontecem juntas: a luz cai E a
                  casa enche. No fim a cabine está acesa e o DJ tocando,
                  dentro do próprio plano.
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

/* Onde a saída de cada capítulo dispara, em fração do curso de permanência.
   Não é um número só porque as três saídas têm durações diferentes de
   gesto: o Jardim escurece devagar (uma luz que acaba), o Salão se parte em
   um segundo.

   O Jardim já foi a 0,74 (quando a saída era o poente, que precisava de um
   quarto de curso para atravessar a tela) e a 0,90 (quando havia um segundo
   ato para não atropelar). Agora é 0,84 sobre um curso de 105%, e o número
   vem do pedido: quando o vídeo acaba, a próxima seção começa. A sequência
   satura a 0,68 do curso; 0,84 deixa uma batida de respiro e sai. */
const SAIDA_EM = { apaga: 0.84, parte: 0.9, fecha: 0.84 }

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
    /* ⚠︎ Este número tem de bater com `quadros` da mesma sequência em
       scripts/frames.mjs. São dois arquivos e nenhum lê o outro: o build
       decide quantos quadros GRAVAR e este decide quantos LER.

       Quando a fonte do entardecer trocou (o pátio vazio virou o jardim com
       gente), o build subiu de 22 para 28 e este ficou em 22. O defeito é
       silencioso e duplo: o site nunca desenhava os seis últimos quadros —
       justamente os mais cheios, à noite — e todo cálculo feito sobre o
       progresso da sequência passou a saturar seis quadros cedo demais,
       incluindo a dissolução para a fotografia da cabine, que acendia
       inteira antes de a noite terminar de encher. */
    total: 28,
    /* 9s → 11s. A fonte deixou de ser uma rampa de luz sobre um pátio vazio
       e passou a ter duas coisas acontecendo ao mesmo tempo: a luz caindo e
       a casa enchendo. A 9s os 28 quadros correm a 3,1/s e a chegada das
       pessoas passa como um borrão de stop-motion; a 11s são 2,5/s, que é o
       ritmo em que se vê alguém sentar. */
    dur: 11,
    /* A janela é o trecho do curso em que a rolagem EMPURRA a sequência;
       fora dela o piso satura em 0 e em 1.

       0,60 → 0,68 junto com a saída do segundo ato. Enquanto havia uma
       fotografia para acender depois do plano, valia a pena o piso saturar
       cedo e sobrar curso. Sem ela, curso sobrando é a sala cheia PARADA
       esperando o dedo — e o pedido foi explícito: quando o vídeo acaba, a
       próxima seção começa.

       A 0,68 de um curso de 105% o sol termina a 0,71 tela do topo da
       seção, e a saída dispara a 0,88 (SAIDA_EM). Sobram 0,17 tela de
       respiro entre a última mudança e a seção sair — uma batida, não uma
       espera.

       Para quem NÃO rola depressa nada disso muda: o relógio de 11s manda,
       e a janela só existe para o caso em que o dedo é mais rápido que a
       luz. */
    janela: [0.02, 0.68],
    /* O jardim também respira no fim: os últimos quadros são a noite já
       posta, e o vaivém entre eles é o piscar das luzinhas na parreira. */
    /* Os últimos quadros, e eles se mudaram junto com a contagem: eram
       [19, 21] no fim de uma sequência de 22. Numa de 28, aquele trecho é o
       meio do estágio da hora dourada — a seção terminaria respirando na
       parte errada da noite. */
    laco: [25, 27],
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

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║ O POENTE SAIU DAQUI, E COM ELE A TELA DOURADA                        ║
   ║                                                                      ║
   ║ Este arquivo tinha um bloco de quarenta linhas que montava a         ║
   ║ transição 17h → 20h: uma faixa âmbar de 220svh, presa a um gatilho   ║
   ║ com as pontas em duas seções diferentes, atravessando a tela de      ║
   ║ baixo para cima.                                                     ║
   ║                                                                      ║
   ║ Ela produzia uma tela inteira de âmbar chapado, e duas passadas      ║
   ║ tentaram consertá-la — uma atacando a DURAÇÃO (677px de âmbar        ║
   ║ viraram 225), outra atacando o PLATÔ do gradiente (o pico caiu de    ║
   ║ 1,00 para 0,65 e ganhou uma camada de bruma). As duas mediram        ║
   ║ certo, as duas aplicaram, e o defeito continuou lá: medido outra vez ║
   ║ a 414×896, na rolagem 3175 o quadro inteiro é âmbar com uma emenda   ║
   ║ horizontal dura no meio, e ele ainda está assim em 3600.             ║
   ║                                                                      ║
   ║ A causa não é nem a duração nem o platô: é a GEOMETRIA. Uma faixa    ║
   ║ cujo trecho acima de 0,7 de opacidade mede 33 pontos percentuais da  ║
   ║ própria altura, atravessando uma tela que ocupa 45 pontos dessa      ║
   ║ mesma altura, cobre o quadro inteiro com valores entre 0,7 e 0,96    ║
   ║ durante uma tela de rolagem. Nenhum ajuste de parada de gradiente    ║
   ║ conserta isso — enquanto o objeto for uma faixa opaca mais alta que  ║
   ║ a tela passando por cima dela, haverá um momento em que ele É a      ║
   ║ tela.                                                                ║
   ║                                                                      ║
   ║ Removido inteiro: o elemento, a folha, a bruma, a fotografia dela e  ║
   ║ este bloco. E ele não deixou buraco, porque a emenda que existia     ║
   ║ para cobrir deixou de existir: depois do Jardim não vem outra        ║
   ║ fotografia de sangria total, vem a cabine — carvão liso com dois     ║
   ║ quadros emoldurados. Não há costura para esconder.                   ║
   ║                                                                      ║
   ║ O Jardim passou a sair como o assunto dele pede (`apaga`, abaixo).   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

for (const chapter of document.querySelectorAll('.chapter')) {
  const stage = chapter.querySelector('.chapter__stage')
  const media = chapter.querySelector('.chapter__media')
  const imgs = [...chapter.querySelectorAll('.chapter__img')]
  /* As camadas da montagem são os PLANOS quando eles existem, e as fotos
     quando não. O plano é um embrulho cuja única função é andar: a foto
     dentro dele guarda a própria escala e âncora no CSS, e as duas coisas
     precisam de transform ao mesmo tempo.

     O seletor teve uma exceção enquanto o Jardim tinha um segundo ato: a
     camada da cabine era um plano no desenho e não uma camada de montagem,
     porque quem a acendia era o progresso da sequência e não o curso da
     seção. Ela saiu do site, e a exceção com ela. */
  const planos = [...chapter.querySelectorAll('.chapter__plano')]
  const camadas = planos.length ? planos : imgs
  const canvas = chapter.querySelector('.chapter__canvas')
  const video = chapter.querySelector('.chapter__video')
  const dusk = chapter.querySelector('.chapter__dusk')
  const label = chapter.querySelector('.chapter__label')
  const title = chapter.querySelector('.chapter__title')
  const text = chapter.querySelector('.chapter__text')
  /* As linhas de apoio da passada de copy: a lista de gêneros (Jardim) e a
     regra da casa (Reservado). Entram depois do parágrafo e saem com ele —
     são texto do capítulo, não um dispositivo próprio. */
  const extras = [...chapter.querySelectorAll('.chapter__generos, .chapter__nota')]
  const meta = chapter.querySelector('.chapter__meta')

  const { dash, text: labelText } = splitLine(label)
  const chars = splitChars(title)
  const curso = Number(chapter.dataset.run) || 180
  const tipoSaida = chapter.dataset.saida

  gsap.set(label, NATURAL)

  /* ── Sem movimento ─────────────────────────────────── */

  if (reducedMotion) {
    // estado final legível: o cartaz parado do ambiente e o texto inteiro
    gsap.set([dash, labelText, title, text, ...extras, ...chars], NATURAL)
    /* O Reservado não tem plano nem <img>: a matéria dele é vídeo, e
       `camadas` fica vazio. `gsap.set([])` avisa no console — sem alvo não
       há o que escrever. */
    if (camadas.length) gsap.set(camadas, { opacity: (i) => (i === camadas.length - 1 ? 1 : 0) })
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
  /* ╔══════════════════════════════════════════════════════════════════════╗
     ║ `scrub: true` E NÃO `scrub: 1` — A CORTINA QUE DESCIA SOZINHA        ║
     ║                                                                      ║
     ║ O número em `scrub` não é uma suavização de curva: é um ATRASO. Com  ║
     ║ `scrub: 1` o GSAP persegue a posição de rolagem com um segundo de    ║
     ║ folga — quando o dedo para, a timeline NÃO para. Ela continua        ║
     ║ correndo até alcançar onde a rolagem já está.                        ║
     ║                                                                      ║
     ║ Quem paga isso é o véu (`.chapter__dusk`), que é o objeto mais       ║
     ║ visível desta timeline: uma demão cinza-marrom sobre a tela inteira, ║
     ║ indo de 0 a 1 entre 20% e 55% do curso. Medido no jardim, uma        ║
     ║ passada de polegar de 380px e o dedo fora da tela:                   ║
     ║                                                                      ║
     ║   0,486 → 0,206 → 0,089 → 0,037 → 0,012 → 0,003 → 0                  ║
     ║                                                                      ║
     ║ Um segundo inteiro de demão se desfazendo sozinha DEPOIS de a pessoa ║
     ║ ter soltado a tela. Foi essa a queixa, nas duas vezes em que ela     ║
     ║ chegou: "a cortina não está completa, e quando eu solto ela desce    ║
     ║ toda". Não era o desenho do véu, era o atraso do scrub.              ║
     ║                                                                      ║
     ║ E é o pior tipo de defeito num site cujo contrato de movimento é a   ║
     ║ classe 1 (motion.js): "a posição da rolagem É um estado da cena".    ║
     ║ Um estado que continua mudando com o dedo parado não é um estado —   ║
     ║ é uma animação disfarçada de scrub.                                  ║
     ║                                                                      ║
     ║ `true` amarra a timeline à rolagem sem folga nenhuma: o dedo para, o ║
     ║ véu para. A suavidade não se perde — quem a fornece é o Lenis no     ║
     ║ ponteiro e a rolagem nativa no telefone, que já entregam a posição   ║
     ║ interpolada. O `1` estava suavizando o que já estava suave e         ║
     ║ cobrando um segundo de movimento não pedido por isso.                ║
     ╚══════════════════════════════════════════════════════════════════════╝ */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top top',
      end: `+=${curso}%`,
      scrub: true,
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

         Jardim  0,02 → 0,86. Uma batida de sol alto na entrada, e uma
                 folga no fim que é onde o segundo ato acontece: a
                 sequência termina e as luzinhas da parreira acendem por
                 cima dela.
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
    /* ╔════════════════════════════════════════════════════════════════╗
       ║ O SEGUNDO ATO SAIU DAQUI                                       ║
       ║                                                                ║
       ║ Havia neste ponto uma terceira camada no Jardim: uma fotografia ║
       ║ da cabine em close que dissolvia por cima do plano nos últimos  ║
       ║ quadros, com a opacidade escrita pelo progresso da SEQUÊNCIA e  ║
       ║ não pela rolagem — para acender sempre no mesmo quadro, com o   ║
       ║ polegar parado ou correndo.                                     ║
       ║                                                                ║
       ║ O mecanismo estava certo e a razão de existir evaporou. Ele foi ║
       ║ construído quando a fonte do capítulo era um pátio VAZIO com a  ║
       ║ luz caindo: sem nada acontecendo nos últimos quadros, a         ║
       ║ fotografia era o único acontecimento que a seção podia ter.      ║
       ║                                                                ║
       ║ A fonte nova tem a cabine acesa e o DJ tocando DENTRO do plano, ║
       ║ nos quadros 17 a 28. Mantida, a fotografia virava uma imagem    ║
       ║ PARADA cobrindo justamente o trecho mais vivo da sequência — e  ║
       ║ depois dela ainda sobrava meia tela de espera antes da seção    ║
       ║ seguinte.                                                       ║
       ║                                                                ║
       ║ Saiu inteira: o elemento, a folha, este bloco e o arquivo       ║
       ║ publicado (−135 kB). O capítulo termina no próprio plano, com a ║
       ║ casa cheia, e sai. Quando o vídeo acaba, a próxima seção        ║
       ║ começa.                                                         ║
       ║                                                                ║
       ║ O original continua em brand/originais/hero.jpg.                ║
       ╚════════════════════════════════════════════════════════════════╝ */

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

  /* A luz caindo: a demão de céu ganha corpo no miolo (só o Jardim) — e
     depois RECUA.

     Ela é um campo âmbar-bronze de tela cheia, e existe para costurar a luz
     da sequência à paleta da marca enquanto o sol cai. No fim do curso a
     sequência já não é mais o que está na tela: é a cabine acesa, que já é
     âmbar de fita de LED sobre reboco. Uma demão âmbar a cheio por cima de
     uma fotografia âmbar não acrescenta paleta, tira contraste — a fita de
     luz do balcão, que é o assunto, some dentro do próprio tempero.

     Sobe até 0,55 do curso e volta a 0,3 até 0,82, que é onde a cabine
     assume. O que fica por cima dela é um véu, não uma demão.

     ╔════════════════════════════════════════════════════════════════════╗
     ║ O VÉU COBRINDO A TELA INTEIRA — e era uma propriedade disputada    ║
     ║                                                                    ║
     ║ A queixa: "seguro a página, solto, e o negócio cinza cobre a tela   ║
     ║ toda". Não era o desenho do véu; eram DOIS DONOS escrevendo a mesma ║
     ║ opacidade.                                                          ║
     ║                                                                    ║
     ║ Esta timeline é scrub (com 1s de atraso, por construção) e vai de   ║
     ║ 0 a 1 do curso. A saída do capítulo é um gatilho de POSIÇÃO e       ║
     ║ dispara a 0,84 do mesmo curso (SAIDA_EM) — isto é, dentro da faixa  ║
     ║ do scrub. Ela também escrevia `dusk.opacity`, levando o véu a zero. ║
     ║                                                                    ║
     ║ Nos últimos 16% do curso os dois escreviam ao mesmo tempo, e quem   ║
     ║ ganhava dependia da ordem do quadro. Rolando depressa e SOLTANDO, o ║
     ║ pior caso acontece inteiro: o gatilho dispara na hora (ele não tem  ║
     ║ atraso), apaga o véu e apaga a fotografia; o scrub, um segundo      ║
     ║ atrás, continua entregando o valor do MEIO do curso — onde o véu    ║
     ║ está a cheio. O que sobra na tela é o véu de tela inteira por cima  ║
     ║ de uma seção que já saiu, e ele fica: terminado o curso, o último   ║
     ║ valor escrito pelo scrub é 0,3, e nada mais o toca.                 ║
     ║                                                                    ║
     ║ O conserto é o mesmo que esta folha já aplicou à escala do          ║
     ║ `.chapter__media` (ver a nota do `alvoSaida`, na saída do Salão):   ║
     ║ uma propriedade, um dono. O véu drena DENTRO do scrub, na mesma     ║
     ║ posição em que a saída dispara — e some da saída.                   ║
     ║                                                                    ║
     ║ De graça, vem a reversibilidade: subindo, o scrub reacende o véu    ║
     ║ pelo mesmo caminho, sem nenhuma volta declarada.                    ║
     ╚════════════════════════════════════════════════════════════════════╝ */
  if (dusk) {
    tl.fromTo(dusk, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, 0.2)
      .to(dusk, { opacity: 0.3, duration: 0.27, ease: 'none' }, 0.55)
      /* e drena junto com a seção, aqui e em lugar nenhum mais. A posição é
         a MESMA fração do curso em que o gatilho de saída dispara, lida da
         mesma tabela: se um dia ela mudar, os dois mudam juntos. */
      .to(dusk, { opacity: 0, duration: 0.16, ease: 'none' }, SAIDA_EM[tipoSaida] ?? 0.84)
  }

  /* ── A batida de preto ────────────────────────────────

     Todo capítulo sobe DO PRETO. Entre a seção anterior e a fotografia não
     há nada na tela por um instante — só o fundo da página —, e é essa
     batida que faz a chegada ser um corte em vez de uma emenda.

     Disparada, não presa ao dedo: uma chegada não é um estado da cena. "A
     fotografia está 40% acesa" não responde à pergunta que separa a classe
     1 da 2 (motion.js) — só descreve o quanto o dedo andou. E presa ao
     scrub ela parava meio acesa quando o usuário parasse de rolar, o que
     não lê como chegada em curso, lê como carregamento travado.

     ── E ela acende mais cedo: `top 64%` virou `top 78%` ────────────────

     Metade de uma queixa de uma passada anterior: "embaixo da cabine tenho
     que rolar quatro vezes para chegar no Salão, e fica um espaço preto
     vazio grande". A outra metade era o poente, que cobria a cabine
     inteira de âmbar e foi removido; esta é o resto.

     A 64%, o capítulo passava 36% de tela em preto absoluto antes de a
     fotografia começar a acender — somados aos 30svh de carvão que a seção
     anterior deixava no pé, davam mais de uma tela seguida sem nada.
     A 78% a batida de preto continua existindo (ela é o que faz a chegada
     ser um corte), e ela dura 22% de tela em vez de 36.

     ── E o vizinho do Salão mudou depois disso ──────────────────────────

     A cabine saiu do site (a nota está em index.html), então quem entrega
     o Salão agora é a carta das 19h — uma fotografia de sangria total, sem
     os 30svh de carvão no pé. O número não mudou por causa disso: a 78% os
     dois gatilhos ficam a 18px um do outro a 414×896 (a saída da carta
     dispara a `bottom 76%`, copo.js), e fotografado em degraus a 2930 e
     2950 não há colisão — a frase da carta sai por cima, o preto do
     capítulo chega por baixo. Os 64% de antes reabririam o buraco que esta
     nota existe para ter fechado. */
  autonomo(chapter, (t) => {
    t.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' })
  }, { start: 'top 78%' })

  /* ── O texto: gatilho, não dedo ────────────────────── */

  entrada(chapter, (t) => {
    t.to(dash, { scaleX: 1, duration: 0.7, ease: EASE }, 0)
      .to(labelText, { ...NATURAL, duration: 0.7, ease: EASE }, 0.2)
      .to(chars, { ...NATURAL, duration: 0.7, ease: EASE, stagger: 0.028 }, 0.34)
      .to(text, { ...NATURAL, duration: 0.9, ease: EASE }, 0.66)
    if (extras.length) t.to(extras, { ...NATURAL, duration: 0.9, ease: EASE }, 0.88)
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

       apaga   — o Jardim acaba porque a LUZ acaba. A tela escurece até o
                 carvão e o texto sobe junto. Ver abaixo.
       parte   — o Salão se parte ao meio, título para um lado e texto para
                 o outro, como a pista abrindo. E a fotografia FICA ACESA.
       fecha   — o Reservado contrai para o centro e escurece: a noite se
                 fecha em si mesma, que é literalmente o que o texto diz.

     Classe 2: a saída é um gesto, e um gesto entregue em fatias
     proporcionais ao dedo deixa de ser gesto. */

  const saida = gsap.timeline({ paused: true })

  saida.to(meta, { opacity: 0, duration: 0.6, ease: 'none' }, 0)

  if (tipoSaida === 'apaga') {
    /* ╔════════════════════════════════════════════════════════════════╗
       ║ A SAÍDA QUE SUBSTITUIU O POENTE                                ║
       ║                                                                ║
       ║ Era `engolir`: o texto se recolhia e uma faixa âmbar de 220svh ║
       ║ atravessava a tela por cima de tudo. Essa faixa era a tela      ║
       ║ dourada, e ela foi removida do site (ver o cabeçalho deste      ║
       ║ arquivo).                                                      ║
       ║                                                                ║
       ║ O que entrou no lugar não é uma transição: é o fim do assunto.  ║
       ║ Este capítulo é o sol se pondo, e no último quadro da sequência ║
       ║ a fotografia já é uma noite com luzinhas acesas. A saída        ║
       ║ simplesmente continua o que a cena está fazendo — a luz acaba,  ║
       ║ a tela escurece até o carvão, e o carvão é o que a seção        ║
       ║ seguinte usa para subir do preto.                               ║
       ║                                                                ║
       ║ Uma transição que é a continuação da cena não precisa de objeto ║
       ║ nenhum por cima dela. Era essa a lição que três passadas de     ║
       ║ conserto de gradiente não tinham aprendido.                     ║
       ║                                                                ║
       ║ `fromTo` com `immediateRender: false`, pelo mesmo motivo do     ║
       ║ Reservado: a batida de preto (a chegada) é um `fromTo` de       ║
       ║ render imediato que põe o media em opacidade 0 na montagem da   ║
       ║ página, e um `.to()` posterior sobre a mesma propriedade        ║
       ║ gravaria esse 0 como valor de partida — a seção inteira nasceria ║
       ║ apagada.                                                        ║
       ╚════════════════════════════════════════════════════════════════╝ */
    /* O véu NÃO está aqui: ele é escrito pelo scrub, e só por ele. A conta
       inteira está na nota do `dusk`, acima. */
    saida.to([title, text, ...extras], { y: -80, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.06 }, 0)
      .fromTo(media,
        { opacity: 1 },
        { opacity: 0, duration: 1.2, ease: 'power2.in', immediateRender: false }, 0.1)
  } else if (tipoSaida === 'fecha') {
    /* `fromTo` com immediateRender: false, pelo mesmo motivo da saída do
       Jardim, logo acima.

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
    saida.to([title, text, ...extras], { scale: 0.94, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08 }, 0)
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
       seção seguinte aparece por baixo dela em vez de depois dela. É
       deslocamento, não dissolução, e nenhuma outra emenda do site usa
       este dispositivo (a de cima, o Jardim, usa o oposto exato: ela
       apaga).

       E o que sai por cima é a SALA CHEIA, correndo sozinha: o que a pista
       das 22h descobre por baixo dela é a mesma sala, parada e nítida. A
       emenda deixa de ser uma troca de tema. */
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
