// api/bypass.js
const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL é obrigatória'
    });
  }

  try {
    const result = await bypassUrl(url);
    
    return res.status(200).json({
      success: true,
      result: result,
      original: url
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

async function bypassUrl(url) {
  const urlLower = url.toLowerCase();

  // Detectar qual serviço é e aplicar o bypass específico
  if (urlLower.includes('linkvertise.com')) {
    return await bypassLinkvertise(url);
  } else if (urlLower.includes('mboost.me') || urlLower.includes('boost.ink')) {
    return await bypassMboost(url);
  } else if (urlLower.includes('loot-link.com') || urlLower.includes('lootlink')) {
    return await bypassLootLink(url);
  } else if (urlLower.includes('rekonise.com')) {
    return await bypassRekonise(url);
  } else if (urlLower.includes('sub4unlock.com') || urlLower.includes('sub4unlock')) {
    return await bypassSub4Unlock(url);
  } else {
    // Tentar bypass genérico
    return await genericBypass(url);
  }
}

// Bypass para Linkvertise
async function bypassLinkvertise(url) {
  try {
    const html = await fetchPage(url);
    
    // Procurar por padrões comuns de redirecionamento
    const patterns = [
      /window\.location\.href\s*=\s*["']([^"']+)["']/,
      /location\.replace\(["']([^"']+)["']\)/,
      /"target_url"\s*:\s*"([^"]+)"/,
      /data-target-url="([^"]+)"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    throw new Error('Não foi possível extrair o link do Linkvertise');
  } catch (error) {
    throw new Error(`Erro no bypass Linkvertise: ${error.message}`);
  }
}

// Bypass para Mboost
async function bypassMboost(url) {
  try {
    const html = await fetchPage(url);
    
    const patterns = [
      /href="([^"]*)" class="btn.*download/i,
      /"url":"([^"]+)"/,
      /window\.location\s*=\s*["']([^"']+)["']/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    throw new Error('Não foi possível extrair o link do Mboost');
  } catch (error) {
    throw new Error(`Erro no bypass Mboost: ${error.message}`);
  }
}

// Bypass para LootLink
async function bypassLootLink(url) {
  try {
    const html = await fetchPage(url);
    
    const patterns = [
      /"redirectUrl":"([^"]+)"/,
      /data-url="([^"]+)"/,
      /window\.location\.href\s*=\s*["']([^"']+)["']/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1].replace(/\\/g, ''));
      }
    }

    throw new Error('Não foi possível extrair o link do LootLink');
  } catch (error) {
    throw new Error(`Erro no bypass LootLink: ${error.message}`);
  }
}

// Bypass para Rekonise
async function bypassRekonise(url) {
  try {
    const html = await fetchPage(url);
    
    const patterns = [
      /"destination":"([^"]+)"/,
      /href="([^"]*)" .*?continue/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    throw new Error('Não foi possível extrair o link do Rekonise');
  } catch (error) {
    throw new Error(`Erro no bypass Rekonise: ${error.message}`);
  }
}

// Bypass para Sub4Unlock
async function bypassSub4Unlock(url) {
  try {
    const html = await fetchPage(url);
    
    const patterns = [
      /"target_url":"([^"]+)"/,
      /data-link="([^"]+)"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    throw new Error('Não foi possível extrair o link do Sub4Unlock');
  } catch (error) {
    throw new Error(`Erro no bypass Sub4Unlock: ${error.message}`);
  }
}

// Bypass genérico para outros serviços
async function genericBypass(url) {
  try {
    const html = await fetchPage(url);
    
    // Tentar padrões comuns de redirecionamento
    const patterns = [
      /window\.location\.href\s*=\s*["']([^"']+)["']/,
      /location\.replace\(["']([^"']+)["']\)/,
      /href="([^"]*)" class=".*?(download|continue|skip|get)/i,
      /"url"\s*:\s*"([^"]+)"/,
      /"destination"\s*:\s*"([^"]+)"/,
      /"target_url"\s*:\s*"([^"]+)"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].startsWith('http')) {
        return decodeURIComponent(match[1]);
      }
    }

    throw new Error('Não foi possível fazer bypass deste link automaticamente');
  } catch (error) {
    throw new Error(`Erro no bypass genérico: ${error.message}`);
  }
}

// Função auxiliar para fazer requisições HTTP/HTTPS
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    };

    protocol.get(url, options, (response) => {
      let data = '';

      // Seguir redirecionamentos
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetchPage(response.headers.location).then(resolve).catch(reject);
      }

      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}