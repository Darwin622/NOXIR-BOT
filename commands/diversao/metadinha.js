const https = require('https');

function buscarDados(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent': 'NOXIR-BOT/1.0'
        }
      },
      response => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }
    ).on('error', reject);
  });
}

module.exports = {
  name: 'metadinha',
  aliases: ['meta'],
  category: 'diversao',
  description: 'Envia uma metadinha aleatória.',
  usage: '¥metadinha',
  cooldown: 5,

  async execute(ctx) {
    try {
      await ctx.reply('💖 Procurando uma metadinha...');

      const dados = await buscarDados(
        'https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json'
      );

      if (!Array.isArray(dados) || !dados.length) {
        throw new Error('Nenhuma metadinha encontrada.');
      }

      const par = dados[
        Math.floor(Math.random() * dados.length)
      ];

      if (!par?.male || !par?.female) {
        throw new Error('Par inválido.');
      }

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          image: { url: par.male },
          caption: '💙 • Perfil Masculino'
        },
        {
          quoted: ctx.message
        }
      );

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          image: { url: par.female },
          caption: '💗 • Perfil Feminino'
        },
        {
          quoted: ctx.message
        }
      );

    } catch (error) {
      console.error('[METADINHA] Erro:', error);

      await ctx.reply(
        '❌ Não foi possível carregar a metadinha agora.'
      );
    }
  }
};
