const { isAntiFloodEnabled } = require('./protection');
const { isOwner } = require('./permissions');

const janelas = new Map();

const JANELA_MS = 6000;
const LIMITE_MSGS = 3;
const LIMITE_MENCOES = 5;

async function handleAntiFlood(ctx) {
  if (!ctx || !ctx.isGroup) return false;

  if (!isAntiFloodEnabled(ctx.chat)) {
    return false;
  }

  if (!ctx.isBotAdmin) {
    return false;
  }

  if (ctx.isAdmin || isOwner(ctx)) {
    return false;
  }

  const sender = ctx.sender;

  if (!sender || ctx.message?.key?.fromMe) {
    return false;
  }

  const mencionados = Array.isArray(ctx.mentionedJid)
    ? ctx.mentionedJid
    : [];

  // 💥 BOMBA DE MENÇÕES
  if (mencionados.length >= LIMITE_MENCOES) {
    return await punir(ctx, `💥 bomba de menções (${mencionados.length})`);
  }

  // 🌊 FLOOD DE MENSAGENS
  const chave = `${ctx.chat}_${sender}`;
  const agora = Date.now();

  let lista = janelas.get(chave) || [];

  lista = lista.filter(
    timestamp => agora - timestamp < JANELA_MS
  );

  lista.push(agora);

  janelas.set(chave, lista);

  if (lista.length >= LIMITE_MSGS) {
    janelas.delete(chave);

    return await punir(
      ctx,
      `🌊 flood (${LIMITE_MSGS} mensagens em ${JANELA_MS / 1000}s)`
    );
  }

  return false;
}

async function punir(ctx, motivo) {
  const sender = ctx.sender;

  try {
    // 🗑️ Apaga a mensagem que acionou a proteção
    if (ctx.message?.key?.id) {
      await ctx.sock.sendMessage(
        ctx.chat,
        {
          delete: {
            remoteJid: ctx.chat,
            fromMe: false,
            id: ctx.message.key.id,
            participant: sender
          }
        }
      ).catch(() => {});
    }

    // 🚫 Remove o membro
    await ctx.sock.groupParticipantsUpdate(
      ctx.chat,
      [sender],
      'remove'
    );

    // 🌑 Aviso oficial do NØXIR
    await ctx.sock.sendMessage(
      ctx.chat,
      {
        text:
          '╭━━━〔 🌑 NØXIR SHIELD 〕━━━╮\n' +
          '┃\n' +
          '┃ 🚫 FLOOD DETECTADO\n' +
          '┃\n' +
          '┃ 👤 Usuário: @' + sender.split('@')[0] + '\n' +
          '┃ ⚠️ Motivo: ' + motivo + '\n' +
          '┃\n' +
          '┃ 🌊 O NØXIR protege este grupo\n' +
          '┃    contra spam e flood.\n' +
          '┃\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━━╯',
        mentions: [sender]
      }
    );

    return true;

  } catch (error) {
    console.error(
      '❌ [NØXIR ANTI-FLOOD]',
      error.message
    );

    return false;
  }
}

module.exports = {
  handleAntiFlood
};
