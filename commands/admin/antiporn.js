const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../database/antiporn.json');

function carregar() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, '[]');
  }

  try {
    const dados = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvar(lista) {
  fs.writeFileSync(FILE, JSON.stringify(lista, null, 2));
}

module.exports = {
  name: 'antiporn',
  aliases: ['antiporno'],
  category: 'admin',
  description: 'Ativa ou desativa a proteção contra conteúdo sexual explícito.',
  usage: '¥antiporn',
  cooldown: 5,

  async execute(ctx) {
    if (!ctx.isGroup) {
      return ctx.reply('❌ Este comando só pode ser usado em grupos.');
    }

    if (!ctx.isAdmin) {
      return ctx.reply('❌ Apenas administradores do grupo podem usar este comando.');
    }

    if (!ctx.isBotAdmin) {
      return ctx.reply('❌ Preciso ser administrador do grupo para ativar esta proteção.');
    }

    const grupo = ctx.chat;
    const grupos = carregar();
    const ativo = grupos.includes(grupo);

    if (ativo) {
      salvar(grupos.filter(id => id !== grupo));

      return ctx.reply(
        '╭━━━〔 🛡️ ANTI-PORN 〕━━━╮\n' +
        '┃\n' +
        '┃ 🔴 STATUS: DESATIVADO\n' +
        '┃\n' +
        '┃ A proteção foi desativada\n' +
        '┃ neste grupo.\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    grupos.push(grupo);
    salvar(grupos);

    return ctx.reply(
      '╭━━━〔 🛡️ ANTI-PORN 〕━━━╮\n' +
      '┃\n' +
      '┃ 🟢 STATUS: ATIVADO\n' +
      '┃\n' +
      '┃ A proteção contra conteúdo\n' +
      '┃ sexual explícito foi ativada.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
