/** @type {import('tailwindcss').Config} */
export default {
  // A seção 'content' é a mais importante.
  // Ela diz ao Tailwind para procurar classes nestes arquivos.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Isso escaneia todos os arquivos dentro da pasta 'src'
  ],
  
  // Habilita o modo escuro baseado na classe 'dark' no elemento <html> ou <body>
  darkMode: 'class', 
  
  theme: {
    // A seção 'extend' permite adicionar novas configurações sem sobrescrever as padrão.
    extend: {
      // Adiciona suas fontes personalizadas para que você possa usá-las com classes como 'font-sans', 'font-lora', etc.
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        lora: ['Lora', 'serif'],
        raleway: ['Raleway', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },

  // Habilita plugins oficiais do Tailwind.
  plugins: [
    // O plugin de tipografia é essencial para estilizar HTML gerado dinamicamente com a classe 'prose'.
    require('@tailwindcss/typography'),
  ],
}