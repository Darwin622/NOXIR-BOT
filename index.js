const config = require('./config/config');
const { loadCommands } = require('./lib/commandLoader');
const { createHandler } = require('./lib/handler');
const { startBot } = require('./lib/connection');

console.log('');
console.log('╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮');
console.log('┃       NØXIR-B∅T v1.0.0      ┃');
console.log('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
console.log('');
console.log('⚙️ Carregando comandos...');

const commands = loadCommands(config.commandsDir);

console.log('');
console.log(`✅ ${commands.size} comandos/atalhos carregados.`);
console.log(`🔑 Prefixo: ${config.prefix}`);
console.log('');

const handleMessage = createHandler(commands);

startBot(handleMessage)
  .then(() => {
    console.log('🚀 NØXIR-B∅T iniciado.');
  })
  .catch((error) => {
    console.error('❌ Erro ao iniciar o NØXIR-B∅T:', error);
  });
