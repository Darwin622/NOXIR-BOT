const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'promover',
  aliases: ['addadm', 'daradm'],
  category: 'grupo',
  description: 'Promove um membro a administrador',
  usage: '¥promover @membro',
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
        '╭━━━〔 👑 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🛡️ PROMOVER\n' +
        '┃\n' +
        '┃ Marque o membro que deseja promover.\n' +
        '┃\n' +
        '┃ 💡 ¥promover @membro\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
      return;
    }

    const target = mentioned[0];
    const targetNumber = target.split('@')[0];

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], 'promote');

      await ctx.reply(
        '╭━━━〔 👑 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🛡️ PROMOÇÃO CONCLUÍDA\n' +
        '┃\n' +
        '┃ 👤 Usuário\n' +
        '┃ └─ @' + targetNumber + '\n' +
        '┃\n' +
        '┃ ⭐ Novo cargo\n' +
        '┃ └─ Administrador\n' +
        '┃\n' +
        '┃ 🔐 Autorização\n' +
        '┃ └─ ADM / Dono ✓\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯',
        { mentions: [target] }
      );
    } catch (error) {
      console.error('[PROMOVER]', error);
      await ctx.reply('❌ Não consegui promover o membro.\n\n💡 Verifique se o bot é administrador.');
    }
  }
};
