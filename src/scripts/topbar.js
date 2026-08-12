/* Cabeçalho fixo: entra quando a hero sai de cena.
   Mesmo gatilho da trilha de progresso — se um mudar, o outro deve acompanhar. */

const topbar = document.querySelector('.topbar')
const hero = document.querySelector('.hero')

if (topbar && hero) {
  new IntersectionObserver(
    ([entry]) => topbar.classList.toggle('is-visible', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(hero)
}
