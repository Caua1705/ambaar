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

  // a cabine, vista de cima, com o globo espelhado: o Salão
  { saida: 'dj-cabine', de: 'dj-cabine.png', largura: 900, q: 74, luz: 1.16 },
  // o mesmo DJ arrastado: entra por cima da primeira no meio do capítulo
  { saida: 'dj-blur', de: 'dj-blur.png', largura: 760, q: 72, luz: 1.1 },

  // as duas pausas entre capítulos: gente, em tela cheia, sem legenda
  { saida: 'perfil', de: 'perfil.png', largura: 900, q: 74, luz: 1.1 },
  { saida: 'rosto', de: 'rosto.png', largura: 900, q: 74, luz: 1.12 },

  // o fecho: âmbar dentro de um copo, que é a marca em uma imagem
  { saida: 'mao-copo', de: 'mao-copo.png', largura: 900, q: 74, luz: 1.14 },

  // fumaça do manifesto: textura, não cena
  { saida: 'textura-fumaca', de: 'textura-fumaca.png', largura: 900, q: 70, luz: 1 }
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

const gravar = async (nome, entrada, { largura, q, luz }) => {
  const { data, info } = await sharp(entrada)
    .rotate()
    .resize({ width: largura, withoutEnlargement: true })
    .modulate({ brightness: luz })
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
