/* Seção: .manifesto — a passagem entre a hero e o capítulo 01.

   ── O painel preto entre a segunda e a terceira seção ──────────────────

   O sintoma: descendo do manifesto para o Jardim, um retângulo preto varria
   a tela de cima para baixo, sem relação com nada.

   A causa não era gatilho mal medido — a ordem de recálculo por posição no
   documento, que motion.js instalou, está correta e continua correta. Era o
   espaçador do pin.

   Com `pin: stage` e `pinSpacing: true`, o ScrollTrigger dá à seção a altura
   do curso pinado MAIS a altura do próprio elemento pinado. Aqui: 180svh de
   espaçador + 100svh de palco = 280svh. O palco fica preso durante os
   180svh e, passado o fim do gatilho, ele é solto no pé do espaçador e ainda
   precisa percorrer uma tela inteira para sair de cena — rolando a 1:1, como
   qualquer bloco comum. Essa tela é real, mede exatamente 100svh e nenhuma
   timeline estava animando nada nela.

   E o que havia nela? O fim da timeline do manifesto deixava a fumaça em
   opacidade 0 e o texto apagado. Ou seja: uma tela inteira de #1A1A1A vazio,
   deslizando com aresta dura por cima do jardim que entrava por baixo. O
   "painel preto" era o próprio manifesto, terminado, indo embora.

   Por isso as duas emendas entre capítulos têm .curtain: a cortina existia
   justamente para tapar essa tela. Não havia cortina aqui.

   O conserto não é uma terceira cortina — é dar conteúdo à tela que ninguém
   estava usando. A timeline termina com a luz âmbar em cheio e o relógio
   aceso em 17h, então o que desliza para fora é um campo quente com o
   horário da noite dentro, e o capítulo 01 abre com o mesmo 17h no mesmo
   canto. A tela deixa de ser um defeito e passa a ser a emenda.

   ── O percurso ─────────────────────────────────────────────────────────

   Três telas num pin só, uma ideia por vez, nunca duas ao mesmo tempo. O
   "blur decrescente" vem de duas cópias da fumaça, uma borrada e uma
   nítida, trocando de opacidade: animar filter: blur() em imagem de tela
   cheia custa repintura a cada quadro, a troca custa só composição. */

import { gsap, reducedMotion, EASE, prioridadeRefresh } from './motion.js'

const manifesto = document.querySelector('.manifesto')

if (manifesto) {
  const stage = manifesto.querySelector('.manifesto__stage')
  const soft = manifesto.querySelector('.manifesto__smoke--soft')
  const sharp = manifesto.querySelector('.manifesto__smoke--sharp')
  const luz = manifesto.querySelector('.manifesto__luz')
  const rule = manifesto.querySelector('.manifesto__rule')
  const hora = manifesto.querySelector('.manifesto__hora')
  const um = [...manifesto.querySelectorAll('.manifesto__bloco--um .manifesto__line')]
  const dois = [...manifesto.querySelectorAll('.manifesto__bloco--dois .manifesto__line')]

  if (reducedMotion) {
    // sem pin: uma tela só, fumaça parada, os dois blocos empilhados e
    // legíveis, e o relógio já aceso no canto
    gsap.set(soft, { opacity: 0 })
    gsap.set(sharp, { opacity: 0.35 })
    gsap.set(luz, { opacity: 0.7 })
    gsap.set(rule, { scaleX: 1 })
    gsap.set([...um, ...dois], { opacity: 1, y: 0 })
    gsap.set(hora, { opacity: 1 })
    manifesto.classList.add('is-estatico')
  } else {
    gsap.set([...um, ...dois], { opacity: 0, y: 28 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: manifesto,
        start: 'top top',
        end: '+=260%',
        pin: stage,
        scrub: 1,
        anticipatePin: 1,
        refreshPriority: prioridadeRefresh(manifesto)
      }
    })

    /* ── 1. o manifesto ────────────────────────────────── */

    // o filete chega da hero e o texto vem atrás dele
    tl.to(rule, { scaleX: 1, duration: 0.06, ease: EASE }, 0.02)
      .to(um, { opacity: 1, y: 0, duration: 0.09, ease: EASE, stagger: 0.03 }, 0.06)
      .to(um, { opacity: 0, y: -20, duration: 0.07, ease: 'none', stagger: 0.02 }, 0.3)
      .to(rule, { scaleX: 0, duration: 0.05, ease: EASE }, 0.32)

    /* ── 2. a fumaça se abre e entrega a ideia ─────────── */

    // cresce, perde corpo e ganha nitidez no caminho
    tl.fromTo(soft,
      { opacity: 0.9, scale: 1.1 },
      { opacity: 0, scale: 1.45, duration: 0.45, ease: 'none' }, 0)
      .fromTo(sharp,
        { opacity: 0, scale: 1.1 },
        { opacity: 0.5, scale: 1.3, duration: 0.3, ease: 'none' }, 0.12)
      .to(sharp, { opacity: 0, scale: 1.5, duration: 0.3, ease: 'none' }, 0.42)

    tl.to(dois, { opacity: 1, y: 0, duration: 0.09, ease: EASE, stagger: 0.035 }, 0.42)
      .to(dois, { opacity: 0, y: -20, duration: 0.07, ease: 'none', stagger: 0.02 }, 0.68)

    /* ── 3. a luz, e o relógio começando ───────────────── */

    /* A luz sobe no último terço e fica em cheio até o fim do curso: é ela
       que ocupa a tela que o espaçador do pin devolve. O relógio acende
       depois dela e não apaga — ele atravessa a emenda. */
    tl.to(luz, { opacity: 1, duration: 0.22, ease: 'none' }, 0.62)
      .fromTo(hora,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.14, ease: EASE }, 0.76)
  }
}
