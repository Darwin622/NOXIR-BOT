const fs = require('fs'); const path = 
require('path'); function 
loadCommands(commandsDir) {
  const commands = new Map(); function 
  scanDirectory(directory) {
    if (!fs.existsSync(directory)) return; 
    const files = fs.readdirSync(directory); 
    for (const file of files) {
      const fullPath = path.join(directory, 
      file); const stat = 
      fs.statSync(fullPath); if 
      (stat.isDirectory()) {
        scanDirectory(fullPath); continue;
      }
      if (!file.endsWith('.js')) continue; try 
      {
        const command = require(fullPath); if 
        (!command.name || typeof 
        command.execute !== 'function') {
          console.log(`⚠️ Comando ignorado: 
          ${fullPath}`); continue;
        }
        commands.set(command.name.toLowerCase(), 
        command); if 
        (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) 
          {
            commands.set(alias.toLowerCase(), 
            command);
          }
        }
        console.log(`✅ Comando carregado: 
        ${command.name}`);
      } catch (error) {
        console.log(`❌ Erro ao carregar 
        ${fullPath}`); 
        console.log(error.message);
      }
    }
  }
  scanDirectory(path.resolve(commandsDir)); 
  return commands;
}
module.exports = { loadCommands
};
