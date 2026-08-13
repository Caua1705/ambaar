/* Seção: .manifesto — a passagem entre a hero e o capítulo 01.

   ── O que ela é agora ───────────────────────────────────────────────────

   Uma tela, uma ideia, uma passada de dedo. Antes eram três telas dentro de
   um pin de 260% — 3,6 telas de rolagem para entregar duas frases, com o
   texto amarrado ao dedo. Era o pior caso do site inteiro: seis passadas
   para ler três linhas.

   O que saiu:

     · o segundo bloco (o âmbar que guarda um instante por milhões de anos)
       foi para o fecho, que é onde essa ideia fecha o site em vez de
       apenas passar por ele. Dito aqui E lá, era a mesma frase duas vezes;
     · o relógio. Ele acendia aqui, uma tela inteira antes de o Jardim
       abrir, contando uma hora que ainda não pertencia a nenhum capítulo.
       Agora a hora nasce no capítulo que a conta.

   O que ficou: o filete que a hero entregou, a frase, e a fumaça se abrindo
   para revelar o jardim por baixo. O curso caiu de 260% para 110%.

   ── A emenda com o capítulo 01 ──────────────────────────────────────────

   O painel preto que varria a tela aqui era o espaçador do pin. Com
   `pin` e `pinSpacing`, o ScrollTrigger dá à seção a altura do curso MAIS
   a altura do elemento pinado: solto o pin, o palco (fundo opaco, tela
   cheia) ainda percorre uma tela inteira para sair de cena, rolando a 1:1.
   Uma caixa opaca atravessando a foto que entra por baixo é, literalmente,
   um painel varrendo a tela.

   O conserto é remover a tela, não pintá-la, e são três mudanças que só
   funcionam juntas:

     1. o capítulo 01 sobe uma tela (margin-top: -100svh, no CSS) e passa a
        começar exatamente onde o pin solta;
     2. o empilhamento se inverte na soltura (.is-passada), senão o capítulo
        subiria por dentro do palco ainda preso — o mesmo defeito ao
        contrário;
     3. o jardim que aparece aqui no fim é o primeiro quadro da sequência do
        capítulo, no mesmo enquadramento e com a mesma demão. O último
        quadro da passagem é o primeiro quadro do capítulo, então o corte
        não se vê.

   O par borrada/nítida da fumaça existe para o desfoque diminuir sem animar
   filter: animar blur() numa imagem de tela cheia custa repintura a cada
   quadro; trocar a opacidade de duas cópias custa só composição. */

import { gsap, ScrollTrigger, reducedMotion, EASE, entrada, prioridadeRefresh } from './motion.js'

const manifesto = document.querySelector('.manifesto')

if (manifesto) {
  const stage = manifesto.querySelector('.manifesto__stage')
  const soft = manifesto.querySelector('.manifesto__smoke--soft')
  const sharp = manifesto.querySelector('.manifesto__smoke--sharp')
  const luz = manifesto.querySelector('.manifesto__luz')
  const rule = manifesto.querySelector('.manifesto__rule')
  const jardim = manifesto.querySelector('.manifesto__jardim')
  const ceu = manifesto.querySelector('.manifesto__ceu')
  const linhas = [...manifesto.querySelectorAll('.manifesto__line')]

  if (reducedMotion) {
    // sem pin: uma tela só, fumaça parada, a frase legível
    gsap.set(soft, { opacity: 0 })
    gsap.set(sharp, { opacity: 0.3 })
    gsap.set([luz, jardim, ceu], { opacity: 0 })
    gsap.set(rule, { scaleX: 1 })
    gsap.set(linhas, { opacity: 1, y: 0 })
    manifesto.classList.add('is-estatico')
  } else {
    gsap.set(linhas, { opacity: 0, y: 24 })

    /* ── A matéria, presa ao dedo ────────────────────── */

    /* Só a fumaça e a luz. A fumaça abrindo é a única coisa desta seção que
       a rolagem deve poder controlar — é ela que entrega o jardim, e a
       entrega tem de acontecer exatamente onde o pin solta. */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: manifesto,
        start: 'top top',
        end: '+=100%',
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

    // a fumaça cresce, perde corpo e ganha nitidez no caminho
    tl.fromTo(soft,
      { opacity: 0.85, scale: 1.08 },
      { opacity: 0, scale: 1.4, duration: 0.62, ease: 'none' }, 0)
      .fromTo(sharp,
        { opacity: 0, scale: 1.1 },
        { opacity: 0.42, scale: 1.28, duration: 0.34, ease: 'none' }, 0.14)
      .to(sharp, { opacity: 0, scale: 1.46, duration: 0.34, ease: 'none' }, 0.5)

    /* O jardim sobe por baixo da luz, e a luz sai por cima dele. Em 1.0 o
       palco é, pixel a pixel, o primeiro quadro do capítulo: mesma foto,
       mesma escala, mesma rotação, mesma demão. É nesse quadro que o pin
       solta. */
    tl.to(luz, { opacity: 1, duration: 0.24, ease: 'none' }, 0.42)
      .to(jardim, { opacity: 1, duration: 0.22, ease: 'none' }, 0.6)
      .to(ceu, { opacity: 1, duration: 0.2, ease: 'none' }, 0.72)
      .to(luz, { opacity: 0, duration: 0.2, ease: 'none' }, 0.76)

    /* ── A frase, por gatilho ────────────────────────── */

    // o filete chega da hero e o texto vem atrás dele; depois os dois saem
    // juntos, no tempo deles, quando a fumaça já está aberta
    entrada(manifesto, (t) => {
      t.to(rule, { scaleX: 1, duration: 1, ease: EASE }, 0)
        .to(linhas, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.14 }, 0.3)
    }, { start: 'top 55%' })

    const sai = gsap.timeline({ paused: true })
    sai.to(linhas, { opacity: 0, y: -18, duration: 0.7, ease: EASE, stagger: 0.06 }, 0)
      .to(rule, { scaleX: 0, duration: 0.6, ease: EASE }, 0.1)

    ScrollTrigger.create({
      trigger: manifesto,
      start: () => `top top-=${Math.round(window.innerHeight * 0.45)}`,
      invalidateOnRefresh: true,
      onEnter: () => sai.play(),
      onLeaveBack: () => sai.reverse()
    })
  }
}
