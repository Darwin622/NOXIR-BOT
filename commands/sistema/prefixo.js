module.exports = {
  name: 'prefixo',
  aliases: ['prefix', 'chave'],
  category: 'sistema',
  description: 'Mostra a chave oficial do NØXIR-B∅T',
  usage: 'prefixo',
  noPrefix: true,
  cooldown: 3,

  async execute(ctx) {
    const config = ctx.config;

    const text =
      '╭━━━〔 🔐 NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ ⚡ CHAVE DO NØXIR\n' +
      '┃\n' +
      '┃ ╭──────────────────╮\n' +
      '┃ │                  │\n' +
      '┃ │       ' + config.prefix + '          │\n' +
      '┃ │                  │\n' +
      '┃ ╰──────────────────╯\n' +
      '┃\n' +
      '┃ 🔑 A chave oficial do\n' +
      '┃    NØXIR-B∅T é:\n' +
      '┃\n' +
      '┃ └─ ' + config.prefix + '\n' +
      '┃\n' +
      '┃ 📌 TODOS OS COMANDOS\n' +
      '┃    COMEÇAM COM A CHAVE.\n' +
      '┃\n' +
      '┃ 💡 EXEMPLOS\n' +
      '┃ ├─ ' + config.prefix + 'menu\n' +
      '┃ ├─ ' + config.prefix + 'ping\n' +
      '┃ ├─ ' + config.prefix + 'info\n' +
      '┃ ├─ ' + config.prefix + 'dono\n' +
      '┃ └─ ' + config.prefix + 's\n' +
      '┃\n' +
      '┃ 🛡️ NØXIR-B∅T\n' +
      '┃ └─ Chave reconhecida ✓\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '╭──────────────────────╮\n' +
      '│ 🔑 CHAVE: ' + config.prefix + '          │\n' +
      '│ 🤖 NØXIR-B∅T • ONLINE│\n' +
      '╰──────────────────────╯';

    if (ctx && typeof ctx.reply === 'function') {
      await ctx.reply(text);
    }

    return text;
  }
};
