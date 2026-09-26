const os = require('os');

module.exports = {
  name: 'ping',
  aliases: ['p', 'pong'],
  category: 'sistema',
  description: 'Mostra o estado e as informações técnicas do NØXIR-B∅T',
  usage: '¥ping',
  cooldown: 3,

  async execute(ctx) {
    const start = Date.now();

    const latency = Date.now() - start;
    const uptime = process.uptime();
    const memory = process.memoryUsage().rss / 1024 / 1024;

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const text =
      '╭━━━〔 ⚡ NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ 🟢 STATUS\n' +
      '┃ └─ ONLINE\n' +
      '┃\n' +
      '┃ ⚡ LATÊNCIA\n' +
      '┃ └─ ' + latency + ' ms\n' +
      '┃\n' +
      '┃ ⏱️ UPTIME\n' +
      '┃ └─ ' + days + 'd ' +
      hours + 'h ' +
      minutes + 'm ' +
      seconds + 's\n' +
      '┃\n' +
      '┃ 💾 MEMÓRIA\n' +
      '┃ └─ ' + memory.toFixed(2) + ' MB\n' +
      '┃\n' +
      '┃ 📱 SISTEMA\n' +
      '┃ └─ ' + os.platform() + '\n' +
      '┃\n' +
      '┃ 🏗️ ARQUITETURA\n' +
      '┃ └─ ' + os.arch().toUpperCase() + '\n' +
      '┃\n' +
      '┃ 🟢 NODE.JS\n' +
      '┃ └─ ' + process.version + '\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯';

    if (ctx && typeof ctx.reply === 'function') {
      await ctx.reply(text);
    }

    return text;
  }
};
