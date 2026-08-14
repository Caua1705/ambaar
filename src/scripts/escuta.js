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
  const campo = secao.querySelector('.campo')
  const linhas = campo ? [...campo.querySelectorAll('.campo__linha')] : []

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
    gsap.set(linhas, { scaleX: 1, y: 0 })
    avisarFecho()
  } else {
    /* O estado inicial das sete linhas: empilhadas em cima do horizonte,
       com comprimento zero.

       Cada uma vai para o CENTRO do campo, não todas para o mesmo
       deslocamento. O `y` do GSAP é relativo à posição natural de cada
       elemento, e as sete têm posições naturais diferentes (o campo é um
       flex column com space-between) — um valor único as empurraria todas
       para baixo mantendo o leque aberto, que é o oposto de colapsar. A
       conta é por linha: quanto falta, a partir de onde ela nasce, para o
       centro dela coincidir com o centro do campo. */
    const colapso = (_, el) =>
      campo.offsetHeight / 2 - el.offsetTop - el.offsetHeight / 2

    if (campo && linhas.length) {
      gsap.set(linhas, { scaleX: 0, y: colapso, transformOrigin: 'left center' })
    }

    // as duas frases que abrem por janela; a terceira é o corte
    for (const frase of frases) {
      if (frase.hasAttribute('data-corte')) continue
      gsap.set(frase.querySelectorAll('span'), { clipPath: FECHADO })
    }

    const corte = frases.find((f) => f.hasAttribute('data-corte'))
    const abrem = frases.filter((f) => !f.hasAttribute('data-corte'))

    /* Quanto o filete tem de descer para chegar ao centro do campo. É
       medido no momento em que a timeline é montada, e é relativo — o
       filete já está na altura da palavra, então o que se anima é a
       diferença. */
    const queda = () => {
      if (!campo || !horizonte) return 0
      const de = horizonte.getBoundingClientRect().top
      const para = campo.getBoundingClientRect()
      return Math.round(para.top + para.height / 2 - de)
    }

    autonomo(secao, (t) => {
      t.to(horizonte, { scaleX: 1, duration: 1.2, ease: EASE }, 0)

      abrem.forEach((frase, i) => {
        t.to(frase.querySelectorAll('span'), {
          clipPath: ABERTO,
          duration: 1.1,
          ease: EASE,
          stagger: 0.16
        }, 0.45 + i * 0.5)
      })

      /* ── O corte, e a linha indo embora ────────────────

         `set` e não `to` na frase: ela não tem duração.

         E no MESMO quadro o filete se solta da palavra. Ele não encolhe no
         lugar como antes — ele CAI: desce até o centro do campo e ali se
         parte nas sete linhas, que crescem de dentro dele.

         É a diferença entre um objeto que some e um objeto que vira outro.
         O sublinhado da palavra "escuta" desce e vira o som — e é o que
         faz o campo, que até então era um enfeite no pé da tela, ter uma
         procedência. Ele veio de uma palavra.

         `power2.in` na queda: uma coisa que se solta acelera. */
      t.set(corte, { opacity: 1 }, 1.45)
        .to(horizonte, { y: queda, duration: 0.85, ease: 'power2.in' }, 1.45)
        .to(horizonte, { scaleX: 0, opacity: 0, duration: 0.5, ease: EASE }, 2.0)
        .to(linhas, {
          scaleX: 1,
          y: 0,
          duration: 0.9,
          ease: EASE,
          stagger: { each: 0.045, from: 'center' }
        }, 2.05)

      /* E então elas começam a respirar. A deriva é keyframe de CSS — custo
         zero de JavaScript, nenhum rAF ligado — e ela sobrescreve o
         transform em linha que a timeline escreve. Isso só é seguro porque
         no ponto de troca os dois estados COINCIDEM: a timeline termina em
         scaleX(1) y(0) e o keyframe desenha translateY(±amp) com scaleX
         implícito em 1. Não há salto para esconder. */
      t.add(() => {
        campo?.classList.add('is-viva')
        avisarFecho()
      }, 2.9)
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
