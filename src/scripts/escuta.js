/* A escuta — uma tela, um gesto.

   O porquê da reescrita está em escuta.css. Aqui está o tempo dela, e o
   tempo agora cabe numa timeline só: a seção inteira é CLASSE 2 (motion.js)
   — dispara na entrada, corre na velocidade dela, termina com o dedo parado.

   Não há pin, não há scrub, não há um único gatilho intermediário. A versão
   anterior tinha seis ScrollTriggers e um curso pinado de 1,4 tela para
   entregar três frases; esta tem um gatilho e 2,6 segundos.

   ── O gesto, em quatro batidas ──────────────────────────────────────────

     0,00  a linha atravessa a tela, da esquerda para a direita
     0,45  "Não é o volume. / É o que está tocando."   abre por clipPath
     0,95  "Organic house, downtempo…"                  idem, mais miúda
     1,45  "Quem escuta, fica."  NÃO abre: ela ESTÁ
           …e no MESMO quadro a linha se parte nas sete do campo
     2,35  o campo começa a respirar; o controle de som nasce

   A quarta batida é a seção inteira. Tudo antes dela é preparação: a
   palavra que não se anuncia chega junto com o objeto que se desfaz, e o
   primeiro movimento não-rolado da página acontece na frase que fala de
   quem fica.

   ── O corte ─────────────────────────────────────────────────────────────

   A última frase não anima. Zero de duração, opacidade binária, nenhuma
   interpolação — num site em que tudo limpa, dissolve ou é preso ao dedo, a
   coisa que não se move é a que se ouve. É o único elemento da página que
   aparece sem gesto.

   ── Sem movimento ───────────────────────────────────────────────────────

   Nada disso roda. A seção vira as três frases empilhadas e legíveis, sem
   sticky, com o campo já aberto no pé. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const ABERTO = 'inset(0% 0% 0% 0%)'
const FECHADO = 'inset(0% 100% 0% 0%)'

const secao = document.querySelector('.escuta')

if (secao) {
  const horizonte = secao.querySelector('.escuta__horizonte')
  const frases = [...secao.querySelectorAll('.escuta__frase')]

  const avisarFecho = () => document.dispatchEvent(new CustomEvent('escuta:fecho'))

  /* ── A linha vai buscar a palavra ────────────────────

     O horizonte não tem mais posição própria: ele tem a posição de
     "escuta". A medida é feita aqui e escrita em custom properties, e ela
     é REFEITA quando as fontes chegam — a Cormorant entra depois do
     primeiro quadro e a palavra muda de largura quando ela entra. Um
     sublinhado medido contra a fonte de sistema fica com a largura errada
     para sempre.

     A medida é por retângulo e não por `offsetLeft`: "escuta" é um <b>
     INLINE dentro de um bloco dentro do palco, e a cadeia de offsetParent
     não passa por onde o filete está ancorado. Nenhum dos dois elementos
     tem transform no momento da medida (o GSAP só toca no clipPath dos
     span e no transform dos filetes do campo), então o retângulo é exato.

     A LINHA DE BASE, e não o pé da caixa: com entrelinha 0,9 a caixa
     inline de uma serifada sobra bem abaixo do desenho da letra, e um
     sublinhado no pé dela ficaria flutuando. O descendente da Cormorant é
     ~0,21em; descontando 0,17 sobra o respiro exato para o filete passar
     rente sem encostar. */
  const palavra = secao.querySelector('.escuta__frase--c b')

  const medirPalavra = () => {
    if (!horizonte || !palavra) return

    const alvo = palavra.getBoundingClientRect()
    const base = secao.querySelector('.escuta__stage').getBoundingClientRect()
    const corpo = parseFloat(getComputedStyle(palavra).fontSize) || 0

    horizonte.style.setProperty('--x', `${Math.round(alvo.left - base.left)}px`)
    horizonte.style.setProperty('--w', `${Math.round(alvo.width)}px`)
    horizonte.style.setProperty('--y', `${Math.round(alvo.bottom - base.top - corpo * 0.17)}px`)
  }

  medirPalavra()
  document.fonts?.ready.then(medirPalavra)

  let remedir = null
  window.addEventListener('resize', () => {
    clearTimeout(remedir)
    remedir = setTimeout(medirPalavra, 200)
  }, { passive: true })

  if (reducedMotion) {
    secao.classList.add('is-estatica')
    gsap.set(secao.querySelectorAll('.escuta__frase span'), { clipPath: ABERTO })
    gsap.set(frases, { opacity: 1 })
    avisarFecho()
  } else {
    // as duas frases que abrem por janela; a terceira é o corte
    for (const frase of frases) {
      if (frase.hasAttribute('data-corte')) continue
      gsap.set(frase.querySelectorAll('span'), { clipPath: FECHADO })
    }

    const corte = frases.find((f) => f.hasAttribute('data-corte'))
    const abrem = frases.filter((f) => !f.hasAttribute('data-corte'))

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ O FILETE FICA. E O CAMPO SAIU DAQUI.                             ║
       ║                                                                  ║
       ║ O mecanismo anterior: o filete se desenhava sob a palavra         ║
       ║ "escuta", se soltava, CAÍA até o terço baixo da tela e ali se     ║
       ║ partia nos sete filetes do campo. A história era boa — o          ║
       ║ sublinhado da tese virando o som.                                ║
       ║                                                                  ║
       ║ Olhado na tela, quadro a quadro, ele não acontecia:               ║
       ║                                                                  ║
       ║  1. O SUBLINHADO NUNCA ERA VISTO. O gesto dispara em `top 85%`,  ║
       ║     isto é, antes de a seção estar na tela, e a queda começava    ║
       ║     aos 1,45s. Quando a composição tomava o quadro, o filete já   ║
       ║     tinha caído. A peça que justificava a disciplina do acento    ║
       ║     era invisível.                                                ║
       ║  2. A QUEDA NÃO SE LIA. Um filete de 1px atravessando 250px de    ║
       ║     carvão em 0,85s é, num telefone, nada.                        ║
       ║  3. E O CAMPO NÃO HERDAVA NADA. As sete linhas no pé da tela      ║
       ║     liam como um equalizador decorativo — que é exatamente o que  ║
       ║     a nota de campo.css dizia que elas não deviam ser.            ║
       ║                                                                  ║
       ║ Somando: sete filetes âmbar num canto, um oitavo invisível, e     ║
       ║ seis elementos numa tela cuja regra é cinco.                      ║
       ║                                                                  ║
       ║ ── O que ficou ───────────────────────────────────────────────── ║
       ║                                                                  ║
       ║ O filete é a ÚLTIMA coisa a acontecer, e ele acontece DEPOIS da   ║
       ║ frase: "Quem escuta, fica." aparece inteira, sem gesto, e só      ║
       ║ então uma linha se desenha por baixo de uma palavra e fica lá.    ║
       ║                                                                  ║
       ║ É o contrário do que havia: em vez de um objeto que passa por     ║
       ║ aqui a caminho de outro lugar, um objeto que chega e permanece.   ║
       ║ Num site em que tudo limpa, dissolve ou atravessa, a coisa que    ║
       ║ fica é a mais alta da página — e a frase diz literalmente isso.   ║
       ║                                                                  ║
       ║ O campo saiu da seção. Ele não desapareceu do site: vive no       ║
       ║ controle de som, três filetes dentro do losango, respirando o     ║
       ║ resto da noite. Lá ele tem função (é o espectro da faixa); aqui   ║
       ║ era ornamento. A tela caiu de seis elementos para quatro.         ║
       ╚══════════════════════════════════════════════════════════════════╝ */
    autonomo(secao, (t) => {
      abrem.forEach((frase, i) => {
        t.to(frase.querySelectorAll('span'), {
          clipPath: ABERTO,
          duration: 1.1,
          ease: EASE,
          stagger: 0.16
        }, i * 0.5)
      })

      /* `set` e não `to` na frase: ela não tem duração. É o único elemento
         da página que aparece sem gesto, e é o motivo de ela não precisar
         DIZER que não grita. */
      t.set(corte, { opacity: 1 }, 1.0)
        /* E então, e só então, a linha. Da esquerda para a direita, na
           velocidade de uma frase sendo sublinhada à mão. */
        .to(horizonte, { scaleX: 1, duration: 0.9, ease: EASE }, 1.25)

      t.add(avisarFecho, 2.0)
    }, {
      /* Cedo. A seção tem 1,35 tela e o gesto dura 2,6 segundos: disparando
         quando o topo dela cruza 85% da tela, o parágrafo termina de se
         escrever enquanto a composição ainda está subindo, e o que o
         usuário encontra quando ela toma a tela é a frase já posta.

         É o contrário da versão anterior, em que a última palavra chegava
         a uma tela e meia da primeira. */
      start: 'top 85%'
    })
  }
}
