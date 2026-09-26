module.exports = {
  name: 'uptime',
  aliases: ['tempo', 'up'],
  category: 'sistema',
  description: 'Mostra ha quanto tempo o NØXIR-B∅T esta ligado',
  usage: '¥uptime',
  cooldown: 3,

  async execute(ctx) {
    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const text =
      '╭━━━〔 ⏱️ NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ 🟢 SISTEMA ONLINE\n' +
      '┃\n' +
      '┃ ⏱️ TEMPO ONLINE\n' +
      '┃ └─ ' + days + 'd ' + hours + 'h\n' +
      '┃    ' + minutes + 'm ' + seconds + 's\n' +
      '┃\n' +
      '┃ ⚡ STATUS\n' +
      '┃ └─ ONLINE ✓\n' +
      '┃\n' +
      '┃ 🤖 BOT\n' +
      '┃ └─ NØXIR-B∅T\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '╭──────────────────────╮\n' +
      '│ 🟢 STATUS: ONLINE    │\n' +
      '│ ⏱️ UPTIME ATIVO      │\n' +
      '╰──────────────────────╯';

    if (ctx && typeof ctx.reply === 'function') {
      await ctx.reply(text);
    }

    return text;
  }
};
