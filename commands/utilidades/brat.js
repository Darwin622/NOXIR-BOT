const { spawn } = require('child_process');

function createBrat(text) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',

      '-f', 'lavfi',
      '-i', 'color=c=#8ACE00:s=512x512',

      '-vf',
      `drawtext=text='${text.replace(/'/g, "\\'")}':fontcolor=white:fontsize=54:fontfile=/system/fonts/Roboto-Bold.ttf:x=(w-text_w)/2:y=(h-text_h)/2`,

      '-frames:v', '1',
      '-vcodec', 'libwebp',
      '-q:v', '80',
      '-f', 'webp',
      'pipe:1'
    ]);

    const chunks = [];
    let errorText = '';

    ffmpeg.stdout.on('data', chunk => chunks.push(chunk));

    ffmpeg.stderr.on('data', chunk => {
      errorText += chunk.toString();
    });

    ffmpeg.on('error', reject);

    ffmpeg.on('close', code => {
      if (code !== 0) {
        reject(new Error(errorText || `FFmpeg terminou com código ${code}`));
        return;
      }

      resolve(Buffer.concat(chunks));
    });

    ffmpeg.stdin.end();
  });
}

module.exports = {
  name: 'brat',
  aliases: [],
  category: 'stickers',
  description: 'Cria um sticker no estilo Brat',
  usage: '¥brat texto',
  cooldown: 3,

  async execute(ctx) {
    if (!ctx || typeof ctx.reply !== 'function') return;

    const text = String(ctx.body || '')
      .replace(/^¥brat\s*/i, '')
      .trim();

    if (!text) {
      await ctx.reply(
        '❌ Digite o texto do sticker.\n\n' +
        'Exemplo:\n' +
        '¥brat NØXIR-B∅T'
      );
      return;
    }

    try {
      await ctx.reply('🎨 Criando seu Brat...');

      const sticker = await createBrat(text);

      await ctx.sendSticker(sticker);

    } catch (error) {
      console.error('[BRAT]', error);

      await ctx.reply(
        '❌ Erro ao criar o Brat.\n\n' +
        '💡 Veja o erro [BRAT] no console.'
      );
    }
  }
};
