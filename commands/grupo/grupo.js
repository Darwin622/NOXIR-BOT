module.exports = {
  name: 'grupo',
  aliases: ['infogrupo'],
  category: 'grupo',
  description: 'Mostra informações do grupo',
  usage: '¥grupo',
  groupOnly: true,

  async execute(ctx) {
    try {
      const metadata = await ctx.sock.groupMetadata(ctx.chat);

      const members = metadata.participants || [];
      const admins = members.filter(
        (p) => p.admin === 'admin' || p.admin === 'superadmin'
      );

      const description =
        metadata.desc && metadata.desc.trim()
          ? metadata.desc.trim()
          : 'Sem descrição';

      await ctx.reply(
        '╭━━━〔 📋 NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 🏷️ INFORMAÇÕES DO GRUPO\n' +
        '┃\n' +
        '┃ 📛 Nome\n' +
        '┃ └─ ' + (metadata.subject || 'Sem nome') + '\n' +
        '┃\n' +
        '┃ 👥 Membros\n' +
        '┃ └─ ' + members.length + '\n' +
        '┃\n' +
        '┃ 👑 Administradores\n' +
        '┃ └─ ' + admins.length + '\n' +
        '┃\n' +
        '┃ 📝 Descrição\n' +
        '┃ └─ ' + description + '\n' +
        '┃\n' +
        '┃ 🆔 ID\n' +
        '┃ └─ ' + ctx.chat + '\n' +
        '┃\n' +
        '┃ 🤖 Bot\n' +
        '┃ └─ NØXIR-B∅T\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    } catch (error) {
      console.error('[GRUPO]', error);

      await ctx.reply(
        '❌ Não consegui obter as informações deste grupo.'
      );
    }
  }
};
