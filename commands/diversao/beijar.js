const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'beijar',
  aliases: [],
  category: 'diversao',
  description: 'Envia um beijo de brincadeira para alguém.',
  usage: '¥beijar @pessoa',
  cooldown: 3,

  async execute(ctx) {
    const mentioned =
      ctx.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
      [];

    if (!mentioned.length) {
      return ctx.reply(
        '💋 Marque alguém para receber o beijo.\n\n' +
        'Exemplo: ¥beijar @pessoa'
      );
    }

    const alvo = mentioned[0];

    // Usuário que executou o comando
    const autor = ctx.sender;

    // Nome real do usuário no WhatsApp
    const nomeAutor =
      ctx.message?.pushName ||
      ctx.pushName ||
      'Alguém';

    try {
      const caminho = path.join(
        process.cwd(),
        'assets',
        'gifs',
        'beijar.mp4'
      );

      if (!fs.existsSync(caminho)) {
        throw new Error(`Arquivo não encontrado: ${caminho}`);
      }

      const video = fs.readFileSync(caminho);

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          video,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption:
            `💋✨ @${autor.split('@')[0]} deu um beijo em @${alvo.split('@')[0]}.\n\n` +
            `❤️ Um gesto simples, mas cheio de carinho.`,
          mentions: [autor, alvo]
        },
        {
          quoted: ctx.message
        }
      );

      console.log(`[BEIJAR] ${nomeAutor} enviou um beijo.`);
    } catch (error) {
      console.error('[BEIJAR] Erro:', error.message);

      await ctx.reply(
        '⚠️ Não consegui enviar o beijo agora.'
      );
    }
  }
};
