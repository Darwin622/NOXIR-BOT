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
  name: 'bangp',
  aliases: ['banirgrupo'],
  category: 'admin',
  description: 'Bane o uso do bot neste grupo.',
  usage: '¥bangp',
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

    if (grupos.includes(grupo)) {
      return ctx.reply('⚠️ Este grupo já está banido.');
    }

    grupos.push(grupo);
    salvar(grupos);

    return ctx.reply(
      '╭━━━〔 🚫 GRUPO BANIDO 〕━━━╮\n' +
      '┃\n' +
      '┃ 🤖 NØXIR-B∅T\n' +
      '┃\n' +
      '┃ ⚠️ Este grupo foi banido\n' +
      '┃    pelo proprietário do bot.\n' +
      '┃\n' +
      '┃ 🔒 O NØXIR-B∅T não responderá\n' +
      '┃    mais a comandos neste grupo.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
