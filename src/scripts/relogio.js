/* O relógio da casa — um algarismo para a página inteira.

   O porquê está em relogio.css. Aqui está a mecânica, e ela tem duas
   metades independentes:

   ── O VALOR ─────────────────────────────────────────────────────────────

   Cada seção declara data-hora. Duas formas:

     data-hora="17—20"   uma faixa, presa ao dedo ao longo do curso pinado
                         da seção: a hora É a posição da rolagem;
     data-hora="20"      uma hora parada, assumida quando a seção toma a
                         tela;
     data-hora="off"     a seção não tem hora (a hero, "A escuta", as
                         reservas, o fecho).

   A hora final tem de caber. A contagem é linear e o que se lê é o piso
   dela, então a última hora só apareceria no instante exato em que a
   contagem terminasse — o Jardim ia de 17h a 20h e nunca chegava a mostrar
   20h. Conta-se até UMA HORA ALÉM do destino e trava-se a leitura no
   destino: cada hora ocupa uma fatia igual do percurso, inclusive a última.

   ── O LUGAR ─────────────────────────────────────────────────────────────

   Cada seção declara data-hora-em, e o token vira uma âncora horizontal
   (0 esquerda, .5 centro, 1 direita), uma altura em svh e uma escala. A
   troca acontece por transform — x, y, scale —, nunca por left/top/font:
   posicionar por caixa e escalar por transform é o que permite ao mesmo
   elemento ser o algarismo gigante do capítulo e o miúdo da pausa sem
   remedir tipografia.

   Quem diz qual seção manda na tela é sections.js, que já resolvia isso
   para o texto vertical e para o menu: o relógio ouve o mesmo evento, então
   ele troca de lugar exatamente no mesmo ponto em que o site troca de
   assinatura. Um observador, três consequências.

   ── Sem movimento ───────────────────────────────────────────────────────

   Nada de scrub e nada de tween: o algarismo aparece direto no lugar da
   seção e as faixas viram texto ("17h — 20h"), como o relógio antigo fazia. */

import { gsap, reducedMotion, EASE } from './motion.js'

const relogio = document.querySelector('#relogio')
const valor = document.querySelector('#relogio-valor')

if (relogio && valor) {
  /* ── Lugares ─────────────────────────────────────────

     x: âncora horizontal na faixa útil (0 esquerda … 1 direita)
     pe: altura do pé, em svh
     escala: relativa ao degrau --fs-numero */
  const LUGARES = {
    esq: { x: 0, pe: 4, escala: 1 },
    centro: { x: 0.5, pe: 4, escala: 1 },

    /* 7svh, e não 4 como os dois de cima. O controle de som virou um lockup
       de traço, palavra e losango ancorado no canto inferior DIREITO, e um
       algarismo alinhado à direita a 4svh do pé cruzava a faixa dele — dois
       objetos âmbar de contorno fino no mesmo lugar viram sujeira. Os
       lugares da esquerda e do centro não têm o problema e não pagam o
       recuo. */
    dir: { x: 1, pe: 7, escala: 1 },

    // as duas telas de composição — a pausa das 00h e a hora sem nome —
    // dividem o quadro com uma frase e com fotografia: um degrau menor, e
    // no canto oposto ao do assunto. Uma de cada lado.
    'esq-baixo': { x: 0, pe: 5, escala: 0.66 },
    'dir-baixo': { x: 1, pe: 7.5, escala: 0.66 }
  }

  /* "20—00" atravessa a meia-noite e conta 20, 21, 22, 23, 00. */
  const lerFaixa = (attr) => {
    const partes = String(attr).match(/^\s*(\d{1,2})\s*[—–-]\s*(\d{1,2})\s*$/)
    if (!partes) return null

    const inicio = Number(partes[1])
    const alvo = Number(partes[2])

    return { inicio, fim: alvo <= inicio ? alvo + 24 : alvo }
  }

  const pad = (n) => String(Math.floor(n) % 24).padStart(2, '0')
  const escrever = (h) => { valor.textContent = `${pad(h)}h` }

  /* ── Posicionamento ──────────────────────────────────

     A largura do algarismo é medida sem escala (a escala é transform, que
     não altera a caixa de layout) e a conta desconta a largura JÁ escalada:
     assim o "03h" alinhado à direita encosta na goteira em qualquer degrau. */
  let lugarAtual = null

  const colocar = (lugar, animar) => {
    const alvo = LUGARES[lugar]
    if (!alvo) return

    lugarAtual = lugar

    const faixa = relogio.clientWidth
    const largura = valor.offsetWidth * alvo.escala
    const estado = {
      x: Math.round(alvo.x * Math.max(0, faixa - largura)),
      y: -Math.round((alvo.pe / 100) * window.innerHeight),
      scale: alvo.escala
    }

    if (!animar) {
      gsap.set(valor, estado)
      return
    }

    /* A curva mais longa do site, e de propósito: o algarismo se REACOMODA,
       ele não voa. O deslocamento acontece durante a passagem entre duas
       seções, quando o olho está ocupado com a composição que entra. */
    gsap.to(valor, { ...estado, duration: 1.6, ease: EASE, overwrite: 'auto' })
  }

  /* ── Quem manda na tela ──────────────────────────────

     sections.js emite o evento; o relógio só reage. O lugar é reposicionado
     ANTES de acender quando ele estava apagado (para não haver um voo de
     entrada) e animado quando ele já estava em cena. */
  let visivel = false
  let dona = null // a seção que manda no algarismo neste momento

  const assumir = (secao) => {
    dona = secao

    const em = secao.dataset.horaEm
    const hora = secao.dataset.hora

    if (!hora || hora === 'off' || !em) {
      if (!visivel) return
      visivel = false
      gsap.to(relogio, { opacity: 0, duration: 0.7, ease: EASE, overwrite: 'auto' })
      return
    }

    // hora parada: a seção assume o valor ao tomar a tela. Faixas são
    // escritas pelo scrub e não devem ser sobrescritas aqui.
    const faixa = lerFaixa(hora)
    if (!faixa) {
      if (reducedMotion) valor.textContent = `${pad(Number(hora))}h`
      else escrever(Number(hora))
    }

    relogio.classList.toggle('relogio--faixa', reducedMotion && Boolean(faixa))
    if (reducedMotion && faixa) {
      valor.textContent = `${pad(faixa.inicio)}h — ${pad(faixa.fim)}h`
    }

    colocar(em, visivel && !reducedMotion)

    if (!visivel) {
      visivel = true
      gsap.to(relogio, {
        opacity: 1,
        duration: reducedMotion ? 0 : 1.1,
        ease: EASE,
        overwrite: 'auto'
      })
    }
  }

  document.addEventListener('secao:ativa', (evento) => assumir(evento.detail.secao))

  /* ── A contagem presa ao dedo ────────────────────────

     Uma timeline por faixa, com o mesmo curso do pin da seção: a hora é a
     posição da rolagem dentro do ambiente. Sem prioridade de refresh — este
     gatilho não pina, e declarar prioridade aqui o faria medir antes de os
     espaçadores dos pins existirem.

     ── Só a dona escreve ─────────────────────────────────────────────────

     Três faixas escrevendo no MESMO algarismo é o preço de ele ser um
     objeto só, e o preço tem de ser pago aqui. Um scrub não dispara apenas
     enquanto a seção dele está na tela: ele é avaliado a cada recálculo,
     inclusive na primeira medida da página, quando todos os gatilhos são
     lidos em sequência. Sem guarda, o último a ser criado ganhava — e o
     site abria com o Jardim marcando 00h, que é a hora do Reservado.

     A guarda é a mesma autoridade que já decide o texto vertical e o menu:
     escreve quem está com a tela. */
  if (!reducedMotion) {
    for (const secao of document.querySelectorAll('[data-hora]')) {
      const faixa = lerFaixa(secao.dataset.hora)
      if (!faixa) continue

      const curso = Number(secao.dataset.run) || 100
      const conta = { v: faixa.inicio }

      gsap.timeline({
        scrollTrigger: {
          trigger: secao,
          start: 'top top',
          end: `+=${curso}%`,
          scrub: 1,
          invalidateOnRefresh: true
        }
      }).to(conta, {
        v: faixa.fim + 1,
        duration: 0.74,
        ease: 'none',
        onUpdate: () => {
          if (dona === secao) escrever(Math.min(conta.v, faixa.fim))
        }
      }, 0.06)
    }
  }

  /* A faixa útil e o pé são medidos em pixels: sem remedir, o algarismo fica
     ancorado na largura antiga. */
  let t = null
  window.addEventListener('resize', () => {
    clearTimeout(t)
    t = setTimeout(() => { if (lugarAtual) colocar(lugarAtual, false) }, 200)
  }, { passive: true })

  document.fonts?.ready.then(() => { if (lugarAtual) colocar(lugarAtual, false) })
}
