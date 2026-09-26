function normalizeNumber(value) {
  return String(value || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '');
}

function isOwner(ctx) {
  if (!ctx || !ctx.config) return false;

  const owner = normalizeNumber(ctx.config.ownerNumber);

  const candidates = [
    ctx.sender,
    ctx.message?.key?.participant,
    ctx.message?.key?.participantAlt,
    ctx.message?.key?.remoteJid,
    ctx.message?.key?.remoteJidAlt
  ];

  return candidates.some(value =>
    normalizeNumber(value) === owner
  );
}

function checkPermission(command, ctx) {
  if (command.ownerOnly && !isOwner(ctx)) {
    return {
      allowed: false,
      message: '❌ Apenas o dono do NØXIR-B∅T pode usar este comando.'
    };
  }

  if (command.groupOnly && !ctx.isGroup) {
    return {
      allowed: false,
      message: '❌ Este comando só pode ser usado em grupos.'
    };
  }

  if (command.botAdmin && !ctx.isBotAdmin) {
    return {
      allowed: false,
      message: '❌ O NØXIR-B∅T precisa ser administrador deste grupo.'
    };
  }

  return { allowed: true };
}

module.exports = {
  normalizeNumber,
  isOwner,
  checkPermission
};
