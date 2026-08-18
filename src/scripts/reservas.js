/* Reservas — a saída, que era a última emenda sem dispositivo.

   ── A auditoria das emendas ─────────────────────────────────────────────

   A regra da casa é que toda junção entre duas seções seja um
   ACONTECIMENTO, e que duas junções vizinhas nunca usem o mesmo. Depois
   desta passada o inventário fica assim, de cima para baixo:

     hero    → escuta     o filete sobrevive: a marca se recolhe nele, ele
                          se estica até o horizonte e reaparece do outro
                          lado sublinhando "escuta"
     escuta  → troca      a linha CAI e vira as sete do campo
     troca   → jardim     a batida de preto: o jardim sobe do carvão
     jardim  → salão      a faixa de luz ATRAVESSA a tela
     salão   → pausa      a câmera chega perto até a sala virar um rosto, e
                          o rosto é DESLOCADO para cima
     pausa   → retrato    as molduras fecham; a fresta abre do centro
     retrato → reservado  a fresta fecha até virar uma linha
     reservado → reservas o quarto CONTRAI e escurece
     reservas → fecho     ← esta não existia

   Oito emendas com gesto e uma sem. E "sem" é o único dispositivo que
   nunca funciona: a seção anterior simplesmente rolava para fora e a
   fotografia do fecho aparecia por baixo, com a aresta de cima do bloco de
   fumê atravessando a tela.

   ── O que ela é agora: a estrutura se recolhe ───────────────────────────

   A tela de reservas é feita de QUATRO FILETES tracejados e nada mais —
   é a seção mais vazia do site, e os filetes são literalmente a estrutura
   dela. Na saída, eles se recolhem: cada um encolhe para o próprio lado,
   em sentidos alternados, e a composição fica sem chão antes de sair de
   cena.

   É o único lugar da página em que um gesto de saída desmonta a
   ARQUITETURA da tela em vez de mover o conteúdo dela. E é a última
   aparição do filete antes do fecho, onde ele se recolhe uma vez mais —
   até virar o losango. As duas coisas rimam de propósito: aqui ele se
   recolhe para os lados, lá para o centro.

   Classe 2. Reversível: subindo, a estrutura se remonta. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.reservas')

if (secao && !reducedMotion) {
  const salas = secao.querySelector('.salas')
  const linhas = salas ? [salas, ...salas.querySelectorAll('.sala')] : []
  /* `.reservas__text` não existe no HTML e nunca existiu nesta forma da
     seção: o bloco de texto é o `.reservas__cabeca` (o título mais a
     condição). O seletor morto fazia o GSAP receber `null` como alvo — um
     aviso no console a cada carga e, mais caro, a METADE do gesto de saída
     que este arquivo descreve simplesmente não acontecia: a estrutura se
     recolhia e o texto ficava parado por cima dela. */
  const texto = secao.querySelector('.reservas__cabeca')

  if (linhas.length) {
    /* O filete mora na BORDA do elemento, e borda não se anima. O que se
       anima é o próprio elemento em scaleX — e como cada `li` só tem uma
       borda de baixo e nenhum fundo, encolher a caixa encolhe o filete e
       não toca no conteúdo, que está em posição estática dentro dela.

       Não é bem verdade: o conteúdo escala junto. Por isso o alvo é um
       pseudo-elemento? Não — é mais simples do que isso: o conteúdo já
       está saindo (as linhas de texto sobem), então escalar tudo junto lê
       como a tela inteira se recolhendo, que é o gesto. */
    gsap.set(linhas, { transformOrigin: (i) => (i % 2 ? 'right center' : 'left center') })

    autonomo(secao, (t) => {
      t.to(linhas, {
        scaleX: 0,
        opacity: 0,
        duration: 0.9,
        ease: EASE,
        stagger: { each: 0.07, from: 'start' }
      }, 0)
        .to(texto, { opacity: 0, y: -14, duration: 0.7, ease: EASE }, 0.15)
    }, {
      /* Tarde, e o número foi medido em cima do defeito que ele evita.

         A 60% do pé da tela o gesto ficava lindo e deixava um BURACO: a
         caixa do bloco continua ocupando a altura dela depois que o
         conteúdo encolheu, e sobravam quase 500px de fumê vazio entre a
         última linha recolhida e o fecho. Meia tela de nada não é
         silêncio, é espera.

         A 25% a estrutura se recolhe nos últimos 200px da seção, enquanto
         ela já está saindo — o buraco fica menor que a folga de rodapé que
         a seção teria de qualquer jeito. */
      start: 'bottom 25%'
    })
  }
}
