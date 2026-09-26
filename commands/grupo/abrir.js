const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'abrir',
  aliases: ['open'],
  category: 'grupo',
  description: 'Abre o grupo para todos os membros',
  usage: '¥abrir',
  cooldown: 5,
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    if (!ctx.isAdmin && !isOwner(ctx)) {
      await ctx.reply('❌ Apenas administradores ou o dono do bot podem usar este comando.');
      return;
    }

    try {
      await ctx.sock.groupSettingUpdate(ctx.chat, 'not_announcement');

      await ctx.reply(
        '╭━━━〔 🔓 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🟢 GRUPO ABERTO\n' +
        '┃\n' +
        '┃ 📢 Todos os membros\n' +
        '┃    podem enviar mensagens.\n' +
        '┃\n' +
        '┃ 🔐 Autorização\n' +
        '┃ └─ ADM / Dono ✓\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    } catch (error) {
      console.error('[ABRIR]', error);
      await ctx.reply('❌ Não consegui abrir o grupo.\n\n💡 Verifique se o NØXIR-B∅T é administrador.');
    }
  }
};
