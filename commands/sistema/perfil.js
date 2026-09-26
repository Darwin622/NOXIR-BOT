const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'perfil',
  aliases: ['meu', 'eu'],
  category: 'sistema',
  description: 'Mostra o perfil completo do usuario',
  usage: '¥perfil',
  cooldown: 3,

  async execute(ctx) {
    if (!ctx || typeof ctx.reply !== 'function') {
      return;
    }

    const numero = ctx.sender || 'Nao identificado';
    const nome = ctx.pushName || 'Nao informado';
    const dono = isOwner(ctx) ? 'Sim 👑' : 'Nao';

    const grupo = ctx.isGroup
      ? (ctx.groupName || 'Grupo')
      : 'Conversa privada';

    const cargo = ctx.isGroup
      ? (ctx.isAdmin ? 'Administrador 🛡️' : 'Membro 👤')
      : 'Nao aplicavel';

    const numeroLimpo = numero
      .replace('@s.whatsapp.net', '')
      .replace('@lid', '');

    const text =
      '╭━━━〔 👤 PERFIL 〕━━━╮\n' +
      '┃\n' +
      '┃ 🖼️ FOTO DE PERFIL\n' +
      '┃ └─ Foto atual do usuário\n' +
      '┃\n' +
      '┃ 👤 NOME\n' +
      '┃ └─ ' + nome + '\n' +
      '┃\n' +
      '┃ 🆔 NÚMERO\n' +
      '┃ └─ +' + numeroLimpo + '\n' +
      '┃\n' +
      '┃ 👑 DONO DO BOT\n' +
      '┃ └─ ' + dono + '\n' +
      '┃\n' +
      '┃ 👥 CONVERSA\n' +
      '┃ └─ ' + grupo + '\n' +
      '┃\n' +
      '┃ 🛡️ CARGO\n' +
      '┃ └─ ' + cargo + '\n' +
      '┃\n' +
      '┃ 📱 PLATAFORMA\n' +
      '┃ └─ WhatsApp\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━╯';

    try {
      if (typeof ctx.getProfilePicture === 'function') {
        const foto = await ctx.getProfilePicture(ctx.sender);

        if (foto) {
          await ctx.sendImage(
            foto,
            text
          );
          return text;
        }
      }

      await ctx.reply(text);

    } catch (error) {
      console.error('[PERFIL]', error);
      await ctx.reply(text);
    }

    return text;
  }
};
