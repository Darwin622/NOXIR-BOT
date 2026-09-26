module.exports = {
  name: 'antilink',
  aliases: ['antilinks'],
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    const { setAntiLink, isAntiLinkEnabled } = require('../../lib/protection');
    const action = (ctx.args[0] || '').toLowerCase();

    if (!ctx.isAdmin && !require('../../lib/permissions').isOwner(ctx)) {
      return ctx.reply('❌ Apenas administradores ou o dono podem configurar o ANTI-LINK.');
    }

    if (!['on', 'off', 'status'].includes(action)) {
      return ctx.reply(
        '╭━━━〔 𝙉Ø𝙓𝙄𝙍 𝙎𝙃𝙄𝙀𝙇𝘿 〕━━━╮\n' +
        '┃\n' +
        '┃ 🛡️ ANTI-LINK\n' +
        '┃\n' +
        '┃ Use:\n' +
        '┃ ├─ ¥antilink on\n' +
        '┃ ├─ ¥antilink off\n' +
        '┃ └─ ¥antilink status\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    if (action === 'status') {
      return ctx.reply(
        '🛡️ ANTI-LINK\n' +
        '└─ Status: ' + (isAntiLinkEnabled(ctx.chat) ? 'ATIVO' : 'DESATIVADO')
      );
    }

    setAntiLink(ctx.chat, action === 'on');

    return ctx.reply(
      '╭━━━〔 𝙉Ø𝙓𝙄𝙍 𝙎𝙃𝙄𝙀𝙇𝘿 〕━━━╮\n' +
      '┃\n' +
      '┃ 🛡️ ANTI-LINK\n' +
      '┃ └─ ' + (action === 'on' ? 'ATIVADO' : 'DESATIVADO') + '\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
