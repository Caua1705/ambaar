/* Núcleo de movimento — não controla nenhuma seção sozinho.
   Publica o par Lenis + ScrollTrigger que todas as timelines usam, a leitura
   de prefers-reduced-motion e as duas utilidades de texto (partir em
   caracteres, montar o traço do rótulo) que antes moravam no reveal.

   Com movimento reduzido o Lenis nem chega a ser criado: a rolagem fica
   nativa e cada script desenha seu estado final sem pin nem scrub.

   ╔══════════════════════════════════════════════════════════════════════╗
   ║ AS TRÊS CLASSES DE MOVIMENTO                                         ║
   ║                                                                      ║
   ║ Esta é a regra que governa o site inteiro, e ela existe porque a     ║
   ║ passada anterior tinha só duas categorias na cabeça — "preso ao      ║
   ║ dedo" e "não preso ao dedo" — e na prática quase tudo caía na        ║
   ║ primeira. Uma página em que TODO movimento responde à rolagem é      ║
   ║ cansativa e, paradoxalmente, sem impacto: quando tudo obedece ao     ║
   ║ dedo, nada parece ter acontecido sozinho.                            ║
   ║                                                                      ║
   ║ 1. PRESO (scrub) — a posição da rolagem É um estado da cena, e o     ║
   ║    usuário controla o tempo. É caro em atenção e por isso é raro:    ║
   ║    três momentos no site, mais o fechamento do documento.            ║
   ║                                                                      ║
   ║       · o entardecer do Jardim (17h → 20h)                           ║
   ║       · o salão enchendo (20h → 23h)                                 ║
   ║       · o relógio da casa, dentro dos dois acima                     ║
   ║       · a resina do fecho — chegar ao fim do documento É fechar      ║
   ║                                                                      ║
   ║    Nada mais. Se um elemento não puder responder à pergunta "que     ║
   ║    ESTADO da cena esta posição de rolagem representa?", ele não      ║
   ║    pertence a esta classe.                                           ║
   ║                                                                      ║
   ║ 2. DISPARADO (`entrada`, `autonomo`) — a rolagem só dá a partida.    ║
   ║    A animação corre na velocidade dela e termina, mesmo que o dedo   ║
   ║    tenha parado. É onde mora quase todo o site: texto, entradas,     ║
   ║    saídas, aberturas de moldura, o engolir do poente.                ║
   ║                                                                      ║
   ║ 3. AMBIENTE (`laco`) — não pergunta nada a ninguém. Corre desde que  ║
   ║    esteja em cena e para quando sai. Vídeo em laço, o campo          ║
   ║    respirando, o pó do fecho, a sala do capítulo 02 depois de o      ║
   ║    dedo soltá-la.                                                    ║
   ║                                                                      ║
   ║ O teste que separa a 1 da 3: um vídeo que PARA no meio do movimento  ║
   ║ porque o usuário parou o polegar é um defeito, não uma pausa.        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import CustomEase from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

/* mesma curva do --ease do CSS: a assinatura do movimento não muda ao sair
   das transitions para o GSAP */
export const EASE = CustomEase.create('ambar', '0.16, 1, 0.3, 1')

/* Duração das entradas que não são presas ao scroll. Antes cada seção
   escolhia a sua (0.9, 1.0, 1.1, 1.15, 1.4, 1.8) e o site inteiro parecia
   ter sotaques diferentes de uma seção para outra. */
export const DUR_TEXTO = 0.9

/* Defasagem entre irmãos: um único passo para toda a página. */
export const STAGGER = 0.12
export const STAGGER_CHAR = 0.04

/* O caminho sem movimento é metade do comportamento do site e não pode
   depender de trocar a preferência do sistema para ser conferido: em dev,
   ?reduce=1 força o mesmo ramo. O import.meta.env.DEV é constante no build,
   então a condição inteira desaparece do bundle de produção. */
export const reducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  (import.meta.env.DEV && new URLSearchParams(location.search).has('reduce'))

export let lenis = null

if (!reducedMotion) {
  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 1,
    smoothWheel: true
  })

  // o ScrollTrigger precisa reavaliar a cada quadro do Lenis, não do scroll nativo
  lenis.on('scroll', ScrollTrigger.update)

  // um relógio só para os dois: o ticker do GSAP conduz o raf do Lenis
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // com o Lenis no comando, window.scrollTo do devtools é desfeito no quadro
  // seguinte: em dev ficam as três instâncias à mão para conferir posições,
  // listar os gatilhos com seus start/end e forçar quadros quando o rAF do
  // navegador está estrangulado (janela em segundo plano)
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __gsap: gsap, __ST: ScrollTrigger })

  // âncoras do menu: o scroll-behavior do CSS brigaria com o Lenis
  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href^="#"]')
    if (!link) return

    const alvo = document.querySelector(link.getAttribute('href'))
    if (!alvo) return

    evento.preventDefault()
    lenis.scrollTo(alvo, { offset: -72 })
  })
}

/* ── Ordem de recálculo ────────────────────────────────── */

/* O ScrollTrigger mede os gatilhos na ordem em que foram criados, não na
   ordem em que eles aparecem na página. Um pin criado antes de outro que
   está acima dele no documento mede a própria posição sem contar o
   espaçador que o de cima ainda vai inserir, e nasce deslocado exatamente
   pela altura desse espaçador.

   A passada anterior amarrou a prioridade à posição no documento, mas em
   valores NEGATIVOS: a primeira seção recebia 0 e as seguintes -1, -2, -3.
   Prioridade maior é recalculada antes — então todo gatilho SEM prioridade
   declarada, que é o padrão 0, passava a ser medido antes de qualquer pin
   abaixo da primeira seção. E um gatilho medido antes dos pins mede um
   documento que ainda não tem nenhum espaçador: seis telas mais curto que
   o real.

   Era por isso que, no site medido, as entradas de texto, as pausas, o
   fecho e as reservas nasciam com start/end de um documento de 8.880px
   dentro de um documento de 14.980px — o Salão acendia o relógio 1,7 tela
   antes de o Salão existir. O pin, esse, estava certo: ele tinha
   prioridade declarada.

   O conserto é inverter o sinal. Pin recebe prioridade POSITIVA decrescente
   por posição no documento (a primeira seção, a maior), e todo o resto fica
   no padrão 0. Assim o recálculo faz primeiro todos os pins, de cima para
   baixo — cada espaçador nasce depois dos que estão acima dele e antes dos
   que estão abaixo —, e só então mede tudo o que não pina, contra o
   documento já no tamanho final.

   Corolário: esta função é para PIN. Um gatilho que não pina não deve
   declarar prioridade nenhuma. */

const ordemDocumento = [...document.querySelectorAll('#app > *')]

export const prioridadeRefresh = (el) =>
  ordemDocumento.length - ordemDocumento.indexOf(el.closest('#app > *'))

/* ── Ciclo de vida do layout ───────────────────────────── */

/* Medidas de pin e de faixa horizontal dependem de imagem carregada e de
   largura de tela: sem recalcular, os gatilhos ficam presos ao layout antigo. */
export const refresh = () => ScrollTrigger.refresh()

let resizeTimer = null
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(refresh, 200)
}, { passive: true })

// as imagens já ocupam espaço reservado, mas as duas famílias chegam depois
// do primeiro quadro: quando trocam a fonte de sistema pela real, cada bloco
// de texto muda de altura e todas as seções abaixo escorregam junto
document.fonts?.ready.then(refresh)

window.addEventListener('load', refresh)

/* ── Entradas presas a um gatilho, nunca ao dedo ────────── */

/* A regra de leitura do site, e a razão de ele ter encolhido de 25 telas
   para 16: scrub só para movimento que É o efeito — o entardecer quadro a
   quadro, o relógio contando, a foto respirando. Casos em que a posição da
   rolagem corresponde de verdade a um estado.

   Texto nunca. Texto entra por gatilho, corre na velocidade dele e fica.
   Amarrado ao scrub, uma frase de duas linhas exigia cinco ou seis
   passadas de dedo para ser lida inteira, porque cada pixel de rolagem
   entregava um pedaço proporcional da animação. Agora uma passada entrega
   a frase inteira.

   `montar` recebe a timeline pausada e escreve o que quiser nela. O
   gatilho só dá o play — e, subindo de volta, rebobina, para que a seção
   possa ser lida duas vezes. */
export const entrada = (trigger, montar, { start = 'top 62%', uma = false } = {}) => {
  const tl = gsap.timeline({ paused: true })
  montar(tl)

  if (reducedMotion) {
    tl.progress(1)
    return tl
  }

  ScrollTrigger.create({
    trigger,
    start,
    once: uma,
    onEnter: () => tl.play(),
    onLeaveBack: uma ? undefined : () => tl.reverse()
  })

  return tl
}

/* Classe 2, variante sem volta. `entrada` rebobina ao subir, para que a
   seção possa ser lida duas vezes; há gestos que não podem rebobinar
   porque são uma PASSAGEM e não um estado — o poente engolindo o jardim,
   o corte do Salão. Um gesto de passagem tocado ao contrário vira um
   desfazer, e desfazer não é um movimento que exista na natureza da cena.

   Aqui a timeline toca uma vez por chegada e, subindo de volta, é
   REBOBINADA sem tocar (progress 0), pronta para acontecer de novo na
   próxima descida. */
export const autonomo = (trigger, montar, { start = 'top 62%', rearmar = true } = {}) => {
  const tl = gsap.timeline({ paused: true })
  montar(tl)

  if (reducedMotion) {
    tl.progress(1)
    return tl
  }

  ScrollTrigger.create({
    trigger,
    start,
    onEnter: () => tl.play(),
    onLeaveBack: rearmar ? () => tl.pause(0) : undefined
  })

  return tl
}

/* ── Classe 3: o motor ambiente ────────────────────────── */

/* Um único rAF para todos os laços do site, e ele existe por três razões
   que um `requestAnimationFrame` solto por seção não daria:

   1. Um relógio só. Cinco laços independentes são cinco callbacks por
      quadro e cinco leituras de `performance.now()` que podem divergir.

   2. Pausa por visibilidade. Um laço fora de cena não desenha nada e
      continua acordando o telefone. Aqui cada laço declara o elemento a que
      pertence e é observado: fora da tela, ele simplesmente não é chamado —
      e quando NENHUM está em cena, o rAF é desligado inteiro.

   3. E a razão de projeto: o fecho precisa PARAR o site.

      A página é sobre o tempo passando; o âmbar é sobre o tempo parado. No
      último pixel do documento tudo o que se move sozinho — o pó, o campo,
      o grão — para no mesmo quadro. Isso só é possível se houver um lugar
      onde "tudo o que se move sozinho" seja uma lista. É esta.

   O passo recebe o delta em segundos, limitado a 1/20s: voltando de uma aba
   em segundo plano o delta seria de vários segundos e todo laço daria um
   salto — que é justamente o tipo de tranco que o site não pode ter. */

const laços = new Set()
let quadroAmbiente = null
let congelado = false

const observadorAmbiente = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const laço = [...laços].find((l) => l.el === entry.target)
      if (laço) laço.visivel = entry.isIntersecting
    }
    bombear()
  }, { rootMargin: '10% 0px' })
  : null

let anterior = 0

const correr = (agora) => {
  const dt = Math.min((agora - anterior) / 1000, 0.05)
  anterior = agora

  let vivos = 0
  for (const laço of laços) {
    if (!laço.visivel) continue
    vivos++
    if (!congelado) laço.passo(dt)
  }

  quadroAmbiente = vivos ? requestAnimationFrame(correr) : null
}

function bombear () {
  if (quadroAmbiente || document.hidden) return
  if (![...laços].some((l) => l.visivel)) return
  anterior = performance.now()
  quadroAmbiente = requestAnimationFrame(correr)
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (quadroAmbiente) cancelAnimationFrame(quadroAmbiente)
    quadroAmbiente = null
  } else bombear()
})

/* Devolve um cabo: `.parar()` para tirar o laço da lista de vez (o Salão
   usa para devolver o canvas ao dedo quando o usuário sobe de volta). */
export const laco = (el, passo) => {
  if (reducedMotion) return { parar: () => {} }

  /* Nasce VISÍVEL, e o observador só serve para desligar.

     O contrário — nascer parado e esperar o observador dizer que apareceu —
     tem duas falhas, e as duas são silenciosas:

       · num navegador sem IntersectionObserver não existe quem ligue, e o
         laço fica morto para sempre sem erro nenhum;
       · o observador entrega a primeira leitura de forma assíncrona, então
         um laço criado com o elemento JÁ em cena perde o primeiro punhado
         de quadros — e o do fecho, que é o objeto cuja parada é o assunto
         da última tela, é justamente um que pode nascer em cena.

     Ligado por padrão, o pior caso é um elemento fora da tela animando por
     um quadro até a primeira leitura chegar. */
  const laço = { el, passo, visivel: true }
  laços.add(laço)
  observadorAmbiente?.observe(el)
  bombear()

  return {
    parar: () => {
      laços.delete(laço)
      observadorAmbiente?.unobserve(el)
    }
  }
}

/* O interruptor do fecho. Não remove nada da lista: os laços continuam
   inscritos e voltam a andar se o usuário rolar para cima — o tempo não
   acabou, ele está guardado. */
export const congelarAmbiente = (v) => {
  congelado = v
  if (!v) bombear()
}

/* ── Utilidades de texto ───────────────────────────────── */

/* Parte o texto em caracteres. O rótulo original vira aria-label: sem isso
   o leitor de tela soletraria a palavra letra a letra.

   Cada caractere é um inline-block, e o navegador aceita quebrar a linha
   entre dois inline-blocks vizinhos mesmo sem espaço entre eles — era assim
   que "Sunset Session" virava "Sunset S / ession". Por isso os caracteres são
   agrupados por palavra: a quebra volta a acontecer só onde há espaço.

   Três coisas que a versão anterior não fazia, e que a tornavam frágil
   justamente por reconstruir DOM em tempo de carga:

   1. Chamada duas vezes no mesmo elemento, ela devolvia lista vazia. Quem
      recebia a lista vazia animava nada — e o estado escondido dos
      caracteres mora no CSS, então o título simplesmente não aparecia
      mais. Agora a segunda chamada devolve os caracteres que já existem.

   2. Ela lia textContent, o que achatava qualquer marcação de dentro. Um
      <br> no meio de um título virava um espaço e a quebra de linha
      desenhada some. Agora os nós são percorridos: texto é partido,
      elemento é preservado onde está.

   3. Ela anexava um span por vez no elemento vivo. Agora o conteúdo é
      montado fora da árvore e entra de uma vez.

   E os caracteres são separados por grafema, não por ponto de código: em
   texto normalizado em NFD o "Â" de ÂMBAR são dois pontos de código, e
   partir entre eles põe o acento numa caixa própria, deslocado da letra. */
const grafemas = (texto) => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('pt-BR', { granularity: 'grapheme' })
    return [...seg.segment(texto)].map((s) => s.segment)
  }
  return [...texto]
}

export const splitChars = (el) => {
  if (!el) return []
  if (el.dataset.split === 'chars') return [...el.querySelectorAll('.char')]

  const rotulo = el.textContent.replace(/\s+/g, ' ').trim()
  if (!rotulo) return []

  const chars = []
  const saida = document.createDocumentFragment()

  const partir = (texto) => {
    for (const pedaco of texto.split(/(\s+)/)) {
      if (!pedaco) continue

      // o espaço entre palavras fica como nó de texto solto: é ele que
      // continua sendo o único ponto de quebra da linha
      if (/^\s+$/.test(pedaco)) {
        saida.append(document.createTextNode(' '))
        continue
      }

      const palavra = document.createElement('span')
      palavra.className = 'word'

      for (const grafema of grafemas(pedaco)) {
        const span = document.createElement('span')
        span.className = 'char'
        span.textContent = grafema
        palavra.append(span)
        chars.push(span)
      }

      saida.append(palavra)
    }
  }

  for (const no of [...el.childNodes]) {
    if (no.nodeType === Node.TEXT_NODE) partir(no.nodeValue)
    else saida.append(no) // <br> e afins atravessam inteiros
  }

  el.setAttribute('aria-label', rotulo)
  el.replaceChildren(saida)
  el.dataset.split = 'chars'

  return chars
}

/* Monta o rótulo com traço: o traço cresce e só então entrega o texto.
   Era um ::before em CSS — virou elemento para o GSAP poder animá-lo. */
export const splitLine = (el) => {
  if (!el || el.dataset.split === 'line') {
    return { dash: el?.querySelector('.reveal__dash'), text: el?.querySelector('.reveal__text') }
  }

  const dash = document.createElement('span')
  dash.className = 'reveal__dash'

  const text = document.createElement('span')
  text.className = 'reveal__text'
  text.append(...el.childNodes)

  el.append(dash, text)
  el.dataset.split = 'line'

  return { dash, text }
}

export { gsap, ScrollTrigger }
