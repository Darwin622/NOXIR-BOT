const ytSearch = require('yt-search');

module.exports = {
  name: 'play',
  aliases: ['musica', 'music'],

  async execute(ctx) {
    const consulta = (ctx.args || []).join(' ').trim();

    if (!consulta) {
      return ctx.reply(
        '🟣 NØXIR PLAY\n\n' +
        'Use:\n' +
        '¥play nome da música\n\n' +
        'Exemplo:\n' +
        '¥play Oruam'
      );
    }

    try {
      await ctx.reply('🔎 Pesquisando no YouTube...');

      const resultado = await ytSearch(consulta);
      const video = resultado.videos?.[0];

      if (!video) {
        return ctx.reply(
          '❌ Nenhum resultado encontrado.\n\n' +
          'Tente pesquisar pelo nome da música ou artista.'
        );
      }

      const titulo = video.title || 'Desconhecido';
      const artista = video.author?.name || 'Desconhecido';
      const duracao = video.timestamp || 'Desconhecida';
      const views = typeof video.views === 'number'
        ? video.views.toLocaleString('pt-BR')
        : 'Indisponível';

      const texto =
        '╭━━━〔 🟣 NØXIR PLAY 〕━━━╮\n' +
        '┃\n' +
        '┃ 🔎 Pesquisa: ' + consulta + '\n' +
        '┃\n' +
        '┃ 🎵 Título\n' +
        '┃ └─ ' + titulo + '\n' +
        '┃\n' +
        '┃ 👤 Artista / Canal\n' +
        '┃ └─ ' + artista + '\n' +
        '┃\n' +
        '┃ ⏱️ Duração\n' +
        '┃ └─ ' + duracao + '\n' +
        '┃\n' +
        '┃ 👀 Visualizações\n' +
        '┃ └─ ' + views + '\n' +
        '┃\n' +
        '┃ 📺 Fonte: YouTube\n' +
        '┃\n' +
        '┃ 📥 Download disponível\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
        '🎛️ ESCOLHA O FORMATO';

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          image: { url: video.thumbnail },
          caption: texto,
          buttons: [
            {
              buttonId: 'play_audio|' + video.videoId,
              buttonText: { displayText: '🎧 ÁUDIO' },
              type: 1
            },
            {
              buttonId: 'play_video|' + video.videoId,
              buttonText: { displayText: '🎬 VÍDEO' },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: ctx.message }
      );

    } catch (error) {
      console.error('[PLAY]', error);
      await ctx.reply(
        '❌ Ocorreu um erro ao pesquisar no YouTube.\n\n' +
        'Tente novamente daqui a pouco.'
      );
    }
  }
};
