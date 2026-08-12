/* Núcleo de movimento — não controla nenhuma seção sozinho.
   Publica o par Lenis + ScrollTrigger que todas as timelines usam, a leitura
   de prefers-reduced-motion e as duas utilidades de texto (partir em
   caracteres, montar o traço do rótulo) que antes moravam no reveal.

   Com movimento reduzido o Lenis nem chega a ser criado: a rolagem fica
   nativa e cada script desenha seu estado final sem pin nem scrub. */

import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import CustomEase from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

/* mesma curva do --ease do CSS: a assinatura do movimento não muda ao sair
   das transitions para o GSAP */
export const EASE = CustomEase.create('ambar', '0.16, 1, 0.3, 1')

/* A varredura das cortinas é o único movimento do site que não é entrada de
   conteúdo: é um painel mecânico atravessando a tela, e pede aceleração
   simétrica em vez da curva de assentamento. As duas emendas usam este par. */
export const EASE_VARRE_ENTRA = 'power2.in'
export const EASE_VARRE_SAI = 'power2.out'

/* Durações das entradas que não são presas ao scroll. Antes cada seção
   escolhia a sua (0.9, 1.0, 1.1, 1.15, 1.4, 1.8) e o site inteiro parecia
   ter sotaques diferentes de uma seção para outra. São só duas: texto entra
   em DUR_TEXTO, traço cresce em DUR_TRACO — o traço é mais lento de
   propósito, porque ele é o gesto que anuncia o texto. */
export const DUR_TEXTO = 0.9
export const DUR_TRACO = 1.4

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

   Era o caso do Reservado: os três capítulos nascem juntos em chapters.js,
   que roda antes de gallery.js, mas o Reservado vem depois da galeria na
   página — e começava 1515px acima do lugar, que é justamente o curso da
   faixa horizontal. A cortina de fumaça, medida corretamente, varria a tela
   com o capítulo já pinado.

   Amarrar a prioridade à posição no documento faz o recálculo seguir a
   página em vez da ordem dos imports. Prioridade maior é recalculada antes,
   então a primeira seção recebe 0 e as seguintes ficam negativas. */

const ordemDocumento = [...document.querySelectorAll('#app > *')]

export const prioridadeRefresh = (el) => -ordemDocumento.indexOf(el.closest('#app > *'))

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

/* ── Utilidades de texto ───────────────────────────────── */

/* Parte o texto em caracteres. O rótulo original vira aria-label: sem isso
   o leitor de tela soletraria a palavra letra a letra.

   Cada caractere é um inline-block, e o navegador aceita quebrar a linha
   entre dois inline-blocks vizinhos mesmo sem espaço entre eles — era assim
   que "Sunset Session" virava "Sunset S / ession". Por isso os caracteres são
   agrupados por palavra: a quebra volta a acontecer só onde há espaço. */
export const splitChars = (el) => {
  if (!el || el.dataset.split === 'chars') return []

  const texto = el.textContent
  el.setAttribute('aria-label', texto)
  el.textContent = ''
  el.dataset.split = 'chars'

  const chars = []

  texto.split(/(\s+)/).forEach((pedaco) => {
    if (!pedaco) return

    // o espaço entre palavras fica como nó de texto solto: é ele que
    // continua sendo o único ponto de quebra da linha
    if (/^\s+$/.test(pedaco)) {
      el.append(document.createTextNode(' '))
      return
    }

    const palavra = document.createElement('span')
    palavra.className = 'word'

    for (const caractere of pedaco) {
      const span = document.createElement('span')
      span.className = 'char'
      span.textContent = caractere
      palavra.append(span)
      chars.push(span)
    }

    el.append(palavra)
  })

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
