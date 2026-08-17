/* A RÉGUA NA TELA — `?diag=1`

   TEMPORÁRIO. Este arquivo existe para responder UMA pergunta e depois sair
   do projeto: "a cortina não pega a tela toda" é uma faixa da tela sem dono,
   e de quantos pixels?

   Por que ele precisa existir: o defeito depende da barra de endereço do
   Chrome do Android indo e vindo, e o Chrome sem interface (`npm run tela`,
   que é a régua do projeto) não tem barra nenhuma — svh, lvh e dvh valem o
   mesmo número lá. Três passadas mediram o que dava para medir aqui e o
   defeito continuou na mão de quem tem o aparelho. Então a régua vai para o
   aparelho.

   ── O que ele desenha ────────────────────────────────────────────────────

     · uma FAIXA MAGENTA sobre qualquer pedaço da tela que a seção da vez
       não esteja cobrindo. Se a queixa for o que parece ser, ela aparece
       enquanto o dedo está na tela e some quando ele solta;
     · um filete ciano na borda de baixo da tela visível;
     · um bloco de números no alto à esquerda.

   ── Como usar ────────────────────────────────────────────────────────────

     1. abra o preview com ?diag=1 no fim do endereço
     2. role até a tela do problema, SEGURE o dedo, print
     3. solte o dedo, print
     4. mande os dois

   Fora de `?diag=1` este arquivo não cria um nó, não registra um ouvinte e
   não custa um quadro. */

const ligado = new URLSearchParams(location.search).has('diag')

if (ligado) {
  /* As superfícies que deveriam cobrir a tela inteira, na ordem do
     documento. É a lista do `--tela`/`--superficie`: uma por seção. */
  const SUPERFICIES = '.hero, .chapter__stage, .copo__stage, .pista__stage, ' +
    '.brinde__stage, .passagem__stage, .pausa__stage, .quemfica__stage, .outro'

  const caixa = document.createElement('div')
  caixa.style.cssText = `position:fixed;top:0;left:0;z-index:99999;
    font:11px/1.45 monospace;color:#0f0;background:rgba(0,0,0,.82);
    padding:6px 8px;pointer-events:none;white-space:pre;max-width:100%`

  /* A faixa que prova a queixa: ela só tem altura quando existe um pedaço
     da tela que a seção da vez não cobre. */
  const falta = document.createElement('div')
  falta.style.cssText = `position:fixed;left:0;right:0;z-index:99998;
    background:rgba(255,0,255,.55);pointer-events:none;height:0`

  const borda = document.createElement('div')
  borda.style.cssText = `position:fixed;left:0;right:0;height:2px;
    background:#0ff;z-index:99999;pointer-events:none`

  document.body.append(caixa, falta, borda)

  /* Uma sonda por unidade: a única forma de LER svh/lvh/dvh é medir um
     elemento que as use. */
  const sonda = (unidade) => {
    const el = document.createElement('div')
    el.style.cssText = `position:fixed;top:0;left:-9999px;width:1px;height:100${unidade}`
    document.body.append(el)
    return () => Math.round(el.getBoundingClientRect().height)
  }
  const svh = sonda('svh')
  const lvh = sonda('lvh')
  const dvh = sonda('dvh')

  let dedo = '—'
  addEventListener('touchstart', () => { dedo = 'SEGURANDO' }, { passive: true })
  addEventListener('touchend', () => { dedo = 'solto' }, { passive: true })

  /* ── O pior instante fica GRAVADO ───────────────────────────────────────

     A primeira versão disto só mostrava o agora, e isso põe no cliente a
     tarefa de acertar o print no quadro certo de um gesto — que é
     exatamente o que já falhou. Aqui o painel guarda o pior valor que
     passou, com o contexto dele. Basta fazer o gesto e fotografar depois,
     com calma.

     E guarda também o intervalo de cada medida: se svh, lvh, dvh, a altura
     visível ou a innerHeight variarem em algum momento do gesto, o mínimo e
     o máximo mostram — é a diferença entre "a tela mudou de tamanho" e "a
     tela é a mesma e o defeito é outro", que é a pergunta que sobrou. */
  const faixa = { }
  const anotar = (nome, v) => {
    const f = faixa[nome] ??= { min: v, max: v }
    if (v < f.min) f.min = v
    if (v > f.max) f.max = v
  }
  const mostrar = (nome) => {
    const f = faixa[nome]
    if (!f) return '?'
    return f.min === f.max ? `${f.min}` : `${f.min}→${f.max}  MUDOU`
  }

  let pior = { d: -1, texto: 'nada ainda' }

  /* ── O que conta como "a cortina não pega a tela toda" ──────────────────

     NÃO é estar no meio de duas seções: o documento é contínuo, uma seção
     começa exatamente onde a outra acaba, e ver metade de cada uma no meio
     de uma rolagem é rolagem, não defeito.

     O defeito é uma superfície de tela cheia ser MAIS CURTA que a tela
     visível. Aí ela não consegue cobrir a tela em posição nenhuma — sempre
     sobra uma faixa mostrando a vizinha, e a faixa fecha sozinha no instante
     em que a tela visível encolhe de volta. É essa diferença, em pixels, que
     este número mede. */
  const ler = () => {
    const alturaVisivel = Math.round(window.visualViewport?.height ?? innerHeight)

    /* A seção da vez é a que cobre o MEIO da tela — o mesmo critério do
       observador que decide o relógio e o texto vertical. */
    const meio = document.elementFromPoint(innerWidth / 2, alturaVisivel / 2)
    const dona = meio?.closest(SUPERFICIES)
    const r = dona?.getBoundingClientRect()

    const curta = r ? Math.round(alturaVisivel - r.height) : 0
    const buraco = Math.max(0, curta)

    /* A faixa é desenhada onde ela apareceria: colada na borda de baixo da
       superfície da vez. */
    falta.style.top = (r ? Math.round(r.bottom) : 0) + 'px'
    falta.style.height = buraco + 'px'
    borda.style.top = (alturaVisivel - 2) + 'px'

    /* A pior superfície da página, não só a da vez: basta UMA ser curta para
       a queixa poder acontecer em algum ponto. */
    let curtaMax = { nome: '—', d: 0 }
    for (const el of document.querySelectorAll(SUPERFICIES)) {
      const d = Math.round(alturaVisivel - el.getBoundingClientRect().height)
      if (d > curtaMax.d) curtaMax = { nome: el.className.split(' ')[0] || el.tagName, d }
    }

    const nome = dona ? (dona.className.split(' ')[0] || dona.tagName) : '?'

    anotar('visivel', alturaVisivel)
    anotar('inner', innerHeight)
    anotar('svh', svh())
    anotar('lvh', lvh())
    anotar('dvh', dvh())

    if (curtaMax.d > pior.d) {
      pior = {
        d: curtaMax.d,
        texto: `${curtaMax.d}px em ${curtaMax.nome}, dedo ${dedo}, scrollY ${Math.round(scrollY)}, visivel ${alturaVisivel}`
      }
    }

    caixa.textContent = [
      `── DIAG ATIVO ──`,
      `dedo         ${dedo}`,
      `agora        falta ${buraco}px  ${buraco ? '<<<< CURTA' : 'ok'}`,
      `PIOR GRAVADO ${pior.texto}`,
      ``,
      `secao        ${nome}   topo ${r ? Math.round(r.top) : '?'}  alt ${r ? Math.round(r.height) : '?'}`,
      `visivel      ${mostrar('visivel')}`,
      `innerHeight  ${mostrar('inner')}`,
      `svh          ${mostrar('svh')}`,
      `lvh          ${mostrar('lvh')}`,
      `dvh          ${mostrar('dvh')}`,
      `scrollY      ${Math.round(scrollY)}`
    ].join('\n')

    requestAnimationFrame(ler)
  }

  requestAnimationFrame(ler)
}
