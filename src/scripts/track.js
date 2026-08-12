/* Trilha de progresso: um ponto por capítulo, o ativo em âmbar. */

const track = document.querySelector('.track')
const dots = [...document.querySelectorAll('.track__dot')]
const chapters = [...document.querySelectorAll('.chapter')]

if (track && dots.length && chapters.length) {
  // a trilha só existe depois que a hero sai de cena
  const hero = document.querySelector('.hero')

  if (hero) {
    new IntersectionObserver(
      ([entry]) => track.classList.toggle('is-visible', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(hero)
  } else {
    track.classList.add('is-visible')
  }

  const marcar = (indice) => {
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === indice))
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        marcar(chapters.indexOf(entry.target))
      }
    },
    // a metade inferior da tela é a zona de decisão: independe da altura da seção
    { rootMargin: '-50% 0px 0px 0px', threshold: 0 }
  )

  for (const chapter of chapters) observer.observe(chapter)
}
