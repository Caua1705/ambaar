/* A abertura — a carga, sem contador.

   Segura a página enquanto as duas imagens que abrem o site chegam (a hero
   e o primeiro quadro do entardecer) e desenha esse progresso numa linha
   só, do centro para fora.

   O porquê está em abertura.css. O que este arquivo faz de diferente da
   cortina anterior é a ENTREGA: em vez de a cortina descascar e sumir com
   tudo o que tinha dentro, a linha é medida contra o filete da hero, o
   carvão dissolve em volta dela e a hero começa com a linha já no lugar. Os
   dois filetes são o mesmo objeto em telas diferentes, e a troca acontece
   num quadro em que os dois estão exatamente sobrepostos.

   Ao terminar resolve `preloaded`; a timeline da hero espera essa promessa. */

import { gsap, reducedMotion, lenis, refresh, EASE } from './motion.js'

/* As duas imagens que abrem o site. Nenhuma terceira: o resto chega depois
   da abertura, e chega tarde de propósito. */
const CRITICAS = ['/img/hero.webp', '/frames/dusk/d_001.webp']
const LIMITE = 6000 // ms: uma imagem travada não pode prender o site

const abertura = document.querySelector('#abertura')
const linha = document.querySelector('#abertura-linha')

const desbloquear = () => {
  document.documentElement.classList.remove('is-loading')
  lenis?.start()
}

export const preloaded = new Promise((resolve) => {
  if (!abertura) {
    desbloquear()
    resolve()
    return
  }

  document.documentElement.classList.add('is-loading')
  lenis?.stop()

  let carregadas = 0
  let encerrado = false

  /* A linha mede carga de verdade — só que sem algarismo. Cada arquivo que
     chega a abre mais um pedaço, e ela nunca volta atrás. */
  const mirar = (progresso) => {
    gsap.to(linha, {
      scaleX: progresso,
      duration: reducedMotion ? 0 : 0.7,
      ease: 'power2.out'
    })
  }

  /* A entrega. A linha da abertura é levada até a posição EXATA do filete
     da hero antes de o carvão sair — assim o que sobra na tela quando a
     abertura acaba já é, geometricamente, o filete da hero. */
  const sair = () => {
    if (encerrado) return
    encerrado = true

    const rule = document.querySelector('.hero__rule')

    // aba em segundo plano: o rAF está parado e a animação nunca correria.
    // Sai seca — quem volta encontra o site pronto, não uma tela de carga.
    if (reducedMotion || document.hidden) {
      abertura.remove()
      desbloquear()
      refresh()
      resolve()
      return
    }

    if (rule) {
      const caixa = rule.getBoundingClientRect()
      abertura.style.setProperty('--y', `${Math.round(caixa.top + caixa.height / 2)}px`)
    }

    gsap.timeline({
      onComplete: () => {
        abertura.remove()
        // as medidas de pin dependem das imagens já ocuparem espaço — e de
        // a rolagem já estar liberada: travada, o documento mede como se
        // não rolasse e todo gatilho nasceria na posição errada
        refresh()
        resolve()
      }
    })
      // o carvão dissolve EM VOLTA da linha; a linha não se move
      .to(abertura, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0.15)
      // e a rolagem volta enquanto ele ainda está saindo, nunca antes
      .add(desbloquear, 0.5)
  }

  const contar = () => {
    carregadas += 1
    mirar(carregadas / CRITICAS.length)
    if (carregadas === CRITICAS.length) {
      /* Um respiro curto e só. A linha precisa ser vista abrindo, não
         esperada: 260ms é o tempo de ela chegar às bordas, não uma pausa
         inventada para justificar um número na tela. */
      setTimeout(sair, 260)
    }
  }

  for (const src of CRITICAS) {
    const img = new Image()
    // erro de rede não pode travar a abertura: conta como resolvida do mesmo jeito
    img.onload = contar
    img.onerror = contar
    img.src = src
  }

  setTimeout(() => {
    if (!encerrado) { mirar(1); sair() }
  }, LIMITE)
})
