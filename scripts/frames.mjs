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

/* Amostragem do entardecer, e ela foi remedida CONTRA A LUZ DO ARQUIVO.

   A fonte nova são dois clipes de 8s emendados por dissolve, e medindo a
   luminância média quadro a quadro ela tem duas partes muito diferentes:

     0—8s    a rampa. YAVG cai de 87 a 38 sem parar: o sol sai, as luzinhas
             acendem, a cabine acende, as pessoas chegam e sentam.
     8—12s   o patamar. YAVG fica em 38 e não se move mais. A luz acabou;
             o que continua acontecendo é gente conversando.

   Uma curva LINEAR sobre isso gasta um terço do dedo num trecho onde a luz
   não muda — e a luz é o assunto do capítulo ("o sol cai atrás da
   parreira"). Não é o mesmo erro do Salão, que era pior (75% dos quadros
   na sala vazia), mas é o mesmo tipo de erro: quadro gasto onde nada
   acontece.

   Os primeiros 76% da sequência cobrem os 66,7% de rampa, e os 24% finais
   cobrem o patamar. São 21 quadros a 0,38s na parte que muda e 7 a 0,57s
   na parte que só respira — e os 7 bastam porque o patamar ainda tem
   movimento de gente, que é o que alimenta o laço do fim (chapters.js).

   A curva também decide ONDE cai a emenda dos dois clipes, aos 6,5s. Com
   estes números ela cai entre o quadro 17 (6,24s, primeiro clipe) e o 18
   (6,63s, segundo) — entre duas amostras, nunca em cima de uma. Isso
   importa: um quadro amostrado dentro de uma dissolvência sai com as
   pessoas transparentes e duplicadas, e foi exatamente assim que a
   primeira montagem desta fonte falhou. */
const PONTE = (u) => (u < 0.76
  ? (u / 0.76) * 0.667
  : 0.667 + ((u - 0.76) / 0.24) * 0.333)

/* Amostragem do salão enchendo — e a curva foi INVERTIDA nesta passada.

   ── Por que a passagem não lia ─────────────────────────────────────────

   O original é um timelapse honesto: aos 0s a sala está vazia, aos 8s ela
   está cheia, e no meio as pessoas atravessam o quadro arrastadas pelo
   obturador. A matéria sempre esteve certa. O que estava errado era a
   amostragem.

   Vinte e dois quadros para oito segundos são 2,75 por segundo. A essa
   taxa uma pessoa que atravessa a tela em um segundo aparece em três
   quadros, em três lugares distantes — e três posições distantes do mesmo
   corpo não são uma travessia, são três pessoas parecidas piscando. O
   arrasto do obturador, que é o assunto, virava ruído.

   Pior: a curva antiga dava 75% dos quadros aos primeiros 60% do vídeo,
   isto é, à parte VAZIA. O capítulo gastava três quartos do dedo mostrando
   uma sala sem ninguém e resolvia a chegada da multidão nos últimos cinco
   quadros. A seção que devia ser a mais cinética do site era, em tempo de
   tela, a mais parada dele.

   ── A curva nova ───────────────────────────────────────────────────────

   O peso foi para onde há gente. Os primeiros 12% da sequência cobrem os
   primeiros 30% do vídeo (a sala vazia existe, mas como batida de espera,
   não como assunto), e os 88% restantes cobrem os 70% em que as pessoas
   entram e cruzam. Combinado com 34 quadros em vez de 22, a taxa efetiva
   na parte cheia sobe de 2,7 para cerca de 5,4 por segundo — e a essa taxa
   o mesmo corpo aparece em posições vizinhas, que é o que o olho lê como
   ALGUÉM PASSANDO.

   E há um segundo consumidor destes quadros que a curva antiga também
   estragava: no fim do capítulo a sequência é solta do dedo e passa a
   correr sozinha (chapters.js). Uma sequência que roda a 24/s com quadros
   amostrados de 2,7/s é um stop-motion; com esta curva, é um plano. */
const ENCHE = (u) => (u < 0.12
  ? (u / 0.12) * 0.3
  : 0.3 + ((u - 0.12) / 0.88) * 0.7)

const SEQUENCIAS = [
  {
    nome: 'dusk',
    /* ── A fonte foi refeita: agora o sol CAI de verdade ────────────────

       A versão anterior tinha gente, e ainda assim a queixa voltou. Medindo
       a luminância dela quadro a quadro o motivo aparece inteiro: os 14s
       começavam em YAVG 55 e terminavam em 40. Ela ia de NOITE a noite mais
       cheia. O pôr do sol que a copy promete ("o sol cai atrás da parreira e
       a cabine acende no lugar dele") não estava na tela em momento nenhum —
       e um capítulo que se chama Sunset Session precisa que a rampa exista.

       A fonte nova nasce de uma chapa fotográfica da própria casa
       (`_MG_2083`, recortada em 9:16 em brand/originais/chapas/), editada
       em três estágios de luz e animada entre eles. Ela vai de YAVG 89 a
       38: dia claro → hora dourada → noite. Mesmo enquadramento do começo
       ao fim, porque a chapa é a mesma.

       ── A emenda, e por que ela é um CORTE ──────────────────────────────

       Os dois clipes gerados partiram do MESMO primeiro quadro (o dia), e
       não em cadeia como o plano previa: o segundo devia começar onde o
       primeiro parou. Emendados crus, o resultado era dia→anoitecer, corte,
       dia de novo→noite — a rampa reiniciava no meio.

       O conserto foi medir os dois e cortar o segundo onde a luz dele
       ALCANÇA a do fim do primeiro: YAVG 53, aos 2,5s. Na emenda a luz não
       dá um degrau (53 → 54); o que troca de uma vez é a posição das
       pessoas.

       A primeira montagem pôs meio segundo de dissolve ali e ISSO FALHOU:
       uma das 28 amostras caiu dentro da dissolvência e o quadro publicado
       saiu com as pessoas transparentes, duas de cada. Num plano fixo o
       dissolve tem de ser feito pelo frames.js, que mistura quadros
       vizinhos em tempo de rolagem — assá-lo no arquivo é assar um fantasma
       e depois amostrá-lo.

       Corte seco, então, e a curva PONTE o coloca entre duas amostras.

       Também saiu 1,5s da cabeça do primeiro clipe: ali o YAVG ia de 89 a
       85, isto é, quatro níveis em trinta e seis quadros. Era o aquecimento
       do gerador, e era o trecho mais caro do arquivo (folhagem em luz
       alta a 54 kB o quadro) para não mostrar nada acontecendo.

       O que sobra é monotônico: 87 → 53 → 38, sem volta. */
    fonte: 'brand/originais/jardim-sunset.mp4',
    janela: [],
    saida: 'public/frames/dusk',
    prefixo: 'd',
    /* Vinte e oito sobre 13s, e a curva PONTE os distribui: 19 na rampa
       (0,42s cada) e 9 no patamar (0,55s).

       O número não subiu junto com a qualidade porque o gargalo desta
       sequência nunca foi a taxa: a câmera está LONGE e o assunto é o tempo
       passando, não o arrasto dos corpos. O Salão, que é o contrário — a
       lente dentro da multidão —, é o único capítulo que precisa de 0,24s
       entre quadros. Igualar os dois faria deles o mesmo capítulo. */
    quadros: 28,
    /* 480 → 560, e o teto de 22 kB → 34 kB.

       O teto antigo era ficção. A escada de qualidade desce até 28 e
       ESCREVE o que sobrar, tenha ele cabido ou não — e a sequência
       publicada tinha média de 35 kB contra um teto de 22, isto é, todos
       os 28 quadros saíam no degrau mais baixo da escada. O capítulo
       pagava 981 kB e recebia qualidade 28 em troca.

       O que estourava o teto não era a folhagem, era o GRÃO do gerador:
       ruído fino, aleatório quadro a quadro, o pior caso possível para um
       codec que trabalha por blocos. O denoise abaixo é o que faz a conta
       fechar; o teto novo é o que impede a escada de destruir a imagem
       enquanto ela tenta caber num número que não descrevia nada.

       Com 560 de largura o rosto de quem senta à mesa tem ~17% mais pixel
       de contorno, que é a diferença entre uma pessoa e uma mancha — e
       agora existem pessoas em quase todos os quadros. */
    largura: 560,
    teto: 34 * 1024,
    curva: PONTE,
    /* O patamar da noite fecha em YAVG 38 de 255 — 15% de exposição —, e é
       sobre ele que a seção ainda joga a demão de céu (`.chapter__dusk`) e
       a vinheta global. Somadas, elas entregam as pessoas da última meia
       tela como massa sem contorno.

       Um brilho global não serve: ele levantaria a hora dourada junto e
       achataria a rampa, que é o assunto. A curva abaixo abre só a parte
       de baixo — a sombra sobe ~30%, o meio ~7%, o alto não se move —,
       então o patamar clareia e a rampa continua caindo o mesmo tanto.

       Assado no arquivo, como todo o resto: nenhum filter em tempo de
       execução, em lugar nenhum. */
    luz: "curves=all='0/0 0.2/0.26 0.5/0.535 1/1',eq=saturation=1.05",

    /* 0,5 → 0,2, e o denoise afrouxou junto.

       Os dois existiam para amaciar folhagem em luz alta, quando o pátio
       estava vazio e não havia nada no quadro que precisasse de aresta.
       Agora há: em quase todo quadro alguém está de pé ou sentado à mesa,
       e o rosto é a menor coisa legível da cena. Desfoque e denoise fortes
       comem exatamente essa escala primeiro.

       O grão do gerador ainda precisa sair (é ele que estoura o teto), mas
       6:4:9:9 arrastava contorno de gente junto com ele. 4:3:6:6 tira o
       ruído temporal e deixa a aresta espacial em pé. */
    desfoque: 0.2,
    denoise: 'hqdn3d=4:3:6:6'
  },

  {
    nome: 'sala',
    fonte: 'brand/originais/salao-enchendo.mp4',
    janela: [],
    saida: 'public/frames/sala',
    prefixo: 's',
    /* Trinta e quatro. O número não é uma folga de qualidade, é o que
       separa "gente passando" de "vultos piscando" — ver a nota da curva
       ENCHE acima. */
    quadros: 34,

    /* ── O recorte, e ele foi remedido NO TELEFONE ──────────────────────

       O original é 1080×1920 e tem três faixas horizontais:

         topo      o teto e as duas luminárias. Bonito, e absolutamente
                   parado.
         miolo     a cabine, a parede, o quadro — e a FAIXA EM QUE AS
                   PESSOAS ATRAVESSAM.
         pé        a mesa de mármore redonda em primeiro plano.

       A passada anterior recortou 1080×1250 e escreveu a conta para a TELA
       LARGA. Para este site essa é a conta errada, e o erro custava a
       seção inteira.

       Um quadro de 1080×1250 tem proporção 0,86; a caixa de um telefone
       tem 0,46. O `cover` do canvas preenche a ALTURA e joga fora a
       LARGURA — e a 0,86 contra 0,46 ele jogava fora 47% dela. Metade da
       multidão ficava nas bordas do arquivo, do lado de fora da tela, e o
       que sobrava no meio era o quadro na parede, a cabine e uma pessoa. A
       seção mais cinética do site chegava ao telefone como uma sala escura
       onde alguém passa de vez em quando.

       Quadro mais ALTO na fonte é mais LARGURA visível no telefone. A
       1080×1310 (0,82) o telefone mostra 56% da largura, e a âncora
       horizontal do canvas (0,58 — chapters.js) põe esses 56% em cima da
       porta por onde as pessoas entram, e não em cima da parede.

       Y em 240 e não 285: tira a segunda luminária de cena sem comer a
       moldura do quadro, que é a única aresta clara e imóvel da cena — e
       sem uma aresta parada o arrasto das pessoas não é lido como arrasto.

       O texto abaixo é a conta antiga, mantida porque ela explica por que
       o recorte existe:

       Recortando na fonte, os 1310px que sobram são quase só a faixa do
       meio: a proporção passa de 9:16 para ~7:8, o `cover` tem muito menos
       o que jogar fora, e a multidão passa a ocupar a tela em vez de uma
       tarja no centro dela. É o mesmo material com o dobro do assunto por
       pixel — e ainda sai mais barato, porque 35% dos pixels que saíram
       eram teto liso e mármore em foco.

       ── E a tela larga ──────────────────────────────────────────────────

       Num monitor de ~2:1 o `cover` de um quadro 0,82 exibe só a faixa
       central — 45% da altura. Com o recorte começando em 240, essa faixa
       cai em 600–1190 do original, que é onde as pessoas estão inteiras: a
       cabeça dentro do quadro e o mármore fora dele. Continua sendo a
       segunda tela do projeto, mas não perde nada por isso. */
    corte: { x: 0, y: 240, w: 1080, h: 1310 },

    /* ── O pé ───────────────────────────────────────────────────────────

       A mesa de mármore ocupa o quarto inferior do recorte e é, de longe,
       o objeto mais CLARO do quadro — e o único que não muda em nenhum dos
       34 quadros. O olho vai para o mais claro; a seção sobre gente
       passando entregava o olho a uma pedra parada.

       Ela não pode sair: é o primeiro plano que dá profundidade à sala, e
       sem ele a multidão flutua. O que ela não pode é ser o assunto. Uma
       queda de luz assada no arquivo — do transparente ao carvão ao longo
       do terço final — devolve o mármore à condição de primeiro plano
       escuro sem tirá-lo de cena.

       Assado e não em CSS: é a regra do projeto (nenhum filtro em tempo de
       execução) e aqui ela ainda economiza bytes, porque pixel escuro é
       pixel barato no WebP. */
    /* A faixa começa acima da borda da mesa de propósito. Começando NELA, a
       queda coincidiria com uma aresta que já existe na imagem e as duas
       somadas virariam um degrau; começando antes, o que escurece primeiro
       é a sombra atrás da mesa, e quando a pedra entra a rampa já está em
       movimento. */
    pe: { faixa: 0.38, alfa: 0.92 },

    /* O recorte cobra uma conta de EXPOSIÇÃO, e ela precisa ser paga aqui.

       A luminária do teto era a fonte de luz do quadro e também o objeto
       mais claro dele: ela sozinha segurava a média do fotograma. Cortada
       fora, o que sobra é a faixa da parede e das pessoas — que é mais
       escura —, e a mesma imagem passa a chegar na tela um passo abaixo,
       antes ainda de receber a demão de céu da seção e a vinheta global.

       Meio passo de brilho e um toque de saturação devolvem o que o corte
       levou. É assado no arquivo, como toda correção deste projeto: nenhum
       filter em tempo de execução, em lugar nenhum. */
    luz: 'eq=brightness=0.055:saturation=1.08',

    /* 620 sobre um quadro 35% menor: a densidade de pixel na faixa das
       pessoas sobe ~30% contra os 560 anteriores, e é onde ela importa —
       esta é a única sequência do site em que o assunto tem contorno de
       corpo humano. */
    largura: 620,
    teto: 19 * 1024,
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

/* A queda de luz do pé, montada UMA VEZ por sequência e composta em todos
   os quadros.

   É um PNG de uma coluna de pixel — largura 1 — esticado depois pelo
   `composite`: o gradiente é vertical, então a largura não carrega
   informação nenhuma e gerar a coluna custa 34 bytes em vez de meio
   megabyte de buffer RGBA.

   A curva é um smoothstep, e a escolha foi medida em vez de escolhida.

   Uma rampa RETA de preto sobre uma pedra clara deixa uma faixa cinza
   visível onde ela começa — a mesma "aresta que aparece" que as demãos de
   céu já diagnosticaram uma vez. Uma rampa AO QUADRADO não tem aresta, mas
   adia tudo para o fim: medindo a luminância por linha no quadro
   publicado, a face clara do mármore está entre 78% e 87% da altura, e ali
   a quadrática ainda estava em 0,2 — o pé escurecia depois do assunto.

   O smoothstep tem derivada zero nas DUAS pontas (nasce sem aresta e morre
   sem aresta) e sobe no miolo, que é exatamente onde a pedra está. */
const quedaDoPe = async (largura, altura, { faixa, alfa }) => {
  const linha = Buffer.alloc(altura * 4)
  const inicio = Math.round(altura * (1 - faixa))

  for (let y = inicio; y < altura; y++) {
    const u = (y - inicio) / Math.max(1, altura - inicio)
    linha[y * 4 + 3] = Math.round(u * u * (3 - 2 * u) * alfa * 255)
  }

  return sharp(linha, { raw: { width: 1, height: altura, channels: 4 } })
    .resize(largura, altura, { fit: 'fill', kernel: 'nearest' })
    .png()
    .toBuffer()
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

  /* Todos os quadros do original, para que a seleção seja feita por índice
     e não por uma segunda passada de decodificação.

     O recorte vem ANTES da escala: recortar depois seria escalar 1080×1920
     inteiros para jogar 35% fora — decodificação e reamostragem pagas em
     pixel que não vai para lugar nenhum. */
  const filtros = [
    seq.corte ? `crop=${seq.corte.w}:${seq.corte.h}:${seq.corte.x}:${seq.corte.y}` : null,
    `scale=${seq.largura}:-2`,
    seq.luz,
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
  let queda = null

  for (let i = 0; i < seq.quadros; i++) {
    const u = seq.quadros === 1 ? 0 : i / (seq.quadros - 1)
    const idx = Math.min(brutos.length - 1, Math.round(seq.curva(u) * (brutos.length - 1)))

    let origem = sharp(join(temp, brutos[idx]))
    const destino = join(seq.saida, `${seq.prefixo}_${String(i + 1).padStart(3, '0')}.webp`)

    if (seq.pe) {
      const { width, height } = await origem.metadata()
      queda ??= await quedaDoPe(width, height, seq.pe)
      origem = sharp(await origem.composite([{ input: queda, blend: 'over' }]).png().toBuffer())
    }

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
