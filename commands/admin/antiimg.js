const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../database/antiimg.json');

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
  name: 'antiimg',
  aliases: ['antiimagem'],
  category: 'admin',
  description: 'Ativa ou desativa o sistema anti-imagem do grupo.',
  usage: '¥antiimg',
  cooldown: 5,

  async execute(ctx) {
    if (!ctx.isGroup) {
      return ctx.reply('❌ Este comando só pode ser usado em grupos.');
    }

    if (!ctx.isAdmin) {
      return ctx.reply('❌ Apenas administradores do grupo podem usar este comando.');
    }

    if (!ctx.isBotAdmin) {
      return ctx.reply('❌ Preciso ser administrador do grupo para ativar o Anti-Imagem.');
    }

    const grupo = ctx.chat;
    const grupos = carregar();
    const ativo = grupos.includes(grupo);

    if (ativo) {
      const novaLista = grupos.filter(id => id !== grupo);
      salvar(novaLista);

      return ctx.reply(
        '╭━━━〔 🖼️ ANTI-IMAGEM 〕━━━╮\n' +
        '┃\n' +
        '┃ 🔴 STATUS: DESATIVADO\n' +
        '┃\n' +
        '┃ O sistema Anti-Imagem foi\n' +
        '┃ desativado neste grupo.\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    grupos.push(grupo);
    salvar(grupos);

    return ctx.reply(
      '╭━━━〔 🛡️ ANTI-IMAGEM 〕━━━╮\n' +
      '┃\n' +
      '┃ 🟢 STATUS: ATIVADO\n' +
      '┃\n' +
      '┃ 🖼️ Imagens enviadas por\n' +
      '┃ usuários serão removidas.\n' +
      '┃\n' +
      '┃ 👮 Administradores ficam\n' +
      '┃ protegidos desta regra.\n' +
      '┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
