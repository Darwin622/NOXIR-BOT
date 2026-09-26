module.exports = {
  name: 'menu',
  aliases: ['help', 'ajuda'],
  category: 'sistema',
  description: 'Abre o painel principal do NØXIR-B∅T',
  usage: '¥menu',
  cooldown: 3,

  async execute(ctx) {
    const config = ctx.config || {};

    const userJid =
      ctx.sender?.endsWith('@s.whatsapp.net')
        ? ctx.sender
        : ctx.message?.key?.participant?.endsWith('@s.whatsapp.net')
          ? ctx.message.key.participant
          : ctx.message?.key?.remoteJid?.endsWith('@s.whatsapp.net')
            ? ctx.message.key.remoteJid
            : ctx.sender || '';

    const userNumber = userJid
      ? userJid.split('@')[0]
      : 'Usuário';

    const agora = new Date();

    const data = agora.toLocaleDateString('pt-PT');
    const hora = agora.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const text =
      '╭────────────────╮\n' +
      '│   🌑 ɴØxɪʀ-ʙ∅ᴛ   │\n' +
      '├────────────────┤\n' +
      '│                │\n' +
      '│ 🌑 ᴜsᴜáʀɪᴏ : @' + userNumber + ' │\n' +
      '│ 🌑 ᴠᴇʀsãᴏ  : ' + (config.botVersion || '1.0.0') + ' │\n' +
      '│ 🔑 ᴘʀᴇғɪxᴏ : ' + (config.prefix || '¥') + '     │\n' +
      '│ 🌑 sᴛᴀᴛᴜs  : ᴏɴʟɪɴᴇ │\n' +
      '│ ⏰ ʜᴏʀᴀ   : ' + hora + ' │\n' +
      '│                │\n' +
      '╰────────────────╯\n\n' +
      '⟦ 🫈 ʙᴇᴍ-ᴠɪɴᴅᴏ ⟧\n\n' +
      '› 🌑 sᴇʟᴇᴄɪᴏɴᴇ ᴜᴍᴀ ᴄᴀᴛᴇɢᴏʀɪᴀ\n' +
      'ᴘᴀʀᴀ ᴀᴄᴇssᴀʀ ᴏs ᴄᴏᴍᴀɴᴅᴏs.\n\n' +
      '• 🌑 ɴØxɪʀ ᴄᴏʀᴇ •';

    if (typeof ctx.sendInteractiveMenu !== 'function') {
      throw new Error('Sistema de botões não está disponível.');
    }

    await ctx.sendInteractiveMenu(ctx.chat, text, [userJid]);

    return text;
  }
};
