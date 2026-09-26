const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'add',
  aliases: ['adicionar'],
  category: 'grupo',
  description: 'Adiciona um número ao grupo',
  usage: '¥add +244XXXXXXXXX',
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    if (!ctx.isAdmin && !isOwner(ctx)) {
      await ctx.reply('❌ Apenas administradores ou o dono do bot podem usar este comando.');
      return;
    }

    const body = String(ctx.body || '');
    const parts = body.trim().split(/\s+/);
    const rawNumber = parts[1] || '';

    const number = rawNumber.replace(/\D/g, '');

    if (!number || number.length < 8) {
      await ctx.reply(
        '╭━━━〔 ➕ NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ ➕ ADICIONAR MEMBRO\n' +
        '┃\n' +
        '┃ 📱 Informe um número válido.\n' +
        '┃\n' +
        '┃ 💡 Exemplo\n' +
        '┃ └─ ¥add +244952851147\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
      return;
    }

    const jid = number + '@s.whatsapp.net';

    try {
      await ctx.sock.groupParticipantsUpdate(
        ctx.chat,
        [jid],
        'add'
      );

      await ctx.reply(
        '╭━━━〔 ➕ NØXIR-B∅T 〕━━━╮\n' +
        '┃\n' +
        '┃ 👤 MEMBRO ADICIONADO\n' +
        '┃\n' +
        '┃ 📱 Número\n' +
        '┃ └─ +' + number + '\n' +
        '┃\n' +
        '┃ 📌 Status\n' +
        '┃ └─ Adicionado ✓\n' +
        '┃\n' +
        '┃ 🔐 Autorização\n' +
        '┃ └─ ADM / Dono ✓\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    } catch (error) {
      console.error('[ADD]', error);

      await ctx.reply(
        '❌ Não consegui adicionar o número.\n\n' +
        '💡 Verifique se o número existe no WhatsApp e se o bot é administrador.'
      );
    }
  }
};
