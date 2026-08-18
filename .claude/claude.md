# ÂMBAR — regras do projeto

## Git
- NUNCA commitar ou dar push na `main` sem eu pedir explicitamente.
- Se a branch atual for `main`, PARE e me avise antes de qualquer alteração.
- Trabalhar sempre em `dev`, criando-a a partir da `main` se não existir.
- Ao terminar, me devolver o link do preview da Vercel da branch.
- Preview da `dev`: https://ambaar-git-dev-cauas-projects-3c9f6aea.vercel.app


## O projeto
Site de apresentação do Âmbar — cocktail bar e listening club que abre em
Fortaleza em 2026, dentro de um café existente. O café fecha às 17h e o Âmbar
abre: mesma sala, mesmas cadeiras. Esse handover é o fato mais distintivo da casa.

A noite começa no jardim (sunset), migra para o salão (ambiente principal, onde
a festa acontece) e tem um espaço reservado mais íntimo junto dele. O Reservado
não é o fim da noite — é uma opção dentro dela.

Um relógio conta as horas ao longo do site. O usuário rola e a noite avança.

Conceito de marca: âmbar é tempo preservado. O site é sobre o tempo passando;
a marca é sobre o tempo parando.

O site não converte. Ele seduz.

## Não mudar nunca
- Paleta: carvão #0D0D0D, âmbar #C8892E, bronze #6B4A2E, concreto #77736E, fumê #1A1A1A
- Tipografia: Cormorant Garamond (o que alguém diz) + Jost (o que a casa declara)
- Página única, sem rotas

## Regras de construção
- Mobile-first e mobile-only na prática. Verificar sempre a 414×896 e 360×800.
- `scrub` só onde a posição do scroll É um estado. Texto nunca usa scrub —
  entra no gatilho, roda na própria velocidade, fica.
- Todo efeito ligado ao scroll tem que ser reversível.
- Animar apenas transform, opacity e clipPath.
- Sem sombra em lugar nenhum. Profundidade vem de dois degraus de luminância.
- Orçamento de peso: 3MB. Reportar sempre o total.
- `prefers-reduced-motion`: sem Lenis, sem pin, sem scrub, sem canvas.

## Direção de arte
- Máximo cinco elementos por tela. Uma ideia por seção.
- O âmbar tipográfico é raro. Se aparecer em toda tela, deixa de ser acento.
- Cada emenda entre seções é um acontecimento, não um fade. Duas emendas
  vizinhas não usam o mesmo dispositivo.
- Referência de linguagem: Lusion, Locomotive, Active Theory, Resn.

## Como trabalhar
- Antes de qualquer alteração, rodar o site no navegador e rolar do começo ao fim.
- Passadas anteriores entregaram código morto (CSS não importado, seletores
  inexistentes). Não confie em comentário nem em relatório anterior — verifique.
- Bugs: reproduzir empiricamente, medir, corrigir, reproduzir de novo.
- Ao final de cada passada, reportar: decisões tomadas sem eu pedir, o que
  considerou e descartou, rolagem por seção, peso final, e o que continua fraco.

## Arquitetura

### Estrutura

```
index.html            uma página, uma <section> por tela, na ordem da noite.
                      Os comentários dele são o projeto — o plugin do
                      vite.config.js os remove NO BUILD (42 kB → 12 kB) sem
                      tocar no arquivo de origem.
src/
  main.js             só imports, e a ORDEM importa (ver abaixo)
  style.css           só @import, e a ORDEM importa (ver abaixo)
  scripts/            um arquivo por seção + 3 transversais
  styles/             um arquivo por seção + 5 transversais
scripts/              os pipelines de build de mídia (.mjs, rodam no Node)
brand/originais/      material bruto. NÃO é publicado, não vai para o site
public/               o que o Vite copia cru para o build
```

Regra de ouro do projeto: **cada seção é um trio** — o bloco no `index.html`
(o porquê), um `styles/nome.css` (a composição) e um `scripts/nome.js` (o
tempo). Os três se referenciam entre si nos comentários.

### src/scripts/

Três transversais, que não desenham seção nenhuma:

| arquivo | papel |
|---|---|
| `motion.js` | O núcleo. Cria o Lenis, registra o ScrollTrigger, lê `prefers-reduced-motion` e exporta as três classes de movimento: `entrada`/`autonomo` (classe 2, dispara e corre sozinho), `laco` (classe 3, ambiente), `relogioComPiso` (classe 3½, corre no tempo mas a rolagem empurra). Também `EASE`, `splitChars`, `splitLine` e `congelarAmbiente`. **Nenhuma seção deve criar Lenis, ticker ou rAF próprio.** |
| `frames.js` | O player de canvas das sequências. Sem opinião de seção: `criarSequencia({ palco, canvas, total, caminho, ancora })` devolve `.desenhar(v)` e `.carregarPerto(el, margem)`. |
| `sections.js` | Um observador só decide qual seção manda na tela e publica o evento `secao:ativa`. Dele saem o texto vertical, o item ativo do menu, o losango do fio, o relógio e o volume. |

Uma por seção, na ordem da página:

| arquivo | o que controla |
|---|---|
| `abertura.js` | A carga. Segura a página até a hero e o 1º quadro do entardecer chegarem; exporta a promessa `preloaded` |
| `hero.js` | A marca entrando a partir do filete e a saída dela (scrub) |
| `chapters.js` | Os três `.chapter` (Jardim, Salão, Reservado): permanência sticky, sequência quadro a quadro, véu do entardecer, entrada de texto e as três saídas (`data-saida`: apaga/parte/fecha) |
| `copo.js` | 19h, a carta. Fundo assentando + o inset deslizando pela borda direita |
| `pista.js` | 22h. Dois quadros que se cruzam (classe 2) sobre o arrasto derivando (classe 3) |
| `brinde.js` | 23h. A seção mais curta em código: uma frase em duas metades |
| `passagem.js` | 00h. A câmera entrando em três estágios até achar um rosto |
| `pausa.js` | 01h. As bordas dos dois quadros abrindo + deriva lateral |
| `quemfica.js` | 03h. A faixa vertical abrindo da direita para a esquerda |
| `reservas.js` | A emenda de entrada da escolha |
| `outro.js` | O fecho: a resina, o pó, o filete recolhendo ao ponto, e o congelamento de tudo o que se move |

E as âncoras fixas: `relogio.js` (o algarismo 17h→03h), `spine.js` (o fio
com o losango), `topbar.js` (o cabeçalho, entra quando a hero sai),
`som.js` (o botão de play e todo o grafo de Web Audio), `reveal.js`
(entradas genéricas `.reveal` — hoje só as reservas; seções com
`[data-choreo]` são puladas de propósito).

**A ordem no `main.js` não é estética.** `motion.js` primeiro (cria o Lenis
antes de qualquer timeline); `relogio.js` **antes** de `sections.js`, porque
o relógio é ouvinte do evento `secao:ativa` e precisa existir antes de o
observador publicar a primeira leitura.

### src/styles/

Um arquivo por seção, mais `tokens.css` (paleta, tipografia, escala,
as duas demãos de céu `--ceu-dia`/`--ceu-noite`), `base.css` (reset, voz de
máquina, estados de entrada), `grain.css` (grão + vinheta globais),
`campo.css` (os filetes do espectro) e `vrail.css`/`spine.css`.

**A ordem dos `@import` no `style.css` importa**: as âncoras fixas
(`relogio`, `campo`, `som`, `vrail`, `spine`, `grain`) vêm por último
porque reservam faixa nas seções acima.

### Pipeline de quadros — `npm run frames`

`scripts/frames.mjs`. Precisa de **ffmpeg no PATH**; usa `sharp`.

Existe porque buscar quadro em `<video>` pelo scroll pula no telefone, e
dois `drawImage` por quadro de tela não pulam. Gera duas sequências:

| seq | fonte | saída | quadros |
|---|---|---|---|
| `dusk` | `brand/originais/jardim-sunset.mp4` | `public/frames/dusk/d_001.webp`… | 28 a 560px, teto 34 kB |
| `sala` | `brand/originais/salao-enchendo.mp4` | `public/frames/sala/s_001.webp`… | 34 a 620px, teto 19 kB |

O fluxo, por sequência: ffmpeg extrai **todos** os quadros para
`node_modules/.cache/frames` aplicando, nesta ordem, `crop` → `scale` →
`luz` → `denoise` → `desfoque`; depois a **curva de amostragem** escolhe
quais índices viram arquivo; depois cada quadro é reencodado em WebP
descendo a escada `[76, 68, 60, 52, 44, 36, 28]` **até caber no teto**.

Duas coisas que não são detalhe:

- **A amostragem não é uniforme.** `PONTE` (dusk) e `ENCHE` (sala) são
  funções que concentram quadros onde a cena muda. Mexer nelas muda o
  ritmo do capítulo, e no caso do `dusk` também move onde cai a emenda dos
  dois clipes — ela precisa cair **entre** duas amostras, nunca em cima de
  uma, ou o quadro sai com gente transparente e duplicada.
- **A saída é apagada e refeita** (`rm -rf` em `public/frames/<nome>`). Não
  edite nada ali à mão.

Uma sequência cujo material não existe é **pulada em silêncio**, de
propósito: dá para decidir enquadramento, contagem e teto antes de o
arquivo chegar.

### Pipeline de fotos — `npm run fotos`

`scripts/fotos.mjs`. Usa `sharp`; só precisa de ffmpeg para os *cartazes*
(quadro único extraído de um mp4, ex. o pôster do Reservado).

`brand/originais/**` → `public/img/<nome>.webp`. Cada linha do array `FOTOS`
declara `saida`, `de`, e opcionalmente `corte`, `largura`, `q`, `luz`,
`sat`, `tinta`. O tratamento é: `extract` (recorte antes de tudo — escalar
4000px para jogar dois terços fora é resolução que ninguém vê) → `resize` →
`modulate` (brilho/saturação) → composição de uma camada tingida de âmbar
com alfa `tinta` → WebP.

**A largura é o papel da foto, não um teto único** — um clímax em tela
cheia e uma miniatura de lista não têm a mesma medida.

Regra que atravessa o projeto e nasce aqui: **toda correção de exposição é
assada no arquivo**. Não existe `filter` em tempo de execução em lugar
nenhum do site.

### Pipeline de vídeo — `npm run video`

`scripts/video.mjs`. Um arquivo só: `reservado-velas.mp4` →
`public/video/reservado.mp4` (540px, 12 fps, sem áudio, `+faststart`).
Vídeo aqui **nunca** é preso ao dedo — quando a rolagem É o estado da cena,
o material vira sequência de quadros.

### Pipeline de áudio — `npm run audio`

`scripts/audio.mjs`. Um arquivo só: a trilha bruta (`.wav`) →
`public/audio/ambar.mp3` — 180s, mono, 96 kbps, −16 LUFS, com fade nas duas
pontas para o laço não estalar. Duas passagens de `loudnorm` (mede, depois
aplica ganho linear), e o silêncio de cabeça do original é detectado e
cortado, porque ele cairia dentro do laço.

Duas coisas que não são detalhe:

- **A fonte `.wav` NÃO é versionada** (`.gitignore`), ao contrário de todo o
  resto de `brand/originais/`: 44,5 MB por cópia, e é um fonograma
  comercial. Num clone sem ela o script sai em silêncio, como os outros.
- **O áudio não entra no carregamento inicial.** O `<audio>` só é construído
  no primeiro toque do botão e nasce com `preload="none"`. Medido no build:
  0 bytes de áudio na carga da página.

`npm run midia` roda os quatro em sequência.

### Onde ficam os assets

| caminho | o que é |
|---|---|
| `brand/originais/` | material bruto (mp4, wav, png, jpg, chapas). **Fora do build.** Todo asset publicado nasce daqui |
| `brand/originais/nao-usadas/` | material já triado que continua disponível |
| `public/img/` | 17 fotos `.webp`, saída do `npm run fotos` |
| `public/frames/dusk/`, `public/frames/sala/` | 28 + 34 quadros, saída do `npm run frames` |
| `public/video/reservado.mp4` | saída do `npm run video` |
| `public/audio/ambar.mp3` | 2,1 MB, saída do `npm run audio`. **Não conta no carregamento inicial** |
| `public/brand/losango.svg`, `public/favicon.svg` | únicos assets escritos à mão |

Tudo em `public/` é copiado **cru** pelo Vite e referenciado por caminho
absoluto (`/img/hero.webp`), nunca por import.

### Dívidas conhecidas

- ~~**`public/audio/` não existe.**~~ **Paga.** O arquivo existe, o botão
  toca, e nenhuma linha do `som.js` mudou por causa dele — a constante
  `FAIXA` já apontava para o caminho certo desde o primeiro dia.
- **O endereço do rodapé é inventado** (`SUA RUA, 000 · FORTALEZA CE`, no
  `index.html`). É a última coisa placeholder do site — o WhatsApp já é o
  número da casa.
- **A licença da trilha está pendente.** O fonograma é comercial. Para o
  site no ar isso precisa de licença de execução pública para web, ou de
  uma trilha licenciada no lugar (trocar o `.wav` de origem, nada de
  código).
- **`prioridadeRefresh` (motion.js) é código morto.** Ele existia para
  ordenar o recálculo dos pins; os capítulos viraram `sticky` e ninguém
  mais o importa. Confirmado por busca, não por comentário.