module.exports = {
  name: 'antisticker',
  aliases: ['antis', 'as'],
  description: 'Ativa ou desativa o Anti Sticker',

  async execute(ctx) {
    if (!ctx.isGroup) {
      return ctx.reply(
        '❌ *COMANDO DE GRUPO*\n\nEste comando só pode ser usado em grupos.'
      );
    }

    if (!ctx.isAdmin) {
      return ctx.reply(
        '❌ *ACESSO NEGADO*\n\nApenas administradores do grupo podem alterar o Anti Sticker.'
      );
    }

    if (!ctx.isBotAdmin) {
      return ctx.reply(
        '❌ *SEM PERMISSÃO*\n\nPreciso ser administrador do grupo para apagar stickers.'
      );
    }

    if (!ctx.dataGp) {
      return ctx.reply(
        '❌ *ERRO*\n\nAs configurações deste grupo não foram carregadas.'
      );
    }

    ctx.dataGp.antisticker = !ctx.dataGp.antisticker;

    await ctx.setGp(ctx.dataGp);

    if (ctx.dataGp.antisticker) {
      return ctx.reply(
        '╭━━━〔 🛡️ ANTI STICKER 〕━━━╮\n' +
        '┃\n' +
        '┃ ✅ *ATIVADO COM SUCESSO*\n' +
        '┃\n' +
        '┃ 🚫 Stickers enviados por\n' +
        '┃    membros serão apagados.\n' +
        '┃\n' +
        '┃ 👑 Administradores estão\n' +
        '┃    protegidos.\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    return ctx.reply(
      '╭━━━〔 🛡️ ANTI STICKER 〕━━━╮\n' +
      '┃\n' +
      '┃ ❌ *DESATIVADO COM SUCESSO*\n' +
      '┃\n' +
      '┃ 🟢 Stickers podem ser\n' +
      '┃    enviados normalmente.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
