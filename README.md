# 🎫 Discord Tickets Dashboard

Dashboard moderno e responsivo para sistema de tickets do Discord com paginação avançada e design futurista.

## 🚀 Deploy no Render

### 1. Preparar Repositório
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/discord-tickets-dashboard.git
git push -u origin main
\`\`\`

### 2. Configurar no Render
1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Clique em "New Web Service"
4. Selecione seu repositório
5. Configure:
   - **Name**: `discord-tickets-dashboard`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Variáveis de Ambiente (Opcional)
- `NODE_ENV`: `production`
- `PORT`: `10000` (automático no Render)

## 🔗 Conectar com Bot Discord

Para enviar dados do seu bot para o dashboard, use:

\`\`\`javascript
// Adicione esta função no seu bot Discord
async function sendTicketToDashboard(ticketData) {
  try {
    // Substitua SEU-DASHBOARD.onrender.com pela URL real do seu dashboard no Render
    await fetch('https://SEU-DASHBOARD.onrender.com/api/tickets/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
  } catch (error) {
    console.error('Erro ao enviar para dashboard:', error);
  }
}
\`\`\`

## 📊 Funcionalidades

### Dashboard
- ✅ Estatísticas em tempo real
- ✅ Tabela moderna com hover effects
- ✅ Sistema de paginação (10 tickets por página)
- ✅ Modal de detalhes com mensagens
- ✅ Filtros e busca avançada
- ✅ Tema claro/escuro persistente

### Paginação
- ✅ Navegação inteligente com reticências
- ✅ Botões Anterior/Próxima com estados
- ✅ Contador de resultados em tempo real
- ✅ Scroll automático ao mudar página
- ✅ Atalhos de teclado (Ctrl + Setas)

## 🛠️ Tecnologias

- Node.js + Express
- HTML5 + CSS3 (Tailwind)
- JavaScript (Vanilla)
- Lucide Icons

## 📁 Estrutura de Arquivos para Upload

\`\`\`
discord-tickets-dashboard/
├── package.json          # Dependências e scripts
├── server.js             # Servidor Express principal
├── .gitignore            # Arquivos ignorados pelo Git
├── README.md             # Documentação
└── public/               # Arquivos estáticos
    ├── index.html        # Interface principal
    ├── script.js         # Lógica do frontend
    └── theme-toggle.js   # Sistema de temas
\`\`\`

## 🎨 Personalização

### Cores
Edite as variáveis CSS em `public/index.html`:
\`\`\`css
:root {
    --primary: #667eea;
    --accent: #f093fb;
    --success: #48bb78;
    /* ... */
}
\`\`\`

### Logo
Substitua a URL da logo no header:
\`\`\`html
<img src="SUA_LOGO_AQUI" alt="Logo" class="logo">
\`\`\`

## 📊 API Endpoints

- `GET /api/tickets` - Lista todos os tickets
- `GET /api/tickets/:id` - Detalhes de um ticket
- `GET /api/stats` - Estatísticas gerais
- `GET /health` - Health check

## 🔧 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato.

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
