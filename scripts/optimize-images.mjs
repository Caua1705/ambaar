/**
 * Otimiza as imagens de public/img: redimensiona, converte para webp e
 * grava no mesmo caminho com a extensão trocada.
 *
 *   npm run optimize
 *
 * Os arquivos de origem que não eram .webp ficam para trás — o script
 * apenas os lista, para que a remoção seja uma decisão explícita.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import sharp from 'sharp'

const DIR = 'public/img'
const MAX_WIDTH = 1400
const QUALITY = 78
const ENTRADA = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const kb = (bytes) => (bytes / 1024).toFixed(0).padStart(6) + ' kB'

const tamanho = async (caminho) => (await stat(caminho)).size

const todos = (await readdir(DIR))
  .filter((nome) => ENTRADA.has(extname(nome).toLowerCase()))
  .sort()

// um arquivo por nome-base: se existir um original ao lado do .webp,
// o original é a fonte — recomprimir o .webp degradaria a cada execução
const porBase = new Map()
for (const nome of todos) {
  const base = nome.replace(/\.[^.]+$/, '')
  const atual = porBase.get(base)
  if (!atual || extname(atual).toLowerCase() === '.webp') porBase.set(base, nome)
}
const arquivos = [...porBase.values()]

if (!arquivos.length) {
  console.log(`Nenhuma imagem encontrada em ${DIR}`)
  process.exit(0)
}

let totalAntes = 0
let totalDepois = 0
const sobras = []

for (const nome of arquivos) {
  const entrada = join(DIR, nome)
  const saida = join(DIR, nome.replace(/\.[^.]+$/, '.webp'))
  const noLugar = entrada === saida

  const antes = await tamanho(entrada)

  // .webp já dentro do limite é saída de uma execução anterior: não mexer
  if (noLugar) {
    const { width } = await sharp(await readFile(entrada)).metadata()
    if (width <= MAX_WIDTH) {
      console.log(`${nome.padEnd(16)} ${kb(antes)}  (já otimizado, ${width}px)`)
      totalAntes += antes
      totalDepois += antes
      continue
    }
  }

  // lê para memória antes de processar: sharp mantém o arquivo de origem
  // aberto, e no Windows isso trava a gravação quando entrada === saída
  const origem = await readFile(entrada)

  const { data, info } = await sharp(origem)
    .rotate() // respeita a orientação EXIF antes de redimensionar
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true })

  await writeFile(saida, data)
  const { width, height } = info

  if (!noLugar) sobras.push(entrada)

  const depois = await tamanho(saida)
  totalAntes += antes
  totalDepois += depois

  const corte = (100 - (depois / antes) * 100).toFixed(1)
  console.log(
    `${nome.padEnd(16)} ${kb(antes)} → ${kb(depois)}  (−${corte}%)  ${width}×${height}`
  )
}

console.log('─'.repeat(58))
console.log(
  `${'total'.padEnd(16)} ${kb(totalAntes)} → ${kb(totalDepois)}` +
    `  (−${(100 - (totalDepois / totalAntes) * 100).toFixed(1)}%)`
)

if (sobras.length) {
  console.log(`\nOriginais mantidos (${sobras.length}):`)
  for (const s of sobras) console.log(`  ${s}`)
  console.log('Remova-os quando confirmar o resultado.')
}
