const API = 'https://nekos.best/api/v2';

const categorias = {
  beijar: 'kiss',
  beijo: 'kiss',
  abracar: 'hug',
  dancar: 'dance',
  rir: 'laugh',
  tapa: 'slap',
  cutucar: 'poke',
  cocegas: 'tickle',
  aplaudir: 'clap',
  carinho: 'pat'
};

async function buscarGif(acao) {
  const categoria = categorias[acao];

  if (!categoria) {
    throw new Error(`Ação não configurada: ${acao}`);
  }

  const resposta = await fetch(`${API}/${categoria}`, {
    headers: {
      'User-Agent': 'NOXIR-BOT/1.0',
      'Accept': 'application/json'
    }
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`API GIF ${resposta.status}: ${erro.slice(0, 200)}`);
  }

  const dados = await resposta.json();
  const gif = dados?.results?.[0]?.url;

  if (!gif) {
    throw new Error('A API não retornou um GIF.');
  }

  console.log(`[GIF] ${categoria}: ${gif}`);

  return gif;
}

module.exports = {
  categorias,
  buscarGif
};
