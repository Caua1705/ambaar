/* Seção: .gallery — a faixa horizontal de detalhes.

   A montagem (formatos e alturas desencontrados, uma foto sangrando o palco)
   está em gallery.css. Aqui mora o que quebra o 1:1:

   1. Cada quadro tem o seu multiplicador de deslocamento. A trilha continua
      sendo a base, mas dois quadros se adiantam e um fica para trás, então a
      distância entre as fotos muda enquanto a faixa corre — elas não chegam
      juntas. O desvio era de ±5%, imperceptível; agora vai a ±12%, que é o
      quanto o olho precisa para ler cadências diferentes sem que as fotos
      cheguem a colidir.

      O último quadro anda a 1 de propósito: é ele que define o fim do
      percurso, e adiantá-lo ou atrasá-lo deixaria uma folga na borda.

   2. Cada foto também anda dentro do próprio quadro, nos dois eixos, com
      amplitude própria. A foto é maior que a janela justamente para isso.

   Com movimento reduzido não há pin: a faixa vira uma tira de rolagem
   horizontal comum, alcançável no toque e no teclado. */

import { gsap, reducedMotion, prioridadeRefresh } from './motion.js'

const RITMO = [1.12, 0.9, 1.04, 1.08, 1]   // multiplicador de deslocamento
const DERIVA_Y = [8, -12, 5, -9, 7]        // % de deslocamento vertical da foto
const DERIVA_X = [-7, 9, -5, 8, -6]        // % de deslocamento horizontal da foto

const gallery = document.querySelector('.gallery')

if (gallery) {
  const stage = gallery.querySelector('.gallery__stage')
  const track = gallery.querySelector('.gallery__track')
  const items = [...gallery.querySelectorAll('.gallery__item')]
  const imgs = items.map((it) => it.querySelector('img'))

  if (reducedMotion) {
    gallery.classList.add('is-static')
  } else {
    // quanto falta percorrer para a última foto encostar na borda direita
    const percurso = () => Math.max(0, track.scrollWidth - stage.clientWidth)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: gallery,
        start: 'top top',
        // um quarto a mais de curso do que a faixa tem de largura: a trilha
        // anda mais devagar que o dedo, e é isso que dá peso às fotos em vez
        // de fazê-las deslizar como um menu
        end: () => '+=' + Math.round(percurso() * 1.25),
        pin: stage,
        scrub: 1,
        anticipatePin: 1,
        // largura de foto é vw: a medida muda a cada resize
        invalidateOnRefresh: true,
        refreshPriority: prioridadeRefresh(gallery)
      }
    })

    tl.to(track, { x: () => -percurso(), duration: 1, ease: 'none' }, 0)

    items.forEach((item, i) => {
      const ritmo = RITMO[i % RITMO.length]

      // o desvio é relativo à trilha: 0 no início, cresce até o fim do curso
      if (ritmo !== 1) {
        tl.fromTo(item,
          { x: 0 },
          { x: () => -percurso() * (ritmo - 1), duration: 1, ease: 'none' }, 0)
      }

      const ax = DERIVA_X[i % DERIVA_X.length]
      const ay = DERIVA_Y[i % DERIVA_Y.length]

      tl.fromTo(imgs[i],
        { xPercent: ax, yPercent: ay },
        { xPercent: -ax, yPercent: -ay, duration: 1, ease: 'none' }, 0)
    })
  }
}
