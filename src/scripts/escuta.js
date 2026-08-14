/* A escuta — uma tela, um gesto.

   O porquê da composição está em escuta.css. Aqui está o tempo dela, e ele
   cabe numa timeline só: a seção inteira é CLASSE 2 (motion.js) — dispara na
   entrada, corre na velocidade dela, termina com o dedo parado.

   ╔══════════════════════════════════════════════════════════════════════╗
   ║ O FECHO TINHA ZERO DE DURAÇÃO. AGORA TEM A MAIOR DA PÁGINA.          ║
   ║                                                                      ║
   ║ A queixa: "«Quem escuta, fica» aparece do nada, sem apresentação".   ║
   ║ O código anterior:                                                   ║
   ║                                                                      ║
   ║     t.set(corte, { opacity: 1 }, 1.0)                                ║
   ║                                                                      ║
   ║ Um `set`. Zero de duração, opacidade binária, um quadro. A defesa    ║
   ║ estava escrita e era coerente — num site em que tudo limpa, dissolve ║
   ║ ou é preso ao dedo, a coisa que NÃO se move é a mais alta —, e ela   ║
   ║ confundia duas coisas diferentes: não gritar e não acontecer.        ║
   ║                                                                      ║
   ║ Zero de duração não lê como silêncio. Num site em que catorze outras ║
   ║ frases têm gesto, a única sem gesto não parece a mais firme: parece  ║
   ║ a que faltou terminar de carregar.                                   ║
   ║                                                                      ║
   ║ O que entrou no lugar é o gesto mais LENTO da página, não o mais     ║
   ║ barulhento. E ele é construído para ser inconfundível com as duas    ║
   ║ frases de cima: elas abrem por cortina lateral (clipPath, da         ║
   ║ esquerda para a direita); esta EMERGE de baixo, por máscara, com a   ║
   ║ letra crescendo 4% enquanto sobe. Duas gramáticas de entrada         ║
   ║ diferentes na mesma tela, e a segunda existe uma vez só.             ║
   ╚══════════════════════════════════════════════════════════════════════╝

   ── O gesto, em cinco batidas ───────────────────────────────────────────

     0,00  "Não é o volume. / É o que está tocando."   abre por cortina
     0,50  "Organic house, downtempo…"                  idem, mais miúda
     1,15  A TELA BAIXA A LUZ. As duas frases de cima recuam para 40% de
           branco — não somem, RECUAM. É o equivalente tipográfico de
           baixar a luz da sala antes de alguém falar, e é o que abre o
           vazio em que a terceira nasce.
     1,30  "Quem escuta," sobe por dentro da máscara       1,5s
     1,52  "fica."                                        1,5s
     2,60  e a linha se desenha por baixo de "escuta"     1,0s

   Três segundos e meio para três palavras. É a coisa mais demorada que a
   página faz, e ela é a tese da casa: se alguma tela pode gastar tempo, é
   a que fala de não ter pressa para ouvir.

   ── E ele termina antes de a tela estar cheia ───────────────────────────

   O gatilho é `top 85%` — a seção ainda tem 85% de tela para subir quando o
   gesto começa. Para quem rola em ritmo normal, o parágrafo termina de se
   escrever enquanto a composição ainda sobe, e o que toma a tela é uma
   frase JÁ POSTA. Quem rola depressa perde parte do gesto, e é o preço
   correto: ninguém deve ter de parar o dedo para ler três palavras.

   ── Sem movimento ───────────────────────────────────────────────────────

   Nada disso roda. A seção vira as três frases empilhadas e legíveis, sem
   sticky, sem máscara e sem filete. */

import { gsap, reducedMotion, EASE, autonomo } from './motion.js'

const ABERTO = 'inset(0% 0% 0% 0%)'
const FECHADO = 'inset(0% 100% 0% 0%)'

const secao = document.querySelector('.escuta')

if (secao) {
  const horizonte = secao.querySelector('.escuta__horizonte')
  const linhasFecho = [...secao.querySelectorAll('.escuta__linha-mask > span')]
  const abrem = [...secao.querySelectorAll('.escuta__frase--a, .escuta__frase--b')]

  const avisarFecho = () => document.dispatchEvent(new CustomEvent('escuta:fecho'))

  /* ── A linha vai buscar a palavra ────────────────────

     O horizonte não tem posição própria: ele tem a posição de "escuta". A
     medida é feita aqui e escrita em custom properties, e ela é REFEITA
     quando as fontes chegam — a Cormorant entra depois do primeiro quadro e
     a palavra muda de largura quando ela entra. Um sublinhado medido contra
     a fonte de sistema fica com a largura errada para sempre.

     A medida é por retângulo e não por `offsetLeft`: "escuta" é um <b>
     INLINE dentro de dois blocos dentro do palco, e a cadeia de
     offsetParent não passa por onde o filete está ancorado.

     ── E ela precisa ser feita com a máscara ABERTA ────────────────────

     O texto do fecho nasce deslocado 105% para baixo, dentro de um bloco
     com overflow escondido. Medir o retângulo nesse estado devolveria a
     posição da palavra FORA da tela, e o filete nasceria uma linha inteira
     abaixo de onde ele deve ficar. A medida abre a máscara por um quadro,
     lê, e devolve o estado — nada disso chega a ser pintado, porque
     acontece dentro do mesmo quadro de layout.

     A LINHA DE BASE, e não o pé da caixa: com entrelinha 0,9 a caixa inline
     de uma serifada sobra bem abaixo do desenho da letra, e um sublinhado
     no pé dela ficaria flutuando. O descendente da Cormorant é ~0,21em;
     descontando 0,17 sobra o respiro exato para o filete passar rente. */
  const palavra = secao.querySelector('.escuta__frase--c b')
  const palco = secao.querySelector('.escuta__stage')

  const medirPalavra = () => {
    if (!horizonte || !palavra || !palco) return

    // abre a máscara só para medir, e devolve na mesma volta do laço
    const guardado = linhasFecho.map((el) => [el.style.transform, el.style.opacity])
    for (const el of linhasFecho) {
      el.style.transform = 'none'
      el.style.opacity = '1'
    }

    const alvo = palavra.getBoundingClientRect()
    const base = palco.getBoundingClientRect()
    const corpo = parseFloat(getComputedStyle(palavra).fontSize) || 0

    horizonte.style.setProperty('--x', `${Math.round(alvo.left - base.left)}px`)
    horizonte.style.setProperty('--w', `${Math.round(alvo.width)}px`)
    horizonte.style.setProperty('--y', `${Math.round(alvo.bottom - base.top - corpo * 0.17)}px`)

    linhasFecho.forEach((el, i) => {
      el.style.transform = guardado[i][0]
      el.style.opacity = guardado[i][1]
    })
  }

  if (reducedMotion) {
    secao.classList.add('is-estatica')
    gsap.set(secao.querySelectorAll('.escuta__frase--a > span, .escuta__frase--b > span'), { clipPath: ABERTO })
    gsap.set(linhasFecho, { yPercent: 0, y: 0, scale: 1, opacity: 1 })
    avisarFecho()
  } else {
    for (const frase of abrem) {
      gsap.set(frase.querySelectorAll(':scope > span'), { clipPath: FECHADO })
    }

    /* ╔══════════════════════════════════════════════════════════════════╗
       ║ `y: 0` JUNTO COM O `yPercent`, E SEM ELE O FECHO NÃO APARECE     ║
       ║                                                                  ║
       ║ O CSS declara `transform: translateY(105%)` para que o texto      ║
       ║ esteja fora da máscara antes de o JavaScript existir — é o        ║
       ║ estado de entrada, e todo estado de entrada deste site mora na    ║
       ║ folha. O GSAP, ao tocar num elemento pela primeira vez, LÊ o      ║
       ║ transform computado; e o navegador devolve percentagem de         ║
       ║ translate já resolvida em pixels, num matrix(). O GSAP guarda     ║
       ║ esse valor como `y` EM PIXELS.                                    ║
       ║                                                                  ║
       ║ O resultado é que `{ yPercent: 105 }` compõe y(48,7px) +          ║
       ║ yPercent(105%), e o `.to({ yPercent: 0 })` seguinte desfaz só a   ║
       ║ segunda metade: o texto termina a animação 48,7px abaixo de onde  ║
       ║ deveria — que, numa máscara de 46,4px de altura, é exatamente     ║
       ║ fora dela. A frase animava inteira e nunca aparecia.              ║
       ║                                                                  ║
       ║ Zerar `y` explicitamente descarta o valor lido e deixa a posição  ║
       ║ nas mãos da percentagem, que é a única unidade que sobrevive a    ║
       ║ uma troca de corpo de tipo — e este é um clamp de 2,2rem a        ║
       ║ 7,2rem.                                                          ║
       ║                                                                  ║
       ║ É o mesmo defeito que o poente teve por duas passadas.            ║
       ╚══════════════════════════════════════════════════════════════════╝

       O estado fechado é escrito pelo GSAP além do CSS por outra razão
       também: o inline style é o que a medida acima salva e devolve, e ele
       precisa existir antes de a primeira medida acontecer. */
    gsap.set(linhasFecho, {
      y: 0,
      yPercent: 105,
      opacity: 0,
      scale: 0.96,
      transformOrigin: 'left bottom'
    })

    medirPalavra()
    document.fonts?.ready.then(medirPalavra)

    let remedir = null
    window.addEventListener('resize', () => {
      clearTimeout(remedir)
      remedir = setTimeout(medirPalavra, 200)
    }, { passive: true })

    autonomo(secao, (t) => {
      abrem.forEach((frase, i) => {
        t.to(frase.querySelectorAll(':scope > span'), {
          clipPath: ABERTO,
          duration: 1.1,
          ease: EASE,
          stagger: 0.16
        }, i * 0.5)
      })

      /* A luz da sala baixa. As duas frases de cima não somem — elas
         RECUAM, e a diferença importa: sumir seria uma troca de slide, e
         esta tela tem uma ideia só. Recuando, elas continuam sendo o
         parágrafo de que a terceira é o fim. */
      t.to(abrem, { opacity: 0.4, duration: 1.2, ease: EASE }, 1.15)

      /* E o fecho emerge. `yPercent` e não `y`: a máscara tem a altura da
         linha e a altura da linha muda com o corpo do tipo, que é um
         clamp. Percentagem é a única unidade que sobrevive a isso. */
        .to(linhasFecho, {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: EASE,
          stagger: 0.22
        }, 1.3)

      /* E então, e só então, a linha. Da esquerda para a direita, na
         velocidade de uma frase sendo sublinhada à mão. */
        .to(horizonte, { scaleX: 1, duration: 1, ease: EASE }, 2.6)

      t.add(avisarFecho, 3.1)
    }, { start: 'top 85%' })
  }
}
