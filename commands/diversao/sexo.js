module.exports = {
  name: 'sexo',
  aliases: [],
  category: 'diversao',
  description: 'Brincadeira de dupla entre dois usuários.',
  usage: '¥sexo @pessoa',
  cooldown: 5,

  async execute(ctx) {
    const mentioned =
      ctx.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentioned.length) {
      return ctx.reply(
        '🤝 Marque alguém para vcs fazerem sexo.\n\n' +
        'Exemplo: ¥sexo @pessoa'
      );
    }

    const autor = ctx.sender;
    const alvo = mentioned[0];

    const nomeAutor =
      ctx.message?.pushName ||
      ctx.pushName ||
      'Alguém';

    const fs = require('fs');
    const path = require('path');

    const caminho = path.join(
      process.cwd(),
      'assets',
      'gifs',
      'dupla.mp4'
    );

    try {
      if (!fs.existsSync(caminho)) {
        return ctx.reply(
          '⚠️ Coloque o vídeo em:\n' +
          'assets/gifs/dupla.mp4'
        );
      }

      const video = fs.readFileSync(caminho);

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          video,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption:
            `🤝✨ @${autor.split('@')[0]} e @${alvo.split('@')[0]} fizeram sexo!\n\n` +
            `❤️ foderam -se como casais.`,
          mentions: [autor, alvo]
        },
        { quoted: ctx.message }
      );

      console.log(`[SEXO] ${nomeAutor} iniciou a brincadeira.`);
    } catch (error) {
      console.error('[SEXO] Erro:', error.message);
      await ctx.reply('⚠️ Não consegui enviar a brincadeira agora.');
    }
  }
};
