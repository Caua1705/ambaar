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

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
  // seguinte: em dev fica a instância à mão para conferir posições
  if (import.meta.env.DEV) window.__lenis = lenis

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

/* ── Ciclo de vida do layout ───────────────────────────── */

/* Medidas de pin e de faixa horizontal dependem de imagem carregada e de
   largura de tela: sem recalcular, os gatilhos ficam presos ao layout antigo. */
export const refresh = () => ScrollTrigger.refresh()

let resizeTimer = null
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(refresh, 200)
}, { passive: true })

window.addEventListener('load', refresh)

/* ── Utilidades de texto ───────────────────────────────── */

/* Parte o texto em caracteres. O rótulo original vira aria-label: sem isso
   o leitor de tela soletraria a palavra letra a letra. */
export const splitChars = (el) => {
  if (!el || el.dataset.split === 'chars') return []

  const texto = el.textContent
  el.setAttribute('aria-label', texto)
  el.textContent = ''
  el.dataset.split = 'chars'

  return [...texto].map((caractere) => {
    const span = document.createElement('span')
    span.className = 'char'
    span.textContent = caractere === ' ' ? ' ' : caractere
    el.append(span)
    return span
  })
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
