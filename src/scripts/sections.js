/* Um único observador decide qual seção manda na tela — a que cruza a faixa
   central — e dela saem as quatro âncoras fixas: a trilha de progresso, o
   texto vertical da lateral, o item ativo do menu e o brilho do losango.

   A faixa é estreita de propósito: seções têm 100svh ou mais, então na prática
   só uma a cruza por vez, e a troca acontece no mesmo ponto subindo e descendo. */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const vrail = document.querySelector('.vrail')
const brandmark = document.querySelector('.brandmark')
const track = document.querySelector('.track')
const dots = [...document.querySelectorAll('.track__dot')]
const links = [...document.querySelectorAll('.topbar__link')]

const sections = [...document.querySelectorAll('#app > section, #app > footer')]
const chapters = sections.filter((secao) => secao.classList.contains('chapter'))

/* ── Texto vertical ────────────────────────────────────── */

const SWAP = 400 // ms: precisa bater com a transição de opacidade do .vrail

let swapTimer = null

const trocarVrail = (texto) => {
  if (!vrail || vrail.textContent === texto) return

  if (reducedMotion.matches) {
    vrail.textContent = texto
    return
  }

  // apaga, troca fora de vista, acende de novo
  vrail.classList.add('is-swapping')
  clearTimeout(swapTimer)
  swapTimer = setTimeout(() => {
    vrail.textContent = texto
    vrail.classList.remove('is-swapping')
  }, SWAP)
}

/* ── Aplicação ─────────────────────────────────────────── */

let atual = null

const aplicar = (secao) => {
  if (!secao || secao === atual) return
  atual = secao

  // seções sem rótulo próprio (manifesto, interlúdio) herdam o texto anterior
  if (secao.dataset.vrail) trocarVrail(secao.dataset.vrail)

  const indice = chapters.indexOf(secao)
  if (track) track.classList.toggle('is-visible', indice !== -1)
  if (indice !== -1) {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === indice))
  }

  const nav = secao.dataset.nav
  for (const link of links) {
    link.classList.toggle('is-active', Boolean(nav) && link.dataset.nav === nav)
  }

  // fundo liso: sem foto competindo, o losango pode aparecer mais
  if (brandmark) brandmark.classList.toggle('is-lit', secao.hasAttribute('data-flat'))
}

/* ── Observação ────────────────────────────────────────── */

if (sections.length) {
  const visiveis = new Set()

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visiveis.add(entry.target)
        else visiveis.delete(entry.target)
      }

      // na emenda entre duas seções a faixa pega as duas por alguns pixels;
      // a de baixo é a que está chegando na descida, e na subida a de cima
      // sai da faixa logo em seguida e corrige sozinha
      aplicar(sections.filter((secao) => visiveis.has(secao)).pop())
    },
    { rootMargin: '-48% 0px -48% 0px', threshold: 0 }
  )

  for (const secao of sections) observer.observe(secao)
}
