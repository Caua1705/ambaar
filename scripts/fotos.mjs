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
     do wordmark e é recortada por ele. */
  { saida: 'jardim-dourado', de: 'jardim-dourado.png', largura: 920, q: 70, luz: 1.06 },

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

  /* ── A cabine · 20h ──────────────────────────────────────────────────
     O DJ visto DE CIMA, cabeça baixa sobre os CDJs, fitas espelhadas na
     parede e a bola de espelhos na quina. Luz de tungstênio, sem flash.

     Ela é a resposta ao buraco nº 1, e é a única fotografia do acervo de
     cabine que passa nos três critérios de recusa do projeto ao mesmo
     tempo: não tem luz vermelha (é âmbar), não tem flash (é contínua) e
     não tem marca de terceiro legível — a camiseta mostra três letras
     soltas e o equipamento aparece de cima, sem logotipo no quadro.

     E não tem ROSTO, que é o que a faz caber aqui. A seção não é sobre um
     DJ; é sobre a noite ter um autor. Uma cara reconhecível transformaria
     a ideia num retrato e a casa num cartaz de line-up.

     880px: é tela cheia dentro de uma moldura, e o assunto é o gesto das
     mãos sobre a mesa. A saturação desce um passo porque as fitas
     espelhadas devolvem um verde-azulado que não é da casa. */
  { saida: 'cabine', de: 'nao-usadas/dj-cabine.png', largura: 880, q: 70, luz: 1.02, sat: 0.86, tinta: 0.08 },

  /* ── A sala antes · 20h ──────────────────────────────────────────────
     O salão vazio: a mesa redonda de mármore acesa por baixo dos dois
     pendentes, o quadro na parede, a cabine encostada no fundo. É
     exatamente o mesmo lugar dos 34 quadros do capítulo 02, visto de outro
     ângulo e sem uma única pessoa.

     Buraco nº 2. Ela divide a tela com a cabine na mesma seção: à
     esquerda a sala sem ninguém, à direita quem vai enchê-la. A seção
     inteira é essa frase em duas imagens.

     760px: ela nunca é vista maior que meia tela. */
  { saida: 'salao-antes', de: 'nao-usadas/salao-som.png', largura: 760, q: 72, luz: 1.04 },

  /* ── O que fica · 04h ────────────────────────────────────────────────
     Um anel esquecido em cima de uma bancada de mármore rachado, atravessada
     por uma réstia de luz. Buraco nº 3, e a fotografia é literalmente um
     TRAÇO: alguém estava aqui e não está mais.

     É a única imagem do site em que há evidência de uma pessoa sem haver
     uma pessoa. Depois de treze telas de gente, o silêncio de um objeto
     esquecido é o que fecha a noite — e é o contrário exato do fecho, que
     é a marca guardando um instante. Aqui a casa não guarda nada: só
     sobrou.

     Sem tinta. A luz dela já é a réstia âmbar sobre pedra escura que a
     paleta inteira do site persegue; tingir seria pintar por cima do
     acerto. */
  { saida: 'fica', de: 'nao-usadas/textura-marmore.png', largura: 780, q: 70, luz: 1.06 },

  /* ── A bruma · dentro do poente ──────────────────────────────────────
     Fumaça atravessada por um facho âmbar sobre preto. Não é fotografia de
     lugar nenhum: é MATÉRIA, irmã do pó do fecho.

     Ela existe para consertar um defeito, e o defeito é o assunto de
     src/styles/poente.css: a faixa de luz que faz a emenda 17h → 20h
     chegava, no pico, a um campo de âmbar CHAPADO — uma tela inteira de
     uma cor só, sem nada dentro. Um retângulo de #C8892E não lê como luz,
     lê como erro de renderização, e a duração não muda isso: 225px de nada
     são tão defeituosos quanto 677.

     Luz precisa de alguma coisa suspensa nela para ser lida como luz. A
     bruma é essa coisa: composta em `screen` dentro da faixa, derivando
     devagar, ela dá ao pico do poente textura, direção e movimento — três
     coisas que uma cor sólida não tem.

     640px e qualidade baixa: é um borrão sobre preto composto a 55%.
     Resolução aqui é peso sem imagem. */
  { saida: 'bruma', de: 'nao-usadas/textura-fumaca.png', largura: 640, q: 58, luz: 1.0 },

  /* ── A troca · 17h ───────────────────────────────────────────────────
     SEÇÃO NOVA, e a imagem que a paga.

     O jardim ao entardecer com o balcão aceso, os dois bancos vazios, as
     luzinhas no chão e o portão aberto para a rua. É a casa no minuto
     entre os dois negócios — o café acabou de fechar e ninguém chegou
     ainda —, e é a única fotografia do acervo em que se vê a CALÇADA.

     Ela estava na pasta das descartadas por causa da luz do portão: o fim
     de tarde na rua é cinza-azulado e o resto do quadro é tungstênio. O
     que a salvou foi medir a mancha em vez de julgar o lote — são 6% do
     quadro, na quina, e ela é o ASSUNTO: a rua é o lado de fora, e o lado
     de fora é o que ainda não entrou. Dessaturar um passo e tingir de
     âmbar puxa o cinza para o bronze sem tocar no tungstênio, que já é a
     paleta. Correção moderada numa mancha pequena; nada de refazer a foto.

     820px: a seção não é sangria total — a fotografia mora numa fresta
     horizontal sobre carvão. */
  { saida: 'casa-dia', de: 'nao-usadas/salao.jpg', largura: 820, q: 72, luz: 1.0, sat: 0.78, tinta: 0.16 },

  /* ── A passagem do Salão · 23h ───────────────────────────────────────
     O corte duro para a fotografia de flash SAIU do capítulo 02, e com ele
     saiu `salao-pista`. Ver a nota no pé deste arquivo.

     O que entra no lugar são duas imagens, e as duas são a mesma frase
     dita duas vezes: o quarto está cheio, e a câmera CHEGA PERTO.

     Primeiro isto — um corpo dissolvido por um giro de obturador, parede
     âmbar, os LEDs da cabine embaixo. Não é uma fotografia DE alguém: é
     uma fotografia de movimento, e é exatamente a mesma matéria dos 34
     quadros que vêm antes dela, que também são arrasto. Por isso ela pode
     entrar por dissolução em vez de por corte: o que muda não é o assunto,
     é a distância.

     720px e qualidade baixa: o arquivo inteiro é borrão. Resolução aqui é
     peso sem imagem. A tinta baixa serve para uma coisa só — os LEDs azuis
     da cabine, que são a única cor fria que o site publica. */
  { saida: 'salao-passagem', de: 'nao-usadas/dj-blur.png', largura: 720, q: 64, luz: 1.02, sat: 0.9, tinta: 0.12 },

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

     880px: tela cheia, e o assunto é a cara. */
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

     880px: é a segunda maior do site depois da hero. Ela é tela cheia numa
     seção de uma ideia só, e a ideia é o rosto. */
  { saida: 'retrato', de: 'nao-usadas/rosto.png', largura: 880, q: 72, luz: 1.02, sat: 0.88, tinta: 0.08 },

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
  { saida: 'guarnicao', de: 'guarnicao.jpg', corte: { left: 1060, top: 1840, width: 1640, height: 1640 }, largura: 520, q: 74, luz: 1.16, sat: 0.42, tinta: 0.38 },

  /* ── O fecho ─────────────────────────────────────────────────────────
     Âmbar dentro de um copo na mão: a marca em uma imagem. */
  { saida: 'mao-copo', de: 'mao-copo.png', largura: 900, q: 74, luz: 1.14 }
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
