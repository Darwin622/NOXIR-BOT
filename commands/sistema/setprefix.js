const fs = require('fs');
const path = require('path');
const { isOwner } = require('../../lib/permissions');

module.exports = {
  name: 'setprefix',
  aliases: ['prefix'],

  async execute(ctx) {
    if (!isOwner(ctx)) {
      return ctx.reply('❌ Apenas o dono do NØXIR-B∅T pode alterar o prefixo.');
    }

    const novoPrefixo = String(ctx.args[0] || '').trim();

    if (!novoPrefixo) {
      return ctx.reply('❌ Exemplo: ¥setprefix !');
    }

    if (novoPrefixo.length > 3) {
      return ctx.reply('❌ O prefixo pode ter no máximo 3 caracteres.');
    }

    const configPath = path.resolve(__dirname, '../../config/config.js');

    let configFile = fs.readFileSync(configPath, 'utf8');

    configFile = configFile.replace(
      /prefix:\s*['"][^'"]*['"]/,
      `prefix: '${novoPrefixo.replace(/'/g, "\\'")}'`
    );

    fs.writeFileSync(configPath, configFile);

    return ctx.reply(
      '╭━━━〔 ⚙️ NØXIR-B∅T 〕━━━╮\n' +
      '┃\n' +
      '┃ 🔑 PREFIXO ALTERADO\n' +
      '┃ └─ Novo: ' + novoPrefixo + '\n' +
      '┃\n' +
      '┃ 🔄 Reinicie o bot para aplicar.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
