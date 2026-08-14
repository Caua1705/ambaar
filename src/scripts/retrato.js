/* A hora sem nome · 01h.

   O porquê da seção está em retrato.css. Aqui está o tempo dela, e são três
   linhas de timeline — a seção mais barata do site em código e a única em
   que uma fotografia é o assunto inteiro.

   Classe 2 (motion.js): dispara na entrada e corre. Nada aqui é preso ao
   dedo, e não deveria ser — um retrato não tem estado intermediário. Ou a
   pessoa está na tela ou não está.

   ── A fresta ────────────────────────────────────────────────────────────

   A imagem nasce fechada numa linha no meio da tela e abre para cima e para
   baixo ao mesmo tempo. É lento de propósito: 1,6s, a entrada mais demorada
   da página depois da marca. Depois de uma tela cheia de gente (o Salão) e
   de uma composição de pedaços (a pausa), a página inteira parando para
   abrir uma imagem só é o contraste.

   E a fotografia RESPIRA enquanto abre — 1,08 para 1 de escala, na mesma
   janela. Sem isso a fresta é uma cortina abrindo sobre um cartaz; com
   isso, a imagem está viva antes de estar inteira. É a mesma escala que os
   capítulos usam ao longo do curso pinado, só que resolvida em segundos em
   vez de em pixels de rolagem.

   ── A frase ─────────────────────────────────────────────────────────────

   Entra depois, e só depois. A fotografia tem uma tela inteira de posse
   antes de qualquer palavra: o site mostra a pessoa e só então diz a hora
   dela. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const secao = document.querySelector('.retrato')

if (secao) {
  const quadro = secao.querySelector('.retrato__quadro')
  const foto = secao.querySelector('.retrato__quadro img')
  const linha = secao.querySelector('.retrato__linha')

  if (reducedMotion) {
    /* A fresta tem de ser aberta AQUI, e não só pela media query do CSS.

       O estado fechado (`clip-path: inset(50% 0 50% 0)`) é o estado de
       entrada e mora na folha, como todo estado de entrada deste site. Sem
       esta linha, o único jeito de abri-lo é a regra dentro de
       @media (prefers-reduced-motion: reduce) — e o caminho sem movimento
       do site também é alcançado pelo ?reduce=1 de desenvolvimento, que não
       aciona media query nenhuma. O resultado era a seção inteira invisível
       exatamente no modo em que tudo tem de estar visível.

       A regra do CSS fica: as duas dizem a mesma coisa, e a redundância é
       barata perto de uma fotografia que some. */
    gsap.set(quadro, { clipPath: 'inset(0% 0% 0% 0%)' })
    gsap.set(linha, { opacity: 1, y: 0 })
  } else {
    gsap.set(linha, { opacity: 0, y: 22 })

    autonomo(secao, (t) => {
      t.fromTo(quadro,
        { clipPath: 'inset(50% 0% 50% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE }, 0)
        .fromTo(foto,
          { scale: 1.08 },
          { scale: 1, duration: 2.2, ease: EASE }, 0)
        .to(linha, { opacity: 1, y: 0, duration: 1, ease: EASE }, 1.15)
    }, {
      /* Cedo, como todas as entradas desta passada: a fresta termina de
         abrir enquanto a seção ainda sobe, e o que toma a tela é a imagem
         inteira em vez de uma imagem abrindo. */
      start: 'top 78%'
    })

    /* ── E a fresta FECHA ────────────────────────────────

       A emenda 01h → Reservado era a única do site que não era nada: uma
       seção acabava, a outra começava, e a rolagem levava uma para fora
       enquanto trazia a outra. Todos os outros sete encontros da página
       têm um gesto próprio — o filete entregando o bastão, a batida de
       preto, o poente engolindo, a fotografia sendo empurrada, a fresta
       abrindo, o Reservado contraindo, a resina fechando — e a regra é que
       dois vizinhos nunca usem o mesmo. Este usava o dispositivo "nenhum",
       e "nenhum" duas vezes seguidas é o que faz uma seção parecer avulsa.

       O fecho é o próprio gesto de entrada ao contrário: a imagem volta a
       ser a linha de que ela nasceu. A seção passa a ter a forma mais
       limpa da página — abre, segura, fecha —, e é a única que se apaga
       sozinha em vez de sair rolando.

       E o que sobra na tela um instante antes do Reservado é uma LINHA
       horizontal no meio do carvão. Não é a linha da marca (aquela morreu
       em "A escuta", partida no campo) — é o resto de uma fotografia. A
       rima é distante o bastante para ser um eco e não uma repetição. */
    autonomo(secao, (t) => {
      t.to(linha, { opacity: 0, y: -18, duration: 0.7, ease: EASE }, 0)
        .to(quadro, {
          clipPath: 'inset(50% 0% 50% 0%)',
          duration: 1.1,
          ease: EASE
        }, 0.15)
    }, { start: 'bottom 78%' })
  }
}
