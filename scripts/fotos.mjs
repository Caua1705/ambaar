/**
 * As fotos que o site publica — manifesto de imagem do projeto.
 *
 *   npm run fotos
 *
 * Cada linha declara origem, largura de publicação, qualidade e o tratamento
 * de luz e cor que aquela foto pede. Não existe "otimizar a pasta": existe
 * decidir, foto a foto, o que ela precisa para pertencer a esta noite.
 *
 * Três regras:
 *
 * 1. Correção de cor não acontece no navegador. Nenhum filter em tempo de
 *    execução — filtrar imagem de tela cheia a cada quadro é caro justamente
 *    no telefone, que é onde o site é lido.
 *
 * 2. A largura é a do papel de cada foto, não um teto único. Um clímax de
 *    tela cheia pede mais pixels que um cartão de reserva de 33svh.
 *
 * 3. Toda foto tem de pertencer à MESMA hora e à MESMA luz. O acervo da casa
 *    é de luz vermelha de boate e de flash direto; o site é âmbar sobre
 *    carvão. A coluna `tinta` é o que reconcilia os dois, e ela é o único
 *    motivo de este arquivo existir em vez de um `sharp` genérico.
 *
 * ── O acervo, e por que quase tudo dele ficou de fora ──────────────────
 *
 * Foram triadas ~25 fotografias novas. Entraram sete. As que ficaram estão
 * em brand/originais/nao-usadas e saíram por três motivos, nesta ordem de
 * frequência:
 *
 *   · luz vermelha de boate. Dessaturar e tingir traz UMA foto para dentro
 *     da paleta (é o que se fez com a `guarnicao`); trazer dez faz o site
 *     deixar de ser âmbar e virar um site vermelho mal corrigido.
 *   · flash direto. Lê como foto de festa, e a casa se vende como clube de
 *     escuta — o registro briga com a tese antes de qualquer legenda.
 *   · marca de terceiro legível no vidro. Um site que é a identidade da
 *     casa não publica o logotipo de um destilado.
 *
 * ── A segunda triagem ──────────────────────────────────────────────────
 *
 * A pasta foi revista uma vez mais, e o erro da primeira passada não foi
 * nenhum dos três critérios acima: foi tê-los aplicado a CONJUNTOS. "As
 * fotos de flash" saíram juntas, "as de luz vermelha" saíram juntas — e
 * dentro de cada conjunto havia uma ou duas que nunca tiveram o defeito do
 * grupo. Quatro voltaram, uma a uma:
 *
 *   retrato    a mulher sentada, cabeça baixa, contra o tijolo. Já é âmbar
 *              — a luz da foto é a luz do site — e é a única fotografia do
 *              acervo em que alguém está SOZINHO e à vontade. Ganhou seção
 *              própria, 01h.
 *   jardim-som o jardim à noite com as luzinhas acesas e a vela na mesa.
 *              Estava fora por ser "mais uma do jardim"; é a única que
 *              mostra o ambiente na hora em que ele é reservado.
 *   salao-alto as mãos no mixer, recorte fechado, contraluz âmbar. Estava
 *              fora com o resto do material de cabine; é a única do lote
 *              que não tem rosto, não tem flash e não tem marca legível.
 *   particulas pó em suspensão num facho âmbar. Não é fotografia da casa —
 *              é matéria. Vai para o fecho, onde a resina fecha.
 *
 * ── A terceira triagem ─────────────────────────────────────────────────
 *
 * Três voltaram, e as três resolvem um buraco que o site tinha e não uma
 * vontade de usar material:
 *
 *   casa-dia        o balcão do jardim aceso, dois bancos vazios, o portão
 *                   aberto para a rua. A premissa da casa — o café fecha
 *                   às 17h e o Âmbar abre — existia numa frase de corpo de
 *                   texto e em lugar nenhum na tela. Agora tem uma seção.
 *   salao-passagem  um corpo dissolvido por um giro de obturador. É a
 *                   mesma matéria dos quadros do capítulo 02, e é o que
 *                   permite a passagem dele ser uma dissolução em vez do
 *                   corte seco que chegava do nada.
 *   salao-rosto     uma mulher de perfil, ouvindo, dentro do barulho. É o
 *                   primeiro rosto em tela cheia do site.
 *
 * ── E uma que SAIU ─────────────────────────────────────────────────────
 *
 *   salao-pista     a pista vista de trás da cabine, 6000×4000, flash e
 *                   grão. Ela foi mantida duas passadas por um argumento
 *                   que só vale na tela larga: "é a única fotografia real
 *                   de uma noite cheia, e tem uma pessoa olhando na
 *                   lente".
 *
 *                   Num telefone essa pessoa está a 62% da largura de um
 *                   quadro DEITADO do qual entram 31%. Ela nunca esteve na
 *                   tela. O que o telefone exibia era a faixa da esquerda:
 *                   dois torsos e um par de pernas, cortados na altura da
 *                   cintura, sem uma cabeça no quadro. A foto que
 *                   justificava a seção não era a foto que o site mostrava.
 *
 *                   Recortá-la em retrato salvaria o rosto e perderia o
 *                   ponto de vista (estar ATRÁS da cabine), que era a
 *                   outra metade do argumento. Sem os dois, sobra uma foto
 *                   de festa — e o registro de festa é o critério nº 2
 *                   desta lista. Saiu inteira: −152 kB.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import sharp from 'sharp'

const run = promisify(execFile)
const ORIG = 'brand/originais'
const OUT = 'public/img'

/* luz  multiplicador de brilho assado no arquivo
   sat  saturação (1 = original)
   tinta  quanto de âmbar é composto por cima, 0–1 */
const FOTOS = [
  /* ── A marca ─────────────────────────────────────────────────────────
     O jardim na hora dourada. É o único plano do site que é uma foto
     PARADA de propósito: o site inteiro é o tempo passando e a marca é o
     tempo parado. Também é a foto mais nítida da página — ela vive atrás
     do wordmark e é recortada por ele.

     ╔══════════════════════════════════════════════════════════════════╗
     ║ O RECORTE SAIU, PORQUE O ARQUIVO MUDOU                           ║
     ║                                                                  ║
     ║ O problema era este: `jardim-dourado.png` é o MESMO              ║
     ║ enquadramento dos 22 quadros do capítulo 01 — mesma mesa,        ║
     ║ mesmas cadeiras, mesma parede, mesma parreira. Publicado         ║
     ║ inteiro, a primeira tela do site e a segunda eram a mesma        ║
     ║ fotografia com duas cores diferentes.                            ║
     ║                                                                  ║
     ║ O primeiro conserto foi recortar: tirar o terço de baixo, onde   ║
     ║ estão a mesa e as cadeiras, e ficar só com a luz na parede. A    ║
     ║ ideia estava certa e o preço era alto — o recorte jogava fora    ║
     ║ 31% da ALTURA de um arquivo de 1536px, e a hero é limitada pela  ║
     ║ altura em tela vertical. Medido: num telefone retina ela passou  ║
     ║ a ser esticada 2,94× (era 2,02× antes do recorte).               ║
     ║                                                                  ║
     ║ `hero-jardim.png` resolve os dois de uma vez. É o mesmo canto,   ║
     ║ a mesma parede caiada com a viga de concreto, a mesma bananeira, ║
     ║ a mesma parreira caindo do alto e a mesma luz rasante — SEM a    ║
     ║ mesa e sem as cadeiras. O chão virou laje com mato entre as      ║
     ║ juntas, que é o que havia por baixo dos móveis.                  ║
     ║                                                                  ║
     ║ Publicada INTEIRA, sem recorte:                                  ║
     ║                                                                  ║
     ║              telefone retina    desktop                          ║
     ║   recorte          2,94×          2,17×                          ║
     ║   original         2,02×          2,08×                          ║
     ║   esta             1,82×          1,87×                          ║
     ║                                                                  ║
     ║ É a mais nítida das três em qualquer tela, e é a única que não   ║
     ║ repete o capítulo 01. A relação com ele ficou melhor do que era: ║
     ║ não é mais "a mesma foto duas vezes" nem "duas fotos sem         ║
     ║ parentesco" — é o mesmo canto do jardim antes de a casa pôr as   ║
     ║ mesas. A hero é o lugar vazio; o capítulo é o lugar acontecendo. ║
     ║                                                                  ║
     ║ E ela serve melhor à razão mecânica de existir: esta imagem vive ║
     ║ atrás do wordmark e é recortada por ele (hero.css). Sem os       ║
     ║ móveis, o que enche as seis letras é luz e folha — nunca a       ║
     ║ quina de uma cadeira.                                            ║
     ║                                                                  ║
     ║ `jardim-dourado.png` continua em brand/originais e é a fonte do  ║
     ║ timelapse; ela só não é mais publicada.                          ║
     ╚══════════════════════════════════════════════════════════════════╝ */
  { saida: 'hero', de: 'hero-jardim.png', largura: 1024, q: 66, luz: 1.02 },

  /* ── A CABINE DO JARDIM SAIU DA PUBLICAÇÃO ────────────────────────────
     Ela foi publicada por uma passada como `jardim-cabine`: o segundo ato
     do capítulo 01, uma fotografia do balcão curvo aceso que dissolvia por
     cima da sequência quando o sol acabava.

     Saiu porque a SEQUÊNCIA passou a fazer o que ela fazia. A fonte nova do
     entardecer tem a cabine acesa e o DJ tocando dentro do próprio plano,
     nos quadros 17 a 28 — e uma fotografia parada por cima do trecho mais
     vivo de um plano é uma cortina, não um ato.

     O original continua em brand/originais/hero.jpg. −135 kB. */


  /* ══════════════════════════════════════════════════════════════════
     A QUARTA TRIAGEM — e ela responde à pergunta que faltava

     As três triagens anteriores perguntaram "esta fotografia pertence à
     paleta?". Esta perguntou outra coisa: "o que a HISTÓRIA não está
     mostrando?". As respostas apareceram em três buracos:

       1. Um clube de escuta sem FONTE. O site diz "O DJ entra. A luz
          baixa." por cima de uma fotografia de uma sala vazia. A coisa que
          está sendo escutada não aparece em nenhuma das dez telas.
       2. A sala do Salão só existe CHEIA. A premissa da casa é "a mesma
          sala, as mesmas cadeiras" — e a sala vazia, o minuto antes, é
          mostrada para o café (17h) e nunca para o salão.
       3. A noite acaba e não SOBRA nada. Depois de "escolha onde
          recomeçar" o site fecha na marca. Ninguém vai embora, ninguém
          apaga a luz, nada fica em cima da mesa.

     Três fotografias que estavam na pasta das descartadas respondem às
     três, e as três já são âmbar — nenhuma precisou de correção pesada.
     ══════════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════════
     A QUINTA TRIAGEM — e desta vez a pergunta foi outra outra vez

     As quatro anteriores perguntaram se a fotografia pertencia à paleta e
     se ela tapava um buraco da narrativa. Esta perguntou uma coisa que
     nenhuma tinha perguntado: QUEM aparece neste site?

     A resposta era constrangedora. Em dezesseis telas havia três pessoas
     com rosto — e o acervo tem dezenas de fotografias de MULHERES na luz
     exata da casa, todas na pasta das descartadas, quase todas triadas em
     LOTE ("as de flash", "as de luz vermelha") sem nunca terem sido
     olhadas uma a uma.

     Onze entraram. Elas não são enfeite de uma narrativa que já existia:
     elas SÃO a narrativa nova — a noite deixou de ser uma sequência de
     cômodos e passou a ser uma sequência de pessoas dentro deles.
     ══════════════════════════════════════════════════════════════════ */

  /* ── A cabine · 20h ──────────────────────────────────────────────────
     As mãos sobre a mesa de som, contraluz âmbar, o resto preto. Nenhum
     rosto, nenhuma cor fria, nenhum logotipo dentro do quadro — o recorte
     joga fora a faixa de baixo, que é onde a marca do equipamento aparece.

     Ela substitui a cabine vista de cima (`dj-cabine`), e a troca é de
     ASSUNTO, não de qualidade: a de cima mostrava um DJ, e um DJ dentro do
     quadro faz a seção virar um retrato e a casa virar um cartaz de
     line-up. Um par de mãos num equipamento não é ninguém — é o GESTO de
     escolher, que é a única coisa que esta seção precisa dizer.

     E ela é âmbar puro sobre preto, o que a faz encostar na sala vazia ao
     lado sem costura de cor nenhuma. */
  { saida: 'cabine', de: 'nao-usadas/salao-maos.png', corte: { left: 0, top: 0, width: 1024, height: 1370 }, largura: 820, q: 72, luz: 1.06 },

  /* ── A sala antes · 20h ──────────────────────────────────────────────
     O salão vazio visto de frente: os dois pendentes acesos, os quadros na
     parede, o piso devolvendo a luz. É o mesmo lugar dos 34 quadros do
     capítulo 02, sem uma única pessoa, e é a fotografia mais QUIETA do
     acervo — dois cones de luz e nada mais.

     Ela substitui a mesa de mármore (`salao-som`), que tinha o mesmo
     assunto e metade da profundidade: lá a sala terminava numa mesa a dois
     metros da lente; aqui ela vai até o fundo, e é essa distância vazia que
     torna a tela seguinte — a mesma sala cheia — um acontecimento.

     760px: ela nunca é vista maior que meia tela. */
  { saida: 'salao-antes', de: 'nao-usadas/salao-vazio.png', largura: 760, q: 72, luz: 1.1 },

  /* ── O primeiro copo · 19h ───────────────────────────────────────────
     SEÇÃO NOVA, e é a fotografia que uma casa que se chama COCKTAIL BAR
     estava devendo desde a primeira passada.

     Uma mulher de verde, no jardim, com uma taça de âmbar na mão. O
     conteúdo do copo é exatamente a cor da marca, a luz é a mesma
     tungstênio quente do resto da noite, e o fundo é a folhagem do jardim
     do capítulo 01 — a mesma parede, uma hora depois.

     Ela é a resposta a duas perguntas de uma vez: onde estão as pessoas
     entre o entardecer e o salão, e o que é que a casa serve. O recorte
     fecha na taça e na mão e deixa o rosto fora do quadro: a seção é sobre
     o copo, não sobre quem o segura.

     900px: é tela cheia. */
  { saida: 'copo-jardim', de: 'nao-usadas/detalhe-01.jpg', corte: { left: 200, top: 1400, width: 3600, height: 4000 }, largura: 1100, q: 72, luz: 1.06, sat: 0.92, tinta: 0.1 },

  /* O mesmo copo a um palmo, e é a única imagem do site em que a marca
     aparece como MATÉRIA: âmbar dentro de vidro, na mão de alguém.

     Ela era o fundo do fecho e foi mal servida ali — em tela cheia sob a
     resina, o que se via era um pescoço e uma renda, com a taça escondida
     atrás do próprio texto. Aqui ela é pequena, emoldurada e nítida, e o
     recorte fecha na taça: a fotografia passou a mostrar o que ela sempre
     teve de bom. */
  { saida: 'copo-mao', de: 'mao-copo.png', corte: { left: 300, top: 460, width: 723, height: 900 }, largura: 620, q: 74, luz: 1.16 },

  /* ── A pista · 22h ───────────────────────────────────────────────────
     SEÇÃO NOVA. A sala cheia vista DE CIMA — a única fotografia do acervo
     tirada de um ponto de vista que o site não tem em nenhuma outra tela.

     Ela vem do lote das descartadas por "flash direto" e nunca teve flash:
     é luz de tungstênio de teto sobre trinta pessoas. O recorte vertical
     joga fora a mesa de som em primeiro plano e deixa só a multidão.

     880px: é tela cheia atrás de duas molduras. */
  { saida: 'pista-alto', de: 'nao-usadas/@FOTOBYDAVID -102 (1).jpg', corte: { left: 1500, top: 0, width: 3000, height: 4000 }, largura: 880, q: 70, luz: 1.08, sat: 0.82, tinta: 0.14 },

  /* E a mesma pista à altura dos ombros: cabelo, costas, um copo, ninguém
     olhando para a lente. É o contrário exato da de cima — lá a sala é um
     desenho, aqui ela é um lugar onde não se enxerga por cima de ninguém.

     820px: moldura, nunca tela cheia. */
  { saida: 'pista-perto', de: 'nao-usadas/@FOTOBYDAVID -086 (1).jpg', corte: { left: 350, top: 1750, width: 3050, height: 3600 }, largura: 1000, q: 70, luz: 1.1, sat: 0.8, tinta: 0.16 },

  /* O gesto que fecha a seção: o leque aberto no alto, o braço estendido,
     a bola de espelhos na quina baixa. É a única fotografia do site em que
     alguém está claramente DANÇANDO.

     A luz é vermelha de palco e por isso ela leva a segunda maior tinta da
     página: dessaturar dois passos e compor âmbar por cima traz o carmim
     para o bronze da casa sem apagar o contraste do braço contra o preto. */
  { saida: 'leque', de: 'nao-usadas/DSC02234.jpeg', corte: { left: 300, top: 300, width: 3500, height: 4700 }, largura: 820, q: 70, luz: 1.04, sat: 0.6, tinta: 0.3 },

  /* ── O brinde · 00h ──────────────────────────────────────────────────
     SEÇÃO NOVA, e é a fotografia mais ALEGRE do acervo — duas mulheres
     rindo com os copos na mão, uma delas com o braço no alto.

     O site tinha um problema de temperatura que nenhuma correção de cor
     resolve: da 20h em diante tudo era arrasto, silhueta e gente de costas.
     Uma casa noturna que nunca mostra ninguém FELIZ está vendendo um
     museu. Esta tela é a meia-noite, e a meia-noite é isto.

     A taça da frente é carmim: sat baixa e tinta média a trazem para o
     âmbar sem tocar na pele, que já é quente.

     900px: tela cheia. */
  { saida: 'brinde', de: 'nao-usadas/DSC02281.jpeg', corte: { left: 400, top: 900, width: 3400, height: 4200 }, largura: 1100, q: 72, luz: 1.06, sat: 0.76, tinta: 0.16 },

  /* ── Quem fica · 03h ─────────────────────────────────────────────────
     SEÇÃO NOVA, e ela fecha o arco que "A escuta" abre na segunda tela.

     Uma mulher de perfil, olhos baixos, o brinco comprido pegando a luz,
     o cabelo inteiro no quadro. Ela não está posando, não está falando com
     ninguém e não está olhando para a lente: está OUVINDO. É literalmente
     a frase da segunda tela — "Quem escuta, fica." — fotografada seis
     horas depois.

     O recorte tira a faixa esquerda do arquivo, onde havia uma marca de
     destilado num quadro de parede. O que sobra é ela e o escuro.

     880px: tela cheia, e o assunto é a orelha.

     ⚠︎ FORA DO BUILD. A `quem fica` passou a usar `salao-rosto` (ver a nota
     daquela seção no index.html), e uma entrada sem consumidor são 159 kB
     — o arquivo mais pesado do acervo — copiados para dist a cada build
     sem aparecer em tela nenhuma. A fonte e o recorte ficam aqui: o
     original é 4000×6000 e voltar é descomentar a linha. */
  // { saida: 'perfil-brinco', de: 'nao-usadas/@FOTOBYDAVID -091.jpg', corte: { left: 1150, top: 600, width: 2450, height: 3700 }, largura: 1000, q: 62, luz: 1.06, sat: 0.88, tinta: 0.08 },

  /* ── O fecho ─────────────────────────────────────────────────────────
     Uma mulher de vestido de paetê bronze, a bola de espelhos atrás. Ela é
     a fotografia mais literalmente ÂMBAR do acervo: um corpo inteiro
     coberto de luz cor de resina.

     Ela substitui `mao-copo` no fecho, e a troca conserta um defeito de
     composição, não de gosto. O fecho tem uma resina que escurece o miolo
     do quadro justamente onde o texto cai — e `mao-copo` tinha o assunto
     (a taça) EXATAMENTE no miolo. A fotografia era coberta pelo próprio
     dispositivo que a segurava legível. Aqui o assunto é o vestido, que
     ocupa a tela inteira e sobrevive a qualquer demão.

     ── O recorte corta a cabeça, e é de propósito ──────────────────────

     Publicada com o rosto dentro do quadro, ela não funcionava no fecho, e
     a causa é geométrica: num telefone (430×930) a proporção da tela é
     2,16 e a da fotografia é 1,43, então o `cover` escala pela ALTURA e
     não sobra nenhum corte vertical — o rosto cai sempre no meio da tela,
     que é exatamente onde moram o losango e o wordmark. O que se via era a
     marca da casa desenhada em cima da boca de uma pessoa.

     Recortada dos ombros para baixo, a fotografia deixa de ser um retrato
     e passa a ser o que a seção precisa: um campo de âmbar com textura. A
     pele no alto do quadro é o que impede a imagem de virar tecido — sabe-
     se que há alguém ali, e não se olha para o rosto dela em vez de para a
     marca.

     ⚠︎ Ela JÁ SAIU daqui uma vez, trocada pelo `retrato`, e VOLTOU. O
     argumento da troca era que a última imagem do site não devia ser um
     corpo sem cabeça; o argumento da volta é mais forte e é de encaixe:
     este slot é um fundo sangrado debaixo de uma resina que come 44% do
     miolo, e o que ele pede é campo de cor com textura, não uma fotografia
     com assunto. A `dourada` é a única do acervo que é exatamente isso.

     900px: tela cheia. */
  { saida: 'dourada', de: 'nao-usadas/DSC02228.jpeg', corte: { left: 250, top: 1980, width: 3500, height: 4020 }, largura: 1100, q: 72, luz: 1.04, sat: 0.8, tinta: 0.16 },

  /* ── A TROCA E O JARDIM À NOITE SAÍRAM DAQUI ─────────────────────────
     Duas fotografias publicadas na passada anterior deixaram de ter
     endereço nesta, e as duas por decisão de NARRATIVA e não de imagem:

       casa-dia      o balcão do jardim com o portão aberto para a rua. Ela
                     existia para a seção das 17h — "o café fecha, a casa
                     continua aberta" —, e a seção inteira foi removida: a
                     casa não quer falar do café na própria página. Sem a
                     premissa, a fotografia é um balcão bonito sem assunto.
       jardim-noite  o jardim com as luzinhas acesas e a vela na mesa. Era
                     o segundo ato do capítulo 01 e perdeu o posto para
                     `jardim-cabine`, que diz a mesma coisa e mais uma: lá
                     a casa acendeu a luz, aqui ela ligou o SOM.

     Nenhuma das duas volta por outro caminho. Elas continuam em
     brand/originais/nao-usadas — a que serve à lista de reservas é a do
     jardim à noite, e ela é republicada em 420px lá embaixo, no tamanho de
     um selo, que é o único papel que ainda lhe cabe.

     −250 kB. */

  /* ── O arrasto · e ele mudou de endereço ─────────────────────────────
     Um corpo dissolvido por um giro de obturador, parede âmbar, os LEDs da
     cabine embaixo. Não é uma fotografia DE alguém: é uma fotografia de
     movimento.

     Ela era o plano do meio da passagem das 23h — o degrau entre a sala em
     34 quadros e o rosto em tela cheia — e não funcionava ali. O
     diagnóstico é de enquadramento: em tela cheia, num telefone, o borrão
     ocupa a tela inteira sem um único ponto de apoio para o olho, e uma
     tela inteira sem ponto de apoio não lê como aproximação, lê como
     imagem desalinhada. Ela chegava, ficava meio segundo, e ia embora sem
     que ninguém soubesse o que tinha visto.

     Agora ela é o FUNDO da pista das 22h, atrás de duas molduras nítidas.
     Ali o borrão tem função: ele é a sala em movimento por trás de duas
     coisas que estão paradas, e o contraste entre os dois registros é o
     assunto da seção. A mesma imagem, num lugar em que ela tem contra o
     que ser borrão.

     720px e qualidade baixa: o arquivo inteiro é borrão. Resolução aqui é
     peso sem imagem. */
  { saida: 'arrasto', de: 'nao-usadas/dj-blur.png', largura: 720, q: 64, luz: 1.04, sat: 0.9, tinta: 0.12 },

  /* ── Os três cartões de reserva VOLTARAM ─────────────────────────────
     Eles saíram duas passadas atrás com um argumento de composição: uma
     galeria de miniaturas no fim de um site que acabou de mostrar os três
     lugares em tela cheia é uma repetição, e com foto o Jardim (o mais
     claro dos três) ganhava a escolha antes de a pessoa ler os nomes.

     O primeiro argumento continua de pé e o segundo tinha um erro de
     sinal: uma lista de três nomes em tipo branco sobre carvão não é
     neutra, é ILEGÍVEL como escolha — nada ali diz o que é cada sala, e a
     pessoa está escolhendo entre três palavras. Uma miniatura de 40mm não
     é uma galeria; é a legenda do nome.

     O que resolve o desequilíbrio não é tirar a foto de todos: é ela ser
     PEQUENA, do mesmo tamanho nos três, e escura o bastante para nenhuma
     ganhar por brilho. 420px, e as três passam pela mesma correção.

     +54 kB, e a seção que pede a reserva deixa de pedir um voto de
     confiança. */
  { saida: 'sala-jardim', de: 'nao-usadas/jardim-noite.png', largura: 420, q: 70, luz: 1.06, sat: 0.9, tinta: 0.1 },
  { saida: 'sala-salao', de: 'nao-usadas/salao-vazio.png', largura: 420, q: 70, luz: 1.35, sat: 0.9, tinta: 0.1 },
  { saida: 'sala-reservado', de: 'nao-usadas/reservado.png', largura: 420, q: 70, luz: 1.4, sat: 0.9, tinta: 0.1 },

  /* E então o borrão resolve num rosto.

     Uma mulher de perfil, olhos baixos, o cabelo ainda andando, o copo na
     mão, contra o mural pintado da sala. É o primeiro ROSTO em tela cheia
     do site inteiro — quinze telas de ambientes e multidões antes de uma
     pessoa —, e ela está fazendo exatamente o que a casa vende: está ali,
     sozinha dentro do barulho, ouvindo.

     Estava fora com o lote de "flash direto" e nunca teve flash: a luz
     dela é a mesma luz de tungstênio quente do resto da noite. Precisou de
     um passo de saturação (o mural tem verdes que competem com o âmbar) e
     de quase nenhuma tinta.

     880px: tela cheia, e o assunto é a cara.

     ⚠︎ ELA MUDOU DE SEÇÃO: saiu da passagem e foi para a `quem fica`, às
     03h. O terceiro estágio da passagem passou a usar o `retrato` (ver as
     notas das duas seções no index.html).

     Continua a 880px, e agora o número quer dizer outra coisa: não é mais
     tela cheia, é a largura da FAIXA vertical da `quem fica`, que num
     monitor de 1440 mede ~893px. Coincidiu. */
  { saida: 'salao-rosto', de: 'nao-usadas/perfil.png', largura: 880, q: 72, luz: 1.02, sat: 0.84, tinta: 0.1 },

  /* ── Os três cartões de reserva saíram ───────────────────────────────
     `jardim-som` (a mesa no jardim à noite) e `salao-alto` (as mãos no
     mixer) foram publicadas duas passadas para os cartazes de reserva.
     A seção de reservas virou uma composição sem fotografia nenhuma —
     três nomes entre filetes tracejados —, e as duas ficaram sem destino.

     Elas não voltam para outro lugar, e a razão é a regra: toda imagem
     pertence a uma HORA da noite ou a uma IDEIA. Estas duas pertenciam a
     um item de lista. Um item de lista deixou de existir; a fotografia
     não se muda para outro endereço só porque já foi tratada.

     −128 kB. O terceiro cartão usava `reservado`, que continua no build
     porque é o cartaz do capítulo 03 (o quadro do vídeo).

     ── A hora sem nome · 01h ───────────────────────────────────────────
     A mulher sentada, cabeça baixa, o cabelo caindo, contra o tijolo. É a
     fotografia que este site estava devendo: todas as outras têm um
     assunto (o jardim, a cabine, a conversa, o copo) e esta tem uma
     PESSOA, sozinha, na hora em que já não se está esperando ninguém.

     Ela vem da pasta das descartadas e não precisou de quase nada: a luz
     dela já é a luz da casa — tungstênio quente rasante, sombra fechada,
     tijolo cor de bronze. É o caso raro em que a paleta não foi imposta à
     foto, foi encontrada nela. A tinta é a mais baixa do site (.08),
     só para o tijolo não puxar para o rosa; a saturação desce um passo
     porque o vermelho do tijolo é a única cor que compete com o âmbar.

     ── E ela MUDOU DE SEÇÃO: agora é o fecho ───────────────────────────

     A seção das 02h saiu (ver a nota no index.html, entre a pausa e o
     Reservado): entre 00h e o fim a página mostrava quatro vezes a mesma
     fotografia — mulher jovem, cabelo longo, sozinha, sem olhar para a
     lente. Esta era a mais fraca das quatro, porque a frase dela falava da
     CASA e a imagem mostrava uma pessoa.

     Ela ficou, e foi para o rodapé, no lugar da `dourada`. O slot pede
     exatamente o que ela tem: a regra do `object-position: 50% 30%`
     (outro.css) existe para manter um rosto fora de trás do wordmark, e
     aqui não há rosto — está coberto pelo próprio cabelo e pela mão. A
     `dourada` obedecia à mesma regra por amputação, recortada dos ombros
     para baixo; esta obedece por composição, e continua inteira.

     880 → 1020, que é o limite da fonte (rosto.png tem 1023 de largura).
     Ela deixou de ser uma fotografia emoldurada numa seção e passou a ser
     fundo sangrado debaixo de uma resina — o mesmo papel que a `dourada`
     fazia a 1100. Ainda sai mais leve que ela. */
  { saida: 'retrato', de: 'nao-usadas/rosto.png', largura: 1020, q: 72, luz: 1.02, sat: 0.88, tinta: 0.08 },

  /* ── A resina · o fecho ──────────────────────────────────────────────
     Pó em suspensão num facho de luz âmbar sobre preto. Não é fotografia
     da casa: é MATÉRIA, e é a única imagem do site que não mostra lugar
     nenhum.

     Ela existe porque o fecho precisava de uma coisa que o gradiente de
     CSS não sabe fazer — partícula suspensa. O site inteiro é o tempo
     passando; o fecho é o tempo parando, e o desenho de "instante
     guardado" é literalmente uma poeira que não cai. Um radial-gradient
     fecha em volta do nada; isto fecha em volta de alguma coisa.

     640px e qualidade baixa de propósito: é um borrão sobre preto composto
     em `screen` a 40% — resolução aqui é peso sem imagem. */
  { saida: 'particulas', de: 'nao-usadas/textura-particulas.png', largura: 640, q: 58, luz: 1.0 },

  /* ── A pausa das 00h ─────────────────────────────────────────────────
     Duas pessoas no sofá, uma falando no ouvido da outra, a cidade
     acesa na janela atrás. A linha da seção é "A conversa baixa
     sozinha" — esta é a única foto do acervo que É a frase, em vez de
     ilustrá-la. Substituiu um retrato posado. */
  { saida: 'conversa', de: 'conversa.jpg', largura: 900, q: 72, luz: 1.06, sat: 0.86, tinta: 0.12 },

  /* O detalhe da mesma pausa: a rodela de limão sendo posta na borda com
     a colher. É o único gesto de BAR do site inteiro — tudo o mais é
     ambiente, gente ou som, e a casa se chama cocktail bar.

     A foto é de luz carmim e tem a marca do destilado gravada no vidro.
     Os dois problemas se resolvem no mesmo lugar: o recorte fecha na
     borda do copo, na fruta e na colher, e deixa o logotipo fora do
     quadro; a tinta alta traz o carmim para o âmbar da casa. É a foto
     mais tratada da página e a única que precisou de recorte no build. */
  { saida: 'guarnicao', de: 'guarnicao.jpg', corte: { left: 1060, top: 1840, width: 1640, height: 1640 }, largura: 520, q: 74, luz: 1.16, sat: 0.42, tinta: 0.38 }
]

/* O Reservado não tem foto: tem um vídeo de velas. O cartaz sai do PRÓPRIO
   vídeo, no quadro em que ele vai estar quando começar a tocar — sem isso,
   o momento em que o vídeo entra é um salto de enquadramento. O mesmo
   arquivo serve o cartão de reservas. */
const CARTAZES = [
  {
    saida: 'reservado',
    de: 'brand/originais/reservado-velas.mp4',
    em: '2.0',
    largura: 720,
    q: 74,
    luz: 1.2
  }
]

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' kB'

const AMBAR = '#C8892E'

const gravar = async (nome, entrada, { largura, q, luz, sat = 1, tinta = 0, corte }) => {
  let base = sharp(entrada).rotate()

  // recorte antes de tudo: escalar 4000px para depois jogar fora dois
  // terços do quadro é pagar resolução que ninguém vê
  if (corte) base = base.extract(corte)

  base = base
    .resize({ width: largura, withoutEnlargement: true })
    .modulate({ brightness: luz, saturation: sat })

  let saida = base

  if (tinta > 0) {
    // uma cópia tingida de âmbar, composta por cima com alfa parcial: a
    // foto mantém a própria luz mas passa a dividir o viés de cor do site
    const { data } = await base.toBuffer({ resolveWithObject: true })
    const camada = await sharp(data).tint(AMBAR).ensureAlpha(tinta).png().toBuffer()
    saida = sharp(data).composite([{ input: camada, blend: 'over' }])
  }

  const { data, info } = await saida
    .webp({ quality: q, effort: 6 })
    .toBuffer({ resolveWithObject: true })

  await writeFile(`${OUT}/${nome}.webp`, data)
  console.log(`${nome.padEnd(16)} ${kb(data.length)}  ${info.width}×${info.height}`)
  return data.length
}

let total = 0

for (const { saida, de, ...opcoes } of FOTOS) {
  total += await gravar(saida, await readFile(`${ORIG}/${de}`), opcoes)
}

// os cartazes passam pelo ffmpeg antes: sharp não lê mp4
for (const cartaz of CARTAZES) {
  const tmp = `node_modules/.cache/cartaz-${cartaz.saida}.png`
  await run('ffmpeg', ['-v', 'error', '-ss', cartaz.em, '-i', cartaz.de, '-frames:v', '1', '-y', tmp])
  total += await gravar(cartaz.saida, await readFile(tmp), cartaz)
}

console.log('─'.repeat(46))
console.log(`${'total'.padEnd(16)} ${kb(total)}`)
