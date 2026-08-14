import { defineConfig } from 'vite'

/* Os comentários deste projeto são o projeto.
 *
 * Cada decisão de arte está escrita ao lado do código que a executa, e é
 * assim que ela sobrevive à próxima passada. O index.html tem 42 kB, e
 * cerca de 30 deles são prosa em português explicando por que o poente
 * atravessa a tela em vez de parar nela.
 *
 * O que é certo no repositório é errado no telefone. O HTML é o único
 * arquivo do site que bloqueia a primeira pintura: ele é baixado,
 * interpretado e só então o navegador descobre a folha de estilo e a
 * fotografia da hero. Trinta quilobytes de comentário nesse caminho são
 * trinta quilobytes que atrasam a primeira letra desenhada — numa rede
 * móvel, uma viagem de ida e volta inteira.
 *
 * Este plugin tira os comentários do HTML NO BUILD e não toca no arquivo
 * de origem. O repositório continua documentado; o telefone recebe
 * 12 kB em vez de 42.
 *
 * Duas guardas:
 *
 *   · comentários condicionais do IE (`<!--[if ...]>`) são preservados,
 *     porque eles não são comentários, são marcação;
 *   · só roda em `build`. Em desenvolvimento o HTML servido é o arquivo
 *     real, para que inspecionar a página e ler o repositório mostrem a
 *     mesma coisa.
 */
const semComentarios = () => ({
  name: 'ambar-sem-comentarios',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => html
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
      // o buraco que cada comentário deixa vira uma linha em branco
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
  }
})

export default defineConfig({
  plugins: [semComentarios()]
})
