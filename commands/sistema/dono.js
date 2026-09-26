module.exports = {
  name: 'dono',
  aliases: ['owner', 'criador'],
  category: 'sistema',
  description: 'Mostra as informações do proprietário do NØXIR-B∅T',
  usage: '¥dono',
  cooldown: 3,

  async execute(ctx) {
    const config = ctx.config;

    const text =
      '╭━━━〔 👑 NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ 📌 INFORMAÇÕES DO DONO\n' +
      '┃\n' +
      '┃ 👤 NOME\n' +
      '┃ └─ ' + config.ownerName + '\n' +
      '┃\n' +
      '┃ 📱 NÚMERO\n' +
      '┃ └─ ' + config.ownerNumber + '\n' +
      '┃\n' +
      '┃ 👑 FUNÇÃO\n' +
      '┃ └─ Proprietário\n' +
      '┃\n' +
      '┃ 🛡️ NÍVEL DE ACESSO\n' +
      '┃ └─ OWNER\n' +
      '┃\n' +
      '┃ 🔐 PERMISSÃO\n' +
      '┃ └─ ACESSO TOTAL\n' +
      '┃\n' +
      '┃ 🤖 BOT\n' +
      '┃ └─ ' + config.botName + '\n' +
      '┃\n' +
      '┃ 📦 VERSÃO\n' +
      '┃ └─ ' + config.botVersion + '\n' +
      '┃\n' +
      '┃ 🟢 STATUS\n' +
      '┃ └─ ONLINE\n' +
      '┃\n' +
      '┃ ⚡ PREFIXO\n' +
      '┃ └─ ' + config.prefix + '\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '╭──────────────────────╮\n' +
      '│ 👑 OWNER • NØXIR-B∅T │\n' +
      '│ ⚡ Sistema protegido  │\n' +
      '╰──────────────────────╯';

    if (ctx && typeof ctx.reply === 'function') {
      await ctx.reply(text);
    }

    return text;
  }
};
