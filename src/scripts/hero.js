/* Seção: .hero — a marca entrando e o bastão passado ao capítulo 01.

   ── A entrada, refeita para responder à saída ───────────────────────────

   A saída daqui sempre foi o melhor gesto do site: o nome e a assinatura se
   recolhem na direção do filete, e o filete — livre dos dois — se estica de
   ponta a ponta da tela e vira a linha do horizonte antes de apagar. A
   entrada era um varrimento de clipPath da esquerda para a direita sobre o
   wordmark: genérico, e sem relação nenhuma com o que a seção faz depois.

   Agora a entrada é a saída ao contrário, e o filete é o protagonista das
   duas:

     1. uma linha atravessa a tela inteira, na altura em que o lockup vai
        nascer — o horizonte, antes de haver marca;
     2. ela se recolhe até a largura do lockup;
     3. o nome se abre para CIMA a partir dela e a assinatura para BAIXO,
        como se as duas saíssem de dentro da linha.

   O filete deixa de ser um enfeite entre duas coisas e passa a ser aquilo
   de que a marca é feita — e é o mesmo objeto que, no fim do site, se
   recolhe até virar um ponto.

   Partir a palavra em caracteres continua fora de questão: criaria uma
   caixa por letra e o tracking largo se desfaria. */

import { gsap, reducedMotion, EASE, DUR_TEXTO, STAGGER } from './motion.js'
import { preloaded } from './preloader.js'

const hero = document.querySelector('.hero')
const mark = document.querySelector('.hero__mark')

if (hero && mark && !reducedMotion) {
  const rule = hero.querySelector('.hero__rule')
  const tag = hero.querySelector('.hero__tag')
  const bg = hero.querySelector('.hero__bg img')
  // o scrim apaga junto com a foto: sozinho ele deixaria uma faixa opaca
  // de carvão no pé da hero, e essa faixa é uma aresta dura contra o
  // Jardim que sobe por baixo
  const scrim = hero.querySelector('.hero__scrim')
  const cantos = [
    hero.querySelector('.hero__place'),
    hero.querySelector('.hero__scroll')
  ].filter(Boolean)

  // quanto o filete precisa esticar para ir de ponta a ponta da tela: a
  // mesma conta que a saída faz, e é o que faz as duas serem a mesma linha
  const horizonte = () => window.innerWidth / (rule.offsetWidth || 1)

  // o nome nasce fechado na borda de baixo (onde o filete está) e a
  // assinatura na borda de cima (idem): os dois se abrem para longe dele
  gsap.set(mark, { clipPath: 'inset(100% 0% 0% 0%)' })
  gsap.set(tag, { clipPath: 'inset(0% 0% 100% 0%)', opacity: 1 })
  gsap.set(cantos, { opacity: 0, y: 16 })
  gsap.set(rule, { scaleX: 0, opacity: 0 })

  preloaded.then(() => {
    gsap.timeline()
      // o horizonte chega
      .fromTo(rule,
        { scaleX: horizonte(), opacity: 0 },
        { opacity: 0.55, duration: 0.8, ease: 'power2.out' }, 0)
      // e se recolhe até a largura do lockup
      .to(rule, { scaleX: 1, duration: 1.5, ease: EASE }, 0.35)
      // a marca sai de dentro dele. É a única duração própria do site: é a
      // abertura, e precisa durar mais que qualquer entrada interna
      .to(mark, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE }, 1.05)
      .to(tag, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: EASE }, 1.35)
      .to(cantos, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE, stagger: STAGGER }, 1.6)

    /* ── Saída ───────────────────────────────────────── */

    // A timeline de saída nasce aqui, e não junto com a de entrada, porque
    // ela grava o valor inicial de cada alvo no momento em que é criada:
    // criada antes, gravaria o estado de espera e apagaria a entrada a cada
    // quadro.
    gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        // o esticão do filete é medido em largura de tela
        invalidateOnRefresh: true
      }
    })
      // a foto recua enquanto o lockup fica: profundidade sem paralaxe de
      // duas velocidades brigando entre si
      .to(bg, { scale: 1.14, duration: 1, ease: 'none' }, 0)
      /* E apaga no último quarto. Com "A passagem" removida, esta é a
         emenda mais importante do site: uma foto parada do jardim
         entregando o mesmo jardim em movimento. Duas fotografias de
         sangria total encostando uma na outra deixam uma linha horizontal
         dura no meio da tela; apagando a de cima antes do encontro, o que
         o capítulo 01 sobe é carvão, e o corte ganha uma batida de preto —
         que é como um corte se faz. */
      .to([bg, scrim], { opacity: 0, duration: 0.26, ease: 'none', immediateRender: false }, 0.74)
      .to(cantos, { opacity: 0, duration: 0.3, ease: 'none', immediateRender: false }, 0)
      // nome e assinatura recolhem na direção do filete
      .to(mark, { y: 42, opacity: 0, duration: 0.45, ease: 'none', immediateRender: false }, 0.3)
      .to(tag, { y: -30, opacity: 0, duration: 0.45, ease: 'none', immediateRender: false }, 0.3)
      // e o filete, sozinho, volta a ser a linha do horizonte antes de
      // apagar. scaleX e não width: largura é layout, e este site não anima
      // layout
      .to(rule, {
        scaleX: horizonte,
        duration: 0.4,
        ease: 'none',
        immediateRender: false
      }, 0.5)
      .to(rule, { opacity: 0, duration: 0.15, ease: 'none' }, 0.85)
  })
}
