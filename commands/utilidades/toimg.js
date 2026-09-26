const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const execFileAsync = promisify(execFile);

module.exports = {
  name: 'toimg',
  aliases: ['imagem', 'stickerimg'],
  category: 'utilidades',
  description: 'Transforma um sticker em imagem.',
  usage: '¥toimg',

  async execute(ctx) {
    let entrada = null;
    let saida = null;

    try {
      const sticker = ctx.quotedMessage?.stickerMessage;

      if (!sticker) {
        return ctx.reply(
          '🖼️ *TOIMG*\n\n' +
          '❌ Responda a um sticker com ¥toimg.'
        );
      }

      console.log('[TOIMG] Baixando sticker...');

      const stream = await downloadContentFromMessage(
        sticker,
        'sticker'
      );

      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      console.log(
        '[TOIMG] Sticker baixado:',
        buffer.length,
        'bytes'
      );

      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

      entrada = path.join(
        os.tmpdir(),
        `noxir_toimg_${id}.webp`
      );

      saida = path.join(
        os.tmpdir(),
        `noxir_toimg_${id}.jpg`
      );

      fs.writeFileSync(entrada, buffer);

      console.log('[TOIMG] Convertendo sticker...');

      /*
       * Primeiro tentamos converter diretamente.
       * -frames:v 1 faz o primeiro frame de stickers animados.
       */
      try {
        await execFileAsync('ffmpeg', [
          '-y',
          '-i', entrada,
          '-frames:v', '1',
          '-q:v', '2',
          saida
        ]);

      } catch (firstError) {
        console.log(
          '[TOIMG] Conversão direta falhou. Tentando modo alternativo...'
        );

        /*
         * Alguns WebP animados não são reconhecidos corretamente
         * pelo FFmpeg. Tentamos forçar o formato WebP.
         */
        await execFileAsync('ffmpeg', [
          '-y',
          '-f', 'webp',
          '-i', entrada,
          '-vf', 'format=yuvj420p',
          '-frames:v', '1',
          '-q:v', '2',
          saida
        ]);
      }

      if (!fs.existsSync(saida)) {
        throw new Error('FFmpeg não criou a imagem de saída.');
      }

      const imagem = fs.readFileSync(saida);

      if (!imagem.length) {
        throw new Error('A imagem criada está vazia.');
      }

      console.log(
        '[TOIMG] JPG criado:',
        imagem.length,
        'bytes'
      );

      await ctx.sock.sendMessage(
        ctx.chat,
        {
          image: imagem,
          mimetype: 'image/jpeg',
          caption: '🖼️ Sticker transformado em imagem.'
        },
        {
          quoted: ctx.message
        }
      );

      console.log('[TOIMG] Foto enviada.');

    } catch (error) {
      console.error('[TOIMG] Erro:', error);

      await ctx.reply(
        '❌ *TOIMG*\n\n' +
        'Não foi possível transformar este sticker em imagem.\n\n' +
        '💡 Tente responder a outro sticker.'
      );

    } finally {
      try {
        if (entrada && fs.existsSync(entrada)) {
          fs.unlinkSync(entrada);
        }

        if (saida && fs.existsSync(saida)) {
          fs.unlinkSync(saida);
        }
      } catch (cleanupError) {
        console.error(
          '[TOIMG] Erro ao limpar arquivos temporários:',
          cleanupError.message
        );
      }
    }
  }
};
