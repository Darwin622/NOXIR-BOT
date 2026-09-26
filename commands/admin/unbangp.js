const fs = require('fs');
const path = require('path');
const { isOwner } = require('../../lib/permissions');

const FILE = path.join(__dirname, '../../database/bannedGroups.json');

function carregar() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, '[]');
  }

  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function salvar(lista) {
  fs.writeFileSync(FILE, JSON.stringify(lista, null, 2));
}

module.exports = {
  name: 'unbangp',
  aliases: ['desbanirgrupo'],
  category: 'admin',
  description: 'Libera o uso do bot neste grupo.',
  usage: '¥unbangp',
  cooldown: 5,

  async execute(ctx) {
    if (!ctx.isGroup) {
      return ctx.reply('❌ Este comando só pode ser usado em grupos.');
    }

    if (!isOwner(ctx)) {
      return ctx.reply(
        '❌ Apenas o dono do NØXIR-B∅T pode usar este comando.'
      );
    }

    const grupo = ctx.chat;
    const grupos = carregar();
    const index = grupos.indexOf(grupo);

    if (index === -1) {
      return ctx.reply('⚠️ Este grupo não está banido.');
    }

    grupos.splice(index, 1);
    salvar(grupos);

    return ctx.reply(
      '╭━━━〔 ✅ GRUPO DESBANIDO 〕━━━╮\n' +
      '┃\n' +
      '┃ 🤖 NØXIR-B∅T\n' +
      '┃\n' +
      '┃ ✅ O bloqueio deste grupo\n' +
      '┃    foi removido.\n' +
      '┃\n' +
      '┃ 🟢 O bot voltou a responder\n' +
      '┃    aos comandos normalmente.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
