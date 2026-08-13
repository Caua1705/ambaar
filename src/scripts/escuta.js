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

   Nas DUAS PRIMEIRAS, o clipPath abre da esquerda para a direita, no
   sentido da leitura, uma linha por vez. É o gesto mais quieto que existe:
   a palavra não sobe, não escala, não desfoca — ela simplesmente está sendo
   lida.

   A TERCEIRA não tem gesto nenhum. Ver o bloco do corte lá embaixo: é a
   única coisa da página que aparece sem animação, e é o que faz dela a mais
   alta.

   ── O único acontecimento ───────────────────────────────────────────────

   O campo de filetes fica IMÓVEL durante as duas primeiras frases. No
   instante em que o fecho aparece, ele começa a respirar, e o controle de
   som acende logo abaixo.

   É o primeiro movimento da página que não vem do dedo, e ele acontece
   exatamente na frase que fala de quem escuta. Depois disso o campo não
   para mais: ele continua vivo dentro do controle de som pelo resto da
   noite.

   Sem movimento: nada disso roda. A seção vira as três frases empilhadas e
   legíveis, sem pin, e o campo fica parado. */

import { gsap, ScrollTrigger, reducedMotion, EASE, prioridadeRefresh } from './motion.js'

const CURSO = 1.4 // frações de tela do curso pinado

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
    gsap.set(frases, { opacity: 1 })
    avisarFecho()
  } else {
    /* ── O curso pinado ──────────────────────────────────

       A imagem não muda porque não há imagem: o que a rolagem controla é
       apenas quando cada frase entra e sai.

       O curso subiu de 1,1 para 1,4 tela, e o que ele comprou foi
       ESCURIDÃO. A objeção antiga — uma seção sobre silêncio não pode ser
       a mais longa da página — continua valendo, e continua respeitada: o
       Jardim tem 1,5. Mas ela levava à conclusão errada, que era encurtar.
       Silêncio não é a ausência de tempo, é tempo em que nada acontece, e
       a versão curta não tinha nenhum: a primeira palavra chegava em 2% do
       curso, praticamente junto com o pin.

       Agora 15% do curso são carvão puro antes de qualquer letra, e há uma
       segunda batida de nada — a mais longa — logo antes do fecho. As duas
       pausas são a seção; as frases são o que acontece entre elas. */
    ScrollTrigger.create({
      trigger: secao,
      start: 'top top',
      end: `+=${CURSO * 100}%`,
      pin: stage,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: prioridadeRefresh(secao)
    })

    /* O mapa do curso. Nenhuma janela toca a seguinte, e o que existe entre
       elas é tela preta:

         0.00 — 0.15   nada
         0.15 — 0.35   "Não trabalhamos com pista, trabalhamos com escuta."
         0.35 — 0.44   nada
         0.44 — 0.64   "Organic house, downtempo…"
         0.64 — 0.73   nada  ← a batida antes do soco
         0.73 — 1.00   "Quem escuta, fica."

       A pausa de 0.64 a 0.73 é a única do site que existe para preparar
       alguma coisa. As outras duas são respiro; esta é sintaxe. */
    const entra = [0.15, 0.44, 0.73]
    const sai = [0.35, 0.64, null]

    const em = (fracao) => () =>
      `top top-=${Math.round(window.innerHeight * CURSO * fracao)}`

    frases.forEach((frase, i) => {
      const linhas = [...frase.querySelectorAll('span')]

      /* ── O corte ─────────────────────────────────────────

         A última frase não abre: ela ESTÁ. Zero de duração, opacidade
         binária, nenhuma interpolação — depois de uma tela de nada, a
         palavra simplesmente já está lá quando o olho chega.

         É o único elemento da página que aparece sem gesto, e é de
         propósito: num site em que tudo limpa, dissolve ou é preso ao
         dedo, a coisa que não se move é a que se ouve. A seção parou de
         DIZER que não precisa gritar e passou a demonstrar. */
      const corte = frase.hasAttribute('data-corte')

      const abre = gsap.timeline({ paused: true })

      if (corte) {
        abre.set(frase, { opacity: 1 })
      } else {
        gsap.set(linhas, { clipPath: FECHADO_ESQ })
        abre.to(linhas, {
          clipPath: ABERTO, duration: 1.15, ease: EASE, stagger: 0.18, overwrite: 'auto'
        })
      }

      // a última frase é a que acorda o campo e apresenta o controle de som
      if (sai[i] === null) {
        abre.add(() => {
          campo?.classList.add('is-viva')
          avisarFecho()
        }, corte ? '>' : '>-0.35')
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
