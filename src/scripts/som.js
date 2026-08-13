/* O som da casa.

   Um clube de escuta com um site mudo é uma contradição que qualquer pessoa
   do ramo nota. Este arquivo é o mecanismo inteiro, e ele foi escrito para
   funcionar ANTES de existir o arquivo de áudio: sem faixa, o controle
   aparece, acende, pulsa, alterna e guarda a escolha — só não produz som.

   ┌──────────────────────────────────────────────────────────────────────┐
   │ PARA ENTREGAR O ÁUDIO                                                │
   │                                                                      │
   │   1. ponha o arquivo em  public/audio/ambar.mp3                      │
   │                                                                      │
   │ Só isso. A constante FAIXA abaixo já aponta para lá. Se o nome for    │
   │ outro, troque a linha da constante — é a única linha a mudar.         │
   │                                                                      │
   │ Recomendação de material: um loop de 60 a 120s, organic house/        │
   │ downtempo, normalizado a −16 LUFS e com fade nas duas pontas para o   │
   │ laço não estalar. 128 kbps mono resolve; o áudio é ambiente, não é o  │
   │ acervo do clube.                                                     │
   └──────────────────────────────────────────────────────────────────────┘

   ── As regras ───────────────────────────────────────────────────────────

   · Desligado por padrão, sempre. Nunca toca sozinho — o navegador
     bloquearia, e mesmo que não bloqueasse seria hostil.
   · O ganho sobe e desce em rampa de 1s. Nenhum corte seco.
   · A escolha sobrevive à navegação dentro da sessão (sessionStorage, não
     localStorage: a preferência é desta visita, não uma configuração
     permanente que o usuário não sabe que deu).
   · Sem arquivo, tudo acima continua valendo, sem som.

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

import { gsap, reducedMotion, EASE } from './motion.js'

/* ↓↓↓ A ÚNICA LINHA A MUDAR PARA ENTREGAR O ÁUDIO ↓↓↓ */
const FAIXA = '/audio/ambar.mp3'

const CHAVE = 'ambar:som'
const RAMPA = 1.0 // s: a subida e a descida do ganho
const VOLUME = 0.55 // teto: som de sala, não de fone
const BANDAS = [3, 6, 11, 19, 32, 52, 84] // limites de bin do analisador

const botao = document.querySelector('#som-toggle')
const campos = [...document.querySelectorAll('[data-campo]')]
const escuta = document.querySelector('.escuta')

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
     sobe. O cancelAndHold evita o estalo quando o usuário alterna duas
     vezes seguidas — a rampa nova parte de onde a anterior estava. */
  const rampa = (alvo) => {
    if (ganho && ctx) {
      const agora = ctx.currentTime
      ganho.gain.cancelScheduledValues(agora)
      ganho.gain.setValueAtTime(ganho.gain.value, agora)
      ganho.gain.setTargetAtTime(alvo, agora, RAMPA / 3)
      return
    }

    // sem Web Audio o fade volta para o rAF do GSAP sobre .volume: pior
    // (engasga com a rolagem, para em aba oculta), mas continua sendo um
    // fade — o requisito é não haver corte seco, e ele vale em toda parte
    if (audio) gsap.to(audio, { volume: alvo, duration: RAMPA, ease: 'power2.out', overwrite: true })
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
      rampa(0)
      // o áudio só para depois da rampa: parar junto seria o corte seco que
      // a rampa existe para evitar
      setTimeout(() => { if (!ligado) audio?.pause() }, RAMPA * 1000 + 120)
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

    rampa(VOLUME)
  }

  botao.addEventListener('click', () => aplicar(!ligado))

  /* ── A entrada ───────────────────────────────────────

     O controle acende quando "A escuta" termina de dizer a última frase, e
     não sai mais — inclusive subindo de volta. A escolha guardada só é
     reaplicada depois disso: um som que volta a tocar antes de o controle
     estar na tela seria som sem origem visível. */
  if (!reducedMotion) gsap.set(botao, { y: 10 })

  const acender = () => {
    if (botao.classList.contains('is-visivel')) return
    botao.classList.add('is-visivel')

    // o anel sobe com o mesmo tempo das entradas de texto do site
    if (!reducedMotion) gsap.to(botao, { y: 0, duration: 0.9, ease: EASE })

    try {
      if (sessionStorage.getItem(CHAVE) === '1') aplicar(true, false)
    } catch { /* modo privado */ }
  }

  if (!escuta || reducedMotion) acender()
  else document.addEventListener('escuta:fecho', acender, { once: true })

  /* Em dev, o grafo à mão. O estado do áudio é invisível por natureza —
     sem faixa e com faixa produzem exatamente a mesma tela —, e sem isto a
     única forma de conferir se o analisador está recebendo sinal é ouvir. */
  if (import.meta.env.DEV) {
    window.__som = {
      estado: () => ({
        ligado,
        temSinal,
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
