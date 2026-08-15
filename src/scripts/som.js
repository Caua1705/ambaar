/* O som da casa.

   Um clube de escuta com um site mudo é uma contradição que qualquer pessoa
   do ramo nota. Este arquivo é o mecanismo inteiro, e ele foi escrito para
   funcionar ANTES de existir o arquivo de áudio: sem faixa, o controle
   aparece, acende, pulsa, alterna e guarda a escolha — só não produz som.

   ┌──────────────────────────────────────────────────────────────────────┐
   │ PARA ENTREGAR O ÁUDIO — um passo                                     │
   │                                                                      │
   │   crie a pasta e ponha o arquivo em:                                 │
   │                                                                      │
   │       public/audio/ambar.mp3                                         │
   │                                                                      │
   │ Só isso. Nada mais muda: a constante FAIXA abaixo já aponta para lá,  │
   │ o Vite copia public/ inteiro para o build, e o mecanismo já está      │
   │ ligado — o controle aparece, acende, pulsa, alterna, guarda a         │
   │ escolha e persegue o volume de cada seção HOJE, sem arquivo nenhum.   │
   │ O que falta é só o que sai do alto-falante.                          │
   │                                                                      │
   │ Se o nome do arquivo for outro, troque a linha da constante — é a     │
   │ única linha a mudar em todo o projeto.                               │
   │                                                                      │
   │ Recomendação de material: um loop de 60 a 120s, organic house/        │
   │ downtempo, normalizado a −16 LUFS e com fade nas duas pontas para o   │
   │ laço não estalar. 128 kbps mono resolve; o áudio é ambiente, não é o  │
   │ acervo do clube.                                                     │
   │                                                                      │
   │ Para conferir sem ouvir: em dev, `__som.estado()` no console devolve  │
   │ o estado do grafo, o ganho instantâneo, o nível que a seção atual     │
   │ pede e o pico do analisador.                                         │
   └──────────────────────────────────────────────────────────────────────┘

   ── As regras ───────────────────────────────────────────────────────────

   · Desligado por padrão, sempre. Nunca toca sozinho — o navegador
     bloquearia, e mesmo que não bloqueasse seria hostil.
   · Ao ligar, o som ENTRA em 1,5s. Nenhum corte seco, em lugar nenhum.
   · A escolha sobrevive à navegação dentro da sessão (sessionStorage, não
     localStorage: a preferência é desta visita, não uma configuração
     permanente que o usuário não sabe que deu).
   · Sem arquivo, tudo acima continua valendo, sem som.

   ── O volume segue a narrativa ──────────────────────────────────────────

   Um clube de escuta não tem um volume só, e o site também não tem: a casa
   às 17h no jardim não soa como a casa às 22h no salão. Cada seção declara
   o nível que pede (data-som, no HTML) e o ganho persegue esse valor em
   2 segundos.

       Hero      .15    o instante guardado, antes de tudo
       Jardim    .30    som lá fora, entre as plantas
       19h copo  .34    a casa começou a servir
       20h cabine .50   alguém escolhendo o que vai tocar
       Salão     .70    a casa cheia
       22h pista .80    o pico da página
       23h brinde .78
       00h passagem .62 a câmera entrando
       01h pausa .40    a conversa baixando
       Reservado .25    poucas mesas, o som no ponto exato
       03h quem fica .18
       Reservas  .15
       Fecho     .15    o tempo parando

     A curva é a da própria noite: sobe do silêncio ao pico no Salão e
     desce até o mesmo silêncio. O .20 das 17h é o único degrau novo, e ele
     existe porque a seção é literalmente o momento em que a casa liga o
     som — .15 seria dizer que nada mudou.

   Duas decisões dentro disso:

   1. O nível é ligado à SEÇÃO ATIVA, nunca ao progresso da rolagem. O
      observador que já decide o texto vertical, o menu e o relógio
      (sections.js) decide também o volume: ele muda uma vez por seção, no
      mesmo ponto em que o site troca de assinatura. Amarrado ao progresso,
      uma rolagem rápida faria o ganho subir e descer várias vezes por
      segundo — e um volume que pulsa é a coisa mais barata que um site
      pode fazer com áudio.

      Quem rola depressa e atravessa quatro seções em dois segundos não
      ouve quatro rampas: `setTargetAtTime` é uma perseguição exponencial e
      cada alvo novo redireciona a curva de onde ela está. O que se ouve é
      um movimento só, na direção da seção em que a pessoa parou.

   2. Nenhum nível é zero. O menor é .15, e ele é audível. Uma faixa que
      some no meio da visita não lê como intenção, lê como o arquivo tendo
      acabado — e o usuário vai ao controle conferir se quebrou. Silêncio
      total é um estado que só o botão pode produzir.

   ── Por que Web Audio e não .volume ─────────────────────────────────────

   Duas razões. A rampa de ganho do Web Audio corre no relógio do áudio e
   não no rAF, então ela não engasga quando a rolagem está pesada nem para
   quando a aba vai para segundo plano no meio de um fade. E o analisador
   sai de graça do mesmo grafo: os três filetes dentro do anel — e os sete
   de "A escuta" — passam a ser o espectro real da faixa em vez de uma
   animação que finge acompanhar uma música que ninguém está ouvindo.

   O grafo é: <audio> → ganho → destino, com o analisador pendurado no
   ganho. O AudioContext só é criado no primeiro toque, que é a regra dos
   navegadores e também a mais educada: quem nunca ligar o som não paga
   contexto de áudio nenhum. */

import { gsap, ScrollTrigger, reducedMotion, EASE } from './motion.js'

/* ↓↓↓ A ÚNICA LINHA A MUDAR PARA ENTREGAR O ÁUDIO ↓↓↓ */
const FAIXA = '/audio/ambar.mp3'

const CHAVE = 'ambar:som'

const ENTRADA = 1.5 // s: o som entrando quando alguém liga
const SAIDA = 1.0 // s: o som saindo quando alguém desliga
const NARRATIVA = 2.0 // s: a troca de nível entre duas seções

/* O piso, e ele é uma regra de projeto e não uma salvaguarda de código:
   ligado, o site nunca fica mudo. Uma seção que esquecesse de declarar
   data-som herdaria isto em vez de silêncio. */
const PISO = 0.15

const BANDAS = [3, 6, 11, 19, 32, 52, 84] // limites de bin do analisador

const botao = document.querySelector('#som-toggle')
const campos = [...document.querySelectorAll('[data-campo]')]

/* Onde o controle nasce. Era "A escuta" — a tela de tese —, que saiu do
   site; agora é o PRIMEIRO CAPÍTULO, e o gatilho passou a ser a chegada
   dele em vez de um evento publicado por outra seção. Ver a nota da
   entrada, no pé deste arquivo. */
const berco = document.querySelector('.chapter')

if (botao) {
  const linhas = campos.map((campo) => [...campo.querySelectorAll('.campo__linha i')])

  let ctx = null
  let ganho = null
  let analisador = null
  let dados = null
  let audio = null
  let quadro = null
  let ligado = false
  let temSinal = false

  /* ── O grafo ─────────────────────────────────────────

     Montado uma vez, no primeiro toque. Se qualquer parte falhar — sem Web
     Audio, sem arquivo, sem permissão — o controle continua funcionando
     como controle: o que se perde é o som, não a interface. */
  const montar = () => {
    // a guarda é o ELEMENTO, não o contexto: num navegador sem Web Audio o
    // contexto nunca existe, e guardar por ele faria cada toque criar um
    // <audio> novo — o site acumularia uma faixa por clique
    if (audio) return

    audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    audio.src = FAIXA

    const Contexto = window.AudioContext || window.webkitAudioContext

    if (Contexto) {
      try {
        ctx = new Contexto()
        ganho = ctx.createGain()
        ganho.gain.value = 0

        analisador = ctx.createAnalyser()
        analisador.fftSize = 256
        analisador.smoothingTimeConstant = 0.82
        dados = new Uint8Array(analisador.frequencyBinCount)

        ctx.createMediaElementSource(audio).connect(ganho)
        ganho.connect(analisador)
        ganho.connect(ctx.destination)
      } catch {
        ctx = null // o botão continua vivo; o som é que não existe
      }
    }

    /* O .volume do elemento só é tocado quando NÃO há Web Audio.

       Um MediaElementSource lê o elemento DEPOIS do volume dele: com
       volume 0, o que entra no grafo é silêncio, e a rampa de ganho passa a
       escalar silêncio. O som ficava mudo com o ganho subindo direitinho e
       o analisador lendo zero em todas as bandas — os filetes recebiam o
       piso, e o campo respondia à música com uma linha reta.

       Com grafo, quem faz o fade é o ganho e o elemento fica a cheio. Sem
       grafo, o elemento é o único controle que existe e precisa começar
       calado. */
    if (!ctx) audio.volume = 0
  }

  /* ── Os filetes ──────────────────────────────────────

     Uma banda por linha, em faixas de largura crescente: as graves ocupam
     poucos bins e as agudas muitos, que é como a audição divide o
     espectro. O valor é achatado por raiz para que as linhas não fiquem
     grudadas no chão nos trechos quietos — e o piso de 0.12 garante que
     nenhuma linha desapareça: o campo é um desenho, não um medidor. */
  const escrever = () => {
    quadro = requestAnimationFrame(escrever)
    if (!analisador || !temSinal) return

    analisador.getByteFrequencyData(dados)

    let de = 0
    for (let b = 0; b < BANDAS.length; b++) {
      const ate = BANDAS[b]
      let soma = 0
      for (let i = de; i < ate; i++) soma += dados[i]
      const media = soma / Math.max(1, ate - de) / 255
      de = ate

      const n = (0.12 + Math.sqrt(media) * 0.88).toFixed(3)
      for (const grupo of linhas) {
        // campos com menos linhas que bandas pegam as bandas de baixo
        grupo[b]?.style.setProperty('--n', n)
      }
    }
  }

  const soltar = () => {
    if (quadro) cancelAnimationFrame(quadro)
    quadro = null
    for (const grupo of linhas) {
      for (const linha of grupo) linha.style.removeProperty('--n')
    }
  }

  /* ── A rampa ─────────────────────────────────────────

     setTargetAtTime e não linearRamp: a constante de tempo dá uma subida
     que começa depressa e assenta devagar, que é como o volume de uma sala
     sobe. E ela é uma PERSEGUIÇÃO, não um agendamento — cada alvo novo
     redireciona a curva de onde ela está, sem estalo e sem fila. É o que
     faz uma rolagem rápida por quatro seções soar como um movimento só em
     vez de quatro rampas empilhadas.

     A constante é a duração dividida por três: a essa taxa o ganho chega a
     95% do alvo no tempo pedido, que é o que o ouvido lê como "chegou". */
  const rampa = (alvo, dur) => {
    if (ganho && ctx) {
      const agora = ctx.currentTime
      ganho.gain.cancelScheduledValues(agora)
      ganho.gain.setValueAtTime(ganho.gain.value, agora)
      ganho.gain.setTargetAtTime(alvo, agora, dur / 3)
      return
    }

    // sem Web Audio o fade volta para o rAF do GSAP sobre .volume: pior
    // (engasga com a rolagem, para em aba oculta), mas continua sendo um
    // fade — o requisito é não haver corte seco, e ele vale em toda parte
    if (audio) gsap.to(audio, { volume: alvo, duration: dur, ease: 'power2.out', overwrite: true })
  }

  /* ── O nível que a seção pede ────────────────────────

     A seção ativa é publicada por sections.js — o mesmo evento que move o
     relógio e troca a assinatura vertical. Aqui ele vira volume.

     O valor é guardado mesmo com o som desligado: se o usuário ligar no
     meio do Salão, o som entra JÁ no nível do Salão em vez de entrar no
     nível de abertura e subir depois. Ligar o som não pode ser um segundo
     acontecimento sonoro depois do primeiro. */
  let nivel = PISO

  document.addEventListener('secao:ativa', (evento) => {
    const pedido = Number(evento.detail.secao.dataset.som)
    nivel = Number.isFinite(pedido) && pedido > 0 ? Math.max(pedido, PISO) : PISO
    if (ligado) rampa(nivel, NARRATIVA)
  })

  /* ── A fala ──────────────────────────────────────────

     O controle não carrega um rótulo permanente: em repouso ele é só o
     losango. A palavra sai de trás dele em três momentos, e este é o
     segundo e o terceiro — ao nascer (3,2s, para dizer o nome) e depois de
     cada toque (2s, para dizer o estado novo). O primeiro é o ponteiro, e
     esse é CSS puro.

     Os 2s do toque existem pelo telefone: sem ponteiro, o único jeito de o
     estado ser DITO é ele se anunciar sozinho no instante em que muda. */
  let calaBoca = 0

  const dizer = (ms) => {
    botao.classList.add('is-dizendo')
    clearTimeout(calaBoca)
    calaBoca = setTimeout(() => botao.classList.remove('is-dizendo'), ms)
  }

  /* ── Alternar ────────────────────────────────────────── */

  const aplicar = (proximo, guardar = true) => {
    ligado = proximo

    botao.setAttribute('aria-pressed', String(ligado))
    botao.setAttribute('aria-label', ligado ? 'Desligar o som da casa' : 'Ligar o som da casa')
    for (const campo of campos) campo.classList.toggle('is-tocando', ligado)

    if (guardar) {
      try { sessionStorage.setItem(CHAVE, ligado ? '1' : '0') } catch { /* modo privado */ }
    }

    if (!ligado) {
      rampa(0, SAIDA)
      // o áudio só para depois da rampa: parar junto seria o corte seco que
      // a rampa existe para evitar
      setTimeout(() => { if (!ligado) audio?.pause() }, SAIDA * 1000 + 120)
      soltar()
      return
    }

    montar()
    ctx?.resume?.()

    audio?.play().then(() => {
      temSinal = true
      if (!quadro && !reducedMotion) escrever()
    }).catch(() => {
      // sem arquivo, ou bloqueado: o controle continua ligado e animando,
      // e os filetes voltam para a deriva própria deles
      temSinal = false
    })

    // entra no nível da seção em que o usuário está, não num teto fixo
    rampa(nivel, ENTRADA)
  }

  botao.addEventListener('click', () => {
    aplicar(!ligado)
    dizer(2000)
  })

  /* ── A entrada ───────────────────────────────────────

     ╔══════════════════════════════════════════════════════════════════╗
     ║ O CONTROLE MUDOU DE BERÇO                                        ║
     ║                                                                  ║
     ║ Ele acendia quando "A escuta" terminava de dizer a última frase,  ║
     ║ e ouvia um evento (`escuta:fecho`) publicado por aquela seção.    ║
     ║ A seção saiu do site.                                            ║
     ║                                                                  ║
     ║ Sem o gatilho, o ramo que sobrava era `acender()` na carga — o    ║
     ║ controle apareceria em cima da marca, na primeira tela, antes de  ║
     ║ existir qualquer razão para alguém querer ligar um som.          ║
     ║                                                                  ║
     ║ Agora ele nasce com o PRIMEIRO CAPÍTULO, e o lugar é melhor do    ║
     ║ que o anterior por uma razão de assunto: o capítulo 01 é a tela   ║
     ║ em que a cabine acende no jardim. O botão que liga o som da casa  ║
     ║ aparece no instante em que a casa liga o som dela.               ║
     ║                                                                  ║
     ║ E o mecanismo ficou mais barato: um ScrollTrigger local em vez    ║
     ║ de um evento entre dois arquivos. Nenhuma seção precisa mais      ║
     ║ saber que este controle existe.                                  ║
     ╚══════════════════════════════════════════════════════════════════╝

     Uma vez aceso, não sai mais — inclusive subindo de volta. A escolha
     guardada só é reaplicada depois disso: um som que volta a tocar antes
     de o controle estar na tela seria som sem origem visível. */
  if (!reducedMotion) gsap.set(botao, { y: 10 })

  const acender = () => {
    if (botao.classList.contains('is-visivel')) return
    botao.classList.add('is-visivel')

    // o losango sobe com o mesmo tempo das entradas de texto do site
    if (!reducedMotion) gsap.to(botao, { y: 0, duration: 0.9, ease: EASE })

    try {
      if (sessionStorage.getItem(CHAVE) === '1') aplicar(true, false)
    } catch { /* modo privado */ }

    // e diz o nome dele uma vez: a única aparição do rótulo que ninguém
    // pediu — a partir daqui a palavra só volta a pedido
    dizer(3200)
  }

  if (!berco || reducedMotion) acender()
  else {
    /* `top 55%`: o capítulo já tomou quase metade da tela e o título dele
       terminou de se escrever. Mais cedo e o botão chega junto com a
       fotografia, disputando a mesma entrada; mais tarde e ele aparece
       depois de a pessoa já ter decidido que o site é mudo. */
    ScrollTrigger.create({ trigger: berco, start: 'top 55%', once: true, onEnter: acender })
  }

  /* Em dev, o grafo à mão. O estado do áudio é invisível por natureza —
     sem faixa e com faixa produzem exatamente a mesma tela —, e sem isto a
     única forma de conferir se o analisador está recebendo sinal é ouvir. */
  if (import.meta.env.DEV) {
    window.__som = {
      estado: () => ({
        ligado,
        temSinal,
        nivel, // o que a seção atual pede
        ctx: ctx?.state ?? null,
        ganho: ganho?.gain.value ?? null,
        pronto: audio?.readyState ?? null,
        tempo: audio?.currentTime ?? null,
        erro: audio?.error?.code ?? null,
        src: audio?.currentSrc ?? null,
        pico: (() => {
          if (!analisador) return null
          analisador.getByteFrequencyData(dados)
          return Math.max(...dados)
        })()
      })
    }
  }
}
