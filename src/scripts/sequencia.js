/* Seção: .sequencia — o copo enchendo, quadro a quadro, preso ao scroll.

   É o momento visual mais denso do site e o único que desenha em canvas. O
   vídeo original (líquido âmbar sendo servido) virou 48 WebP: escolhido
   contra a fumaça porque o movimento dele é monotônico — começa vazio e
   termina cheio — e movimento com direção continua legível quando decimado,
   enquanto fumaça turbulenta vira cintilação.

   Três decisões que sustentam o efeito:

   1. O desenho não acontece a cada quadro do scroll, e sim quando o índice
      muda. Entre um quadro e outro há dezenas de eventos de rolagem que não
      alterariam um pixel; redesenhar neles é custo puro.

   2. Nada é baixado até a seção estar a duas telas de distância. Antes disso
      o canvas é preto e a seção pesa zero. Quem nunca chegar lá não paga.

   3. A seção nunca segura o scroll. Se o quadro pedido ainda não chegou,
      desenha-se o último que chegou — a animação fica mais grossa por um
      instante e se resolve sozinha, mas nunca trava nem pisca.

   Sem movimento: nada disso roda. A seção vira os três blocos de texto
   empilhados e legíveis, sem canvas e sem pin. */

import { gsap, ScrollTrigger, reducedMotion, EASE, prioridadeRefresh } from './motion.js'

const TOTAL = 48
const caminho = (i) => `/frames/f_${String(i + 1).padStart(3, '0')}.webp`

const secao = document.querySelector('.sequencia')

if (secao) {
  const stage = secao.querySelector('.sequencia__stage')
  const canvas = secao.querySelector('.sequencia__canvas')
  const blocos = [...secao.querySelectorAll('.sequencia__bloco')]

  if (reducedMotion) {
    // sem canvas, sem pin: os três blocos ficam visíveis e empilhados
    secao.classList.add('is-estatica')
    gsap.set(blocos, { opacity: 1, y: 0 })
  } else {
    const ctx = canvas.getContext('2d', { alpha: false })

    const imagens = new Array(TOTAL)
    const prontas = new Array(TOTAL).fill(false)

    let atual = -1
    let pedido = 0
    let iniciouCarga = false

    /* ── Desenho ─────────────────────────────────────── */

    // dpr acima de 2 não acrescenta nitidez visível e multiplica o número de
    // pixels a preencher a cada quadro
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2)

    const medir = () => {
      const r = stage.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr())
      canvas.height = Math.round(r.height * dpr())
    }

    // cover: preenche a caixa inteira preservando a proporção, recortando o
    // excedente no eixo que sobra
    const desenhar = (i) => {
      const img = imagens[i]
      if (!img || !prontas[i]) return

      const cw = canvas.width
      const ch = canvas.height
      const escala = Math.max(cw / img.width, ch / img.height)
      const w = img.width * escala
      const h = img.height * escala

      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
      atual = i
    }

    // o quadro pedido pode ainda não ter chegado: cai para o último anterior
    // que já esteja pronto, e nunca deixa a tela vazia
    const desenharDisponivel = (i) => {
      for (let k = i; k >= 0; k--) {
        if (prontas[k]) { if (k !== atual) desenhar(k); return }
      }
      for (let k = i + 1; k < TOTAL; k++) {
        if (prontas[k]) { if (k !== atual) desenhar(k); return }
      }
    }

    /* ── Carga sob demanda ───────────────────────────── */

    const carregar = () => {
      if (iniciouCarga) return
      iniciouCarga = true

      for (let i = 0; i < TOTAL; i++) {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          prontas[i] = true
          // o primeiro quadro entra em cena assim que existe; os demais só
          // redesenham se forem justamente o que a rolagem está pedindo
          if (i === 0 || i === pedido) desenharDisponivel(pedido)
        }
        img.onerror = () => { prontas[i] = false }
        img.src = caminho(i)
        imagens[i] = img
      }
    }

    /* Duas telas de antecedência, medidas pelo próprio ScrollTrigger.
       Um IntersectionObserver faria o mesmo, mas seria um segundo mecanismo
       de observação para a página manter — e um que pode simplesmente nunca
       disparar (aba em segundo plano não entrega callbacks de IO), deixando
       a seção preta para sempre. O ScrollTrigger já conduz o site inteiro e
       é medido a partir da posição de rolagem, não da composição da aba. */
    ScrollTrigger.create({
      trigger: secao,
      start: 'top bottom+=200%',
      once: true,
      onEnter: carregar
    })

    /* ── Amarração ao scroll ─────────────────────────── */

    medir()
    ctx.fillStyle = '#0D0D0D'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const quadro = { i: 0 }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: secao,
        start: 'top top',
        end: '+=320%',
        pin: stage,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: prioridadeRefresh(secao)
      }
    })

    tl.to(quadro, {
      i: TOTAL - 1,
      ease: 'none',
      duration: 1,
      onUpdate: () => {
        const i = Math.round(quadro.i)
        if (i === pedido) return
        pedido = i
        desenharDisponivel(i)
      }
    }, 0)

    /* ── Os três blocos, em momentos distintos ───────── */

    /* Cada um entra e sai dentro do mesmo curso, sem nunca coexistir: a tela
       tem uma frase por vez, e a posição e a escala mudam a cada uma para o
       olho não se acomodar. Só opacity e translate — o canvas já é o custo
       de composição desta seção. */
    const momentos = [
      { entra: 0.06, sai: 0.30 },
      { entra: 0.38, sai: 0.60 },
      { entra: 0.68, sai: 0.94 }
    ]

    blocos.forEach((bloco, i) => {
      const { entra, sai } = momentos[i]
      gsap.set(bloco, { opacity: 0, y: 34 })

      tl.to(bloco, { opacity: 1, y: 0, duration: 0.09, ease: EASE }, entra)
        .to(bloco, { opacity: 0, y: -26, duration: 0.08, ease: EASE }, sai)
    })

    /* ── Resize ──────────────────────────────────────── */

    let t = null
    window.addEventListener('resize', () => {
      clearTimeout(t)
      t = setTimeout(() => {
        medir()
        atual = -1 // a caixa mudou: o quadro em cena precisa ser refeito
        desenharDisponivel(pedido)
      }, 200)
    }, { passive: true })
  }
}
