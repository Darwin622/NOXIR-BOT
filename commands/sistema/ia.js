const OpenAI = require('openai');

module.exports = {
  name: 'ia',
  aliases: ['chatgpt', 'gpt'],

  async execute(ctx) {
    const pergunta = ctx.args.join(' ').trim();

    if (!pergunta) {
      return ctx.reply(
        '🤖 Exemplo:\n' +
        '¥ia explica o que é inteligência artificial'
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return ctx.reply('❌ A chave da IA não está configurada.');
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    try {
      const resposta = await client.responses.create({
        model: 'gpt-5-mini',
        input: pergunta
      });

      const texto = resposta.output_text?.trim();

      if (!texto) {
        return ctx.reply('❌ A IA não retornou uma resposta.');
      }

      return ctx.reply(
        '╭━━━〔 🤖 NØXIR-IA 〕━━━╮\n' +
        '┃\n' +
        '┃ ' + texto + '\n' +
        '┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      );

    } catch (error) {
      console.error('[IA]', error.message);
      return ctx.reply('❌ Erro ao consultar a IA.');
    }
  }
};
