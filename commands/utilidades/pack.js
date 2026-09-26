const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'pack',
  aliases: ['packfig', 'packfigurinhas'],
  desc: 'Envia packs de figurinhas da pasta',
  async execute(ctx) {
    const q = ctx.args.join(' ').trim().toLowerCase();
    const conn = ctx.sock;
    const m = ctx.message;
    const prefix = ctx.config.prefix;

    const base = path.join(__dirname, '../../media/packs');
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
    
    const packsDisponiveis = fs.readdirSync(base).filter(f => fs.statSync(path.join(base, f)).isDirectory());

    if (!q) {
      return ctx.reply(`*Manda o nome do pack*\n\nEx: ${prefix}pack putaria\n\nDisponíveis: ${packsDisponiveis.join(', ') || 'nenhum'}`);
    }

    const packPath = path.join(base, q);
    if (!fs.existsSync(packPath)) {
      return ctx.reply(`*Pack "${q}" não existe*\nDisponíveis: ${packsDisponiveis.join(', ')}`);
    }

    const arquivos = fs.readdirSync(packPath).filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'));
    
    if (!arquivos.length) return ctx.reply(`*Pack ${q} tá vazio* - coloca .webp dentro de media/packs/${q}/`);

    await ctx.reply(`*Enviando pack ${q}...* _${arquivos.length} figs_ 👻`);

    for (let file of arquivos) {
      try {
        const filePath = path.join(packPath, file);
        await conn.sendMessage(ctx.chat, { sticker: { url: filePath } }, { quoted: m });
        await new Promise(r => setTimeout(r, 800));
      } catch (e) {
        console.log('Erro fig:', file, e.message);
      }
    }
  }
};
