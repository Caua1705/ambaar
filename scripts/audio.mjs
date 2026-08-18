/**
 * A trilha da casa — o único áudio que o site publica.
 *
 *   npm run audio
 *
 * Fecha a última dívida do projeto: `som.js` foi escrito inteiro ANTES de
 * existir arquivo de som — o botão aparecia, acendia, pulsava, alternava,
 * guardava a escolha e perseguia o volume de cada seção sem nada sair do
 * alto-falante. Faltava só isto.
 *
 * ── O material ─────────────────────────────────────────────────────────
 *
 * Um .wav de 44,5 MB, 48 kHz estéreo, 3min52. O nome do arquivo em
 * `brand/originais/` é o do fonograma de propósito: a licença é um assunto
 * pendente e o nome é o que impede a pendência de ser esquecida. Ver a
 * nota no pé.
 *
 * ── As cinco decisões ──────────────────────────────────────────────────
 *
 * 1. MONO. O som aqui não é o acervo do clube, é a sala ao fundo — e
 *    ninguém ouve um site de telefone em estéreo. Metade dos bits pelo
 *    mesmo resultado.
 *
 * 2. 96 kbps. Um degrau abaixo dos 128 que o `som.js` recomendava. Em mono
 *    96 kbps é transparente o bastante para ambiente, e o arquivo é o
 *    único do site que o usuário baixa POR VONTADE — ele não pode custar
 *    uma espera depois do clique.
 *
 * 3. TRÊS MINUTOS (`CORTE`). O original tem 3min52; os últimos 52s são a
 *    saída da faixa, e uma saída não é material de laço. Medido em janelas
 *    de 6s, a energia do trecho cortado é plana (−10 dB de média do começo
 *    ao fim, com um respiro a 120s), e o ponto de emenda liga −10,3 dB com
 *    −11,0 dB: o laço volta para uma energia igual à que deixou.
 *
 * 4. FADE NAS DUAS PONTAS. É o pedido literal, e ele tem duas razões. A
 *    óbvia: um corte de onda no meio de um ciclo é um degrau de amplitude,
 *    e degrau é estalo. A menos óbvia: o MP3 tem atraso de codificador nas
 *    pontas, e nenhum laço de MP3 emenda ao sample. Com 1,2s entrando e
 *    2,5s saindo, o que havia de emenda vira respiração.
 *
 * 5. −16 LUFS (loudnorm em duas passagens). O master do fonograma é um
 *    master de rádio — plano, colado no teto. Jogado dentro do grafo de
 *    ganho do `som.js`, cujos níveis vão de .15 a .80, um sinal desses só
 *    tem para onde ir para baixo. A −16 LUFS a escada de volume da noite
 *    volta a ter degraus audíveis nas duas pontas.
 *
 *    Duas passagens e não uma: a primeira MEDE o trecho já cortado e já em
 *    mono, a segunda aplica um ganho linear com o que foi medido. Em uma
 *    passagem só o loudnorm é dinâmico — ele comprime o que passa, e
 *    comprimir uma faixa já comprimida é o que faz um som "bombear".
 *
 * A regra que atravessa o projeto vale aqui igual: TODA CORREÇÃO É ASSADA
 * NO ARQUIVO. Não existe filtro em tempo de execução em lugar nenhum do
 * site, e agora isso inclui o áudio — nenhum ganho de correção mora no
 * `som.js`, só os níveis narrativos das seções.
 *
 * ── A fonte NÃO é versionada ───────────────────────────────────────────
 *
 * Todo o resto de `brand/originais/` está no git. Este arquivo não, e a
 * regra está no `.gitignore` (`brand/originais/*.wav`). São 44,5 MB por
 * cópia, para sempre, num repositório cujo .git já tem 386 MB — e é um
 * fonograma comercial num repositório hospedado. As duas razões separadas
 * bastariam.
 *
 * Consequência prática: quem clonar o projeto roda `npm run audio` e o
 * script sai em silêncio, do mesmo jeito que `npm run frames` sai quando o
 * mp4 de origem não está lá. O que o site publica (`public/audio/`) está
 * versionado e é o que importa para o build.
 *
 * ⚠︎ LICENÇA. O fonograma é comercial. Para uma prévia interna isso é uma
 * questão de gaveta; para o site no ar, no domínio da casa, é a mesma
 * licença de execução pública que a casa vai precisar de qualquer jeito —
 * só que também para a web. Trocar por uma trilha licenciada não custa
 * uma linha de código: é este arquivo apontando para outro .wav.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { stat, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const run = promisify(execFile)

const FONTE = 'brand/originais/Peggy Gou - (It Goes Like) Nanana.wav'
const SAIDA = 'public/audio/ambar.mp3'

const CORTE = 180 // s — o teto pedido
const ABRE = 1.2 // s — fade de entrada
const FECHA = 2.5 // s — fade de saída
const ALVO = -16 // LUFS

/* Uma fonte que não existe é PULADA EM SILÊNCIO, como nos outros três
   pipelines. Aqui isso não é comodidade: o .wav não é versionado (ver o
   cabeçalho), então este é o estado normal de qualquer clone. */
try {
  await stat(FONTE)
} catch {
  console.log(`(sem ${FONTE} — nada a fazer)`)
  process.exit(0)
}

await mkdir(dirname(SAIDA), { recursive: true })

/* ── Onde o corte começa: DEPOIS do silêncio de cabeça ───

   Medido neste material: o .wav abre com 0,43s de silêncio digital — sobra
   de masterização, e toda faixa comercial tem alguma. Cortar em 0 põe esse
   silêncio DENTRO do laço, e ele cai exatamente na emenda: somado aos 2,5s
   de fade de saída, o laço passaria a ter um buraco de quase 3 segundos a
   cada 3 minutos. Não é estalo — é pior, é uma pausa que parece o arquivo
   tendo acabado, que é o defeito que o `som.js` já anota sobre volume zero.

   Medido e não declarado: se a faixa for trocada, o silêncio de cabeça da
   nova é outro, e um número escrito à mão aqui estaria errado no dia
   seguinte. `silencedetect` a −50 dB responde isso em uma passagem. */
const { stderr: mudo } = await run('ffmpeg', [
  '-nostdin', '-i', FONTE,
  '-af', 'silencedetect=n=-50dB:d=0.1',
  '-f', 'null', '-'
], { maxBuffer: 1 << 22 })

// só interessa o silêncio que começa em 0: os do meio da faixa são música
const cabeca = /silence_start: 0\b[\s\S]*?silence_end: ([\d.]+)/.exec(mudo)
const INICIO = cabeca ? Number(cabeca[1]) : 0

if (INICIO) console.log(`silêncio de cabeça: ${INICIO.toFixed(3)}s — cortado`)

/* `-nostdin` antes de tudo, e ele não é enfeite: `execFile` entrega ao
   filho um stdin em CANO, e o ffmpeg tem um modo interativo que fica
   esperando por ele. A nota inteira, com a medida do travamento de 8
   minutos que isto causou, está em scripts/video.mjs. */
const BASE = ['-nostdin', '-ss', String(INICIO), '-t', String(CORTE), '-i', FONTE, '-ac', '1']

/* ── 1ª passagem: MEDIR ─────────────────────────────────

   O que se mede é o sinal que vai ser entregue — já cortado em 3 minutos e
   já somado em mono. Medir o estéreo inteiro daria outro número, e o ganho
   aplicado na 2ª passagem erraria o alvo pela diferença. */
const { stderr: medida } = await run('ffmpeg', [
  ...BASE,
  // 'info' e não 'error': o relatório do loudnorm sai no nível informativo,
  // e com -v error a 1a passagem devolve um stderr vazio
  '-v', 'info',
  '-af', `loudnorm=I=${ALVO}:TP=-1.5:LRA=11:print_format=json`,
  '-f', 'null', '-'
], { maxBuffer: 1 << 22 })

// o loudnorm escreve o JSON no fim do stderr, depois das linhas de log
const m = JSON.parse(medida.slice(medida.indexOf('{'), medida.lastIndexOf('}') + 1))

console.log(`medido: ${m.input_i} LUFS  ·  pico ${m.input_tp} dBTP  ·  faixa ${m.input_lra} LU`)

/* ── 2ª passagem: APLICAR ───────────────────────────────

   `linear=true` é a razão de existir a primeira passagem: com ele o filtro
   aplica UM ganho constante e não toca na dinâmica. Sem ele o loudnorm
   trabalha adiante, comprimindo — e comprimir um master de rádio, que já
   veio comprimido, é o que produz aquele som que respira sozinho.

   Os fades vêm DEPOIS do loudnorm na cadeia. Antes dele, seriam medidos
   como parte do sinal e o normalizador tentaria desfazê-los. */
const filtros = [
  `loudnorm=I=${ALVO}:TP=-1.5:LRA=11` +
    `:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
    `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}` +
    `:offset=${m.target_offset}:linear=true`,
  `afade=t=in:st=0:d=${ABRE}`,
  `afade=t=out:st=${CORTE - FECHA}:d=${FECHA}`
].join(',')

await run('ffmpeg', [
  ...BASE,
  '-v', 'error',
  '-af', filtros,
  '-c:a', 'libmp3lame',
  '-b:a', '96k',
  '-ar', '44100',
  /* Sem capa, sem tags, sem lixo: o que o navegador baixa é onda. E o
     cabeçalho Xing que o LAME escreve sozinho é o que diz ao Chrome onde o
     áudio de verdade começa e acaba dentro do primeiro e do último quadro
     — é dele que sai a emenda mais justa que um MP3 consegue dar. */
  '-map_metadata', '-1',
  '-write_xing', '1',
  '-y', SAIDA
])

const { size } = await stat(SAIDA)
const { size: bruto } = await stat(FONTE)

console.log(`${SAIDA}  ${(size / 1024).toFixed(0)} kB  ` +
  `(${CORTE}s, mono, 96 kbps — de ${(bruto / 1e6).toFixed(1)} MB)`)
