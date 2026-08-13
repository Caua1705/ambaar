/**
 * As duas sequências de quadros do site.
 *
 *   npm run frames
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
 * ── pour ──────────────────────────────────────────────────────────────
 * O copo enchendo. Ao contrário do entardecer, esta sequência não é
 * presa ao dedo: ela dispara e corre sozinha, em tempo real, quando a
 * seção chega. Por isso pede taxa de quadros de vídeo (12/s) num curso
 * curto, e não amostragem esparsa num curso longo.
 *
 * Peso: cada quadro é reencodado com qualidade decrescente até caber no
 * teto. Quadro escuro fecha em 8 kB com qualidade alta; quadro claro e
 * detalhado precisa descer. Qualidade fixa ou estoura o teto no fim ou
 * destrói o começo à toa.
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
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
  {
    nome: 'pour',
    fonte: 'brand/originais/liquido.mp4',
    // o primeiro segundo é o copo vazio antes de o fio chegar
    janela: ['-ss', '0.8'],
    saida: 'public/frames/pour',
    prefixo: 'p',

    /* ── Por que 18 quadros a 720px, e não 24 a 520 ──────────────────────

       A passada anterior empilhou três degradações sobre uma fonte que só
       tem 720px de largura: reduzi para 520 (perde 28% da resolução),
       passei um gblur de 0.4 (tira a aresta do cristal, que é justamente o
       que faz um copo parecer vidro) e depois cortei cada quadro em 20 kB
       com qualidade decrescente. O resultado é o que o cliente viu — o
       líquido sem definição e o copo sem borda.

       Agora é o inverso, e a troca é a que o enunciado pede: menos
       quadros, mais qualidade. Largura nativa, sem desfoque nenhum, teto
       de 52 kB. O que sustenta 18 quadros é a seção mistura vizinhos
       (frames.js) e o movimento ser quase monotônico: o fio de líquido
       fica praticamente no mesmo lugar quadro a quadro — quem anda é o
       nível e a linha de espuma, e nível interpola quase exato.

       Amostragem levemente adiantada (u^0.85): o copo enche rápido no
       começo e vai devagar no fim, então o começo precisa de mais
       quadros. */
    quadros: 18,
    largura: 720,
    teto: 52 * 1024,
    curva: (u) => Math.pow(u, 0.85),
    desfoque: 0,
    denoise: null
  }
]

const TEMP = 'node_modules/.cache/frames'
const QUALIDADES = [76, 68, 60, 52, 44, 36, 28]

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' kB'

let totalGeral = 0

for (const seq of SEQUENCIAS) {
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
