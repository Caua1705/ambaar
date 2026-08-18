/* O brinde · 23h.

   O porquê está no HTML e a composição em brinde.css. Aqui está o tempo, e
   ele é a seção mais curta do site em código porque é a mais curta em
   ideia: uma fotografia que já está pronta e uma frase que chega em duas
   metades.

   CLASSE 2 (motion.js), inteira.

   ── O gesto ─────────────────────────────────────────────────────────────

     0,00  a fotografia respira: 1,06 → 1,00 em 3,2s. É lento e pequeno de
           propósito — não é uma entrada, é a única coisa que impede a tela
           de ser um cartaz enquanto o texto ainda não chegou
     0,45  "A risada"    entra da ESQUERDA
     0,85  "é uma só."   entra da DIREITA

   As duas metades se cruzam no ar: a segunda começa a andar quando a
   primeira ainda tem 40% do curso pela frente. Elas não chegam em fila —
   elas se encontram, que é o que a palavra brinde quer dizer.

   ── Por que 40px e não mais ─────────────────────────────────────────────

   O deslocamento é curto porque o corpo do tipo é grande: uma linha de
   4,4rem entrando de 200px de distância lê como um slide de apresentação.
   A 40px o que se vê é a frase ASSENTANDO no lugar dela, e a curva do site
   (uma quase-parada longa no fim) faz o resto do trabalho.

   ── Sem saída ───────────────────────────────────────────────────────────

   Não tem, e é deliberado. A seção seguinte é a passagem — a câmera
   entrando na sala até achar uma pessoa —, e ela abre com a sala em 34
   quadros já correndo. Duas coisas acontecendo na mesma emenda anulariam
   uma à outra. Aqui a tela simplesmente rola para fora, com a fotografia
   inteira até o último pixel: é a única seção do site que sai como
   chegou. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.brinde')

if (secao) {
  const foto = secao.querySelector('.brinde__quadro img')
  const a = secao.querySelector('.brinde__meia--a')
  const b = secao.querySelector('.brinde__meia--b')

  if (reducedMotion) {
    gsap.set([a, b], { opacity: 1, x: 0 })
  } else {
    autonomo(secao, (t) => {
      t.fromTo(foto,
        { scale: 1.06 },
        { scale: 1, duration: 3.2, ease: EASE }, 0)
        .fromTo(a,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 1.4, ease: EASE }, 0.45)
        .fromTo(b,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 1.4, ease: EASE }, 0.85)
    }, { start: 'top 78%' })
  }
}
