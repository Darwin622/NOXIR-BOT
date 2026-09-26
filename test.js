const { generateWAMessageFromContent, proto } = require('@itsliaaa/baileys');

function criarMensagemInterativa(jid) {
  const msg = proto.Message.fromObject({
    interactiveMessage: proto.Message.InteractiveMessage.create({
      body: proto.Message.InteractiveMessage.Body.create({ text: "Escolha uma opção abaixo:" }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: "NOXIR-BOT" }),
      header: proto.Message.InteractiveMessage.Header.create({ title: "Menu Principal", hasMediaAttachment: false }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: [
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: "Opção 1", id: "opt1" })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({ display_text: "Abrir Link", url: "https://google.com" })
          }
        ]
      })
    })
  });

  return generateWAMessageFromContent(jid, msg, { userJid: "5511999999999@s.whatsapp.net" });
}

console.log("Estrutura gerada com sucesso!");
