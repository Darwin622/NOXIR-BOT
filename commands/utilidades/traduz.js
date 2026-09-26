const axios = require('axios');

const idiomas = {
  'português': 'pt',
  'portugues': 'pt',
  'pt': 'pt',
  'inglês': 'en',
  'ingles': 'en',
  'en': 'en',
  'francês': 'fr',
  'frances': 'fr',
  'fr': 'fr',
  'espanhol': 'es',
  'es': 'es',
  'alemão': 'de',
  'alemao': 'de',
  'de': 'de',
  'italiano': 'it',
  'it': 'it',
  'japonês': 'ja',
  'japones': 'ja',
  'ja': 'ja',
  'chinês': 'zh-CN',
  'chines': 'zh-CN',
  'zh': 'zh-CN',
  'russo': 'ru',
  'ru': 'ru',
  'árabe': 'ar',
  'arabe': 'ar',
  'ar': 'ar'
};

module.exports = {
  name: 'traduz',
  aliases: ['translate', 'traducao', 'tradução'],

  async execute(ctx) {
    const entrada = (ctx.args || []).join(' ').trim();

    if (!entrada.includes('|')) {
      return ctx.reply(
        '╭━━━〔 🌍 NØXIR-TRADUZ 〕━━━╮\n' +
        '┃\n' +
        '┃ ❌ FORMATO INCORRETO\n' +
        '┃\n' +
        '┃ Use:\n' +
        '┃ ¥traduz texto|idioma\n' +
        '┃\n' +
        '┃ Exemplo:\n' +
        '┃ ¥traduz boa tarde|francês\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );
    }

    const partes = entrada.split('|');
    const texto = partes[0].trim();
    const idiomaNome = partes.slice(1).join('|').trim();
    const idioma = idiomas[idiomaNome.toLowerCase()];

    if (!texto || !idioma) {
      return ctx.reply(
        '❌ Texto ou idioma inválido.\n\n' +
        'Exemplo:\n' +
        '¥traduz boa tarde|francês'
      );
    }

    try {
      const url =
        'https://translate.googleapis.com/translate_a/single' +
        '?client=gtx' +
        '&sl=auto' +
        '&tl=' + encodeURIComponent(idioma) +
        '&dt=t' +
        '&q=' + encodeURIComponent(texto);

      const resposta = await axios.get(url, {
        timeout: 10000
      });

      const dados = resposta.data;

      const traducao = Array.isArray(dados?.[0])
        ? dados[0]
            .map(item => item?.[0] || '')
            .join('')
            .trim()
        : '';

      if (!traducao) {
        return ctx.reply('❌ Não foi possível obter a tradução.');
      }

      const nomeIdioma =
        idiomaNome.charAt(0).toUpperCase() +
        idiomaNome.slice(1);

      const codigo = idioma.toUpperCase();

      return ctx.reply(
        '╭━━━〔 🌍 NØXIR-TRADUZ 〕━━━╮\n' +
        '┃\n' +
        '┃ 📝 TEXTO ORIGINAL\n' +
        '┃ └─ ' + texto + '\n' +
        '┃\n' +
        '┃ 🎯 IDIOMA DESTINO\n' +
        '┃ └─ ' + nomeIdioma + '\n' +
        '┃\n' +
        '┃ 🌍 TRADUÇÃO\n' +
        '┃ └─ ' + traducao + '\n' +
        '┃\n' +
        '┃ 🔤 CÓDIGO\n' +
        '┃ └─ ' + codigo + '\n' +
        '┃\n' +
        '┃ 📊 CARACTERES\n' +
        '┃ └─ ' + texto.length + ' → ' + traducao.length + '\n' +
        '┃\n' +
        '┃ ⚡ Traduzido por NØXIR-B∅T\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );

    } catch (error) {
      console.error('[TRADUZ]', error.message);
      return ctx.reply(
        '❌ Erro ao conectar ao serviço de tradução.'
      );
    }
  }
};
