/* Seção: .chapter (Jardim, Salão, Reservado) — a timeline de cada ambiente.

   Cada capítulo é uma tela pinada onde a noite avança de verdade: o relógio
   gigante conta a faixa de horário do ambiente (18h→20h, 20h→00h, 00h→03h), a
   imagem respira, o título entra letra a letra e o bloco se desfaz na saída.

   O curso de rolagem vem do data-run de cada seção, não de um valor único: o
   entardecer é o momento denso do site (300%) e os outros dois passam mais
   rápido (200% e 220%). É o que dá ritmo desigual à sequência — três capítulos
   com a mesma duração são o que faz uma peça parecer template.

   O capítulo 01 tem duas fotos do mesmo jardim, de dia e à noite, e uma demão
   de céu (.chapter__dusk) por cima: as duas coisas cruzando no miolo da
   timeline são o entardecer acontecendo, não um crossfade. */

import { gsap, reducedMotion, EASE, splitChars, splitLine, prioridadeRefresh } from './motion.js'

const NATURAL = { opacity: 1, y: 0, x: 0, scaleX: 1 }
const OVERLAP = 0.25 // fatia da janela compartilhada com a vizinha

/* "18—20" → conta de 18 a 20; "20—00" atravessa a meia-noite e conta
   20, 21, 22, 23, 00. O texto escrito no HTML é só o estado inicial. */
const lerRelogio = (attr) => {
  const partes = String(attr).match(/^\s*(\d{1,2})\s*[—–-]\s*(\d{1,2})\s*$/)
  if (!partes) return null

  const inicio = Number(partes[1])
  const alvo = Number(partes[2])
  const fim = alvo <= inicio ? alvo + 24 : alvo

  const pad = (n) => String(Math.floor(n) % 24).padStart(2, '0')

  return {
    inicio,
    fim,
    render: (v) => `${pad(v)}h`,
    estatico: `${pad(inicio)}h — ${pad(fim)}h`
  }
}

for (const chapter of document.querySelectorAll('.chapter')) {
  const stage = chapter.querySelector('.chapter__stage')
  const media = chapter.querySelector('.chapter__media')
  const imgs = [...chapter.querySelectorAll('.chapter__img')]
  const dusk = chapter.querySelector('.chapter__dusk')
  const clock = chapter.querySelector('.chapter__clock')
  const label = chapter.querySelector('.chapter__label')
  const title = chapter.querySelector('.chapter__title')
  const text = chapter.querySelector('.chapter__text')
  const losango = chapter.querySelector('.chapter__losango')
  const meta = chapter.querySelector('.chapter__meta')

  const { dash, text: labelText } = splitLine(label)
  const chars = splitChars(title)
  const relogio = clock ? lerRelogio(clock.dataset.clock) : null

  gsap.set(label, NATURAL)

  if (reducedMotion) {
    // estado final legível: a última foto do ambiente, o céu já caído e o
    // horário como faixa em vez de contagem
    gsap.set([dash, labelText, title, text, ...chars], NATURAL)
    gsap.set(imgs, { opacity: (i) => (i === imgs.length - 1 ? 1 : 0) })
    gsap.set(media, { scale: 1.05 })
    if (dusk) gsap.set(dusk, { opacity: 1 })

    // a faixa inteira tem três vezes a largura de um horário só: na escala do
    // relógio animado ela sairia da tela
    if (relogio) {
      clock.textContent = relogio.estatico
      clock.classList.add('chapter__clock--faixa')
    }
    continue
  }

  gsap.set(imgs, { opacity: (i) => (i === 0 ? 1 : 0) })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top top',
      end: `+=${Number(chapter.dataset.run) || 220}%`,
      pin: stage,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: prioridadeRefresh(chapter)
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

  /* ── A luz caindo: o céu ganha corpo no miolo ──────── */

  if (dusk) {
    tl.fromTo(dusk,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'none' }, 0.22)
  }

  /* ── Entrada do texto, em ordem ────────────────────── */

  tl.to(dash, { scaleX: 1, duration: 0.14, ease: EASE }, 0.05)
    .to(labelText, { ...NATURAL, duration: 0.16, ease: EASE }, 0.12)
    .to(losango, { opacity: 0.5, duration: 0.14, ease: EASE }, 0.05)
    .to(chars, { ...NATURAL, duration: 0.22, ease: EASE, stagger: 0.012 }, 0.24)
    .to(text, { ...NATURAL, duration: 0.24, ease: EASE }, 0.46)

  /* ── O relógio conta enquanto o capítulo corre ─────── */

  if (relogio) {
    const conta = { v: relogio.inicio }
    tl.to(conta, {
      v: relogio.fim,
      duration: 0.66,
      ease: 'none',
      onUpdate: () => { clock.textContent = relogio.render(conta.v) }
    }, 0.16)
  }

  /* ── Saída: cada peça por um lado ──────────────────── */

  tl.to(title, { xPercent: -12, opacity: 0, duration: 0.2, ease: EASE }, 0.82)
    .to(text, { xPercent: 12, opacity: 0, duration: 0.2, ease: EASE }, 0.84)
    .to(meta, { opacity: 0, duration: 0.16, ease: 'none' }, 0.82)
    .to(clock, { opacity: 0, duration: 0.16, ease: 'none' }, 0.86)
}
