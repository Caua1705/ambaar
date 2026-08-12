/* Seção: a cortina de carregamento (#preloader).

   Segura a página enquanto as duas imagens que abrem o site chegam — a hero
   e o jardim, que é o fundo do capítulo 01 e também o que o manifesto revela.
   O contador segue o progresso real desses dois arquivos, não um relógio.

   Ao terminar, sobe e resolve `preloaded`; a timeline da hero espera por essa
   promessa para só então começar. */

import { gsap, reducedMotion, lenis, refresh } from './motion.js'

const CRITICAS = ['/img/hero.webp', '/img/jardim.webp']
const MIN_EM_CENA = 700 // ms: em cache o contador passaria rápido demais para ser lido
const LIMITE = 6000 // ms: uma imagem travada não pode prender o site

const preloader = document.querySelector('#preloader')
const contador = document.querySelector('#preloader-count')
const marca = preloader?.querySelector('.preloader__mark')

const desbloquear = () => {
  document.documentElement.classList.remove('is-loading')
  lenis?.start()
}

export const preloaded = new Promise((resolve) => {
  if (!preloader) {
    desbloquear()
    resolve()
    return
  }

  document.documentElement.classList.add('is-loading')
  lenis?.stop()

  const inicio = performance.now()
  const mostrado = { valor: 0 }
  let carregadas = 0
  let encerrado = false

  const desenhar = () => {
    const n = Math.round(mostrado.valor * 100)
    if (contador) contador.textContent = n < 100 ? String(n).padStart(2, '0') : '100'
  }

  const mirar = (progresso) => {
    gsap.to(mostrado, {
      valor: progresso,
      duration: reducedMotion ? 0 : 0.6,
      ease: 'power2.out',
      onUpdate: desenhar,
      onComplete: desenhar
    })
  }

  const sair = () => {
    if (encerrado) return
    encerrado = true

    // Aba em segundo plano: o rAF está parado, então o GSAP não corre e a
    // cortina animada ficaria travada até o usuário voltar. Nesse caso ela
    // sai seca — quem volta encontra o site pronto, não uma tela de carga.
    if (reducedMotion || document.hidden) {
      preloader.remove()
      desbloquear()
      refresh()
      resolve()
      return
    }

    gsap.timeline({
      onComplete: () => {
        preloader.remove()
        // as medidas de pin dependem das imagens já ocuparem espaço — e de
        // a rolagem já estar liberada: travada, o documento mede como se
        // não rolasse e todo gatilho nasceria na posição errada
        refresh()
        resolve()
      }
    })
      .to(marca, { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(contador, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0)
      .to(preloader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, 0.3)
      // a rolagem só volta quando a cortina já está saindo, nunca antes
      .add(desbloquear, 0.6)
  }

  // os prazos são de setTimeout, não do ticker do GSAP: em aba oculta o
  // ticker para junto com o rAF e a cortina nunca receberia a ordem de sair
  const concluir = () => {
    const espera = Math.max(0, MIN_EM_CENA - (performance.now() - inicio))
    mirar(1)
    setTimeout(sair, espera)
  }

  const contar = () => {
    carregadas += 1
    if (carregadas === CRITICAS.length) concluir()
    else mirar(carregadas / CRITICAS.length)
  }

  for (const src of CRITICAS) {
    const img = new Image()
    // erro de rede não pode travar a cortina: conta como resolvida do mesmo jeito
    img.onload = contar
    img.onerror = contar
    img.src = src
  }

  setTimeout(() => {
    if (!encerrado) concluir()
  }, LIMITE)
})
