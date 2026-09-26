const pino = require('pino');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const { isOwner } = require('./permissions');
const {
  default: makeWASocket,
  useMultiFileAuthState,
    generateWAMessageFromContent,
    proto
} = require('@itsliaaa/baileys');

const config = require('../config/config');

let reconnecting = false;

const groupCache = new Map();

async function startBot(handleMessage) {
  const { state, saveCreds } =
    await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code =
          await sock.requestPairingCode(config.pairingNumber);

        console.log('');
        console.log('================================');
        console.log('CODIGO DE PAREAMENTO');
        console.log('================================');
        console.log('Numero:', config.pairingNumber);
        console.log('Codigo:', code);
        console.log('================================');
        console.log('');
      } catch (error) {
        console.error('[PAIRING]', error.message);
      }
    }, 5000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      reconnecting = false;

      console.log('');
      console.log('================================');
      console.log('NOXIR-BOT CONECTADO');
      console.log('================================');
      console.log('WhatsApp conectado com sucesso!');
      console.log('Conta:', config.pairingNumber);
      console.log('');
    }

    if (connection === 'close') {
      const error =
        lastDisconnect?.error?.message ||
        'Erro desconhecido';

      console.log('Conexao encerrada:', error);

      if (!reconnecting) {
        reconnecting = true;

        setTimeout(() => {
          reconnecting = false;
          startBot(handleMessage);
        }, 3000);
      }
    }
  });
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log('[DIAG] messages.upsert:', type, 'quantidade:', messages?.length || 0);

    if (type !== 'notify') return;

    for (const message of messages) {
      try {
        if (!message.message) continue;

        const remoteJid = message.key.remoteJid;
        if (!remoteJid) continue;

        const msg =
        message.message?.ephemeralMessage?.message ||
        message.message?.viewOnceMessage?.message ||
        message.message?.viewOnceMessageV2?.message ||
        message.message;

        const body =
          msg.conversation ||
          msg.extendedTextMessage?.text ||
          msg.imageMessage?.caption ||
          msg.videoMessage?.caption ||
          '';

        const quotedMessage =
          msg.extendedTextMessage?.contextInfo?.quotedMessage ||
          null;

        // Leitura dos botões interativos
      let buttonId = null;

      const interactiveResponse =
        msg.interactiveResponseMessage?.nativeFlowResponseMessage;

      if (interactiveResponse?.paramsJson) {
        try {
          const params = JSON.parse(interactiveResponse.paramsJson);
          buttonId = params.id || null;
          console.log('[BOTÃO CLICADO]', buttonId);
        } catch (error) {
          console.error('[BOTÃO] Erro ao ler botão:', error.message);
        }
      }

      if (!buttonId) {
        buttonId = msg.templateButtonReplyMessage?.selectedId ||
          msg.buttonsResponseMessage?.selectedButtonId ||
          msg.listResponseMessage?.singleSelectReply?.selectedRowId || null;
        if (buttonId) console.log("[BOTÃO CLICADO]", buttonId);
      }
      const imageMessage =
          msg.imageMessage ||
          msg.viewOnceMessage?.message?.imageMessage ||
          msg.viewOnceMessageV2?.message?.imageMessage ||
          null;

        let sender =
          message.key.participant ||
          message.key.participantAlt ||
          remoteJid;

        const isGroup = remoteJid.endsWith('@g.us');

        const maskId = (value) => {
          const digits = String(value || '').replace(/\\D/g, '');
          return digits ? '******' + digits.slice(-4) : '(vazio)';
        };

        console.log('[IDENTIDADE]', {
          sender: maskId(sender),
          participant: maskId(message.key.participant),
          participantAlt: maskId(message.key.participantAlt),
          remoteJid: maskId(remoteJid)
        });


        let isBotAdmin = false;
        let isAdmin = false;

        let participants = [];

        if (isGroup && (String(body || '').trim().startsWith(config.prefix) || imageMessage)) {
          try {
            const cached = groupCache.get(remoteJid);

            if (cached && Date.now() - cached.time < 300000) {
              participants = cached.participants;
            } else {
              const metadata =
                await sock.groupMetadata(remoteJid);

              participants =
                metadata.participants || [];

              groupCache.set(remoteJid, {
                participants,
                time: Date.now()
              });
            }

            if (sender.endsWith('@lid')) {
              const lidParticipant = participants.find(
                (p) => p.id === sender || p.lid === sender
              );

              if (lidParticipant?.jid) {
                sender = lidParticipant.jid;
                console.log('[LID->JID] remetente convertido');
              }
            }

            const normalize = (id) =>
              String(id || '')
                .split('@')[0]
                .split(':')[0]
                .replace(/\D/g, '');

            const botNumber =
              normalize(sock.user?.id);

            const botParticipant =
              participants.find((p) =>
                [p.id, p.jid, p.lid, p.phoneNumber]
                  .filter(Boolean)
                  .some((id) => normalize(id) === botNumber)
              );

            isBotAdmin =
              botParticipant?.admin === 'admin' ||
              botParticipant?.admin === 'superadmin';

            const senderNumber = normalize(sender);

            const senderParticipant =
              participants.find((p) =>
                [p.id, p.jid, p.lid, p.phoneNumber]
                  .filter(Boolean)
                  .some((id) => normalize(id) === senderNumber)
              );

            isAdmin =
              senderParticipant?.admin === 'admin' ||
              senderParticipant?.admin === 'superadmin';

            console.log('[BOT-ADMIN]', isBotAdmin);
            console.log('[USER-ADMIN]', isAdmin);

          } catch (error) {
            console.error(
              '[GROUP-ADMIN]',
              error.message
            );
          }
        }

        const sendInteractiveMenu = async (jid, text, mentions = []) => {
          const msg = proto.Message.fromObject({
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text,
                contextInfo: {
                  mentionedJid: mentions
                }
              }),

              footer: proto.Message.InteractiveMessage.Footer.create({
                text: 'NØXIR-B∅T • NØXIR CORE'
              }),

              header: proto.Message.InteractiveMessage.Header.create({
                title: '⟦ 𝙉Ø𝙓𝙄𝙍-𝘽∅𝙏 ⟧',
                hasMediaAttachment: false
              }),

              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [
                    {
                      name: 'single_select',
                      buttonParamsJson: JSON.stringify({
                        title: '📋 ABRIR MENUS',
                        sections: [
                          {
                            title: '🌐 NØXIR-B∅T • CATEGORIAS',
                            rows: [
                              {
                                title: '⚙️ Menu Sistema',
                                description: 'Comandos principais do NØXIR',
                                id: 'menu_sistema'
                              },
                              {
                                title: '👑 Menu Dono',
                                description: 'Comandos exclusivos do proprietário',
                                id: 'menu_dono'
                              },
                              {
                                title: '🛡️ Menu ADM',
                                description: 'Ferramentas de administração',
                                id: 'menu_adm'
                              },
                              {
                                title: '👥 Menu Grupo',
                                description: 'Comandos para grupos',
                                id: 'menu_grupo'
                              },
                              {
                                title: '🔧 Menu Utilidades',
                                description: 'Ferramentas e utilidades',
                                id: 'menu_utilidades'
                              },
                              {
                                title: '🎨 Menu Stickers',
                                description: 'Comandos de stickers e mídia',
                                id: 'menu_stickers'
                              },
                              {
                                title: '🎵 Menu Música',
                                description: 'Comandos de música',
                                id: 'menu_musica'
                              },
                              {
                                title: '🎭 Menu Dark Fun',
                                description: 'Comandos de diversão',
                                id: 'menu_fun'
                              }
                            ]
                          }
                        ]
                      })
                    }
                  ]
                })
            })
          });

          const waMessage = generateWAMessageFromContent(jid, msg, {
            userJid: sock.user?.id
          });

          await sock.relayMessage(
            jid,
            waMessage.message,
            { messageId: waMessage.key.id }
          );
        };

        const ctx = {
          sendInteractiveMenu,
          sock,
          message,
          msg,
          chat: remoteJid,
          sender,
          body,
          isGroup,
          isBotAdmin,
          isAdmin,
          quotedMessage,
          imageMessage,
          config,

          reply: async (text, options = {}) =>
            sock.sendMessage(
              remoteJid,
              {
                text: String(text),
                ...options
              },
              {
                quoted: message
              }
            ),

          sendImage: async (image, caption) =>
            sock.sendMessage(
              remoteJid,
              {
                image: { url: image },
                caption: String(caption)
              },
              {
                quoted: message
              }
            ),

          sendGif: async (gif, caption = '', mentions = []) => {
            const resposta = await fetch(gif);

            if (!resposta.ok) {
              throw new Error(`Falha ao baixar GIF: HTTP ${resposta.status}`);
            }

            const buffer = Buffer.from(await resposta.arrayBuffer());

            return sock.sendMessage(
              remoteJid,
              {
                video: buffer,
                gifPlayback: true,
                mimetype: 'video/mp4',
                caption: String(caption),
                mentions
              },
              {
                quoted: message
              }
            );
          },

          downloadMedia: async (mediaMessage) => {
            const { downloadContentFromMessage } = require('@itsliaaa/baileys');

            let type = 'image';

            if (mediaMessage?.videoMessage) {
              type = 'video';
              mediaMessage = mediaMessage.videoMessage;
            } else if (mediaMessage?.imageMessage) {
              type = 'image';
              mediaMessage = mediaMessage.imageMessage;
            }

            if (!mediaMessage) {
              throw new Error('Mídia não encontrada.');
            }

            const stream = await downloadContentFromMessage(
              mediaMessage,
              type
            );

            const chunks = [];

            for await (const chunk of stream) {
              chunks.push(chunk);
            }

            return Buffer.concat(chunks);
          },

          sendSticker: async (sticker) =>
            sock.sendMessage(
              remoteJid,
              {
                sticker
              },
              {
                quoted: message
              }
            )
        };

        const textoSemPrefixo = String(body || '').trim().toLowerCase();

        if (/^quem\s+sou\s+eu\??$/.test(textoSemPrefixo)) {
          if (isOwner(ctx)) {
            await ctx.reply(
              '╭━━━〔 👑 NØXIR-B∅T 〕━━━╮\n' +
              '┃\n' +
              '┃ 👤 QUEM SOU EU?\n' +
              '┃\n' +
              '┃ 👑 Você é o meu DONO.\n' +
              '┃ 🤖 Proprietário oficial do bot.\n' +
              '┃ 🔐 Acesso: AUTORIZADO\n' +
              '┃ ⭐ Nível: ADMINISTRADOR MÁXIMO\n' +
              '┃\n' +
              '┃ 🛡️ Número reconhecido\n' +
              '┃ ⚡ Privilégios: MÁXIMOS\n' +
              '┃ 📡 Status: CONECTADO\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━━━╯'
            );
          } else {
            await ctx.reply(
              '╭━━━〔 🤖 NØXIR-B∅T 〕━━━╮\n' +
              '┃\n' +
              '┃ 👤 Você é um usuário.\n' +
              '┃\n' +
              '┃ 🔐 Acesso: NORMAL\n' +
              '┃ ⭐ Nível: USUÁRIO\n' +
              '┃\n' +
              '┃ 👑 O proprietário deste bot\n' +
              '┃    possui acesso especial.\n' +
              '┃\n' +
              '┃ 🤖 Continue usando o NØXIR-B∅T\n' +
              '┃    para explorar os comandos.\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━━━╯'
            );
          }

          continue;
        }

        console.log(
          'Mensagem recebida:',
          body || '[mídia]'
        );

        if (buttonId) {

          if (buttonId.startsWith('play_audio|')) {
            const videoId = buttonId.split('|')[1];

            if (!videoId) {
              await ctx.reply('❌ Música não identificada.');
              continue;
            }

            const dir = fs.mkdtempSync(
              path.join(os.tmpdir(), 'noxir_play_')
            );

            try {
              const inicio = Date.now();

              await ctx.reply('⏳ 🎵 Preparando áudio...');

              await execFileAsync('yt-dlp', [
                '--js-runtimes', 'node',
                '--extractor-args', 'youtube:player_client=mweb',
                '--no-playlist',
                '-f', '599',
                '-o', path.join(dir, 'audio.%(ext)s'),
                'https://www.youtube.com/watch?v=' + videoId
              ]);

              const m4a = path.join(dir, 'audio.m4a');

              if (!fs.existsSync(m4a)) {
                throw new Error('Áudio M4A não criado.');
              }

              const audio = fs.readFileSync(m4a);

              console.log(
                '[PLAY ÁUDIO] Download concluído em ' +
                ((Date.now() - inicio) / 1000).toFixed(2) + 's'
              );

              await sock.sendMessage(remoteJid, {
                audio: audio,
                mimetype: 'audio/mp4',
                ptt: false
              }, { quoted: message });

              console.log(
                '[PLAY ÁUDIO] Enviado em ' +
                ((Date.now() - inicio) / 1000).toFixed(2) + 's'
              );

            } catch (error) {
              console.error('[PLAY ÁUDIO]', error);
              await ctx.reply('❌ Não foi possível baixar o áudio.');
            } finally {
              fs.rmSync(dir, { recursive: true, force: true });
            }

            continue;
          }

          if (buttonId.startsWith('play_video|')) {
            const videoId = buttonId.split('|')[1];

            if (!videoId) {
              await ctx.reply('❌ Vídeo não identificado.');
              continue;
            }

            const dir = fs.mkdtempSync(
              path.join(os.tmpdir(), 'noxir_play_')
            );

            try {
              await ctx.reply('⏳ 🎬 Baixando o vídeo...');

              await execFileAsync('yt-dlp', [
                '--js-runtimes', 'node',
                '--extractor-args', 'youtube:player_client=mweb',
                '--no-playlist',
                '-f', '598+599',
                '--merge-output-format', 'mp4',
                '-o', path.join(dir, 'video.%(ext)s'),
                'https://www.youtube.com/watch?v=' + videoId
              ]);

              const arquivo = fs.readdirSync(dir)
                .find(x => x.endsWith('.mp4'));

              if (!arquivo) {
                throw new Error('MP4 não criado.');
              }

              const video = fs.readFileSync(
                path.join(dir, arquivo)
              );

              if (video.length > 50 * 1024 * 1024) {
                throw new Error('Vídeo maior que 50 MB.');
              }

              await sock.sendMessage(remoteJid, {
                video: video,
                mimetype: 'video/mp4',
                caption: '🎬 *NØXIR PLAY*'
              }, { quoted: message });

              console.log('[PLAY] Vídeo enviado.');

            } catch (error) {
              console.error('[PLAY VÍDEO]', error.message);
              await ctx.reply('❌ Não foi possível baixar o vídeo.');
            } finally {
              fs.rmSync(dir, { recursive: true, force: true });
            }

            continue;
          }

          const menus = {

            menu_lista:
              '╭────────────────╮\\n' +
              '│   🌑 ɴØxɪʀ-ʙ∅ᴛ   │\\n' +
              '├────────────────┤\\n' +
              '│                │\\n' +
              '│ 🌑 ᴜsᴜáʀɪᴏ : @user │\\n' +
              '│ 🌑 ᴠᴇʀsãᴏ  : 1.0.0 │\\n' +
              '│ 🔑 ᴘʀᴇғɪxᴏ : ¥     │\\n' +
              '│ 🌑 sᴛᴀᴛᴜs  : ᴏɴʟɪɴᴇ │\\n' +
              '│ ⏰ ʜᴏʀᴀ   : ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' │\\n' +
              '│                │\\n' +
              '╰────────────────╯\\n\\n' +
              '⟦ 🫈 ʙᴇᴍ-ᴠɪɴᴅᴏ ⟧\\n\\n' +
              '› 🌑 sᴇʟᴇᴄɪᴏɴᴇ ᴜᴍᴀ ᴄᴀᴛᴇɢᴏʀɪᴀ\\n' +
              'ᴘᴀʀᴀ ᴀᴄᴇssᴀʀ ᴏs ᴄᴏᴍᴀɴᴅᴏs.\\n\\n' +
              '• 🌑 ɴØxɪʀ ᴄᴏʀᴇ •',

            menu_sistema:
              '╭━━━〔 ⚙️ 𝙎𝙄𝙎𝙏𝙀𝙈𝘼 〕━━━╮\n' +
              '┃\n' +
              '┃ ⚡ ¥ping\n' +
              '┃ 🤖 ¥info\n' +
              '┃ 👤 ¥perfil\n' +
              '┃ ⏱️ ¥uptime\n' +
              '┃ 📋 ¥menu\n' +
              '┃ 🔑 ¥prefixo\n' +
              '┃ 🧠 ¥ia\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━╯',

            menu_perfil:
              '╭━━━〔 👤 𝙋𝙀𝙍𝙁𝙄𝙇 〕━━━╮\\n' +
              '┃\\n' +
              '┃ 👤 ¥perfil\\n' +
              '┃ 🖼️ ¥avatar\\n' +
              '┃\\n' +
              '╰━━━━━━━━━━━━━━━━━━╯',

            menu_dono:
              '╭━━━〔 👑 𝘿𝙊𝙉𝙊 〕━━━╮\n' +
              '┃\n' +
              '┃ 👑 ¥dono\n' +
              '┃ 🔧 ¥setprefix\n' +
              '┃ 🔐 ¥menudono\n' +
              '┃ 💀 ¥bangp\n' +
              '┃ ➕ ¥privaddgroup\n' +
              '┃ 📂 ¥getcase\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━╯',

            menu_adm:
              '╭━━━〔 👨‍💼 𝙈𝙀𝙉𝙐 𝘼𝘿𝙈 〕━━━╮\n' +
              '┃\n' +
              '┃ 🖼️ ¥antiimg\n' +
              '┃ 🚫 ¥antiporn\n' +
              '┃ 🔓 ¥unbangp\n' +
              '┃ 🔗 ¥antilink\n' +
              '┃ 🛡️ ¥antisticker\n' +
              '┃ 👑 ¥promover\n' +
              '┃ 🔻 ¥rebaixar\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━━━╯',

            menu_grupo:
              '╭━━━〔 👥 𝙂𝙍𝙐𝙋𝙊 〕━━━╮\n' +
              '┃\n' +
              '┃ 🔓 ¥abrir\n' +
              '┃ 🔒 ¥fechar\n' +
              '┃ ➕ ¥add\n' +
              '┃ 🚫 ¥ban\n' +
              '┃ 📋 ¥grupo\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━╯',

            menu_utilidades:
              '╭━━━〔 🛠️ 𝙐𝙏𝙄𝙇𝙄𝘿𝘼𝘿𝙀𝙎 〕━━━╮\n' +
              '┃\n' +
              '┃ 🌐 ¥traduz\n' +
              '┃ 🎤 ¥trans\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━━━╯',

            menu_stickers:
              '╭━━━〔 🖼️ 𝙈𝙄́𝘿𝙄𝘼 〕━━━╮\n' +
              '┃\n' +
              '┃ 🖼️ ¥sticker\n' +
              '┃ 🎨 ¥brat\n' +
              '┃ 👤 ¥avatar\n' +
              '┃ 🎬 ¥toimg\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━╯',

            menu_musica:
              '╭━━━〔 🎵 𝙈𝙐́𝙎𝙄𝘾𝘼 〕━━━╮\n' +
              '┃\n' +
              '┃ 🎧 ¥play\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━╯',

            menu_fun:
              '╭━━━〔 🎭 𝘿𝙄𝙑𝙀𝙍𝙎𝘼̃𝙊 〕━━━╮\n' +
              '┃\n' +
              '┃ 💋 ¥beijar\n' +
              '┃ 🎭 ¥metadinha\n' +
              '┃ 🔞 ¥sexo\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━╯',

            menu_ocultos:
              '╭━━━〔 🔒 𝙊𝘾𝙐𝙇𝙏𝙊𝙎 〕━━━╮\n' +
              '┃\n' +
              '┃ Nenhum comando listado.\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━╯'
          };

          if (buttonId === 'menu_dono' && !isOwner(ctx)) {
            await ctx.reply(
              '╭━━〔 🔐 ACESSO NEGADO 〕━━╮\n' +
              '┃\n' +
              '┃ 👑 Este menu é exclusivo\n' +
              '┃    do proprietário do NØXIR.\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━╯'
            );
            continue;
          }

          if (menus[buttonId]) {
            await sendInteractiveMenu(ctx.chat, menus[buttonId], [ctx.sender]);
          }

          continue;
        }

        console.log("[DIAG] BODY:", JSON.stringify(ctx.body), "CHAT:", ctx.chat, "SENDER:", ctx.sender);

        await handleMessage(ctx);

      } catch (error) {
        console.error(
          'Erro ao processar mensagem:',
          error.message
        );
      }
    }
  });

  return sock;
}

module.exports = {
  startBot
};
