/* Seção: .pausa — o que ficou no lugar das cortinas.

   ── Por que as cortinas saíram ──────────────────────────────────────────

   Havia um painel sólido de tela cheia varrendo de cima para baixo em duas
   emendas. Ele nunca funcionou, e a medida não era o problema: o gatilho
   começava exatamente onde o pin do capítulo anterior soltava, ao pixel —
   conferido. O problema é o mecanismo. Um retângulo opaco de tela cheia,
   com aresta dura, atravessando na direção contrária à do conteúdo, entre
   duas seções que já são quase pretas, não tem como ser lido como
   transição: é lido como um painel. Pintá-lo de âmbar (a tentativa da
   emenda com o Reservado) só troca a cor do retângulo — vira um painel
   luminoso.

   ── O que ficou no lugar ────────────────────────────────────────────────

   Uma tela inteira de gente. O site não tinha uma pessoa legível em lugar
   nenhum, numa casa cujo assunto é gente ouvindo junto — e o intervalo
   entre dois ambientes é exatamente onde uma pessoa cabe sem disputar com
   um capítulo. Sem título, sem legenda, sem relógio: uma imagem, e o rail
   vertical dizendo a hora.

   Não é pinada e não tem scrub de conteúdo — só a foto deriva devagar
   dentro do quadro. É o oposto do capítulo vizinho por construção: uma
   passada de dedo atravessa a seção inteira. */

import { gsap, reducedMotion } from './motion.js'

for (const pausa of document.querySelectorAll('.pausa')) {
  if (reducedMotion) continue

  const img = pausa.querySelector('.pausa__img')

  // a foto é maior que a janela: a sobra é o curso da deriva
  gsap.fromTo(img,
    { yPercent: -6, scale: 1.12 },
    {
      yPercent: 6,
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: pausa,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    })
}
