/* Seção: .gallery — a faixa horizontal de detalhes.

   Era a seção mais genérica do site: a trilha inteira andava 1:1 com a
   rolagem, todas as fotos rígidas dentro dela, e o resultado lia como um
   carrossel. Três coisas quebram isso agora:

   1. Cada quadro tem o seu multiplicador de deslocamento. A trilha continua
      sendo a base, mas um quadro fica para trás e outro se adianta, então a
      distância entre as fotos muda enquanto a faixa corre — elas não chegam
      juntas. O desvio é pequeno de propósito (±5%): o suficiente para o olho
      perceber que não é um bloco, pequeno demais para as fotos colidirem.

   2. Cada foto também anda dentro do próprio quadro, nos dois eixos, com
      amplitude própria. A foto é maior que a janela justamente para isso.

   3. Uma das três sangra o palco inteiro em altura, contra as 62svh das
      outras. É ela que impede a faixa de ter um pulso regular.

   Com movimento reduzido não há pin: a faixa vira uma tira de rolagem
   horizontal comum, alcançável no toque e no teclado. */

import { gsap, reducedMotion, prioridadeRefresh } from './motion.js'

const RITMO = [1, 0.95, 1.06]     // multiplicador de deslocamento por quadro
const DERIVA_Y = [7, -11, 5]      // % de deslocamento vertical da foto
const DERIVA_X = [-6, 9, -7]      // % de deslocamento horizontal da foto

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
        end: () => '+=' + percurso(),
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
