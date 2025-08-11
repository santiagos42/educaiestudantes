// Exportamos a função como 'handler' para ser importada no vite.config.js
export async function handler(req, res) {
  // Coletar o corpo da requisição é diferente em um middleware do Vite/Node
  const body = await new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      resolve(data)
    })
  })
  
  // Analisa o corpo da requisição para obter os dados
  const { prompt, schema } = JSON.parse(body || '{}');

  // Verifica se o método da requisição é POST
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  // Verifica se o prompt foi enviado
  if (!prompt) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Prompt é obrigatório.' }))
    return
  }

  // Pega a chave da API do ambiente (.env.local)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERRO DE BACKEND: GEMINI_API_KEY não encontrada no .env.local")
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Chave da API não configurada no servidor.' }))
    return
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(schema && {
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    }),
  }

  try {
    // Faz a chamada para a API do Gemini
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Lê a resposta como texto para poder inspecionar, evitando erros de .json()
    const responseBodyText = await geminiResponse.text();

    // Log detalhado no terminal (onde 'npm run dev' está rodando) para depuração
    console.log("\n--- RESPOSTA DA API GEMINI RECEBIDA NO BACKEND ---")
    console.log("Status da Resposta:", geminiResponse.status, geminiResponse.statusText)
    console.log("Corpo da Resposta (texto):", responseBodyText)
    console.log("---------------------------------------------------\n")

    // Define o status e o cabeçalho da nossa resposta para o frontend
    res.statusCode = geminiResponse.status
    res.setHeader('Content-Type', 'application/json')
    // Envia a resposta (seja erro ou sucesso) do Gemini diretamente para o frontend
    res.end(responseBodyText)

  } catch (error) {
    // Captura erros de rede (ex: sem internet, DNS não resolve)
    console.error('ERRO DE REDE AO TENTAR CHAMAR A API GEMINI:', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Erro de rede ao conectar com a API Gemini.', details: error.message }))
  }
}