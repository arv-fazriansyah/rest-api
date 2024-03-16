// Mendefinisikan konstanta-konstanta yang diperlukan
const MODELS = 'gemini-pro';
const VERSION = 'v1beta';
const STREAM = '';
const API_KEY = 'API_KEY';
const BASE_URL = 'https://generativelanguage.googleapis.com';
const PROMPT_USER = 'Kamu adalah Veronisa dirancang oleh fazriansyah.my.id. Asisten yang sangat membantu, kreatif, pintar, dan ramah.';
const PROMPT_SYSTEM = 'Haloo!! Aku adalah Veronisa dirancang oleh fazriansyah.my.id. Asisten yang sangat membantu, kreatif, pintar, dan ramah.';
const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];
const DEFAULT_GENERATION_CONFIG = {
  stopSequences: ['Title'],
  temperature: 1.0,
  maxOutputTokens: 800,
  topP: 0.8,
  topK: 10
};

// Mendefinisikan fungsi untuk menangani permintaan
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
  if (request.method !== 'POST') { 
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { pathname } = new URL(request.url);

  if (pathname !== '/v1/chat/completions') {
    return new Response('Not Found', { status: 404 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response('Invalid Request Body', { status: 400 });
  }

  let finalRequestBody;
  if (Array.isArray(requestBody.contents) && requestBody.contents.length > 0) {
    const roles = requestBody.contents.map(content => content.role);
    finalRequestBody = {
      contents: roles.length === 1 && roles[0] === 'user' ? [
        { role: 'user', parts: [{ text: PROMPT_USER }] },
        { role: 'model', parts: [{ text: PROMPT_SYSTEM }] },
        ...requestBody.contents
      ] : requestBody.contents,
      safetySettings: getSafetySettings(requestBody.safetySettings),
      generationConfig: getGenerationConfig(requestBody.generationConfig)
    };
  } else {
    return new Response('Invalid Request Body', { status: 400 });
  }

  const url = `${BASE_URL}/${VERSION}/models/${MODELS}:${STREAM}generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'DoH-URL': 'https://doh.fazri.com/'
    },
    body: JSON.stringify(finalRequestBody)
  });

  if (response.headers.get('Content-Type') === 'text/html') {
    return new Response('Unexpected Content-Type', { status: 500 });
  }

  return response;
}

// Fungsi untuk mendapatkan pengaturan keamanan
function getSafetySettings(safetySettings) {
  return safetySettings && safetySettings.length > 0 ? safetySettings.slice(0, 4) : DEFAULT_SAFETY_SETTINGS;
}

// Fungsi untuk mendapatkan konfigurasi pembangkitan
function getGenerationConfig(generationConfig) {
  return {
    stopSequences: generationConfig?.stopSequences || DEFAULT_GENERATION_CONFIG.stopSequences,
    temperature: generationConfig?.temperature || DEFAULT_GENERATION_CONFIG.temperature,
    maxOutputTokens: generationConfig?.maxOutputTokens || DEFAULT_GENERATION_CONFIG.maxOutputTokens,
    topP: generationConfig?.topP || DEFAULT_GENERATION_CONFIG.topP,
    topK: generationConfig?.topK || DEFAULT_GENERATION_CONFIG.topK
  };
}
