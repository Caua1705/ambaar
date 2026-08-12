/* Mídia sob demanda: os dois vídeos de textura.

   Juntos eles pesam mais que todas as imagens do site somadas, e nenhum dos
   dois aparece na primeira tela. Ficam com preload="none" e src vazio no HTML
   — o arquivo só é pedido quando o observador vê a seção chegando, uma tela
   antes de entrar em cena. Quem nunca rolar até lá não baixa nada.

   Fora da tela o vídeo é pausado: decodificar quadro a quadro um vídeo que
   ninguém está vendo é o tipo de custo que derruba o scroll no celular.

   Quem está dentro de um elemento fixo não pode observar a si mesmo: a caixa
   de uma cortina position:fixed cobre a tela desde o primeiro quadro e o
   observador a daria por visível na hora, baixando o arquivo no load. Esses
   vídeos apontam em data-observe a seção que de fato anuncia a chegada deles.

   Com movimento reduzido nenhum dos dois é carregado. O poster continua no
   atributo do elemento e é o que fica em cena — um quadro parado, que é
   exatamente o que essa preferência pede. */

import { reducedMotion } from './motion.js'

const videos = [...document.querySelectorAll('video[data-src]')]

if (videos.length && !reducedMotion) {
  const carregar = (video) => {
    if (video.dataset.loaded) return
    video.dataset.loaded = '1'
    video.src = video.dataset.src
    // muted + playsinline já estão no HTML: sem os dois o autoplay é recusado
    video.load()
  }

  const tocar = (video) => {
    // a promessa é rejeitada quando a aba perde o foco no meio do play;
    // não há o que fazer a respeito, e o erro não pode subir
    video.play?.().catch(() => {})
  }

  // cada sentinela devolve o vídeo que ela comanda
  const comandados = new Map()

  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const video = comandados.get(target)
        if (!video) continue

        if (isIntersecting) {
          carregar(video)
          tocar(video)
        } else if (video.dataset.loaded) {
          video.pause()
        }
      }
    },
    // uma tela inteira de antecedência: o arquivo chega antes de ser visto
    { rootMargin: '100% 0px 100% 0px', threshold: 0 }
  )

  for (const video of videos) {
    const sentinela = video.dataset.observe
      ? document.querySelector(video.dataset.observe)
      : video

    if (!sentinela) continue

    comandados.set(sentinela, video)
    observer.observe(sentinela)
  }

  // aba em segundo plano não precisa decodificar vídeo nenhum
  document.addEventListener('visibilitychange', () => {
    for (const video of videos) {
      if (!video.dataset.loaded) continue
      if (document.hidden) video.pause()
    }
  })
}
