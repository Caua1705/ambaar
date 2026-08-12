/* Seção: .gallery — a faixa horizontal que substitui o crossfade de detalhes.

   As cinco fotos que antes se sobrepunham no capítulo 02 agora andam de lado
   enquanto a página rola. O deslocamento é 1:1 com a rolagem: cada pixel de
   scroll é um pixel de faixa, então a mão e a imagem andam juntas.

   Cada foto tem uma amplitude vertical própria dentro do seu quadro — sem
   isso a faixa se lê como um bloco rígido deslizando.

   Com movimento reduzido não há pin: a faixa vira uma tira de rolagem
   horizontal comum, que continua alcançável no toque e no teclado. */

import { gsap, reducedMotion } from './motion.js'

const AMPLITUDES = [7, -11, 5, -9, 8] // % de deslocamento vertical por foto

const gallery = document.querySelector('.gallery')

if (gallery) {
  const stage = gallery.querySelector('.gallery__stage')
  const track = gallery.querySelector('.gallery__track')
  const imgs = [...gallery.querySelectorAll('.gallery__item img')]

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
        invalidateOnRefresh: true
      }
    })

    tl.to(track, { x: () => -percurso(), duration: 1, ease: 'none' }, 0)

    imgs.forEach((img, i) => {
      const amplitude = AMPLITUDES[i % AMPLITUDES.length]
      tl.fromTo(img,
        { yPercent: amplitude },
        { yPercent: -amplitude, duration: 1, ease: 'none' }, 0)
    })
  }
}
