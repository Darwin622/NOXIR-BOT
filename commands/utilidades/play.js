const ytSearch = require('yt-search');

module.exports = {
  name: 'play',
  aliases: ['musica', 'music'],

  async execute(ctx) {
    const consulta = (ctx.args || []).join(' ').trim();

    if (!consulta) {
      return ctx.reply(
        '🎧 NØXIR PLAY\n\n' +
        'Use:\n' +
        '¥play nome da música\n\n' +
        'Exemplo:\n' +
        '¥play Oruam - 10 Min de Freestyle'
      );
    }

    try {
      const resultado = await ytSearch(consulta);
      const video = resultado.videos?.[0];

      if (!video) {
        return ctx.reply('❌ Não encontrei essa música.');
      }

      const texto =
        '╭━━━〔 🎧 NØXIR PLAY 〕━━━╮\n' +
        '┃\n' +
        '┃ 🎵 MÚSICA ENCONTRADA\n' +
        '┃\n' +
        '┃ 🎶 Título\n' +
        '┃ └─ ' + video.title + '\n' +
        '┃\n' +
        '┃ 👤 Artista\n' +
        '┃ └─ ' + (video.author?.name || 'Desconhecido') + '\n' +
        '┃\n' +
        '┃ ⏱️ Duração\n' +
        '┃ └─ ' + (video.timestamp || 'Desconhecida') + '\n' +
        '┃\n' +
        '┃ ━━━━━━━━━━━━━━━━━━━\n' +
        '┃\n' +
        '┃ 📥 ESCOLHA O FORMATO\n' +
        '┃\n' +
        '┃ 🎵 ÁUDIO\n' +
        '┃ 🎬 VÍDEO\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯';

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          image: { url: video.thumbnail },
          caption: texto,
          buttons: [
            {
              buttonId: 'play_audio|' + video.videoId,
              buttonText: { displayText: '🎵 Áudio' },
              type: 1
            },
            {
              buttonId: 'play_video|' + video.videoId,
              buttonText: { displayText: '🎬 Vídeo' },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: ctx.message }
      );

    } catch (error) {
      console.error('[PLAY]', error);
      await ctx.reply('❌ Erro ao pesquisar a música.');
    }
  }
};
