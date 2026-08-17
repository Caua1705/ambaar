/**
 * O laço do Reservado — o único vídeo que o site publica.
 *
 *   npm run video
 *
 * Vídeo aqui nunca é preso ao dedo. Quando a posição da rolagem É o estado
 * da cena, o material vira sequência de quadros (scripts/frames.mjs); mp4 é
 * para o contrário disso — movimento contínuo que corre no tempo dele e não
 * no do usuário.
 *
 * Só o capítulo 03 pede isso. Plano fixo à luz de vela, só as chamas se
 * mexendo: o fim da noite pedia movimento sem pedir acontecimento, e prender
 * isso ao scroll seria transformar o fim da noite em evento, que é o oposto
 * do que a seção diz. Os capítulos 01 e 02 são o contrário — neles a rolagem
 * É o sol caindo e a sala enchendo — e por isso são quadro a quadro.
 *
 * ── O laço do copo saiu ────────────────────────────────────────────────
 *
 * Existiu um segundo laço: uma macro de líquido enchendo um copo, dentro da
 * moldura da pausa das 20h. Saiu junto com a seção. A pausa das 20h foi
 * absorvida pelo capítulo 02 — o salão vazio virou o primeiro quadro do
 * próprio capítulo — e sem aquela moldura o laço não tinha onde ser
 * pequeno e emoldurado, que eram as duas condições que o faziam funcionar.
 *
 * Mantê-lo teria sido guardar um efeito pelo efeito: 142 kB e um <video> a
 * mais para uma imagem que já não tinha argumento. O original continua em
 * brand/originais/liquido.mp4.
 *
 * ── Três decisões ──────────────────────────────────────────────────────
 *
 * 1. Meia velocidade (setpts). O original já é quieto; a 12/s a chama passa
 *    a tremer no limiar do perceptível, que é o que a seção quer, e o
 *    arquivo encolhe junto — dezesseis segundos pelo preço de oito.
 *
 * 2. 540px de largura. É fundo de tela cheia atrás de texto, com metade do
 *    quadro em sombra fechada: resolução aqui não é o que se vê.
 *
 * 3. Sem áudio. A faixa do original é ruído de sala e o site é mudo.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { stat } from 'node:fs/promises'

const run = promisify(execFile)

const FONTE = 'brand/originais/reservado-velas.mp4'
const SAIDA = 'public/video/reservado.mp4'

/* `-nostdin` antes de tudo, e ele não é enfeite.

   `execFile` entrega ao filho um stdin em CANO, e um cano aberto que nunca
   fecha não é o mesmo que ausência de entrada: o ffmpeg tem um modo
   interativo (q para sair, + e - para o nível de log) e fica esperando por
   ele. Medido nesta passada: as fotos todas terminaram em 10 segundos e o
   processo ficou 8 MINUTOS parado no cartaz, sem escrever nada e sem erro.

   O defeito é latente desde que estes pipelines existem — ele só não
   aparecia porque a máquina onde a mídia foi gerada tinha um stdin que
   fechava. `-nostdin` diz ao ffmpeg para não ler entrada nenhuma, que é a
   verdade: aqui ninguém vai digitar nada. */
await run('ffmpeg', [
  '-nostdin',
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
  // metadados no começo do arquivo: sem isto o navegador precisa do fim do
  // download para começar a tocar
  '-movflags', '+faststart',
  '-y', SAIDA
])

const { size } = await stat(SAIDA)
console.log(`${SAIDA}  ${(size / 1024).toFixed(0)} kB`)
