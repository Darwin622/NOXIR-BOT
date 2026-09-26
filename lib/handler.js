const config = require('../config/config');
const { checkPermission } = require('./permissions');
const { sugerirComandos } = require('./suggestions');
const fs = require('fs');
const path = require('path');

const BANNED_GROUPS_FILE = path.join(
  __dirname,
  '../database/bannedGroups.json'
);

function grupoBanido(jid) {
  if (!jid || !String(jid).endsWith('@g.us')) return false;

  try {
    if (!fs.existsSync(BANNED_GROUPS_FILE)) return false;

    const grupos = JSON.parse(
      fs.readFileSync(BANNED_GROUPS_FILE, 'utf8')
    );

    return Array.isArray(grupos) && grupos.includes(jid);
  } catch (error) {
    console.error('Erro ao verificar grupo banido:', error);
    return false;
  }
}

function similarity(a, b) {
  a = String(a || '').toLowerCase();
  b = String(b || '').toLowerCase();

  const m = a.length;
  const n = b.length;

  if (!m && !n) return 100;
  if (!m || !n) return 0;

  const dp = Array.from(
    { length: m + 1 },
    () => Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] +
          (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return Math.max(
    0,
    Math.round(
      (1 - dp[m][n] / Math.max(m, n)) * 100
    )
  );
}

function obterSugestoes(commandName, commands) {
  const resultados = [];
  const vistos = new Set();

  for (const [name, cmd] of commands.entries()) {
    const nomes = [
      name,
      ...(Array.isArray(cmd.aliases) ? cmd.aliases : [])
    ];

    for (const nome of nomes) {
      const candidato = String(nome || '').toLowerCase();

      if (!candidato || vistos.has(candidato)) {
        continue;
      }

      vistos.add(candidato);

      const score = similarity(commandName, candidato);

      resultados.push({
        comando: candidato,
        score
      });
    }
  }

  return resultados
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.comando.localeCompare(b.comando);
    })
    .slice(0, 5);
}

function createHandler(commands) {
  return async function handleMessage(ctx) {
    if (!ctx || typeof ctx.body !== 'string') return;

    const body = ctx.body.trim();
    if (!body) return;

    let content;

    if (body.startsWith(config.prefix)) {
      content = body.slice(config.prefix.length).trim();
    } else {
      const firstWord = body
        .split(/\s+/)[0]
        .toLowerCase();

      const noPrefixCommand = commands.get(firstWord);

      if (!noPrefixCommand || !noPrefixCommand.noPrefix) {
        return;
      }

      content = body;
    }

    if (!content) return;

    const parts = content.split(/\s+/);
    const commandName = parts.shift().toLowerCase();
    const args = parts;

    const command = commands.get(commandName);

    if (
      ctx.isGroup &&
      grupoBanido(ctx.chat) &&
      commandName !== 'unbangp' &&
      !(command && (command.aliases || []).includes('unbangp'))
    ) {
      return;
    }

    // ======================================================
    // COMANDO NÃO ENCONTRADO
    // ======================================================

    if (!command) {
      const sugestoes = obterSugestoes(
        commandName,
        commands
      );

      const sugestoesValidas = sugestoes.filter(
        item => item.score >= 30
      );

      const typed = config.prefix + commandName;

      if (!sugestoesValidas.length) {
        if (typeof ctx.reply === 'function') {
          await ctx.reply(
            '╭━━━〔 ⚠️ NØXIR-B∅T 〕━━━╮\n' +
            '┃\n' +
            '┃ ❌ COMANDO NÃO ENCONTRADO\n' +
            '┃\n' +
            '┃ 📌 Você digitou\n' +
            '┃ └─ ' + typed + '\n' +
            '┃\n' +
            '┃ 📚 Use ' + config.prefix +
            'menu para ver os comandos.\n' +
            '┃\n' +
            '╰━━━━━━━━━━━━━━━━━━━━━━╯'
          );
        }

        return;
      }

      let textoSugestoes =
        '╭━━━〔 💡 SUGESTÕES 〕━━━╮\n' +
        '┃\n' +
        '┃ ❌ COMANDO NÃO ENCONTRADO\n' +
        '┃\n' +
        '┃ 📌 Você digitou\n' +
        '┃ └─ ' + typed + '\n' +
        '┃\n' +
        '┃ 🔎 Talvez você quis dizer:\n' +
        '┃\n';

      sugestoesValidas.forEach((item, index) => {
        textoSugestoes +=
          '┃ ' +
          (index + 1) +
          '. ' +
          config.prefix +
          item.comando +
          ' — ' +
          item.score +
          '%\n';
      });

      textoSugestoes +=
        '┃\n' +
        '┃ 📊 Quanto maior a %, maior a\n' +
        '┃    semelhança com o comando.\n' +
        '┃\n' +
        '┃ 📚 Use ' +
        config.prefix +
        'menu para ver os comandos.\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯';

      try {
        const {
          proto,
          generateWAMessageFromContent
        } = require('@whiskeysockets/baileys');

        const botoes = [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🌑 Comandos NØXIR',
              sections: [
                {
                  title: 'COMANDOS DISPONÍVEIS',
                  rows: sugestoesValidas.map((item) => ({
                    title: `${config.prefix}${item.comando}`,
                    description: `${item.score}% de semelhança`,
                    id: `${config.prefix}${item.comando}`
                  }))
                }
              ]
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '📢 Ver canal',
              url: 'https://whatsapp.com/channel/0029Vb8ZckhJENyBIhgYXh24',
              merchant_url: 'https://whatsapp.com/channel/0029Vb8ZckhJENyBIhgYXh24'
            })
          }
        ];

        const mensagemInterativa = generateWAMessageFromContent(
          ctx.chat,
          {
            viewOnceMessage: {
              message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                  body: {
                    text: textoSugestoes
                  },
                  footer: {
                    text: '☑ NØXIR-B∅T ★ • SYSTEM ONLINE'
                  },
                  nativeFlowMessage: {
                    buttons: botoes,
                    messageParamsJson: ''
                  }
                })
              }
            }
          },
          {
            userJid: ctx.sock.user?.id,
            quoted: ctx.message
          }
        );

        await ctx.sock.relayMessage(
          ctx.chat,
          mensagemInterativa.message,
          {
            messageId: mensagemInterativa.key.id
          }
        );

      } catch (erroInterativo) {
        console.log('⚠️ Erro na mensagem interativa:', erroInterativo);

        if (typeof ctx.reply === 'function') {
          await ctx.reply(textoSugestoes);
        }
      }

      return;
    }

    const permission = checkPermission(
      command,
      { ...ctx, config: config }
    );

    if (!permission.allowed) {
      if (typeof ctx.reply === 'function') {
        await ctx.reply(permission.message);
      }
      return;
    }

    // ======================================================
    // REAÇÃO OFICIAL DO NØXIR-B∅T
    // ======================================================

    try {
      const reacoes = {
        sexo: '🍆',
        beijo: '👩‍❤️‍💋‍👨',
        metidinha: '🙃'
      };

      const emoji = reacoes[commandName] || '🌑';

      if (
        ctx.sock &&
        ctx.message &&
        ctx.message.key
      ) {
        await ctx.sock.sendMessage(
          ctx.chat,
          {
            react: {
              text: emoji,
              key: ctx.message.key
            }
          }
        );
      }
    } catch (erroReacao) {
      console.log('⚠️ Erro ao reagir ao comando:', erroReacao);
    }

    try {
      await command.execute({
        ...ctx,
        args: args,
        command: commandName,
        commands: commands,
        config: config
      });
    } catch (error) {
      console.error(
        'Erro no comando ' + command.name + ':',
        error
      );

      if (typeof ctx.reply === 'function') {
        await ctx.reply(
          'Ocorreu um erro ao executar o comando.'
        );
      }
    }
  };
}

module.exports = {
  createHandler
};
