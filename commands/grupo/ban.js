const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'ban',
  aliases: ['kick', 'expulsar'],
  category: 'grupo',
  description: 'Remove um membro do grupo',
  usage: '¥ban @membro',
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    if (!ctx.isAdmin && !isOwner(ctx)) {
      await ctx.reply(
        '❌ Apenas administradores ou o dono do bot podem usar este comando.'
      );
      return;
    }

    const mentioned =
      ctx.message?.message?.extendedTextMessage
        ?.contextInfo?.mentionedJid || [];

    if (!mentioned.length) {
      await ctx.reply(
        '╭━━━〔 🚫 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🛑 BAN\n' +
        '┃\n' +
        '┃ Marque o membro que deseja remover.\n' +
        '┃\n' +
        '┃ 💡 ¥ban @membro\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
      return;
    }

    const target = mentioned[0];
    const targetNumber = target.split('@')[0];

    try {
      await ctx.sock.groupParticipantsUpdate(
        ctx.chat,
        [target],
        'remove'
      );

      await ctx.reply(
        '╭━━━〔 🚫 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🛑 MEMBRO REMOVIDO\n' +
        '┃\n' +
        '┃ 👤 Usuário\n' +
        '┃ └─ @' + targetNumber + '\n' +
        '┃\n' +
        '┃ 📌 Ação\n' +
        '┃ └─ Removido do grupo ✓\n' +
        '┃\n' +
        '┃ 🔐 Autorização\n' +
        '┃ └─ ADM / Dono ✓\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯',
        {
          mentions: [target]
        }
      );
    } catch (error) {
      console.error('[BAN]', error);

      await ctx.reply(
        '❌ Não consegui remover o membro.\n\n' +
        '💡 Verifique se o NØXIR-B∅T é administrador e se o membro pode ser removido.'
      );
    }
  }
};
