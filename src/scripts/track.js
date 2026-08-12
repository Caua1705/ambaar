/* Trilha de progresso: um ponto por capítulo, o ativo em âmbar.
   A trilha só existe enquanto algum capítulo ocupa a zona de decisão —
   fora deles (manifesto, experiências, reservas, fechamento) ela recolhe. */

const track = document.querySelector('.track')
const dots = [...document.querySelectorAll('.track__dot')]
const chapters = [...document.querySelectorAll('.chapter')]

if (track && dots.length && chapters.length) {
  const ativos = new Set()

  const marcar = (indice) => {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === indice))
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          ativos.add(entry.target)
          // o ponto só muda na entrada: assim o anterior fica aceso
          // durante a transição, em vez de piscar apagado
          marcar(chapters.indexOf(entry.target))
        } else {
          ativos.delete(entry.target)
        }
      }

      track.classList.toggle('is-visible', ativos.size > 0)
    },
    // a metade inferior da tela é a zona de decisão: independe da altura da seção
    { rootMargin: '-50% 0px 0px 0px', threshold: 0 }
  )

  for (const chapter of chapters) observer.observe(chapter)
}
