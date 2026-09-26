const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  generateWAMessageFromContent, 
  proto 
} = require('@itsliaaa/baileys');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['NOXIR-BOT', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão fechada. Reconectando...', shouldReconnect);
      if (shouldReconnect) connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('NOXIR-BOT conectado com sucesso!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || '';

    // Comando de teste !menu
    if (body.toLowerCase() === '!menu') {
      const msg = proto.Message.fromObject({
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ text: "Escolha uma opção do NOXIR-BOT:" }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: "NOXIR-BOT v1.0" }),
          header: proto.Message.InteractiveMessage.Header.create({ title: "📌 MENU PRINCIPAL", hasMediaAttachment: false }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({ display_text: "⚡ Opção Rápida", id: "btn_1" })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({ display_text: "🌐 Visitar Site", url: "https://google.com" })
              }
            ]
          })
        })
      });

      const waMessage = generateWAMessageFromContent(from, msg, { userJid: sock.user.id });
      await sock.relayMessage(from, waMessage.message, { messageId: waMessage.key.id });
    }
  });
}

connectToWhatsApp();
