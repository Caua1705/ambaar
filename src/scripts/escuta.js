/* A escuta — o silêncio, e então o primeiro som.

   O porquê da seção está em escuta.css. Aqui está o tempo dela.

   ── O que estava errado ─────────────────────────────────────────────────

   Três frases aparecendo e sumindo sobre carvão, e nada mais em cena. A
   intenção era silêncio; o efeito era uma página que não terminou de
   carregar. A diferença entre as duas coisas não é quantidade de
   movimento — é se existe UM OBJETO com destino na tela. Silêncio é a
   espera de alguma coisa. Sem a coisa, é só ausência.

   ── O objeto ───────────────────────────────────────────────────────────

   Uma linha âmbar no meio da tela, e ela não é nova: é a mesma linha que a
   abertura desenha enquanto os dois arquivos críticos chegam, e a mesma
   que a hero usa como horizonte para parir a marca. Terceira e última
   aparição — e é aqui que ela acaba.

   Ao longo do curso ela se PARTE nas sete linhas do campo: elas nascem
   empilhadas em cima dela, com comprimento zero, e se abrem para as
   alturas e os comprimentos desiguais em que vão viver. Uma linha vira um
   espectro. O horizonte vira som.

   Tudo isso é scaleX e translateY — nada de largura, nada de top, nada que
   force layout. São sete elementos e dois transforms cada.

   ── O tempo ────────────────────────────────────────────────────────────

   Duas frases entram por clipPath, da esquerda para a direita, no sentido
   da leitura. Entre elas há tela preta com a linha sozinha, e essas
   batidas de nada são a seção tanto quanto as frases.

   A terceira não entra: ela ESTÁ. Zero de duração, opacidade binária. É o
   único elemento da página que aparece sem gesto, e é no mesmo quadro dela
   que o campo termina de se abrir e o controle de som acende.

   Sem movimento: nada disso roda. A seção vira as três frases empilhadas e
   legíveis, sem pin, com o campo já aberto no pé. */

import { gsap, ScrollTrigger, reducedMotion, EASE, prioridadeRefresh } from './motion.js'

const CURSO = 1.4 // frações de tela do curso pinado

const ABERTO = 'inset(0% 0% 0% 0%)'
const FECHADO_ESQ = 'inset(0% 100% 0% 0%)'
const FECHADO_DIR = 'inset(0% 0% 0% 100%)'

const secao = document.querySelector('.escuta')

if (secao) {
  const stage = secao.querySelector('.escuta__stage')
  const frases = [...secao.querySelectorAll('.escuta__frase')]
  const horizonte = secao.querySelector('.escuta__horizonte')
  const campo = secao.querySelector('.campo')
  const linhas = campo ? [...campo.querySelectorAll('.campo__linha')] : []

  const avisarFecho = () => document.dispatchEvent(new CustomEvent('escuta:fecho'))

  if (reducedMotion) {
    secao.classList.add('is-estatica')
    gsap.set(secao.querySelectorAll('.escuta__frase span'), { clipPath: ABERTO })
    gsap.set(frases, { opacity: 1 })
    gsap.set(linhas, { scaleX: 1, y: 0 })
    avisarFecho()
  } else {
    /* ── O curso pinado ──────────────────────────────────

       1,4 tela, e o que ela compra é ESCURIDÃO. A objeção de que uma seção
       sobre silêncio não pode ser a mais longa da página continua de pé —
       e continua respeitada: os dois capítulos com sequência têm 1,5.

       Mas ela levava à conclusão errada, que era encurtar. Silêncio não é
       a ausência de tempo, é tempo em que nada acontece, e a versão curta
       não tinha nenhum: a primeira palavra chegava em 2% do curso,
       praticamente junto com o pin. */
    ScrollTrigger.create({
      trigger: secao,
      start: 'top top',
      end: `+=${CURSO * 100}%`,
      pin: stage,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: prioridadeRefresh(secao)
    })

    /* Uma fração do curso pinado em pixels de rolagem. Usada pelos gatilhos
       das frases e pelo da respiração do campo. */
    const em = (fracao) => () =>
      `top top-=${Math.round(window.innerHeight * CURSO * fracao)}`

    /* ── O horizonte se parte ────────────────────────────

       Preso ao dedo, e é a única coisa da seção que é. As frases entram
       por gatilho, no tempo delas — mas a linha abrindo É o curso da
       rolagem, do mesmo jeito que o sol caindo é o curso do Jardim.

       Estado inicial: as sete linhas em cima do horizonte (y = 0 relativo
       ao centro do campo), com comprimento zero. A linha do horizonte
       existe como elemento próprio só para os primeiros 20% — depois dela
       quem desenha são as sete. */
    if (campo && linhas.length) {
      /* Cada linha vai para o CENTRO do campo, não todas para o mesmo
         deslocamento. O `y` do GSAP é relativo à posição natural de cada
         elemento, e as sete têm posições naturais diferentes (o campo é um
         flex column com space-between) — um valor único as empurraria
         todas para baixo mantendo o leque aberto, que é o oposto de
         colapsar. A conta é por linha: quanto falta, a partir de onde ela
         nasce, para o centro dela coincidir com o centro do campo. */
      const colapso = (_, el) =>
        campo.offsetHeight / 2 - el.offsetTop - el.offsetHeight / 2

      gsap.set(linhas, {
        scaleX: 0,
        y: colapso,
        transformOrigin: 'left center'
      })

      gsap.timeline({
        scrollTrigger: {
          trigger: secao,
          start: 'top top',
          end: `+=${CURSO * 100}%`,
          scrub: 1,
          invalidateOnRefresh: true
        }
      })
        /* A linha do horizonte entrega o bastão: ela encolhe para o centro
           exatamente enquanto as sete crescem a partir dele. Num único
           instante, no meio do percurso, as duas coisas dividem a tela — e
           é aí que se lê que uma virou a outra. */
        .to(horizonte, { scaleX: 0, duration: 0.34, ease: 'none' }, 0.2)
        .to(linhas, {
          scaleX: 1,
          y: 0,
          duration: 0.42,
          ease: 'none',
          stagger: { each: 0.03, from: 'center' }
        }, 0.26)

      /* E então elas começam a respirar. A deriva é keyframe de CSS — custo
         zero de JavaScript, nenhum rAF ligado — e ela sobrescreve o
         transform em linha que o scrub escreve. Isso só é seguro porque no
         ponto de troca os dois estados COINCIDEM: o scrub termina em
         scaleX(1) y(0) e o keyframe desenha translateY(±amp) com scaleX
         implícito em 1. Não há salto para esconder.

         Subindo de volta a classe sai, e o inline volta a mandar. */
      ScrollTrigger.create({
        trigger: secao,
        start: em(0.7),
        invalidateOnRefresh: true,
        onEnter: () => campo.classList.add('is-viva'),
        onLeaveBack: () => campo.classList.remove('is-viva')
      })
    }

    /* ── As frases ───────────────────────────────────────

       O mapa do curso. Nenhuma janela toca a seguinte, e o que existe
       entre elas é tela preta com a linha:

         0.00 — 0.15   nada
         0.15 — 0.35   "Não é o volume. É o que está tocando."
         0.35 — 0.44   nada          ← o horizonte começa a se partir aqui
         0.44 — 0.64   "Organic house, downtempo…"
         0.64 — 0.73   nada          ← a batida antes do soco
         0.73 — 1.00   "Quem escuta, fica."

       A pausa de 0.64 a 0.73 é a única do site que existe para preparar
       alguma coisa. As outras duas são respiro; esta é sintaxe. */
    const entra = [0.15, 0.44, 0.73]
    const sai = [0.35, 0.64, null]

    frases.forEach((frase, i) => {
      const linhasFrase = [...frase.querySelectorAll('span')]

      /* ── O corte ─────────────────────────────────────────

         A última frase não abre: ela ESTÁ. Zero de duração, opacidade
         binária, nenhuma interpolação — depois de uma tela de nada, a
         palavra simplesmente já está lá quando o olho chega.

         É o único elemento da página que aparece sem gesto, e é de
         propósito: num site em que tudo limpa, dissolve ou é preso ao
         dedo, a coisa que não se move é a que se ouve. */
      const corte = frase.hasAttribute('data-corte')

      const abre = gsap.timeline({ paused: true })

      if (corte) {
        abre.set(frase, { opacity: 1 })
      } else {
        gsap.set(linhasFrase, { clipPath: FECHADO_ESQ })
        abre.to(linhasFrase, {
          clipPath: ABERTO, duration: 1.15, ease: EASE, stagger: 0.18, overwrite: 'auto'
        })
      }

      // a última frase é a que apresenta o controle de som
      if (sai[i] === null) {
        abre.add(() => avisarFecho(), corte ? '>' : '>-0.35')
      }

      /* Sai pela direita, continuando o mesmo movimento com que entrou: a
         frase atravessa a tela e some pela borda oposta, em vez de piscar. */
      const fecha = sai[i] === null ? null : gsap.timeline({ paused: true })
      fecha?.to(linhasFrase, {
        clipPath: FECHADO_DIR, duration: 0.85, ease: EASE, stagger: 0.1, overwrite: 'auto'
      })

      /* As duas timelines mexem na MESMA propriedade e podem ser disparadas
         no mesmo quadro — num tranco de dedo, ou numa rolagem programática
         que salte a seção inteira. Rodando as duas, quem termina por último
         ganha, e como a entrada é mais longa que a saída o resultado era a
         frase FICAR aberta por cima da seguinte. Por isso cada uma para a
         outra ao começar. */
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
