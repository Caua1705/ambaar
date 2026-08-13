/**
 * Os dois laços do site.
 *
 *   npm run video
 *
 * Vídeo aqui nunca é preso ao dedo. Quando a posição da rolagem É o estado
 * da cena, o material vira sequência de quadros (scripts/frames.mjs); mp4
 * é para o contrário disso — movimento contínuo que corre no tempo dele e
 * não no do usuário. São dois casos, e os dois são planos fixos:
 *
 * reservado  as chamas, em tela cheia atrás do capítulo 03. O fim da noite
 *            pedia movimento sem pedir acontecimento: prender isso ao
 *            scroll seria transformar o fim da noite em evento, que é o
 *            oposto do que a seção diz.
 *
 * liquido    o copo enchendo, dentro da moldura de 46vw da pausa das 20h.
 *            Foi expulso de "A escuta" e o que o condenava era o uso: em
 *            sangria total uma macro de líquido perde a aresta do copo e
 *            vira superfície dourada, e havia texto branco brigando por
 *            cima. Numa moldura pequena com borda visível, a escala volta
 *            — e é o único âmbar-sobre-preto do acervo.
 *
 * Três decisões, iguais para os dois:
 *
 * 1. Velocidade reduzida (setpts). Os dois originais já são quietos; mais
 *    lentos eles passam a se mexer no limiar do perceptível, que é o que
 *    as duas seções querem, e o arquivo encolhe junto — o dobro de
 *    segundos pelo preço dos mesmos quadros.
 *
 * 2. Largura pelo papel, não um teto único. Fundo de tela cheia atrás de
 *    texto com metade do quadro em sombra pede menos pixels do que se
 *    imagina; uma moldura de 46vw pede menos ainda.
 *
 * 3. Sem áudio. A faixa dos originais é ruído de sala e o site é mudo.
 *
 * ── O caso do líquido, que custou 832 kB antes de custar 144 ────────────
 *
 * Bolha é o material mais caro que existe num codec de vídeo: cada quadro
 * traz milhares de pontos novos e nenhum se parece com o do quadro
 * anterior, então não há redundância temporal para explorar — é o
 * equivalente em movimento à folhagem que o frames.mjs paga caro. O
 * primeiro encode (360px, 11s, crf 31) saiu MAIOR que o original.
 *
 * Três cortes, nesta ordem de eficácia:
 *
 *   1. RECORTAR ANTES. A moldura tem proporção quase quadrada e a fonte é
 *      9:16 — 35% da altura codificada era jogada fora pelo object-fit
 *      antes de chegar à tela. Codificar pixel que o CSS descarta é o
 *      desperdício mais bobo que existe, e some com uma linha.
 *   2. ENCURTAR O LAÇO. Cinco segundos de fonte a 1,4 dão sete de laço, e
 *      sete segundos de copo enchendo numa moldura de 46vw é mais do que
 *      qualquer um assiste. Os outros três eram repetição paga.
 *   3. AMACIAR. Meio pixel de desfoque some com a bolha que, a 180px de
 *      lado, ninguém ia ver de qualquer jeito — e ela era metade da conta.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { stat } from 'node:fs/promises'

const run = promisify(execFile)

const LACOS = [
  {
    saida: 'public/video/reservado.mp4',
    de: 'brand/originais/reservado-velas.mp4',
    // meia velocidade: dezesseis segundos pelo preço de oito
    ritmo: 2.0,
    largura: 540,
    fps: 12,
    crf: 30
  },
  {
    saida: 'public/video/liquido.mp4',
    de: 'brand/originais/liquido.mp4',
    /* Cinco segundos de fonte, não os oito. O laço vive numa moldura de
       46vw ao lado de um retrato de tela cheia e de uma frase: ninguém o
       assiste, ele é visto de canto de olho enquanto a hora vira. */
    duracao: 5.0,
    /* menos lento que as velas: o líquido tem uma direção (ele SOBE) e
       abaixo de certa velocidade o gesto some e sobra textura. 1,4 é onde
       o fio ainda cai como fio e o copo ainda enche. */
    ritmo: 1.4,
    /* A moldura é quase quadrada nos dois extremos — 46vw × 22svh no
       telefone, 22vw × 34svh no monitor — e a fonte é 9:16. Este recorte é
       o que o object-fit ia fazer de qualquer jeito, feito antes do encode
       em vez de depois: 720×828 centrado em 46% da altura, que é a mesma
       âncora que o CSS usa (pausa.css). */
    corte: 'crop=720:828:0:175',
    // 320 de largura para uma caixa de 180 a 310 px: cobre o monitor com
    // folga e o telefone com retina
    largura: 320,
    // líquido em queda estroboscopa abaixo de 15; a chama não
    fps: 15,
    crf: 34,
    /* Bolha é ruído de alta frequência puro e, a este tamanho de tela,
       invisível. Meio pixel de desfoque apaga o que ninguém veria e leva
       metade do arquivo junto. */
    denoise: 'hqdn3d=8:6:12:12',
    desfoque: 0.5,
    /* A mesma correção de exposição que toda foto do site recebe assada no
       arquivo (scripts/fotos.mjs) — nenhum filter em tempo de execução. O
       original é âmbar sobre preto puro e, numa moldura de 180px ao lado de
       um retrato de tela cheia, ele fecha demais: o copo vira uma mancha
       escura com um risco claro em cima. Seis pontos de luz devolvem as
       facetas do cristal, que é o que faz a imagem ler como COPO. */
    luz: 'eq=brightness=0.06:saturation=1.05'
  }
]

let total = 0

for (const laco of LACOS) {
  const { saida, de, ritmo, largura, fps, crf } = laco

  const filtros = [
    `setpts=${ritmo}*PTS`,
    laco.corte,
    `scale=${largura}:-2`,
    laco.denoise,
    laco.desfoque ? `gblur=sigma=${laco.desfoque}` : null,
    laco.luz
  ].filter(Boolean).join(',')

  await run('ffmpeg', [
    '-v', 'error',
    // o corte de duração vem ANTES do -i: assim o ffmpeg para de decodificar
    // no ponto, em vez de decodificar tudo e descartar
    ...(laco.duracao ? ['-t', String(laco.duracao)] : []),
    '-i', de,
    '-an',
    '-vf', filtros,
    '-r', String(fps),
    '-c:v', 'libx264',
    '-profile:v', 'main',
    '-pix_fmt', 'yuv420p',
    '-crf', String(crf),
    '-preset', 'slow',
    // um par de quadros-chave por laço basta numa cena parada, e é o que
    // permite ao arquivo ficar pequeno
    '-g', '96',
    // metadados no começo do arquivo: sem isto o navegador precisa do fim
    // do download para começar a tocar
    '-movflags', '+faststart',
    '-y', saida
  ])

  const { size } = await stat(saida)
  total += size
  console.log(`${saida.padEnd(28)} ${(size / 1024).toFixed(0).padStart(5)} kB`)
}

console.log('─'.repeat(38))
console.log(`${'total'.padEnd(28)} ${(total / 1024).toFixed(0).padStart(5)} kB`)
