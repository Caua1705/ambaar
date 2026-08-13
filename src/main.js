import './style.css'

// base de movimento antes de tudo: cria o Lenis e registra o ScrollTrigger
import './scripts/motion.js'
import './scripts/abertura.js'

// uma seção por arquivo, na ordem em que aparecem na página
import './scripts/hero.js'
import './scripts/chapters.js'
import './scripts/pausa.js'
import './scripts/escuta.js'
import './scripts/outro.js'

/* Transversais: entradas genéricas e as âncoras fixas.

   O relógio entra ANTES de sections.js de propósito: quem decide qual seção
   manda na tela é o observador de sections.js, e ele publica isso num
   evento. O ouvinte precisa existir antes de o observador entregar a
   primeira leitura. */
import './scripts/reveal.js'
import './scripts/relogio.js'
import './scripts/som.js'
import './scripts/sections.js'
import './scripts/spine.js'
import './scripts/topbar.js'
