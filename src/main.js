import './style.css'

// base de movimento antes de tudo: cria o Lenis e registra o ScrollTrigger
import './scripts/motion.js'
import './scripts/abertura.js'

/* Uma seção por arquivo, na ordem em que elas aparecem na página — e a
   ordem é a noite, hora a hora:

     hero       a marca
     chapters   17—19h · 20—22h · 02—03h   os três ambientes
     copo       19h   o primeiro copo
     cabine     20h   alguém escolhe o que vai tocar
     pista      22h   a sala cheia
     brinde     23h   ninguém combinou nada
     passagem   00h   a câmera entra até achar uma pessoa
     pausa      01h   a conversa baixa
     quemfica   03h   a regra da casa, dita uma vez só e no fim
     reservas   a escolha
     outro      o fecho */
import './scripts/hero.js'
import './scripts/chapters.js'
import './scripts/copo.js'
import './scripts/cabine.js'
import './scripts/pista.js'
import './scripts/brinde.js'
import './scripts/passagem.js'
import './scripts/pausa.js'
import './scripts/quemfica.js'
import './scripts/reservas.js'
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
