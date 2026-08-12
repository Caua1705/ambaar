/* Seção: .manifesto — a passagem entre a hero e o capítulo 01.

   A fumaça cobre a tela, se dissipa enquanto o texto entra e devolve o
   escuro. Ela não entrega mais o jardim por baixo: essa foto era a mesma com
   que o capítulo 01 abre, e vê-la aqui gastava a imagem antes de o capítulo
   poder usá-la. O manifesto é passagem, não prévia — e o primeiro
   ambiente do site passa a estrear onde ele é assunto.

   O "blur decrescente" vem de duas cópias da fumaça, uma borrada e uma
   nítida, trocando de opacidade. Animar filter: blur() em imagem de tela
   cheia custa repintura a cada quadro; a troca custa só composição. */

import { gsap, reducedMotion, EASE, prioridadeRefresh } from './motion.js'

const manifesto = document.querySelector('.manifesto')

if (manifesto) {
  const stage = manifesto.querySelector('.manifesto__stage')
  const soft = manifesto.querySelector('.manifesto__smoke--soft')
  const sharp = manifesto.querySelector('.manifesto__smoke--sharp')
  const linhas = [...manifesto.querySelectorAll('.manifesto__line, .manifesto__sign')]

  if (reducedMotion) {
    // sem pin: uma tela só, fumaça parada e texto legível por cima
    gsap.set(soft, { opacity: 0 })
    gsap.set(sharp, { opacity: 0.5, scale: 1.1 })
    gsap.set(linhas, { opacity: 1, y: 0 })
  } else {
    gsap.set(linhas, { opacity: 0, y: 28 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: manifesto,
        start: 'top top',
        end: '+=180%',
        pin: stage,
        scrub: 1,
        anticipatePin: 1,
        refreshPriority: prioridadeRefresh(manifesto)
      }
    })

    // a fumaça se abre: cresce, perde corpo e ganha nitidez no caminho
    tl.fromTo(soft,
      { opacity: 0.9, scale: 1.1 },
      { opacity: 0, scale: 1.45, duration: 0.6, ease: 'none' }, 0)
      .fromTo(sharp,
        { opacity: 0, scale: 1.1 },
        { opacity: 0.55, scale: 1.28, duration: 0.45, ease: 'none' }, 0.15)
      .to(sharp, { opacity: 0, scale: 1.45, duration: 0.4, ease: 'none' }, 0.6)

    // o texto ocupa o miolo da passagem
    tl.to(linhas, { opacity: 1, y: 0, duration: 0.35, ease: EASE, stagger: 0.08 }, 0.12)
      .to(linhas, { opacity: 0, y: -20, duration: 0.25, ease: 'none', stagger: 0.04 }, 0.78)
  }
}
