/**
 * As fotos que o site publica — manifesto de imagem do projeto.
 *
 *   npm run fotos
 *
 * Cada linha declara origem, largura de publicação, qualidade e o ajuste de
 * luz que a foto pede. Isso substitui o par optimize-images/grade-faixa, que
 * tratava a pasta inteira com um valor só e depois tentava consertar caso a
 * caso em tempo de execução.
 *
 * Duas regras:
 *
 * 1. Correção de cor não acontece no navegador. As fotos novas já chegaram
 *    com a grade âmbar feita, e o que sobra é exposição — que é por foto e
 *    é assada aqui. Nenhum filter em tempo de execução: filtrar imagem de
 *    tela cheia a cada quadro é caro justamente no telefone.
 *
 * 2. A largura é a do papel de cada foto, não um teto único. Fundo de tela
 *    cheia atrás da marca pede mais pixels que uma foto que entra desfocada.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import sharp from 'sharp'

const run = promisify(execFile)
const ORIG = 'brand/originais'
const OUT = 'public/img'

/* luz: multiplicador de brilho assado no arquivo. O site inteiro estava
   escuro demais — fotos a 62–86% de brilho debaixo de duas demãos de preto.
   O passe de luminância subiu a foto e desceu a demão, e a parte da foto
   é esta coluna. */
const FOTOS = [
  // a hora dourada do jardim: é a hero, e é a foto mais nítida do site
  { saida: 'jardim-dourado', de: 'jardim-dourado.png', largura: 920, q: 70, luz: 1.06 },

  /* O bar da casa, ainda vazio, com a rua acabando de escurecer na porta.
     Estava fora do site inteiro até agora, e é o único plano ABERTO que o
     Salão tem: é ele que abre a montagem do capítulo 02, no minuto em que
     a pausa das 20h diz que "o salão enche sem que ninguém perceba".

     Uma pitada de tinta e meio ponto de saturação a menos: o original tem
     verde de folhagem e azul de fim de tarde na porta, e os dois precisam
     recuar meio passo para o quadro pertencer à mesma noite que os três
     seguintes — sem apagar a luz azul, que é justamente o que faz esta ser
     a hora em que a rua acaba. */
  /* 820px e q66, e não 900/74 como as outras: é um plano de FUNDO que
     entra em corte seco, fica três segundos em cena, é escalado 1,06 e
     recebe a demão de céu noturno por cima. O original é folhagem em luz
     baixa — ruído de alta frequência puro, o material mais caro que existe
     em WebP —, e no degrau anterior este arquivo sozinho pesava mais que a
     hero. Aqui ele cai 40% sem diferença visível em cena. */
  { saida: 'salao-bar', de: 'salao.jpg', largura: 820, q: 66, luz: 1.04, sat: 0.88, tinta: 0.12 },

  // a cabine, vista de cima, com o globo espelhado: o Salão
  { saida: 'dj-cabine', de: 'dj-cabine.png', largura: 900, q: 74, luz: 1.16 },
  // o mesmo DJ arrastado: entra por cima da primeira no meio do capítulo
  { saida: 'dj-blur', de: 'dj-blur.png', largura: 760, q: 72, luz: 1.1 },

  // as duas pausas entre capítulos: gente, em tela cheia, sem legenda
  { saida: 'perfil', de: 'perfil.png', largura: 900, q: 74, luz: 1.1 },
  { saida: 'rosto', de: 'rosto.png', largura: 900, q: 74, luz: 1.12 },

  // o fecho: âmbar dentro de um copo, que é a marca em uma imagem
  { saida: 'mao-copo', de: 'mao-copo.png', largura: 900, q: 74, luz: 1.14 },

  /* ── As três que estavam fora ────────────────────────────────────────
     Sobraram da faixa horizontal apagada numa passada anterior. Duas são
     copos na mão — o mesmo gesto das fotos que já entraram, e por isso
     elas emparelham: cada pausa passa a ser uma pessoa E o copo dela.
     A terceira são as mãos na mesa, e é o corte fechado que faltava ao
     Salão.

     tinta: quanto de âmbar é composto por cima. A vermelha vem de luz de
     boate carmim e é a única foto do site fora da paleta; dessaturar e
     tingir a traz para dentro sem apagar a luz própria dela. É o mesmo
     método do antigo grade-faixa, agora com uma foto só — porque agora é
     uma foto só que precisa. */
  { saida: 'copo-dourado', de: 'detalhe-01.jpg', largura: 560, q: 74, luz: 1.02, sat: 0.86, tinta: 0.14 },
  { saida: 'copo-rubi', de: 'detalhe-02.jpg', largura: 560, q: 74, luz: 1.2, sat: 0.5, tinta: 0.34 },
  { saida: 'maos-mesa', de: 'detalhe-03.jpg', largura: 900, q: 72, luz: 1.34, sat: 0.72, tinta: 0.24 }
]

/* O reservado não tem foto: tem um vídeo de velas. O cartaz dele sai do
   próprio vídeo, para que o quadro parado e o quadro em movimento sejam o
   mesmo enquadramento — é ele que aparece antes do vídeo tocar, sem
   movimento nenhum e no cartão de reservas. */
const CARTAZ = {
  saida: 'reservado',
  de: 'brand/originais/reservado-velas.mp4',
  em: '2.0',
  largura: 720,
  q: 74,
  luz: 1.2
}

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' kB'

const AMBAR = '#C8892E'

const gravar = async (nome, entrada, { largura, q, luz, sat = 1, tinta = 0 }) => {
  const base = sharp(entrada)
    .rotate()
    .resize({ width: largura, withoutEnlargement: true })
    .modulate({ brightness: luz, saturation: sat })

  let saida = base

  if (tinta > 0) {
    // uma cópia tingida de âmbar, composta por cima com alfa parcial: a
    // foto mantém a própria luz mas passa a dividir o viés de cor do site
    const { data, info } = await base.toBuffer({ resolveWithObject: true })
    const camada = await sharp(data).tint(AMBAR).ensureAlpha(tinta).png().toBuffer()
    saida = sharp(data).composite([{ input: camada, blend: 'over' }])
    void info
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

// o cartaz do vídeo passa pelo ffmpeg antes: sharp não lê mp4
const tmp = 'node_modules/.cache/cartaz.png'
await run('ffmpeg', ['-v', 'error', '-ss', CARTAZ.em, '-i', CARTAZ.de, '-frames:v', '1', '-y', tmp])
total += await gravar(CARTAZ.saida, await readFile(tmp), CARTAZ)

console.log('─'.repeat(46))
console.log(`${'total'.padEnd(16)} ${kb(total)}`)
