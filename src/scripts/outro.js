/* Seção: .outro — o fecho, refeito.

   Era o pior lugar do site: uma lista centrada e parada — losango, nome,
   frase, horários, @ — com o mesmo peso em tudo. A última coisa que alguém
   vê, e a menos pensada. E o rodapé de qualquer site.

   ── A ideia ─────────────────────────────────────────────────────────────

   O site inteiro é o tempo passando: um relógio atravessa os capítulos,
   17h → 20h → 00h → 03h, e a noite avança conforme o dedo. A marca é o
   contrário — âmbar é resina que endureceu em volta de um instante e o
   guardou por milhões de anos. As duas ideias precisavam se encontrar em
   algum lugar, e o lugar é este: o fim, onde o tempo para de passar.

   Quatro gestos, nessa ordem:

     1. O filete volta. Na hero ele chegou do horizonte e a marca nasceu de
        dentro dele; aqui ele faz o caminho inverso e se recolhe até virar
        um ponto — e o ponto é o losango. É a mesma linha, e ela abre e
        fecha o site.

     2. A resina fecha. Um campo âmbar cresce das bordas para o centro
        enquanto a página termina, e a foto — âmbar dentro de um copo, a
        marca como matéria — encolhe dentro dele. Este é o único movimento
        do fecho preso ao dedo, e é preso porque a rolagem chegando ao fim
        do documento É o fechamento: aqui a posição corresponde mesmo a um
        estado.

     3. O nome se escreve, e a frase da resina fica só aqui — no site antigo
        ela era dita duas vezes, e aqui é onde ela fecha alguma coisa em
        vez de apenas passar.

     4. O grão sai. A camada de ruído que esteve sobre todos os quadros do
        site levanta na última tela: a imagem deixa de ser filme correndo e
        vira a coisa guardada. É o gesto mais silencioso da página, e é o
        que faz o fim parecer fim em vez de fim de conteúdo. */

import { gsap, ScrollTrigger, reducedMotion, EASE, entrada, splitChars } from './motion.js'

const outro = document.querySelector('.outro')

if (outro) {
  const bg = outro.querySelector('.outro__bg')
  const resina = outro.querySelector('.outro__resina')
  const rule = outro.querySelector('.outro__rule')
  const marca = outro.querySelector('.outro__mark')
  const nome = outro.querySelector('.outro__name')
  const linhas = [...outro.querySelectorAll('.outro__line')]
  const pe = outro.querySelector('.outro__foot')

  const chars = splitChars(nome)

  if (reducedMotion) {
    gsap.set([...chars, ...linhas, marca, pe], { opacity: 1, y: 0, scale: 1 })
    gsap.set(rule, { scaleX: 0.04, opacity: 0.14 })
    gsap.set(resina, { opacity: 1 })
  } else {
    gsap.set(chars, { opacity: 0, y: 16 })
    gsap.set([...linhas, pe], { opacity: 0, y: 14 })
    gsap.set(marca, { opacity: 0, scale: 0.3 })
    gsap.set(rule, { scaleX: 1, opacity: 0 })

    /* ── A resina, presa ao fim do documento ─────────── */

    gsap.timeline({
      scrollTrigger: {
        trigger: outro,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1
      }
    })
      .fromTo(bg,
        { scale: 1.2, opacity: 0.45 },
        { scale: 1, opacity: 0.6, duration: 1, ease: 'none' }, 0)
      .fromTo(resina,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'none' }, 0)

    /* ── O gesto de fechar ───────────────────────────── */

    entrada(outro, (t) => {
      // a linha atravessa a tela...
      t.to(rule, { opacity: 0.5, duration: 0.5, ease: 'power2.out' }, 0)
        // ...e se recolhe até virar um ponto
        .to(rule, { scaleX: 0.04, duration: 1.6, ease: EASE }, 0.35)
        // o ponto é o losango
        .to(marca, { opacity: 1, scale: 1, duration: 1, ease: EASE }, 1.5)
        .to(rule, { opacity: 0.14, duration: 0.8, ease: EASE }, 1.6)
        .to(chars, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.05 }, 1.85)
        .to(linhas, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.16 }, 2.3)
        .to(pe, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 2.9)
    }, { start: 'top 72%', uma: true })

    ScrollTrigger.create({
      trigger: outro,
      // o pé do documento, 40px antes: 'bottom bottom-=40' seria 40px DEPOIS
      // do fim da rolagem, e o gatilho nunca chegaria a disparar
      start: 'bottom bottom+=40',
      onEnter: () => document.documentElement.classList.add('is-guardado'),
      onLeaveBack: () => document.documentElement.classList.remove('is-guardado')
    })
  }
}
