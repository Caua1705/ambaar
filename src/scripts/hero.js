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
import { preloaded } from './abertura.js'

const hero = document.querySelector('.hero')
const mark = document.querySelector('.hero__mark')

if (hero && mark && !reducedMotion) {
  const rule = hero.querySelector('.hero__rule')
  const tag = hero.querySelector('.hero__tag')
  const bg = hero.querySelector('.hero__bg img')
  // as duas camadas do wordmark: a janela e o âmbar cheio
  const marcaFoto = hero.querySelector('.hero__mark-layer--foto')
  const marcaCheia = hero.querySelector('.hero__mark-layer--cheio')
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

  /* A linha JÁ ESTÁ NA TELA quando esta timeline começa: ela é a linha da
     abertura, medida contra este filete e entregue no lugar exato dele
     (abertura.js). A hero não a acende — ela continua o gesto.

     Era aqui que a versão anterior tinha o passo de sobra: a cortina
     descascava levando tudo consigo e a hero acendia uma linha nova do
     zero, o que fazia o começo do site ter duas aberturas. Agora tem uma. */
  gsap.set(rule, { scaleX: horizonte(), opacity: 0.55 })

  preloaded.then(() => {
    gsap.timeline()
      // o horizonte se recolhe até a largura do lockup
      .to(rule, { scaleX: 1, duration: 1.5, ease: EASE }, 0.15)
      // a marca sai de dentro dele. É a única duração própria do site: é a
      // abertura, e precisa durar mais que qualquer entrada interna
      .to(mark, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE }, 0.85)
      .to(tag, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: EASE }, 1.15)
      .to(cantos, { opacity: 1, y: 0, duration: DUR_TEXTO, ease: EASE, stagger: STAGGER }, 1.4)

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
      /* ── O âmbar fecha em volta do jardim ──────────────

         Estas três linhas são o mesmo gesto, e por isso correm na mesma
         janela: as letras deixam de ser uma janela e viram matéria cheia
         enquanto o jardim de verdade apaga atrás delas. O que fica na tela
         é o âmbar com o jardim dentro — a última frase do site executada na
         primeira rolagem, quinze telas antes de ela ser escrita.

         ── E é também a emenda ────────────────────────────────────────────

         Esta é a costura mais importante da página: uma foto PARADA do
         jardim entregando o MESMO jardim em movimento. Duas fotografias de
         sangria total encostando uma na outra deixam uma linha horizontal
         dura atravessando a tela, e a versão anterior só apagava a de cima
         no último quarto do percurso — ou seja, as duas ficavam visíveis
         juntas, com a costura à mostra, durante três quartos da saída.

         Apagando a foto no MEIO do percurso, o capítulo 01 sobe contra
         carvão limpo e o corte ganha uma batida de preto, que é como um
         corte se faz. A foto sai cedo e não faz falta: o que segura a tela
         a partir dali é a marca, e a marca é a única coisa desta seção que
         precisava sobreviver até o fim. */
      .to(marcaFoto, { opacity: 0, duration: 0.3, ease: 'none', immediateRender: false }, 0.3)
      .to(marcaCheia, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, 0.3)
      .to([bg, scrim], { opacity: 0, duration: 0.32, ease: 'none', immediateRender: false }, 0.34)
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
