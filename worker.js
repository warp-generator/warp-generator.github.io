// src/index.js

export default {
  async fetch(request, env, ctx) {
    // Обработка CORS для всех запросов
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Обработка preflight запросов
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Только GET запросы (изменил с POST на GET для простоты)
    if (request.method !== 'GET') {
      return new Response('Method not allowed. Use GET', { 
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const warpData = await getWarpData();
      
      if (!warpData) {
        return new Response(JSON.stringify({ error: 'Failed to generate WARP data' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      return new Response(JSON.stringify(warpData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};

// Генерация случайных байт
function generateRandomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Функция для генерации X25519 ключей через JWK экспорт
async function generateX25519Keys() {
  try {
    // Генерируем ключевую пару X25519
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "X25519",
        namedCurve: "X25519",
      },
      true,
      ["deriveKey", "deriveBits"]
    );
    
    // Экспортируем публичный ключ в raw формате
    const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    
    // Экспортируем приватный ключ в JWK формате
    const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    
    // Конвертируем JWK в raw формат (32 байта)
    let privateKeyBase64 = privateKeyJwk.d
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Добавляем padding
    while (privateKeyBase64.length % 4) {
      privateKeyBase64 += '=';
    }
    
    const privateKeyRaw = base64ToArrayBuffer(privateKeyBase64);
    
    return {
      privKey: arrayBufferToBase64(privateKeyRaw),
      pubKey: arrayBufferToBase64(publicKeyRaw),
    };
  } catch (error) {
    console.error('Error generating X25519 keys:', error);
    // Fallback: генерируем случайные ключи
    const privateKey = generateRandomBytes(32);
    const publicKey = generateRandomBytes(32);
    
    return {
      privKey: arrayBufferToBase64(privateKey.buffer),
      pubKey: arrayBufferToBase64(publicKey.buffer),
    };
  }
}

// Вспомогательные функции для работы с base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Функция для безопасного парсинга ответа API
async function safeParseResponse(response) {
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  // Проверяем не является ли ответ HTML ошибкой (например, 1015)
  if (contentType && contentType.includes('text/html')) {
    // Ищем код ошибки в HTML
    const errorMatch = text.match(/error code: (\d+)/i);
    if (errorMatch) {
      throw new Error(`Cloudflare API error: ${errorMatch[0]}`);
    }
    throw new Error(`HTML error response: ${text.substring(0, 200)}`);
  }
  
  // Пробуем парсить JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
  }
}

// API запрос к Cloudflare
async function apiRequest(method, endpoint, body = null, token = null) {
  const headers = {
    'User-Agent': 'CloudflareWarp/1.0',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `https://api.cloudflareclient.com/v0i1909051800/${endpoint}`;
  
  const response = await fetch(url, options);
  
  // Проверяем статус ответа
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
  }
  
  const data = await safeParseResponse(response);
  
  // Проверяем наличие ошибки в ответе
  if (data.error) {
    throw new Error(`API error: ${data.error}`);
  }
  
  return data;
}

// Основная функция получения WARP данных
async function getWarpData() {
  try {
    const { privKey, pubKey } = await generateX25519Keys();

    const regBody = {
      install_id: "",
      tos: new Date().toISOString(),
      key: pubKey,
      fcm_token: "",
      type: "ios",
      locale: "en_US"
    };
    
    const regResponse = await apiRequest('POST', 'reg', regBody);
    
    if (!regResponse.result || !regResponse.result.id) {
      throw new Error('Failed to register device: ' + JSON.stringify(regResponse));
    }

    const id = regResponse.result.id;
    const token = regResponse.result.token;

    const warpResponse = await apiRequest('PATCH', `reg/${id}`, { warp_enabled: true }, token);
    
    if (!warpResponse.result || !warpResponse.result.config) {
      throw new Error('Failed to enable WARP: ' + JSON.stringify(warpResponse));
    }

    const peer_pub = warpResponse.result.config.peers[0].public_key;
    const peer_endpoint = warpResponse.result.config.peers[0].endpoint.host;
    const client_ipv4 = warpResponse.result.config.interface.addresses.v4;
    const client_ipv6 = warpResponse.result.config.interface.addresses.v6;

    return {
      privKey,
      peer_pub,
      client_ipv4,
      client_ipv6,
    };
  } catch (error) {
    console.error('Error getting WARP data:', error);
    throw error;
  }
}
