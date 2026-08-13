/**
 * O laço do reservado.
 *
 *   npm run video
 *
 * Plano fixo à luz de vela: só as chamas se mexem. É o único vídeo que o
 * site publica, e ele existe porque o capítulo 03 pedia movimento sem
 * pedir acontecimento — uma sequência de quadros ao scroll ali seria
 * transformar o fim da noite em evento, que é o oposto do que a seção diz.
 *
 * Três decisões:
 *
 * 1. Meia velocidade (setpts). O original já é quieto; a 12/s a chama
 *    passa a tremer no limiar do perceptível, que é o que a seção quer, e
 *    o arquivo encolhe junto — dezesseis segundos pelo preço de oito.
 *
 * 2. 540px de largura. É fundo de tela cheia atrás de texto, com metade
 *    do quadro em sombra fechada: resolução aqui não é o que se vê.
 *
 * 3. Sem áudio. A faixa do original é ruído de sala e o site é mudo.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { stat } from 'node:fs/promises'

const run = promisify(execFile)

const FONTE = 'brand/originais/reservado-velas.mp4'
const SAIDA = 'public/video/reservado.mp4'

await run('ffmpeg', [
  '-v', 'error',
  '-i', FONTE,
  '-an',
  '-vf', 'setpts=2.0*PTS,scale=540:-2',
  '-r', '12',
  '-c:v', 'libx264',
  '-profile:v', 'main',
  '-pix_fmt', 'yuv420p',
  '-crf', '30',
  '-preset', 'slow',
  // um par de quadros-chave por laço basta numa cena parada, e é o que
  // permite ao arquivo ficar pequeno
  '-g', '96',
  // metadados no começo do arquivo: sem isto o navegador precisa do fim
  // do download para começar a tocar
  '-movflags', '+faststart',
  '-y', SAIDA
])

const { size } = await stat(SAIDA)
console.log(`${SAIDA}  ${(size / 1024).toFixed(0)} kB`)
