/* A escuta — o silêncio, e então o primeiro som.

   O porquê da seção está em escuta.css. Aqui está o tempo dela, e ele é o
   contrário do que era: a sequência do copo prendia o dedo a dezoito
   quadros de líquido e revelava a tipografia de baixo para cima "como o
   copo enche". Sumiu a imagem, sumiu a metáfora — e o que ficou no lugar é
   uma regra mais simples e mais dura:

     UMA FRASE POR VEZ, E NADA MAIS NA TELA.

   Três frases, três terços do curso pinado, sem sobreposição nenhuma. A
   versão anterior punha a primeira e a segunda na mesma zona alta com dois
   svh de diferença, e no telefone elas se cruzavam no meio da rolagem —
   dava para ler as duas ao mesmo tempo, uma por cima da outra.

   ── O corte da revelação ────────────────────────────────────────────────

   O clipPath abre da ESQUERDA para a DIREITA, no sentido da leitura, uma
   linha por vez. É o gesto mais quieto que existe: a palavra não sobe, não
   escala, não desfoca — ela simplesmente está sendo lida.

   ── O único acontecimento ───────────────────────────────────────────────

   O campo de filetes fica IMÓVEL durante as duas primeiras frases. Quando a
   terceira — "Música boa não precisa gritar para ser ouvida" — termina de
   se abrir, ele começa a respirar, e o controle de som acende logo abaixo.

   É o primeiro movimento da página que não vem do dedo, e ele acontece
   exatamente na frase que fala de ser ouvido. Depois disso o campo não para
   mais: ele continua vivo dentro do controle de som pelo resto da noite.

   Sem movimento: nada disso roda. A seção vira as três frases empilhadas e
   legíveis, sem pin, e o campo fica parado. */

import { gsap, ScrollTrigger, reducedMotion, EASE, prioridadeRefresh } from './motion.js'

const CURSO = 1.1 // frações de tela do curso pinado

const ABERTO = 'inset(0% 0% 0% 0%)'
const FECHADO_ESQ = 'inset(0% 100% 0% 0%)'
const FECHADO_DIR = 'inset(0% 0% 0% 100%)'

const secao = document.querySelector('.escuta')

if (secao) {
  const stage = secao.querySelector('.escuta__stage')
  const frases = [...secao.querySelectorAll('.escuta__frase')]
  const campo = secao.querySelector('.campo')

  const avisarFecho = () => document.dispatchEvent(new CustomEvent('escuta:fecho'))

  if (reducedMotion) {
    secao.classList.add('is-estatica')
    gsap.set(secao.querySelectorAll('.escuta__frase span'), { clipPath: ABERTO })
    avisarFecho()
  } else {
    /* ── O curso pinado ──────────────────────────────────

       A imagem não muda porque não há imagem. O que a rolagem controla é
       apenas quando cada frase entra e sai — e por isso o curso é o mais
       curto de todas as seções pinadas do site (1,1 tela contra 1,35 da
       versão do copo). Uma seção sobre silêncio não pode ser a mais longa. */
    ScrollTrigger.create({
      trigger: secao,
      start: 'top top',
      end: `+=${CURSO * 100}%`,
      pin: stage,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: prioridadeRefresh(secao)
    })

    /* Os três terços. Cada frase abre no seu e fecha antes de a seguinte
       começar: as janelas não se tocam em ponto nenhum do curso. */
    const entra = [0.02, 0.36, 0.68]
    const sai = [0.29, 0.61, null]

    const em = (fracao) => () =>
      `top top-=${Math.round(window.innerHeight * CURSO * fracao)}`

    frases.forEach((frase, i) => {
      const linhas = [...frase.querySelectorAll('span')]
      gsap.set(linhas, { clipPath: FECHADO_ESQ })

      const abre = gsap.timeline({ paused: true })
      abre.to(linhas, {
        clipPath: ABERTO, duration: 1.15, ease: EASE, stagger: 0.18, overwrite: 'auto'
      })

      // a última frase é a que acorda o campo e apresenta o controle de som
      if (sai[i] === null) {
        abre.add(() => {
          campo?.classList.add('is-viva')
          avisarFecho()
        }, '>-0.35')
      }

      /* Sai pela direita, continuando o mesmo movimento com que entrou: a
         frase atravessa a tela e some pela borda oposta, em vez de piscar. */
      const fecha = sai[i] === null ? null : gsap.timeline({ paused: true })
      fecha?.to(linhas, {
        clipPath: FECHADO_DIR, duration: 0.85, ease: EASE, stagger: 0.1, overwrite: 'auto'
      })

      /* As duas timelines mexem na MESMA propriedade e podem ser disparadas
         no mesmo quadro — num tranco de dedo, ou numa rolagem programática
         que salte a seção inteira, o gatilho de entrada e o de saída da
         mesma frase cruzam juntos. Rodando as duas, quem termina por último
         ganha, e como a entrada é mais longa que a saída o resultado era a
         frase FICAR aberta por cima da seguinte.

         Por isso cada uma para a outra ao começar. É o único ponto do site
         em que duas timelines disputam um alvo, e é onde a disputa é
         resolvida — não no CSS nem na sorte da ordem. */
      const entrar = () => { fecha?.pause(); abre.play() }
      const sairFrase = () => { abre.pause(); fecha.play() }

      ScrollTrigger.create({
        trigger: secao,
        start: em(entra[i]),
        invalidateOnRefresh: true,
        onEnter: entrar,
        onLeaveBack: () => { fecha?.pause(); abre.reverse() }
      })

      if (!fecha) return

      ScrollTrigger.create({
        trigger: secao,
        start: em(sai[i]),
        invalidateOnRefresh: true,
        onEnter: sairFrase,
        onLeaveBack: () => { abre.pause(); fecha.reverse() }
      })
    })
  }
}
