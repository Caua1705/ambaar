/* Sequências de quadros em canvas — o mecanismo, sem opinião de seção.

   Ele é usado por dois capítulos, e o Salão o usa das DUAS maneiras
   possíveis dentro de uma mesma seção:

     · o entardecer do Jardim, preso ao dedo do começo ao fim, porque ali a
       posição da rolagem É a hora do dia;
     · o Salão enchendo, preso ao dedo até certo ponto do curso e SOLTO
       depois dele — a partir daí o mesmo canvas é alimentado por um laço
       de tempo real (chapters.js), e a sala continua se mexendo com o
       polegar parado.

   Isso é possível porque este arquivo não conhece scroll nenhum: ele expõe
   `desenhar(v)` com v fracionário e não faz ideia de quem escreve v. Trocar
   o dedo pelo relógio é trocar quem chama a função.

   Quatro decisões sustentam os dois casos:

   1. Mistura entre quadros vizinhos. Os dois vídeos são de plano fixo, e
      num plano fixo dois quadros vizinhos só diferem em luz. Desenhar o
      quadro A inteiro e o quadro B por cima com alfa fracionário é, nesse
      caso, interpolação quase exata — o que permitiu ao entardecer descer
      de 40 para 22 quadros sem passar a pular. São dois drawImage por
      quadro de tela, ambos sem filtro e sem repintura de layout.

   2. Nada é baixado até a seção estar perto. Quem nunca chegar lá não paga
      o arquivo.

   3. A rolagem nunca é segurada. Se o quadro pedido ainda não chegou,
      desenha-se o mais próximo que chegou: a animação fica mais grossa por
      um instante e se resolve sozinha, sem travar nem piscar.

   4. A resolução do canvas é limitada a 1,5× o CSS. A fonte tem 520px de
      largura real; encher um canvas de 2× com ela não acrescenta nitidez
      nenhuma e dobra o número de pixels a preencher a cada quadro, que é
      justamente o que trava o telefone. */

import { ScrollTrigger } from './motion.js'

const DPR_MAX = 1.5

export const criarSequencia = ({ palco, canvas, total, caminho, frente = 6, ancora = 0.5 }) => {
  const ctx = canvas.getContext('2d', { alpha: false })

  const imagens = new Array(total)
  const prontas = new Array(total).fill(false)

  let iniciou = false
  let ultimo = -1 // último valor desenhado, para não repintar o mesmo quadro
  let pedido = 0 // último valor pedido, tenha ele chegado ou não

  /* ── Medida ──────────────────────────────────────── */

  const dpr = () => Math.min(window.devicePixelRatio || 1, DPR_MAX)

  /* offsetWidth e não getBoundingClientRect: o palco do capítulo é o
     elemento que a timeline escala e gira, e o retângulo medido já viria
     multiplicado pela escala do quadro em que a medida caiu — o canvas
     nasceria com resolução diferente a cada recálculo. A caixa de layout
     ignora transform, que é exatamente o que se quer aqui. */
  const medir = () => {
    canvas.width = Math.max(1, Math.round(palco.offsetWidth * dpr()))
    canvas.height = Math.max(1, Math.round(palco.offsetHeight * dpr()))
    ctx.fillStyle = '#0D0D0D'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ultimo = -1
  }

  /* ── Desenho ─────────────────────────────────────── */

  /* cover: preenche a caixa inteira preservando a proporção, recortando o
     excedente no eixo que sobra.

     ── E o recorte tem ÂNCORA ────────────────────────────────────────────

     `cover` centrado é o padrão de todo mundo e é uma decisão de
     enquadramento tomada por omissão. Num telefone, uma sequência de
     proporção 0,82 dentro de uma caixa 0,46 perde 44% da largura — e
     centrar significa escolher os 56% do MEIO do arquivo, que só por
     acaso seriam os 56% em que está o assunto. No Salão não eram: a
     multidão entra pela direita e o meio do quadro é a parede.

     `ancora` é onde o recorte cai, de 0 (encosta à esquerda) a 1 (à
     direita). É o `object-position` que um <canvas> não tem — e o eixo
     vertical usa a mesma conta, mesmo que hoje nenhuma sequência precise
     dele: quando a caixa é mais alta que a fonte, o excedente é zero e o
     valor não faz diferença nenhuma. */
  const pintar = (img, alfa) => {
    const cw = canvas.width
    const ch = canvas.height
    const escala = Math.max(cw / img.width, ch / img.height)
    const w = img.width * escala
    const h = img.height * escala

    ctx.globalAlpha = alfa
    ctx.drawImage(img, (cw - w) * ancora, (ch - h) * 0.5, w, h)
    ctx.globalAlpha = 1
  }

  // o quadro pedido pode ainda não ter chegado: cai para o vizinho mais
  // próximo que já esteja pronto, e nunca deixa a tela vazia
  const disponivel = (i) => {
    for (let d = 0; d < total; d++) {
      if (prontas[i - d]) return imagens[i - d]
      if (prontas[i + d]) return imagens[i + d]
    }
    return null
  }

  /* v é fracionário: a parte inteira escolhe o quadro, a fração mistura o
     seguinte por cima. */
  const desenhar = (v) => {
    const alvo = Math.min(Math.max(v, 0), total - 1)
    pedido = alvo
    if (Math.abs(alvo - ultimo) < 0.004) return

    const a = Math.floor(alvo)
    const f = alvo - a

    const ia = disponivel(a)
    if (!ia) return

    pintar(ia, 1)

    if (f > 0.01 && a + 1 < total) {
      const ib = disponivel(a + 1)
      if (ib && ib !== ia) pintar(ib, f)
    }

    ultimo = alvo
    palco.classList.add('is-pintado')
  }

  /* ── Carga ───────────────────────────────────────── */

  /* Fila de largura fixa, não as N imagens de uma vez: disparar tudo no
     mesmo quadro satura a decodificação e trava a rolagem da seção que
     está em cena — que nem é a seção que está carregando. */
  const carregar = () => {
    if (iniciou) return
    iniciou = true

    let proximo = 0

    const puxar = () => {
      if (proximo >= total) return

      const i = proximo++
      const img = new Image()
      img.decoding = 'async'

      // a fila anda mesmo quando um quadro falha: um 404 no meio não pode
      // impedir os outros de chegarem
      img.onload = () => {
        prontas[i] = true

        /* Repintar SÓ se este quadro melhora o que está na tela.

           Isto era incondicional: cada um dos 28 (ou 34) quadros que chegava
           zerava `ultimo` e forçava um `desenhar` completo — dois `drawImage`
           num canvas de até 1,5× DPR. São 62 repinturas de tela cheia
           disparadas por callbacks de rede, em rajada, e justamente enquanto
           a pessoa rola em direção à seção. O canvas em cena nem estava
           errado: na maioria das vezes o quadro que chegou está a dez
           posições do que está sendo desenhado.

           A repintura existe por um motivo real e estreito — o quadro em
           cena pode ser um SUBSTITUTO (`disponivel`) e o que acabou de
           chegar pode ser o pedido de verdade. Isso só pode acontecer perto
           do pedido, então é só perto do pedido que se repinta. */
        if (Math.abs(i - pedido) <= 1) {
          ultimo = -1
          desenhar(pedido)
        }

        puxar()
      }
      img.onerror = () => { prontas[i] = false; puxar() }

      img.src = caminho(i)
      imagens[i] = img
    }

    for (let k = 0; k < frente; k++) puxar()
  }

  /* Antecedência medida pelo próprio ScrollTrigger. Um IntersectionObserver
     faria o mesmo, mas seria um segundo mecanismo de observação — e um que
     pode nunca disparar (aba em segundo plano não entrega callbacks de IO),
     deixando a seção preta para sempre. */
  const carregarPerto = (secao, antes = '150%') =>
    ScrollTrigger.create({
      trigger: secao,
      start: `top bottom+=${antes}`,
      once: true,
      onEnter: carregar
    })

  medir()

  /* Só a LARGURA remede, pelo mesmo motivo de motion.js — e aqui o preço de
     não ter a guarda era ainda mais direto: `medir()` escreve `canvas.width`,
     e escrever nessa propriedade REALOCA o buffer inteiro e o pinta de preto.
     Com a barra do navegador indo e vindo, isso acontecia nos dois canvas do
     site no meio da rolagem, uma vez por toque na barra.

     A altura da caixa vem de `--superficie` no capítulo, que acompanha a
     barra — mas a diferença é de ~7% na aresta de baixo de uma fotografia em
     `cover`, e o `cover` já recorta o excedente. Refazer o buffer para isso é
     caro e não se vê; refazer para uma largura nova é obrigatório e se vê. */
  let t = null
  let larguraMedida = window.innerWidth

  window.addEventListener('resize', () => {
    if (window.innerWidth === larguraMedida) return
    larguraMedida = window.innerWidth

    clearTimeout(t)
    t = setTimeout(() => {
      medir() // a caixa mudou: o quadro em cena precisa ser refeito
      desenhar(pedido)
    }, 200)
  }, { passive: true })

  return { desenhar, carregar, carregarPerto, medir }
}
