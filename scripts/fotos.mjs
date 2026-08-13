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

  /* ── O clímax do Salão ───────────────────────────────────────────────
     A pista vista de trás da cabine: os CDJs na quina inferior esquerda e
     a sala inteira de pé. É a única fotografia REAL de uma noite cheia no
     acervo, e é o único quadro deitado do site.

     Ela existe para uma coisa só, e a coisa é uma troca de registro. Todo
     o capítulo 02 é um plano gerado — liso, âmbar, silencioso. No fim
     dele o site corta para ISTO: grão, flash, rosto olhando na lente.
     O corte diz "e foi assim de verdade", e é a única vez que o site
     mostra a casa como ela é fotografada, não como ela é desenhada.

     1180px: é o quadro que mais precisa de resolução depois da hero,
     porque é o único com rostos reconhecíveis em tela cheia. A tinta é
     baixa (.16) — o suficiente para a temperatura bater com o plano
     anterior, e não tanto que apague o flash, que é o assunto. */
  { saida: 'salao-pista', de: 'salao-pista.jpg', largura: 1180, q: 68, luz: 1.02, sat: 0.82, tinta: 0.16 },

  /* ── Os três cartões de reserva ──────────────────────────────────────
     Cada cartão mostra o ambiente que se está reservando, e os três têm
     de ler em 33svh de altura com texto por cima. Por isso são os únicos
     arquivos do site abaixo de 800px: eles nunca são vistos grandes. */

  // Jardim: a única foto do acervo em que o jardim aparece À NOITE e com
  // a cabine acesa. Estava na pasta desde o começo, sem uso nenhum —
  // vendia melhor o ambiente do que o quadro de timelapse que estava lá.
  { saida: 'jardim-som', de: 'hero.jpg', largura: 760, q: 72, luz: 1.1 },

  // Salão: a cabine vista de cima, com as pernas da pista em volta. Diz
  // "equipamento" e "gente" no mesmo quadro, que é o que o cartão vende.
  { saida: 'salao-alto', de: 'salao-alto.jpg', largura: 760, q: 70, luz: 1.12, sat: 0.8, tinta: 0.2 },

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
