const { spawn } = require('child_process');
const { Image } = require('node-webpmux');

function convertToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', 'pipe:0',
      '-vf',
      'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0',
      '-vcodec', 'libwebp',
      '-q:v', '75',
      '-an',
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

    ffmpeg.stdin.end(buffer);
  });
}

function createExif(packName, author) {
  const data = JSON.stringify({
    'sticker-pack-id': 'noxir-stickers',
    'sticker-pack-name': packName,
    'sticker-pack-publisher': author,
    'emojis': ['🤖', '🔥']
  });

  const exif = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57,
    0x07, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x16, 0x00,
    0x00, 0x00
  ]);

  const json = Buffer.from(data, 'utf8');

  const result = Buffer.concat([exif, json]);

  result.writeUInt32LE(json.length, 14);

  return result;
}

async function addMetadata(webp, author) {
  const img = new Image();

  await img.load(webp);

  img.exif = createExif(
    'NØXIR STICKERS',
    author
  );

  return await img.save(null);
}

module.exports = {
  name: 'sticker',
  aliases: ['s'],
  category: 'stickers',
  description: 'Cria uma figurinha NØXIR',
  usage: '¥sticker ou ¥s',
  cooldown: 3,

  async execute(ctx) {
    if (!ctx || typeof ctx.reply !== 'function') return;

    const message = ctx.message;

    const quoted =
      message?.message?.extendedTextMessage
        ?.contextInfo?.quotedMessage;

    const imageMessage =
      message?.message?.imageMessage ||
      quoted?.imageMessage;

    if (!imageMessage) {
      await ctx.reply(
        '❌ Envie uma imagem com ¥sticker ou responda a uma imagem usando ¥s.'
      );
      return;
    }

    try {
      await ctx.reply('⏳ Criando seu sticker...');

      const buffer = await ctx.downloadMedia(imageMessage);

      if (!buffer?.length) {
        await ctx.reply('❌ Não consegui baixar a imagem.');
        return;
      }

      const webp = await convertToWebp(buffer);

      const pushName =
        message?.pushName || 'Usuário';

      let groupName = 'Privado';

      if (ctx.isGroup && ctx.sock) {
        try {
          const metadata = await ctx.sock.groupMetadata(ctx.chat);
          groupName = metadata?.subject || 'Grupo';
        } catch {
          groupName = 'Grupo';
        }
      }

      const author =
        `👥 Grupo: ${groupName}\n\n` +
        `📩 Pedido por: ${pushName}\n\n` +
        `🎨 Feito por: NØXIR\n\n` +
        `👑 Dono: Vicente Darwin Jephte.🪽`;

      const finalSticker = await addMetadata(
        webp,
        author
      );

      await ctx.sendSticker(finalSticker);

    } catch (error) {
      console.error('[STICKER]', error);

      await ctx.reply(
        '❌ Erro ao criar o sticker.'
      );
    }
  }
};
