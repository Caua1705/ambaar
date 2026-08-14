/* Seção: .outro — o fecho, e é aqui que o tempo para.

   ── A ideia, e ela é a da marca ─────────────────────────────────────────

   O site inteiro é o tempo passando: um relógio o atravessa de 17h a 03h e
   a noite avança conforme o dedo. Âmbar é o contrário — resina que
   endureceu em volta de um instante e o guardou por milhões de anos. As
   duas ideias precisavam se encontrar em algum lugar, e o lugar é este.

   A passada anterior dizia isso em TEXTO ("o âmbar guarda um instante por
   milhões de anos") e o fecho continuava sendo, mecanicamente, mais uma
   seção que animava e terminava. A frase afirmava uma coisa que a tela não
   fazia.

   Agora a tela faz. No último pixel do documento, TUDO o que se move
   sozinho na página para no mesmo quadro — não desacelera, não some: para.
   O motor ambiente do site (motion.js) existe em parte por isto: para que
   "tudo o que se move sozinho" seja uma lista que alguém possa desligar.

   ── Os cinco gestos, nesta ordem ────────────────────────────────────────

     1. O PÓ ANDA. Uma camada de partículas em suspensão num facho âmbar
        deriva devagar — classe 3, sozinha, desde que a seção entra em
        cena. Ela é o relógio visível do fecho: é preciso haver uma coisa
        andando para que parar signifique alguma coisa.

     2. O FILETE VOLTA. Na hero ele chegou do horizonte e a marca nasceu de
        dentro dele; aqui faz o caminho inverso e se recolhe até virar um
        ponto — e o ponto é o losango. É a mesma linha, e ela abre e fecha
        o site.

     3. A RESINA FECHA. Um campo âmbar cresce das bordas para o centro
        enquanto a página termina, e a foto encolhe dentro dele. É o único
        movimento do fecho preso ao dedo, e é preso porque a rolagem
        chegando ao fim do documento É o fechamento: aqui a posição
        corresponde mesmo a um estado.

     4. O NOME SE ESCREVE, e a frase da resina fica só aqui.

     5. E ENTÃO PARA. No pé do documento: o pó congela no meio da deriva, o
        grão levanta, a vinheta abre e a composição assenta 1,5% — a resina
        endurecendo em volta do que ficou dentro. A imagem deixa de ser
        filme correndo e vira a coisa guardada.

   O quinto gesto é o único da página que não tem duração nem volta: é um
   estado. E ele se desfaz se o usuário rolar para cima, porque o tempo não
   acabou — está guardado. */

import {
  gsap, ScrollTrigger, reducedMotion, EASE, entrada, splitChars,
  laco, congelarAmbiente
} from './motion.js'

const outro = document.querySelector('.outro')

if (outro) {
  const bg = outro.querySelector('.outro__bg')
  const po = outro.querySelector('.outro__po')
  const resina = outro.querySelector('.outro__resina')
  const rule = outro.querySelector('.outro__rule')
  const marca = outro.querySelector('.outro__mark')
  const nome = outro.querySelector('.outro__name')
  const linhas = [...outro.querySelectorAll('.outro__line')]
  const pe = outro.querySelector('.outro__foot')
  const conteudo = outro.querySelector('.outro__content')

  const chars = splitChars(nome)

  if (reducedMotion) {
    gsap.set([...chars, ...linhas, marca, pe], { opacity: 1, y: 0, scale: 1 })
    gsap.set(rule, { scaleX: 0.04, opacity: 0.14 })
    gsap.set(resina, { opacity: 1 })
    gsap.set(po, { opacity: 0.5 })
  } else {
    gsap.set(chars, { opacity: 0, y: 16 })
    gsap.set([...linhas, pe], { opacity: 0, y: 14 })
    gsap.set(marca, { opacity: 0, scale: 0.3 })
    gsap.set(rule, { scaleX: 1, opacity: 0 })

    /* ── 1 · O pó, classe 3 ──────────────────────────

       Quatro senoides de períodos primos entre si (9,1s, 12,0s, 16,4s e
       21,3s): o desenho nunca fecha o ciclo, então nunca se repete
       visivelmente. É o mesmo princípio dos filetes do campo, aplicado a
       uma imagem.

       A amplitude é minúscula de propósito. Isto não é uma paralaxe: é uma
       coisa que não está PARADA. A diferença entre 2% de deriva e zero é a
       diferença entre um fecho vivo e um cartaz — e é o que faz o congelar
       do fim ser perceptível.

       Um gsap.set por quadro num elemento só, escrevendo transform: é a
       coisa mais barata que se pode animar, e ela só roda com a seção em
       cena (o observador vive dentro do laco). */
    /* ── E a amplitude subiu ─────────────────────────────

       Era ±2,2% de translação em 9,1s. A conta estava certa e o resultado
       era invisível: 2,2% de uma camada de partículas difusas ao longo de
       nove segundos é meio pixel por segundo, e meio pixel por segundo não
       é uma coisa que se move — é uma coisa parada.

       O problema não é estético, é estrutural: esta tela inteira existe
       para que uma coisa PARE. Parar só significa alguma coisa se houver
       andado antes, e ninguém tinha visto o pó andar.

       Agora são ±5,4% num período mais curto, e a escala respira 5% em vez
       de 3%. Continua longe de uma paralaxe — não se olha para o pó, ele
       não é o assunto — mas o quadro deixou de estar parado, e o congelar
       do fim passou a ser um acontecimento em vez de uma nota de rodapé.

       Quatro senoides de períodos primos entre si (11,4s, 15,1s, 21,3s e
       26,2s): o desenho nunca fecha o ciclo, então nunca se repete
       visivelmente. É o mesmo princípio dos filetes do campo, aplicado a
       uma imagem.

       Um gsap.set por quadro num elemento só, escrevendo transform: é a
       coisa mais barata que se pode animar, e ela só roda com a seção em
       cena (o observador vive dentro do laco). */
    if (po) {
      let t = 0
      laco(outro, (dt) => {
        t += dt
        gsap.set(po, {
          xPercent: Math.sin(t * 0.088) * 5.4,
          yPercent: Math.cos(t * 0.066) * 4.1,
          rotation: Math.sin(t * 0.047) * 2.4,
          scale: 1.1 + Math.sin(t * 0.038) * 0.05
        })
      })
    }

    /* ── 3 · A resina, presa ao fim do documento ─────── */

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
      .fromTo(po,
        { opacity: 0 },
        { opacity: 0.62, duration: 1, ease: 'none' }, 0)

    /* ── 2 e 4 · O gesto de fechar ───────────────────── */

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

    /* ── 5 · E então para ──────────────────────────────

       ╔════════════════════════════════════════════════════════════════╗
       ║ O SITE INTEIRO É O TEMPO PASSANDO. AQUI ELE PARA.              ║
       ║                                                                ║
       ║ Um relógio atravessa a página de 17h a 03h e a noite avança     ║
       ║ conforme o dedo. Âmbar é o contrário: resina que endureceu em   ║
       ║ volta de um instante e o guardou por milhões de anos. As duas   ║
       ║ ideias se encontram no último pixel do documento, e o encontro  ║
       ║ é literal — não é uma metáfora escrita na tela, é o             ║
       ║ comportamento da tela.                                         ║
       ║                                                                ║
       ║ No pé do documento, ao mesmo tempo, no mesmo quadro:            ║
       ║                                                                ║
       ║   · o pó congela no meio da deriva (congelarAmbiente)           ║
       ║   · o GRÃO levanta — a camada de ruído que esteve sobre a       ║
       ║     página inteira, das 17h às 03h, some                        ║
       ║   · a vinheta abre                                             ║
       ║   · os SETE FILETES do campo param de respirar, e com eles o    ║
       ║     pulso do controle de som (grain.css)                        ║
       ║   · e a composição assenta 1,5%                                 ║
       ║                                                                ║
       ║ Os filetes são a peça nova desta lista, e são a que fecha o     ║
       ║ argumento. Eles nasceram em "A escuta" — quinze telas atrás,    ║
       ║ do sublinhado da palavra "escuta" caindo — e desde então vivem  ║
       ║ dentro do controle de som, respirando, em toda tela da página.  ║
       ║ São o único objeto do site que se move o tempo inteiro sem      ║
       ║ nunca ter sido pedido a ninguém.                                ║
       ║                                                                ║
       ║ Se eles não parassem aqui, a última tela teria uma coisa viva   ║
       ║ no canto dizendo que o tempo continua — e a tela inteira        ║
       ║ existe para dizer o contrário.                                 ║
       ║                                                                ║
       ║ E nada disso é permanente: rolar para cima devolve tudo. O      ║
       ║ tempo não acabou, ele está GUARDADO — que é a diferença entre   ║
       ║ âmbar e um fim.                                                ║
       ╚════════════════════════════════════════════════════════════════╝

       A composição encolhe 1,5% e fica. É pouco de propósito — não é um
       zoom, é uma coisa acomodando dentro de outra que endureceu em volta
       dela. Numa tela que acabou de ficar imóvel, 1,5% é visível; numa tela
       que ainda se mexe, não seria. */
    const assentar = gsap.timeline({ paused: true })
    assentar.to(conteudo, { scale: 0.985, duration: 2.2, ease: EASE }, 0)

    ScrollTrigger.create({
      trigger: outro,
      // o pé do documento, 40px antes: 'bottom bottom-=40' seria 40px DEPOIS
      // do fim da rolagem, e o gatilho nunca chegaria a disparar
      start: 'bottom bottom+=40',
      onEnter: () => {
        document.documentElement.classList.add('is-guardado')
        congelarAmbiente(true)
        assentar.play()
      },
      onLeaveBack: () => {
        document.documentElement.classList.remove('is-guardado')
        congelarAmbiente(false)
        assentar.reverse()
      }
    })
  }
}
