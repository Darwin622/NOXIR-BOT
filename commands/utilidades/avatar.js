module.exports = {
  name: 'avatar',
  aliases: ['foto', 'pp'],

  async execute(ctx) {
    try {
      let jid = ctx.sender || ctx.chat;

      const mentioned =
        ctx.msg?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (mentioned) {
        jid = mentioned;
      }

      const url = await ctx.sock.profilePictureUrl(jid, 'image');

      return ctx.sock.sendMessage(
        ctx.chat,
        {
          image: { url },
          caption: '🖼️ FOTO DE PERFIL'
        },
        { quoted: ctx.message }
      );

    } catch (error) {
      console.error('[AVATAR]', error.message);
      return ctx.reply(
        '❌ Não foi possível obter a foto de perfil desta pessoa.'
      );
    }
  }
};
