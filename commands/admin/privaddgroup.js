const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'privaddgroup',
  aliases: ['privgrupo', 'addgroup'],
  category: 'admin',
  description: 'Controla quem pode adicionar o bot em grupos.',
  usage: '¥privaddgroup all|cntt|ngm',
  cooldown: 5,

  async execute(ctx) {
    if (!isOwner(ctx)) {
      return ctx.reply(
        '❌ Apenas o dono do NØXIR-B∅T pode alterar esta configuração.'
      );
    }

    const opcao = String(ctx.args?.[0] || '').toLowerCase();

    if (!['all', 'cntt', 'ngm'].includes(opcao)) {
      return ctx.reply(
        '╭━━━〔 🔐 PRIVADDGROUP 〕━━━╮\n' +
        '┃\n' +
        '┃ Controle quem pode adicionar\n' +
        '┃ o NØXIR-B∅T em grupos.\n' +
        '┃\n' +
        '┃ 👥 all  → Todos\n' +
        '┃ 📇 cntt → Contatos\n' +
        '┃ 🚫 ngm  → Ninguém\n' +
        '┃\n' +
        '┃ Exemplo:\n' +
        '┃ └─ ¥privaddgroup ngm\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    const privacy = {
      all: 'all',
      cntt: 'contacts',
      ngm: 'none'
    }[opcao];

    try {
      await ctx.sock.updateGroupsAddPrivacy(privacy);

      const mensagens = {
        all:
          '👥 Agora qualquer pessoa pode adicionar o NØXIR-B∅T em grupos.',
        cntt:
          '📇 Agora somente seus contatos podem adicionar o NØXIR-B∅T em grupos.',
        ngm:
          '🚫 Agora ninguém pode adicionar o NØXIR-B∅T em grupos.'
      };

      return ctx.reply(
        '╭━━━〔 🔐 PRIVACIDADE DE GRUPOS 〕━━━╮\n' +
        '┃\n' +
        '┃ ✅ CONFIGURAÇÃO ATUALIZADA\n' +
        '┃\n' +
        `┃ ${mensagens[opcao]}\n` +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    } catch (error) {
      console.error('[PRIVADDGROUP] Erro:', error);
      return ctx.reply(
        '❌ Não foi possível atualizar a privacidade de grupos.'
      );
    }
  }
};
