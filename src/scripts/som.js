/* O som da casa.

   Um clube de escuta com um site mudo é uma contradição que qualquer pessoa
   do ramo nota. Este arquivo é o mecanismo inteiro, e ele foi escrito para
   funcionar ANTES de existir o arquivo de áudio: durante nove passadas o
   controle apareceu, acendeu, pulsou, alternou e guardou a escolha sem que
   nada saísse do alto-falante.

   ┌──────────────────────────────────────────────────────────────────────┐
   │ O ÁUDIO CHEGOU — e nenhuma linha daqui mudou por causa dele          │
   │                                                                      │
   │   public/audio/ambar.mp3   2,1 MB   180s   mono   96 kbps   −16 LUFS │
   │                                                                      │
   │ Ele é assado por `npm run audio` (scripts/audio.mjs) a partir do      │
   │ .wav em brand/originais/, com fade nas duas pontas para o laço não    │
   │ estalar. A constante FAIXA abaixo já apontava para esse caminho desde │
   │ o primeiro dia, e continuou apontando: a entrega foi um arquivo       │
   │ aparecer onde o código já olhava.                                     │
   │                                                                      │
   │ Se a faixa for trocada, troque o .wav de origem — não este arquivo.   │
   │ Todo tratamento de som é ASSADO no mp3, como toda correção de         │
   │ exposição é assada nas fotos. Aqui só moram os níveis narrativos.     │
   │                                                                      │
   │ O QUE O NAVEGADOR BAIXA, E QUANDO. Nada no carregamento da página.    │
   │ O elemento <audio> só é construído no primeiro toque do botão         │
   │ (`montar`), e nasce com `preload = 'none'` — as duas coisas, e não    │
   │ uma delas: o elemento não existe antes do clique, e se existisse não  │
   │ buscaria nada sem um `play()`. Quem nunca ligar o som não paga os     │
   │ 2,1 MB nem o AudioContext.                                           │
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
    /* `none` e não `auto`, e a diferença é real mesmo aqui dentro.

       Este bloco só roda no primeiro toque, então nenhum dos dois valores
       custaria nada no carregamento da página. Mas `montar()` também é
       chamado pelo caminho da preferência guardada (`acender`), e ali o
       elemento nasce e o `play()` pode não vir — se o navegador recusar o
       toque, `auto` teria começado a baixar 2,1 MB para uma faixa que
       ninguém vai ouvir.

       Com `none`, o download é o `play()` e nada mais. É a mesma disciplina
       das fotos com `loading="lazy"`: nada entra na rede antes de a tela
       precisar dele. */
    audio.preload = 'none'
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

  /* ── A FALA SAIU ─────────────────────────────────────

     Havia aqui um `dizer(ms)` que acendia a classe `is-dizendo` por um
     tempo: era ela que fazia o rótulo — "Ouvir a casa" / "Pausar" — sair
     de trás do disco ao nascer (3,2s), depois de cada toque (2s) e na
     chamada do capítulo 02, junto com a resina que escurecia a fotografia
     atrás da palavra.

     A palavra e a resina saíram (o argumento inteiro está em som.css), e o
     mecanismo saiu com elas: uma classe que nenhuma folha lê é código que
     roda para não fazer nada. O que o botão diz agora ele diz por forma —
     o glifo para a ação, o pulso do anel para o estado — e por
     `aria-label`, que é onde a frase sempre foi útil. */

  /* ── Alternar ────────────────────────────────────────── */

  const aplicar = (proximo, guardar = true) => {
    ligado = proximo

    botao.setAttribute('aria-pressed', String(ligado))
    // o rótulo diz a AÇÃO, não o estado: é o que o leitor de tela anuncia e
    // é a mesma palavra que está escrita ao lado do disco
    botao.setAttribute('aria-label', ligado ? 'Pausar a trilha da casa' : 'Ouvir a trilha da casa')
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

  botao.addEventListener('click', () => aplicar(!ligado))

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
  }

  /* ── E ele chama uma vez no Salão ────────────────────

     A alternativa em cima da mesa era o controle VIVER numa seção só, em
     vez de ser permanente. Ela não passa: o som continua tocando depois de
     a seção sair, e um controle que produz um efeito duradouro não pode
     desaparecer — quem ligasse teria de rolar de volta para calar. O
     argumento inteiro está em som.css.

     O que a ideia tinha de bom é o CONTEXTO, e isso dá para ficar com. A
     chamada morava na cabine das 20h — a tela cujo assunto era alguém
     escolhendo o que vai tocar —, e essa seção saiu do site (a nota está
     em index.html, onde ela ficava). O endereço novo é o CAPÍTULO 02, e
     ele não é um consolo: o Salão é o pico de volume da página (.70) e é
     onde está escrito, em tipo grande, "Não é o volume. É o que está
     tocando." Oferecer o som embaixo dessa frase é a única colocação do
     site em que "quer ouvir a casa?" não é uma interrupção — é a legenda
     do que está na tela.

     Longe do berço, também: o botão nasce no capítulo 01 e o 02 começa
     quase três telas depois. Duas falas do mesmo controle não se
     atropelam.

     Ele repete os dois anéis, uma só vez, e só se o som ainda estiver
     desligado — chamar quem já ligou é pedir uma coisa que a pessoa já fez.

     `once` no gatilho e não um sinalizador: subir de volta não recomeça a
     chamada. Duas insistências não são um convite. */
  const chamado = document.querySelector('#cap-salao')

  if (chamado && !reducedMotion) {
    ScrollTrigger.create({
      trigger: chamado,
      /* `top 30%` e não os 55% que a cabine usava: lá o convite podia
         chegar junto com a seção, porque a seção INTEIRA era o argumento.
         Aqui o argumento é uma frase, e ela só termina de se escrever
         depois do gatilho de texto do capítulo (`top 40%`, chapters.js).
         Chamar antes dela seria pedir o som em cima de uma tela ainda
         preta. */
      start: 'top 30%',
      once: true,
      onEnter: () => {
        if (ligado || !botao.classList.contains('is-visivel')) return
        botao.classList.add('is-chamando')
        // 2 voltas de 2,4s: a classe sai quando a animação acaba, para não
        // ficar um estado pendurado no elemento pelo resto da visita
        setTimeout(() => botao.classList.remove('is-chamando'), 4900)
      }
    })
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
      /* Salta no tempo da faixa, e existe para uma prova só: a EMENDA DO
         LAÇO. O arquivo tem 180s; conferir a volta esperando por ela custa
         três minutos por tentativa, e ninguém confere o que custa isso.
         Com `__som.saltar(176)` a volta acontece em quatro segundos.

         Só em dev, como todo este bloco: o elemento <audio> nunca esteve
         no DOM (nasce de `new Audio()` e vive fechado no módulo), então
         esta é a única porta que existe para ele. */
      saltar: (t) => {
        if (audio) audio.currentTime = t
        return audio?.currentTime ?? null
      },
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
