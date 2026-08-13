/**
 * A sequência de quadros do site.
 *
 *   npm run frames
 *
 * ── A sequência que saiu ──────────────────────────────────────────────
 * `pour` — o copo enchendo, 18 quadros a 720px, 896 kB — foi apagada
 * junto com a seção que a usava. "A escuta" era uma macro de líquido
 * dourado em tela cheia com três blocos de texto por cima, e o problema
 * nunca foi a compressão: o material é uma macro sem aresta de copo e sem
 * silhueta, e em sangria total ele não lê como um copo enchendo, lê como
 * uma superfície dourada. Não há qualidade de encode que conserte
 * enquadramento.
 *
 * A seção passou a ser a única tela do site sem fotografia (escuta.css) e
 * a sequência deixou de existir. São 896 kB devolvidos ao orçamento — um
 * terço do teto —, e é com eles que o Salão pôde ganhar uma fotografia
 * nova.
 *
 * ── dusk ──────────────────────────────────────────────────────────────
 * O entardecer do jardim, 17h → 20h, em plano fixo. É a única seção do
 * site em que a posição da rolagem É o estado da cena, e por isso ela é
 * quadro a quadro: um crossfade entre duas fotos sob uma demão colorida
 * lê como troca de filtro, e não como o sol caindo. Aqui as luzinhas
 * acendem, a vela aparece na mesa e o céu perde a luz — três eventos
 * discretos que nenhuma interpolação inventa.
 *
 * A amostragem não é uniforme. Os três primeiros segundos do original são
 * dia pleno e mudam pouco; o interesse está entre o dourado e a noite
 * fechada. A curva CORTE concentra os quadros aí: o dia passa rápido, o
 * momento em que a luz vira recebe o dobro de quadros. Menos arquivo e
 * mais evento no lugar certo.
 *
 * Peso: cada quadro é reencodado com qualidade decrescente até caber no
 * teto. Quadro escuro fecha em 8 kB com qualidade alta; quadro claro e
 * detalhado precisa descer. Qualidade fixa ou estoura o teto no fim ou
 * destrói o começo à toa.
 */
import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)

/* Amostragem do entardecer. Entrada 0→1 (posição na sequência final),
   saída 0→1 (posição na janela recortada do vídeo).

   O original tem três trechos de custo e interesse muito diferentes: um
   fim de tarde quase parado, a virada da luz (as luzinhas acendem, a vela
   aparece, a parede fica quente) e uma noite igualmente parada. A virada
   é 40% do tempo e recebe 55% dos quadros; os dois extremos, onde nada
   acontece, entram só o suficiente para existirem.

   Isso importa duas vezes. Narrativamente, o site demora no momento em
   que a luz vira, que é o assunto do capítulo. Em peso, os quadros de
   dia são os mais caros do site — folhagem em luz alta é ruído de alta
   frequência puro, e nenhum ajuste de qualidade os faz caber; o barato é
   pedir menos deles. */
const VIRADA = (u) => {
  if (u < 0.3) return (u / 0.3) * 0.286
  if (u < 0.85) return 0.286 + ((u - 0.3) / 0.55) * 0.4
  return 0.686 + ((u - 0.85) / 0.15) * 0.314
}

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
       (sequencia.js). A interpolação linear entre dois estados de luz da
       mesma cena é quase exata — é o resto do movimento que ela não saberia
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

  /* ── sala ─────────────────────────────────────────────────────────────
   * O plano geral do Salão: a sala enchendo, 20h → 23h, em plano fixo. É o
   * evento que falta ao capítulo 02 — hoje ele é o único dos três em que
   * nada ACONTECE: o Jardim tem o sol caindo, o Reservado tem as chamas, e
   * o Salão tem três fotografias paradas montadas em corte. Montagem é
   * edição, não acontecimento, e o texto da seção promete que a noite
   * encontra o próprio ritmo.
   *
   * A entrada já está declarada e o arquivo de origem ainda não existe:
   * esta lista pula em silêncio o que não encontra (ver o laço abaixo), e
   * é assim que a vaga fica pronta sem quebrar `npm run midia`.
   *
   * O que o vídeo precisa ser, e isto não é preferência — é o que faz 22
   * quadros bastarem:
   *
   *   · CÂMERA TRAVADA. Sem pan, sem dolly, sem drone. A mistura entre
   *     quadros vizinhos (frames.js) é quase exata num plano fixo porque
   *     só a luz e os corpos mudam; com a câmera andando, tudo no quadro
   *     se desloca e 22 quadros viram um soluço.
   *   · 8 segundos bastam. O entardecer inteiro do site saiu de um clipe
   *     de 8,000s — é o mesmo número, o mesmo pipeline, a mesma conta.
   *   · A mudança tem de ser MOVIMENTO E LUZ, não contagem de gente.
   *     Começa com poucos corpos, nítidos, luz mais alta; termina denso,
   *     arrastado pelo obturador, luz baixa. Isso desemboca exatamente na
   *     foto dj-blur, que passa a ser o fecho natural da montagem.
   *
   * Curva linear, ao contrário do entardecer: aqui não há um trecho morto
   * no começo para pular — a sala muda o tempo todo. */
  {
    nome: 'sala',
    fonte: 'brand/originais/salao-cheio.mp4',
    janela: [],
    saida: 'public/frames/sala',
    prefixo: 's',
    quadros: 22,
    largura: 520,
    teto: 30 * 1024,
    curva: (u) => u,
    // cena escura com gente em movimento: menos folhagem que o jardim, mas
    // grão de ISO alto, que o WebP também paga caro
    desfoque: 0.5,
    denoise: 'hqdn3d=5:3:8:8'
  }
]

const TEMP = 'node_modules/.cache/frames'
const QUALIDADES = [76, 68, 60, 52, 44, 36, 28]

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' kB'

let totalGeral = 0

/* Uma sequência declarada cujo material ainda não chegou não é um erro: é
   uma vaga. O site tem uma agora (sala), e ela precisa poder ficar no
   código — com o enquadramento, o número de quadros e o teto de peso já
   decididos — sem derrubar `npm run midia` todo dia até o vídeo existir.
   Quando o arquivo aparecer na pasta, a linha muda de "faltando" para
   quadros gerados sem que ninguém edite nada. */
const existe = async (caminho) => {
  try {
    await access(caminho)
    return true
  } catch {
    return false
  }
}

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
