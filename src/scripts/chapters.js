/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   Cada capítulo é uma tela pinada onde tudo acontece em ordem: a imagem entra
   com escala e um grau de meio de rotação, o número fantasma gira, o horário
   conta até fechar a faixa da noite, o título entra letra a letra e o texto
   por último. Na saída o bloco se desfaz em direções diferentes.

   Capítulo com mais de uma imagem (o Reservado) mantém a lógica de janelas:
   cada imagem tem sua fatia do progresso e as vizinhas se cruzam na borda. */

import { gsap, reducedMotion, EASE, splitChars, splitLine } from './motion.js'

const NATURAL = { opacity: 1, y: 0, x: 0, scaleX: 1 }
const OVERLAP = 0.25 // fatia da janela compartilhada com a vizinha

/* "17h — 20h" → conta o segundo número a partir do primeiro, preservando o
   separador escrito no HTML. No fim mostra exatamente o texto original. */
const lerHorario = (texto) => {
  const partes = texto.match(/^(\s*)(\d{1,2})h(.*?)(\d{1,2})h(\s*)$/)
  if (!partes) return null

  const [, antes, de, meio, ate, depois] = partes
  const inicio = Number(de)
  // atravessa a meia-noite: 20h → 00h conta 20, 21, 22, 23, 00
  const fim = Number(ate) < inicio ? Number(ate) + 24 : Number(ate)

  const pad = (n) => String(Math.floor(n) % 24).padStart(2, '0')
  return {
    inicio,
    fim,
    render: (v) => `${antes}${pad(inicio)}h${meio}${pad(v)}h${depois}`
  }
}

for (const chapter of document.querySelectorAll('.chapter')) {
  const stage = chapter.querySelector('.chapter__stage')
  const media = chapter.querySelector('.chapter__media')
  const imgs = [...chapter.querySelectorAll('.chapter__img')]
  const ghost = chapter.querySelector('.chapter__ghost')
  const label = chapter.querySelector('.chapter__label')
  const time = chapter.querySelector('.chapter__time')
  const title = chapter.querySelector('.chapter__title')
  const text = chapter.querySelector('.chapter__text')
  const losango = chapter.querySelector('.chapter__losango')

  const { dash, text: labelText } = splitLine(label)
  const chars = splitChars(title)
  const horario = time ? lerHorario(time.textContent) : null

  // o ::before de centralização saiu do CSS: em porcentagem o GSAP
  // reposiciona sozinho no resize, o translateX em pixel ficaria velho
  if (chapter.classList.contains('chapter--center')) gsap.set(ghost, { xPercent: -50 })

  gsap.set(label, NATURAL)

  if (reducedMotion) {
    gsap.set([dash, labelText, time, title, text, ...chars], NATURAL)
    gsap.set(imgs, { opacity: 1 })
    gsap.set(media, { scale: 1.05 })
    continue
  }

  gsap.set(imgs, { opacity: (i) => (i === 0 ? 1 : 0) })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top top',
      end: '+=220%',
      pin: stage,
      scrub: 1,
      anticipatePin: 1
    }
  })

  /* ── Fundo: a imagem respira o capítulo inteiro ────── */

  tl.fromTo(media,
    { scale: 1.25, rotate: 0.5 },
    { scale: 1.05, rotate: 0, duration: 1, ease: 'none' }, 0)

  // janelas de crossfade: cada imagem entra sobre a anterior
  if (imgs.length > 1) {
    const janela = 1 / imgs.length
    const cruzamento = OVERLAP * janela

    imgs.forEach((img, i) => {
      if (i === 0) return
      tl.to(img, { opacity: 1, duration: cruzamento, ease: 'none' }, i * janela - cruzamento / 2)
    })
  }

  /* ── Número fantasma: gira e ganha corpo ───────────── */

  tl.fromTo(ghost,
    { rotate: 0, opacity: 0.03 },
    { rotate: 14, opacity: 0.075, duration: 1, ease: 'none' }, 0)

  /* ── Entrada do texto, em ordem ────────────────────── */

  tl.to(dash, { scaleX: 1, duration: 0.14, ease: EASE }, 0.05)
    .to(labelText, { ...NATURAL, duration: 0.16, ease: EASE }, 0.12)
    .to(losango, { opacity: 0.5, duration: 0.14, ease: EASE }, 0.05)
    .to(time, { ...NATURAL, duration: 0.2, ease: EASE }, 0.14)
    .to(chars, { ...NATURAL, duration: 0.22, ease: EASE, stagger: 0.012 }, 0.24)
    .to(text, { ...NATURAL, duration: 0.24, ease: EASE }, 0.46)

  /* ── O horário conta enquanto o capítulo corre ─────── */

  if (horario) {
    const relogio = { v: horario.inicio }
    tl.to(relogio, {
      v: horario.fim,
      duration: 0.62,
      ease: 'none',
      onUpdate: () => { time.textContent = horario.render(relogio.v) }
    }, 0.18)
  }

  /* ── Saída: cada peça por um lado ──────────────────── */

  tl.to(title, { xPercent: -12, opacity: 0, duration: 0.2, ease: EASE }, 0.8)
    .to(text, { xPercent: 12, opacity: 0, duration: 0.2, ease: EASE }, 0.82)
    .to(chapter.querySelector('.chapter__meta'), { opacity: 0, duration: 0.16, ease: 'none' }, 0.8)
    .to(ghost, { scale: 1.35, opacity: 0, duration: 0.2, ease: EASE }, 0.8)
}
