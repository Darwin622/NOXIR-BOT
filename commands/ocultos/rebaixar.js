const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'rebaixar',
  aliases: ['tiraradm', 'removeadm'],
  category: 'grupo',
  description: 'Remove o cargo de administrador',
  usage: '¥rebaixar @membro',
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    if (!ctx.isAdmin && !isOwner(ctx)) {
      await ctx.reply('❌ Apenas administradores ou o dono do bot podem usar este comando.');
      return;
    }

    const mentioned =
      ctx.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentioned.length) {
      await ctx.reply(
        '╭━━━〔 🔻 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 📉 REBAIXAR\n' +
        '┃\n' +
        '┃ Marque o administrador que deseja rebaixar.\n' +
        '┃\n' +
        '┃ 💡 ¥rebaixar @membro\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
      return;
    }

    const target = mentioned[0];
    const targetNumber = target.split('@')[0];

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], 'demote');

      await ctx.reply(
        '╭━━━〔 🔻 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 📉 REBAIXAMENTO CONCLUÍDO\n' +
        '┃\n' +
        '┃ 👤 Usuário\n' +
        '┃ └─ @' + targetNumber + '\n' +
        '┃\n' +
        '┃ 📌 Novo cargo\n' +
        '┃ └─ Membro\n' +
        '┃\n' +
        '┃ 🔐 Autorização\n' +
        '┃ └─ ADM / Dono ✓\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯',
        { mentions: [target] }
      );
    } catch (error) {
      console.error('[REBAIXAR]', error);
      await ctx.reply('❌ Não consegui remover o cargo.\n\n💡 Verifique se o bot é administrador.');
    }
  }
};
