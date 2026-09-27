const axios = require('axios');
const { pinterestSessions } = require('../../lib/connection');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  Referer: 'https://www.pinterest.com/'
};

async function buscarPinterest(consulta) {
  const resposta = await axios.get(
    'https://www.pinterest.com/search/pins/',
    {
      params: { q: consulta },
      headers: HEADERS,
      timeout: 15000
    }
  );

  const html = resposta.data;

  const encontrados = [
    ...html.matchAll(
      /https?:\\?\/\\?\/i\.pinimg\.com\/(?:736x|originals)\/[a-z0-9\/_-]+\.(?:jpg|jpeg|png|webp)/gi
    )
  ]
    .map(m =>
      m[0]
        .replace(/\\u002F/g, '/')
        .replace(/\\/g, '')
    )
    .map(url => url.replace('/originals/', '/736x/'));

  const unicos = [];
  const vistos = new Set();

  for (const url of encontrados) {
    const id = url.split('/').pop();

    if (!id || vistos.has(id)) continue;

    vistos.add(id);
    unicos.push(url);
  }

  return unicos;
}

async function baixarImagem(url) {
  const resposta = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: HEADERS,
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: status => status >= 200 && status < 400
  });

  const buffer = Buffer.from(resposta.data);
  const tipo = resposta.headers['content-type'] || '';

  if (!tipo.startsWith('image/')) {
    throw new Error('Resposta não é uma imagem');
  }

  if (buffer.length < 15000) {
    throw new Error('Imagem muito pequena/placeholder');
  }

  return buffer;
}

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pint'],

  async execute(ctx) {
    const consulta = (ctx.args || []).join(' ').trim();

    if (!consulta) {
      return ctx.reply(
        '🌑 NØXIR PINTEREST\n\n' +
        'Use:\n' +
        '¥pinterest nome\n\n' +
        'Exemplo:\n' +
        '¥pinterest anime'
      );
    }

    try {
      await ctx.reply('🔎 Pesquisando no Pinterest...');

      const imagens = await buscarPinterest(consulta);

      if (!imagens.length) {
        return ctx.reply(
          '❌ Nenhuma imagem encontrada para:\n' +
          '🔎 ' + consulta
        );
      }

      console.log(
        `[🌑 PINTEREST] ${imagens.length} imagens encontradas para: ${consulta}`
      );

      let imagem = null;
      let indice = 0;

      for (let i = 0; i < imagens.length; i++) {
        try {
          imagem = await baixarImagem(imagens[i]);
          indice = i;
          break;
        } catch (error) {
          console.log(
            `[🌑 PINTEREST] Imagem ${i + 1} ignorada: ${error.message}`
          );
        }
      }

      if (!imagem) {
        return ctx.reply(
          '❌ O Pinterest encontrou resultados, mas não conseguiu obter uma imagem válida.'
        );
      }

      const chave = ctx.sender || ctx.chat;

      pinterestSessions.set(chave, {
        consulta,
        imagens,
        index: indice
      });

      return ctx.sock.sendMessage(
        ctx.chat,
        {
          image: imagem,
          caption:
            '🌑 NØXIR PINTEREST\n\n' +
            '🔎 Pesquisa: ' + consulta + '\n' +
            '🖼️ Resultado ' + (indice + 1) + '\n\n' +
            '📌 Fonte: Pinterest',
          buttons: [
            {
              buttonId: 'pin_next',
              buttonText: {
                displayText: '➡️ SEGUINTE'
              },
              type: 1
            }
          ],
          headerType: 1
        },
        {
          quoted: ctx.message
        }
      );

    } catch (error) {
      console.error(
        '[🌑 PINTEREST]',
        error.response?.status || '',
        error.message
      );

      return ctx.reply(
        '❌ Não foi possível obter a imagem do Pinterest.\n\n' +
        'Tente novamente daqui a pouco.'
      );
    }
  }
};
