/* Seção: .manifesto — a passagem entre a hero e o capítulo 01.

   ── O painel entre a segunda e a terceira seção ────────────────────────

   O sintoma: descendo do manifesto para o Jardim, um retângulo varria a tela
   de cima para baixo, sem relação com nada.

   A causa não é gatilho mal medido — a ordem de recálculo por posição no
   documento, que motion.js instalou, está correta e continua correta. É o
   espaçador do pin.

   Com `pin: stage` e `pinSpacing: true`, o ScrollTrigger dá à seção a altura
   do curso pinado MAIS a altura do próprio elemento pinado: 260svh de
   espaçador + 100svh de palco = 360svh. O palco fica preso durante os
   260svh e, passado o fim do gatilho, é solto no pé do espaçador e ainda
   precisa percorrer uma tela inteira para sair de cena — rolando a 1:1, como
   qualquer bloco comum. Essa tela é real, mede exatamente 100svh, e nenhuma
   timeline anima nada nela.

   O `.manifesto__stage` tem fundo opaco (--fume). Uma caixa opaca de tela
   cheia atravessando o jardim que entra por baixo é, literalmente, um painel
   varrendo a tela — e a aresta inferior dura é o que o olho registra.

   Uma tentativa anterior pintou essa tela de âmbar e acendeu o relógio nela,
   na esperança de que o painel deixasse de parecer um defeito. Não resolve:
   só troca a cor do retângulo. O que desliza continua sendo uma aresta dura
   sobre uma foto, e ainda põe dois "17h" na tela ao mesmo tempo — o do
   manifesto subindo e o do capítulo chegando.

   O conserto é remover a tela, não pintá-la. Três mudanças, e as três são
   necessárias juntas:

   1. O capítulo 01 sobe uma tela (margin-top: -100svh, no CSS) e passa a
      começar exatamente onde o pin solta. A tela sobrando deixa de existir.

   2. Empilhamento invertido na soltura. Com o capítulo agora sobreposto ao
      espaçador, ele subiria por dentro da tela ainda presa — o mesmo defeito
      ao contrário. Então o manifesto fica acima dele durante o pin e abaixo
      depois, o que faz o capítulo cobrir o palco em vez de o palco atravessar
      o capítulo. A troca é a classe .is-passada, no onLeave do gatilho.

   3. O jardim entra por baixo da luz no fim do percurso, com a mesma foto, a
      mesma escala, a mesma rotação, o mesmo enquadramento e a mesma demão do
      capítulo 01. O último quadro da passagem é o primeiro quadro do
      capítulo, então a troca de seção é um corte que não se vê.

   É também o que a seção pedia narrativamente: a fumaça que se dissipa é o
   que abre a noite, e a entrada no jardim passa a ser causada por ela.

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
  const jardim = manifesto.querySelector('.manifesto__jardim')
  const ceu = manifesto.querySelector('.manifesto__ceu')
  const um = [...manifesto.querySelectorAll('.manifesto__bloco--um .manifesto__line')]
  const dois = [...manifesto.querySelectorAll('.manifesto__bloco--dois .manifesto__line')]

  if (reducedMotion) {
    // sem pin: uma tela só, fumaça parada, os dois blocos empilhados e
    // legíveis, e o relógio já aceso no canto
    gsap.set(soft, { opacity: 0 })
    gsap.set(sharp, { opacity: 0.35 })
    gsap.set(luz, { opacity: 0.7 })
    gsap.set([jardim, ceu], { opacity: 0 })
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
        invalidateOnRefresh: true,
        refreshPriority: prioridadeRefresh(manifesto),
        /* solto o pin, o capítulo 01 assume a frente. É esta troca que
           impede o palco de ser visto saindo por cima dele. */
        onLeave: () => manifesto.classList.add('is-passada'),
        onEnterBack: () => manifesto.classList.remove('is-passada')
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
      .to(dois, { opacity: 0, y: -20, duration: 0.07, ease: 'none', stagger: 0.02 }, 0.66)

    /* ── 3. a luz, o relógio, e o jardim por baixo ─────── */

    /* A luz sobe no último terço. O relógio acende depois dela e não apaga —
       ele atravessa a emenda e reaparece no mesmo canto, na mesma escala,
       dentro do capítulo 01. */
    tl.to(luz, { opacity: 1, duration: 0.16, ease: 'none' }, 0.56)
      .fromTo(hora,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.12, ease: EASE }, 0.7)

    /* O jardim sobe por baixo da luz, e a luz sai por cima dele: em cheio ela
       tem 90% de preto no topo e apagaria a foto justamente quando ela precisa
       ser lida. Quem fica no lugar da luz é o .manifesto__ceu, que é a demão
       do capítulo 01.

       Em 1.0 o palco é, pixel a pixel, o primeiro quadro do capítulo: mesma
       foto, mesma escala, mesma rotação, mesma demão, 17h no mesmo canto. É
       nesse quadro que o pin solta. */
    tl.to(jardim, { opacity: 1, duration: 0.14, ease: 'none' }, 0.74)
      .to(ceu, { opacity: 1, duration: 0.14, ease: 'none' }, 0.8)
      .to(luz, { opacity: 0, duration: 0.14, ease: 'none' }, 0.82)
  }
}
