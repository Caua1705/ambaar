/**
 * Grade da faixa horizontal — gera public/img/faixa-*.webp
 *
 *   node scripts/grade-faixa.mjs
 *
 * Por que existe
 * -------------
 * As cinco fotos da faixa vêm de noites e câmeras diferentes: uma foi feita
 * sob luz vermelha de boate, outra é um jardim esverdeado, outra é uma mesa
 * de DJ quase neutra. A faixa é a única seção do site em que cinco fotos
 * aparecem lado a lado — é onde a diferença de temperatura entre elas fica
 * impossível de não ver.
 *
 * Havia um filter CSS único (--grade-noite) tentando resolver isso em tempo
 * de execução. Não resolve, por dois motivos:
 *
 *   1. Um giro de matiz que leva o vermelho ao âmbar leva o verde ao oliva.
 *      Não existe um valor único que sirva às cinco, porque o defeito de cada
 *      uma é diferente. Corrigir cor é trabalho por imagem.
 *
 *   2. Custo. São cinco imagens grandes recebendo transform a cada quadro
 *      dentro de uma seção pinada; um filter composto sobre elas obriga o
 *      navegador a refiltrar a cada quadro, no telefone, justamente quando a
 *      sequência de quadros da seção seguinte começa a baixar.
 *
 * A grade passa a ser assada no arquivo: custo zero em execução e controle
 * por foto.
 *
 * Como
 * ----
 * Dessatura e clareia (modulate), depois compõe por cima uma cópia tingida de
 * âmbar com opacidade parcial. O resultado não é monocromático — a foto
 * mantém a própria luz — mas todas passam a dividir o mesmo viés de cor.
 * `forca` é o quanto de tingimento cada uma pede: a vermelha pede muito, o
 * jardim pede pouco.
 */
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const AMBAR = '#C8892E'
const LARGURA = 1200
const QUALIDADE = 78

/* saida ← origem, com o quanto cada uma se afasta da paleta */
const FOTOS = [
  { saida: 'faixa-01', de: 'public/img/detalhe-01.webp', sat: 0.62, luz: 1.1, forca: 0.34 },
  { saida: 'faixa-02', de: 'public/img/detalhe-02.webp', sat: 0.66, luz: 1.16, forca: 0.3 },
  { saida: 'faixa-03', de: 'public/img/detalhe-03.webp', sat: 0.5, luz: 1.12, forca: 0.46 },
  { saida: 'faixa-04', de: 'public/img/detalhe-04.webp', sat: 0.58, luz: 1.1, forca: 0.38 },
  // o jardim já é quente e já está na paleta: entra quase só para acompanhar
  { saida: 'faixa-05', de: 'public/img/jardim-noite.webp', sat: 0.8, luz: 1.06, forca: 0.16 }
]

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' kB'

let total = 0

for (const { saida, de, sat, luz, forca } of FOTOS) {
  const origem = await readFile(de)

  const base = sharp(origem)
    .rotate()
    .resize({ width: LARGURA, withoutEnlargement: true })
    .modulate({ saturation: sat, brightness: luz })

  const { data, info } = await base.toBuffer({ resolveWithObject: true })

  // a camada de âmbar: mesma imagem, tingida, com alfa proporcional à força
  const tingida = await sharp(data)
    .tint(AMBAR)
    .ensureAlpha(forca)
    .png()
    .toBuffer()

  const final = await sharp(data)
    .composite([{ input: tingida, blend: 'over' }])
    .webp({ quality: QUALIDADE })
    .toBuffer()

  const destino = `public/img/${saida}.webp`
  await writeFile(destino, final)
  total += final.length

  console.log(`${saida.padEnd(10)} ${kb(final.length)}  ${info.width}×${info.height}  ← ${de.split('/').pop()}`)
}

console.log('─'.repeat(52))
console.log(`${'total'.padEnd(10)} ${kb(total)}`)
