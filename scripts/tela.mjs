/* A RÉGUA — `npm run tela`

   Fotografa e MEDE o site numa viewport de telefone de verdade, com o
   movimento ligado e a página rolada até onde se quer olhar. É a única
   coisa em scripts/ que não é pipeline de mídia; ela existe para a regra
   de trabalho do projeto ("rodar o site no navegador", "reproduzir
   empiricamente, medir") poder ser cumprida sem um par de olhos.

   ── Por que não serve o caminho óbvio ───────────────────────────────────

   `chrome --headless --screenshot --window-size=414,896`, no Windows,
   grava um PNG de 414 de largura — e o LAYOUT por trás dele tem 500, que é
   a largura mínima de janela do sistema. O arquivo é um recorte de uma
   tela larga, não uma tela estreita.

   Não é uma sutileza. Numa dessas capturas a frase da carta aparecia
   cortada na borda, e a conclusão foi que ela transbordava a caixa; a
   folha ganhou uma medida local para consertar um defeito que não existia.
   A linha tem 306px numa caixa de 330. O corte era da moldura do arquivo.

   Aqui a viewport vem de `Emulation.setDeviceMetricsOverride`, que não
   passa pelo gerenciador de janelas.

   ── Uso ────────────────────────────────────────────────────────────────

     node scripts/tela.mjs <url> <saida.png> [larg] [alt] [rolagem] \
                           [instantes] _ _ [expressão]

     rolagem     pixels (`3100`), uma LISTA de pixels em degraus
                 (`2100+2900+3300`) ou um seletor (`.copo`)
     instantes   ms depois da rolagem, separados por vírgula: grava um PNG
                 por instante, para pegar o MEIO de um gesto
     expressão   JS avaliado na página; o retorno é impresso

   Tudo o que o console da página cuspir (erros, avisos, exceções) sai
   junto, com a pilha: uma seção que abre bonita com um TypeError por baixo
   não é uma seção que funciona.

   ── Por que a rolagem em degraus ────────────────────────────────────────

   Saltar de 0 direto para o pé de uma seção faz o gatilho de entrada e o
   de saída dispararem na mesma atualização do ScrollTrigger. As duas
   timelines correm juntas, a mais longa escreve por último, e o estado
   final da captura é mentira — foi assim que a saída da carta pareceu
   quebrada por meia hora depois de já estar funcionando. Em degraus, cada
   gesto termina antes de o próximo começar, que é o que um dedo faz. */
import { spawn } from 'node:child_process'
import { writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, saida, larg = '414', alt = '896', rolagem = '0'] = process.argv.slice(2)
if (!url || !saida) {
  console.error('uso: node scripts/tela.mjs <url> <saida.png> [larg] [alt] [rolagem]')
  process.exit(1)
}

const CHROME = process.env.CHROME ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe'

const perfil = await mkdtemp(join(tmpdir(), 'ambar-tela-'))
const porta = 9223 + Math.floor(process.pid % 200)

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
  `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`,
  '--no-first-run', '--no-default-browser-check', 'about:blank'
], { stdio: 'ignore' })

const espera = (ms) => new Promise(r => setTimeout(r, ms))

async function alvo () {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${porta}/json/list`)
      const abas = await r.json()
      const p = abas.find(a => a.type === 'page')
      if (p) return p.webSocketDebuggerUrl
    } catch {}
    await espera(150)
  }
  throw new Error('o Chrome não abriu a porta de depuração')
}

const ws = new WebSocket(await alvo())
await new Promise(r => ws.addEventListener('open', r, { once: true }))

let id = 0
const pendentes = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pendentes.has(m.id)) {
    const { ok, falha } = pendentes.get(m.id)
    pendentes.delete(m.id)
    m.error ? falha(new Error(m.error.message)) : ok(m.result)
  }
})
const cmd = (method, params = {}) => new Promise((ok, falha) => {
  const n = ++id
  pendentes.set(n, { ok, falha })
  ws.send(JSON.stringify({ id: n, method, params }))
})

await cmd('Page.enable')
await cmd('Runtime.enable')

// tudo o que o console cuspir vira saída desta ferramenta: uma seção que
// abre bonita com um TypeError por baixo não é uma seção que funciona
const queixas = []
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails
    queixas.push(`EXCEÇÃO ${d.exception?.description || d.text}`)
  }
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
    const pilha = (m.params.stackTrace?.callFrames || [])
      .slice(0, 6).map(f => `      ${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.lineNumber + 1}`)
    queixas.push(`${m.params.type.toUpperCase()} ${m.params.args.map(a => a.value ?? a.description).join(' ')}\n${pilha.join('\n')}`)
  }
})
await cmd('Emulation.setDeviceMetricsOverride', {
  width: +larg, height: +alt, deviceScaleFactor: 1, mobile: true
})

await cmd('Page.navigate', { url })
await espera(2600)

// rolar: em pixels ou até uma seção
if (rolagem !== '0') {
  /* Uma LISTA de offsets separados por `+` desce em degraus, com pausa
     entre eles. Não é preciosismo: saltar de 0 direto para o pé de uma
     seção faz o gatilho de entrada e o de saída dispararem na mesma
     atualização, e as duas timelines correm juntas — a mais longa escreve
     por último e o estado final da captura é mentira. Descendo em degraus,
     cada gesto termina antes de o próximo começar, que é o que acontece
     com um dedo de verdade. */
  const js = /^[\d.+]+$/.test(rolagem)
    ? rolagem.split('+').map(y => `window.scrollTo(0, ${y})`).join(';await new Promise(r=>setTimeout(r,2000));')
    : `document.querySelector('${rolagem}')?.scrollIntoView()`
  await cmd('Runtime.evaluate', {
    expression: `(async()=>{${js}})()`, awaitPromise: true
  })

  /* O 6º argumento é uma lista de instantes em ms depois da rolagem. Com
     ela dá para fotografar o MEIO de um gesto de classe 2, que corre no
     tempo dele e não no do dedo — o estado final não prova que a aresta
     anda no sentido certo, e é justamente o sentido que estava errado nas
     duas passadas anteriores desta seção. */
  const instantes = (process.argv[7] || '').split(',').filter(Boolean).map(Number)
  if (instantes.length) {
    let antes = 0
    for (const [i, ms] of instantes.entries()) {
      await espera(ms - antes)
      antes = ms
      const q = await cmd('Page.captureScreenshot', { format: 'png' })
      const nome = saida.replace(/\.png$/, `-${String(i + 1).padStart(2, '0')}.png`)
      await writeFile(nome, Buffer.from(q.data, 'base64'))
      console.log(`  ${ms}ms → ${nome}`)
    }
  }
  await espera(2200)
}

const medida = await cmd('Runtime.evaluate', {
  expression: 'document.getElementById("medida")?.textContent || ""',
  returnByValue: true
})
if (medida.result.value) console.log(medida.result.value)

// 8º argumento: uma expressão qualquer, avaliada na página e impressa
if (process.argv[10]) {
  const r = await cmd('Runtime.evaluate', {
    expression: process.argv[10], returnByValue: true, awaitPromise: true
  })
  console.log(JSON.stringify(r.result.value, null, 1))
}

const tiro = await cmd('Page.captureScreenshot', { format: 'png' })
await writeFile(saida, Buffer.from(tiro.data, 'base64'))
if (queixas.length) console.log(queixas.join('\n'))
console.log(`→ ${saida}  ${larg}×${alt}  ${queixas.length ? queixas.length + ' queixa(s)' : 'console limpo'}`)

ws.close()
chrome.kill()
await rm(perfil, { recursive: true, force: true }).catch(() => {})
