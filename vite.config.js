import { defineConfig, loadEnv } from 'vite' // 1. Importe 'loadEnv'
import react from '@vitejs/plugin-react'
import { handler as apiHandler } from './api/generateQuiz.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => { // 2. Mude a exportação para uma função
  // 3. Carregue as variáveis de ambiente do .env.local
  const env = loadEnv(mode, process.cwd(), '');
  
  // 4. Exponha a GEMINI_API_KEY para o processo do Node.js
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;

  return {
    plugins: [
      react(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/generateQuiz') {
              return await apiHandler(req, res);
            }
            next();
          });
        },
      },
    ],
  }
})