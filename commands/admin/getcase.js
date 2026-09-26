const fs = require('fs');
const path = require('path');
const { isOwner } = require('../../lib/permissions');

const COMMANDS_DIR = path.join(__dirname, '..');

function procurarComando(nome, diretorio = COMMANDS_DIR) {
  const itens = fs.readdirSync(diretorio, { withFileTypes: true });

  for (const item of itens) {
    const caminho = path.join(diretorio, item.name);

    if (item.isDirectory()) {
      const encontrado = procurarComando(nome, caminho);
      if (encontrado) return encontrado;
    }

    if (
      item.isFile() &&
      item.name.endsWith('.js') &&
      item.name.toLowerCase() === `${nome.toLowerCase()}.js`
    ) {
      return caminho;
    }
  }

  return null;
}

module.exports = {
  name: 'getcase',
  aliases: ['puxarcase', 'puxarcomando', 'getcomando'],
  category: 'admin',
  description: 'Puxa o código de um comando do NØXIR-B∅T.',
  usage: '¥getcase nome',
  cooldown: 3,

  async execute(ctx) {
    if (!isOwner(ctx)) {
      return ctx.reply(
        '❌ Apenas o dono do NØXIR-B∅T pode usar este comando.'
      );
    }

    const nome = String(ctx.args?.[0] || '')
      .trim()
      .replace(/\.js$/i, '');

    if (!nome) {
      return ctx.reply(
        '📂 *GETCASE*\n\n' +
        'Use:\n' +
        '└─ ¥getcase nome\n\n' +
        'Exemplo:\n' +
        '└─ ¥getcase ping'
      );
    }

    const arquivo = procurarComando(nome);

    if (!arquivo) {
      return ctx.reply(
        `❌ Comando *${nome}* não encontrado na pasta commands.`
      );
    }

    try {
      const codigo = fs.readFileSync(arquivo, 'utf8');
      const relativo = path.relative(
        path.join(__dirname, '../..'),
        arquivo
      );

      const resposta =
        `📂 *COMANDO ENCONTRADO*\n\n` +
        `📄 Arquivo: ${relativo}\n` +
        `📦 Comando: ${nome}\n\n` +
        '```javascript\n' +
        codigo +
        '\n```';

      await ctx.reply(resposta);

    } catch (error) {
      console.error('[GETCASE] Erro:', error);

      await ctx.reply(
        '❌ Erro ao ler o arquivo do comando.'
      );
    }
  }
};
