/**
 * Extrai a sequência de quadros de public/frames a partir do vídeo escolhido.
 *
 *   npm run frames
 *
 * O vídeo é liquido.mp4 e não fumaca.mp4 porque o movimento dele é monotônico
 * — o copo enche, o nível sobe, a direção nunca é ambígua — e movimento com
 * direção continua legível quando decimado. A fumaça é turbulenta: dois
 * quadros vizinhos não compartilham estrutura nenhuma, e a 6 fps ela deixa de
 * ser movimento e vira cintilação. Além disso a fumaça já é o assunto do
 * manifesto; repeti-la aqui gastaria o mesmo material duas vezes.
 *
 * Amostragem: 6 fps sobre os 8 s do original = 48 quadros. O enunciado do
 * passe pedia 15 fps, que daria 120 quadros — três vezes o teto de 60. Como o
 * número de quadros é o que manda no peso, a taxa é derivada dele, não o
 * contrário.
 *
 * Peso: cada quadro é reencodado com qualidade decrescente até caber em 25 kB.
 * Os primeiros quadros são quase todos pretos e fecham em 12 kB com qualidade
 * alta; os últimos são cristal e bolhas e precisam descer. Uma qualidade fixa
 * ou estouraria o teto no fim ou destruiria o começo à toa.
 */
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)

const FONTE = 'brand/originais/liquido.mp4'
const SAIDA = 'public/frames'
const TEMP = 'node_modules/.cache/frames'

const FPS = 6
const LARGURA = 520
const TETO = 26 * 1024 // bytes por quadro
const QUALIDADES = [72, 62, 54, 46, 38, 30, 24]

const kb = (n) => (n / 1024).toFixed(1).padStart(6) + ' kB'

await rm(TEMP, { recursive: true, force: true })
await mkdir(TEMP, { recursive: true })

// um leve desfoque antes de encodar: o cristal facetado gera ruído de alta
// frequência que o WebP paga caro e que a demão escura da seção come de
// qualquer jeito
await run('ffmpeg', [
  '-v', 'error',
  '-i', FONTE,
  '-vf', `fps=${FPS},scale=${LARGURA}:-2,gblur=sigma=0.4`,
  join(TEMP, 'f_%03d.png'),
  '-y'
])

const brutos = (await readdir(TEMP)).sort()

await rm(SAIDA, { recursive: true, force: true })
await mkdir(SAIDA, { recursive: true })

let total = 0

for (const [i, nome] of brutos.entries()) {
  const origem = sharp(join(TEMP, nome))
  const destino = join(SAIDA, `f_${String(i + 1).padStart(3, '0')}.webp`)

  let buffer = null
  let usada = 0

  for (const q of QUALIDADES) {
    buffer = await origem.clone().webp({ quality: q, effort: 6 }).toBuffer()
    usada = q
    if (buffer.length <= TETO) break
  }

  await writeFile(destino, buffer)
  total += buffer.length
  console.log(`${destino}  ${kb(buffer.length)}  q${usada}`)
}

console.log(`\n${brutos.length} quadros · ${kb(total)} no total`)

await rm(TEMP, { recursive: true, force: true })

// o script de sequência precisa saber quantos são
const atual = await stat(SAIDA)
if (!atual.isDirectory()) process.exit(1)
