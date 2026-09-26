module.exports = {
  name: 'menudono',
  aliases: ['ownermenu', 'dmenu'],
  category: 'sistema',
  description: 'Abre o menu exclusivo do proprietário',
  usage: '¥menudono',
  cooldown: 3,
  ownerOnly: true,

  async execute(ctx) {
    const config = ctx.config || {};

    const text =
      '╭━━━〔 👑 NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ 🔐 MENU EXCLUSIVO DO DONO\n' +
      '┃\n' +
      '┃ 👑 OWNER\n' +
      '┃ └─ ' + (config.ownerName || 'Proprietário') + '\n' +
      '┃\n' +
      '┃ ⚡ PAINEL DE CONTROLE\n' +
      '┃\n' +
      '┃ 🛠️ Comandos administrativos\n' +
      '┃ ⚙️ Configurações do bot\n' +
      '┃ 🛡️ Sistemas de proteção\n' +
      '┃ 📊 Informações avançadas\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '👑 *ACESSO: OWNER*\n' +
      '🔒 *Painel protegido do NØXIR-B∅T*';

    await ctx.reply(text);

    return text;
  }
};
