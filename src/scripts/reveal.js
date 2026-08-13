/* Seção: entradas genéricas (.reveal) — hoje só as reservas.

   As seções coreografadas (hero, capítulos, pausas, escuta, fechamento)
   trazem [data-choreo] e são puladas aqui: quem anima o conteúdo delas é a
   timeline da própria seção. As variantes continuam existindo com os mesmos
   tempos — o que muda é quem dispara.

   O estado escondido continua morando no CSS, não aqui: se ele nascesse no JS
   haveria um quadro de conteúdo visível antes do script rodar. O GSAP só
   caminha desse estado até o natural. */

import {
  gsap, reducedMotion, EASE, splitChars, splitLine,
  DUR_TEXTO, STAGGER_CHAR
} from './motion.js'

const CHAR_STEP = STAGGER_CHAR
const DUR = DUR_TEXTO

const NATURAL = { opacity: 1, y: 0, scaleX: 1 }

const alvos = [...document.querySelectorAll('.reveal')].filter((el) => !el.closest('[data-choreo]'))

/* Cada variante devolve os pedaços a animar e em que instante cada um entra. */
const montarReveal = (el) => {
  if (el.classList.contains('reveal--chars')) {
    return [{ alvo: splitChars(el), dur: DUR, stagger: CHAR_STEP }]
  }

  if (el.classList.contains('reveal--line')) {
    const { dash, text } = splitLine(el)
    return [
      { alvo: dash, dur: DUR },
      { alvo: text, dur: DUR, em: 0.45 }
    ]
  }

  return [{ alvo: el, dur: DUR }]
}

/* Escreve o estado final direto, sem passar pela animação. */
const assentarReveal = (el, partes) => {
  for (const { alvo } of partes) gsap.set(alvo, NATURAL)
  gsap.set(el, NATURAL)
}

for (const el of alvos) {
  const partes = montarReveal(el)

  // nas variantes partidas quem esconde são os pedaços: o pai já pode aparecer
  if (el.dataset.split) gsap.set(el, NATURAL)

  if (reducedMotion) {
    assentarReveal(el, partes)
    continue
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    // o escalonamento que vivia no style inline de cada elemento
    delay: Number(el.dataset.delay || 0) / 1000
  })

  for (const { alvo, dur, stagger, em } of partes) {
    tl.to(alvo, { ...NATURAL, duration: dur, ease: EASE, stagger }, em || 0)
  }
}
