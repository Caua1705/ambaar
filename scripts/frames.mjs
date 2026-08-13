/**
 * As sequências de quadros do site.
 *
 *   npm run frames
 *
 * Duas, e as duas são a mesma ideia: um PLANO FIXO em que a posição da
 * rolagem é literalmente o estado da cena. É o único lugar do site onde o
 * dedo controla a matéria, e é o que separa esta página de uma pilha de
 * slides com paralaxe.
 *
 *   dusk  o entardecer do jardim, 17h → 20h. As luzinhas acendem, a vela
 *         aparece na mesa, o céu perde a luz.
 *   sala  o salão enchendo, 20h → 23h. A sala está vazia e acesa; ao longo
 *         do curso as pessoas entram, o movimento arrasta os contornos e a
 *         cena satura.
 *
 * Uma muda pela LUZ, a outra pela GENTE. Mesmo mecanismo, assuntos opostos,
 * e é essa rima que dá forma à noite: o Jardim é o que o sol faz, o Salão é
 * o que as pessoas fazem, e o Reservado (vídeo solto, sem scrub) é o que
 * acontece quando ninguém faz mais nada.
 *
 * ── Por que quadro a quadro e não vídeo ────────────────────────────────
 *
 * Buscar quadro em <video> pelo scroll é caro e irregular no telefone, e
 * pula. Um canvas com dois drawImage por quadro de tela não pula. O preço é
 * peso de arquivo, e é por isso que este script existe: ele decide, por
 * sequência, quantos quadros, de onde, e com que teto de bytes.
 *
 * ── A amostragem não é uniforme ────────────────────────────────────────
 *
 * Os dois originais têm trechos de custo e de interesse muito diferentes.
 * A curva de cada sequência concentra os quadros onde a cena muda e passa
 * batido onde ela está parada. Menos arquivo e mais acontecimento no lugar
 * certo.
 *
 * ── Peso ───────────────────────────────────────────────────────────────
 *
 * Cada quadro é reencodado com qualidade decrescente até caber no teto.
 * Quadro escuro fecha em 8 kB com qualidade alta; quadro claro e detalhado
 * precisa descer. Qualidade fixa ou estoura o teto no fim ou destrói o
 * começo à toa.
 */
import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)

/* Amostragem do entardecer. Entrada 0→1 (posição na sequência final),
   saída 0→1 (posição na janela recortada do vídeo).

   O original tem três trechos: um fim de tarde quase parado, a virada da
   luz (as luzinhas acendem, a vela aparece, a parede fica quente) e uma
   noite igualmente parada. A virada é 40% do tempo e recebe 55% dos
   quadros; os dois extremos entram só o suficiente para existirem.

   Em peso isso importa duas vezes: os quadros de DIA são os mais caros do
   site — folhagem em luz alta é ruído de alta frequência puro — e o barato
   é pedir menos deles. */
const VIRADA = (u) => {
  if (u < 0.3) return (u / 0.3) * 0.286
  if (u < 0.85) return 0.286 + ((u - 0.3) / 0.55) * 0.4
  return 0.686 + ((u - 0.85) / 0.15) * 0.314
}

/* Amostragem do salão enchendo. O original vai de sala vazia a pista cheia
   em oito segundos, mas a mudança não é uniforme: tudo acontece nos
   primeiros cinco. Depois disso são três segundos de multidão arrastada que
   já não muda de estado — só de desenho.

   Setenta e cinco por cento dos quadros cobrem os primeiros 60% do vídeo.
   O que se ganha é o momento em que a sala ainda está VAZIA e a primeira
   pessoa entra: é o quadro que conta a história, e numa amostragem linear
   ele passava em dois frames. */
const ENCHE = (u) => (u < 0.75
  ? (u / 0.75) * 0.6
  : 0.6 + ((u - 0.75) / 0.25) * 0.4)

const SEQUENCIAS = [
  {
    nome: 'dusk',
    fonte: 'brand/originais/jardim-timelapse.mp4',
    // o primeiro segundo é dia pleno e idêntico ao segundo: entra um quadro
    // dele, não vinte e quatro
    janela: ['-ss', '1.0'],
    saida: 'public/frames/dusk',
    prefixo: 'd',
    /* Vinte e dois quadros para três horas de luz caindo. O que sustenta um
       número tão baixo é o plano ser fixo: entre dois quadros vizinhos só a
       luz muda, e a seção mistura o par em vez de trocar de um para o outro
       (frames.js). A interpolação linear entre dois estados de luz da mesma
       cena é quase exata — é o resto do movimento que ela não saberia
       inventar, e aqui não há resto. */
    quadros: 22,
    largura: 520,
    teto: 34 * 1024,
    curva: VIRADA,
    // a folhagem gera ruído de alta frequência que o WebP paga caro e que
    // a demão da seção come de qualquer jeito
    desfoque: 0.6,
    denoise: 'hqdn3d=6:4:9:9'
  },

  {
    nome: 'sala',
    fonte: 'brand/originais/salao-enchendo.mp4',
    janela: [],
    saida: 'public/frames/sala',
    prefixo: 's',
    quadros: 22,
    /* 560 e não 520 como o entardecer: esta sequência é o capítulo inteiro,
       sem foto por baixo e sem demão de céu por cima para esconder degrau —
       ela é a única coisa em cena durante uma tela e meia de rolagem. E
       mesmo assim ela é MAIS BARATA que o entardecer, porque a cena é
       escura, lisa e desfocada por natureza: o custo em WebP é quase todo
       gradiente, que é o que ele comprime bem. */
    largura: 560,
    teto: 26 * 1024,
    curva: ENCHE,
    // sem desfoque: o arrasto das pessoas JÁ é o desfoque, e amaciar por
    // cima disso apaga a única aresta viva do quadro (o filete de luz da
    // cabine). Só um denoise leve, para o grão do gerador não virar bloco.
    denoise: 'hqdn3d=3:2:5:5'
  }
]

const TEMP = 'node_modules/.cache/frames'
const QUALIDADES = [76, 68, 60, 52, 44, 36, 28]

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' kB'

/* Uma sequência declarada cujo material ainda não chegou não é um erro: é
   uma vaga. A lista pula em silêncio o que não encontra, para que o
   enquadramento, o número de quadros e o teto de peso possam ser decididos
   no código antes de o arquivo existir. */
const existe = async (caminho) => {
  try {
    await access(caminho)
    return true
  } catch {
    return false
  }
}

let totalGeral = 0

for (const seq of SEQUENCIAS) {
  if (!await existe(seq.fonte)) {
    console.log(`${seq.nome.padEnd(6)} faltando · ${seq.fonte}`)
    continue
  }

  const temp = join(TEMP, seq.nome)
  await rm(temp, { recursive: true, force: true })
  await mkdir(temp, { recursive: true })

  // todos os quadros do original, para que a seleção seja feita por índice
  // e não por uma segunda passada de decodificação
  const filtros = [
    `scale=${seq.largura}:-2`,
    seq.denoise,
    seq.desfoque ? `gblur=sigma=${seq.desfoque}` : null
  ].filter(Boolean).join(',')

  await run('ffmpeg', [
    '-v', 'error',
    ...seq.janela,
    '-i', seq.fonte,
    '-vf', filtros,
    join(temp, 'src_%04d.png'),
    '-y'
  ])

  const brutos = (await readdir(temp)).sort()

  await rm(seq.saida, { recursive: true, force: true })
  await mkdir(seq.saida, { recursive: true })

  let total = 0

  for (let i = 0; i < seq.quadros; i++) {
    const u = seq.quadros === 1 ? 0 : i / (seq.quadros - 1)
    const idx = Math.min(brutos.length - 1, Math.round(seq.curva(u) * (brutos.length - 1)))

    const origem = sharp(join(temp, brutos[idx]))
    const destino = join(seq.saida, `${seq.prefixo}_${String(i + 1).padStart(3, '0')}.webp`)

    let buffer = null
    for (const q of QUALIDADES) {
      buffer = await origem.clone().webp({ quality: q, effort: 6 }).toBuffer()
      if (buffer.length <= seq.teto) break
    }

    await writeFile(destino, buffer)
    total += buffer.length
  }

  totalGeral += total
  console.log(
    `${seq.nome.padEnd(6)} ${String(seq.quadros).padStart(3)} quadros · ${seq.largura}px · ${kb(total)}`
  )
}

console.log('─'.repeat(46))
console.log(`${'total'.padEnd(10)} ${kb(totalGeral)}`)

await rm(TEMP, { recursive: true, force: true })
