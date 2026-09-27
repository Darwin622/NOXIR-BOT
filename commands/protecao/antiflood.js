const {
  setAntiFlood,
  isAntiFloodEnabled
} = require('../../lib/protection');

const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'antiflood',
  aliases: ['antiflood', 'flood'],
  groupOnly: true,
  botAdmin: true,

  async execute(ctx) {
    const acao = (ctx.args[0] || '').toLowerCase();

    if (!ctx.isAdmin && !isOwner(ctx)) {
      return ctx.reply(
        '╭━━━〔 🌑 NØXIR SHIELD 〕━━━╮\n' +
        '┃\n' +
        '┃ 🚫 ACESSO NEGADO\n' +
        '┃\n' +
        '┃ Apenas administradores ou\n' +
        '┃ o dono podem configurar o\n' +
        '┃ ANTI-FLOOD.\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    if (!['on', 'off', 'status'].includes(acao)) {
      return ctx.reply(
        '╭━━━〔 🌊 NØXIR ANTI-FLOOD 〕━━━╮\n' +
        '┃\n' +
        '┃ 🌊 Proteção contra flood\n' +
        '┃ 💥 Proteção contra spam de menções\n' +
        '┃\n' +
        '┃ Use:\n' +
        '┃ ├─ ¥antiflood on\n' +
        '┃ ├─ ¥antiflood off\n' +
        '┃ └─ ¥antiflood status\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    if (acao === 'status') {
      const ativo = isAntiFloodEnabled(ctx.chat);

      return ctx.reply(
        '╭━━━〔 🌑 NØXIR ANTI-FLOOD 〕━━━╮\n' +
        '┃\n' +
        '┃ 🌊 Status: ' + (ativo ? '🟢 ATIVO' : '🔴 DESATIVADO') + '\n' +
        '┃\n' +
        '┃ 💥 Menções: 5+ por mensagem\n' +
        '┃ 🌊 Flood: 3 mensagens / 6 segundos\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    setAntiFlood(ctx.chat, acao === 'on');

    return ctx.reply(
      '╭━━━〔 🌑 NØXIR SHIELD 〕━━━╮\n' +
      '┃\n' +
      '┃ 🌊 ANTI-FLOOD\n' +
      '┃ └─ ' + (acao === 'on' ? '🟢 ATIVADO' : '🔴 DESATIVADO') + '\n' +
      '┃\n' +
      '┃ 💥 Bomba de menções: protegida\n' +
      '┃ 🌊 Rajada de mensagens: protegida\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
