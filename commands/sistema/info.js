module.exports = {
  name: 'info',
  aliases: ['bot', 'sobre'],
  category: 'sistema',
  description: 'Mostra as informações do NØXIR-B∅T',
  usage: '¥info',
  cooldown: 3,

  async execute(ctx) {
    const config = ctx.config;

    const totalComandos = ctx.commands
      ? new Set(
          Array.from(ctx.commands.values()).map(
            command => command.name
          )
        ).size
      : 0;

    const text =
      '╭━━━〔 🤖 NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ 📌 INFORMAÇÕES DO BOT\n' +
      '┃\n' +
      '┃ 🤖 NOME\n' +
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
      '┃ 📚 COMANDOS\n' +
      '┃ └─ ' + totalComandos + '\n' +
      '┃\n' +
      '┃ 🟢 NODE.JS\n' +
      '┃ └─ ' + process.version + '\n' +
      '┃\n' +
      '┃ 📱 PLATAFORMA\n' +
      '┃ └─ ' + process.platform + '\n' +
      '┃\n' +
      '┃ 🏗️ ARQUITETURA\n' +
      '┃ └─ ' + process.arch.toUpperCase() + '\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯';

    if (ctx && typeof ctx.reply === 'function') {
      await ctx.reply(text);
    }

    return text;
  }
};
