const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'fechar',
  aliases: ['close'],
  category: 'grupo',
  description: 'Fecha o grupo para os membros',
  usage: '¥fechar',
  cooldown: 5,
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    if (!ctx.isAdmin && !isOwner(ctx)) {
      await ctx.reply('❌ Apenas administradores ou o dono do bot podem usar este comando.');
      return;
    }

    try {
      await ctx.sock.groupSettingUpdate(ctx.chat, 'announcement');

      await ctx.reply(
        '╭━━━〔 🔒 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🔴 GRUPO FECHADO\n' +
        '┃\n' +
        '┃ 📢 Apenas administradores\n' +
        '┃    podem enviar mensagens.\n' +
        '┃\n' +
        '┃ 🔐 Autorização\n' +
        '┃ └─ ADM / Dono ✓\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    } catch (error) {
      console.error('[FECHAR]', error);
      await ctx.reply('❌ Não consegui fechar o grupo.\n\n💡 Verifique se o NØXIR-B∅T é administrador.');
    }
  }
};
