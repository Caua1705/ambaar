/* Cards de experiência: abrem revelando a imagem.
   Acima de 900px o CSS mantém tudo aberto e esconde o indicador. */

for (const card of document.querySelectorAll('.exp-card')) {
  const alternar = () => {
    const aberto = card.classList.toggle('is-open')
    card.setAttribute('aria-expanded', String(aberto))
  }

  card.addEventListener('click', alternar)

  card.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter' && evento.key !== ' ') return
    evento.preventDefault() // espaço rolaria a página
    alternar()
  })
}
