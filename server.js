const express = require("express")
const cors = require("cors")
const path = require("path")
const helmet = require("helmet")
const compression = require("compression")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:", "https://media.discordapp.net", "https://cdn.discordapp.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      },
    },
  }),
)

app.use(compression())
app.use(cors())
app.use(express.json())

// Servir arquivos estáticos com fallback
app.use(express.static(path.join(__dirname, "public")))

// Middleware para verificar se os arquivos existem
app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/index.html") {
    const indexPath = path.join(__dirname, "public", "index.html")
    if (!fs.existsSync(indexPath)) {
      console.error("❌ Arquivo index.html não encontrado em:", indexPath)
      return res.status(500).send(`
        <h1>Erro de Configuração</h1>
        <p>Arquivo index.html não encontrado.</p>
        <p>Caminho esperado: ${indexPath}</p>
        <p>Arquivos disponíveis:</p>
        <pre>${JSON.stringify(fs.readdirSync(__dirname), null, 2)}</pre>
      `)
    }
  }
  next()
})

// Dados simulados para demonstração
const ticketsData = [
  {
    id: "001",
    username: "João Silva",
    userId: "123456789",
    userAvatar: "https://cdn.discordapp.com/embed/avatars/1.png",
    type: "Up de Patente",
    status: "closed",
    priority: "high",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    closedAt: new Date().toISOString(),
    officerName: "Oficial Santos",
    rating: 5,
    messages: [
      {
        author: "João Silva",
        content: "Olá, gostaria de solicitar um up de patente.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        attachments: [],
      },
      {
        author: "Oficial Santos",
        content: "Olá! Vou analisar sua solicitação. Pode me enviar seus dados?",
        timestamp: new Date(Date.now() - 86000000).toISOString(),
        attachments: [],
      },
      {
        author: "João Silva",
        content: "Claro! Aqui estão meus dados: [dados]",
        timestamp: new Date(Date.now() - 85000000).toISOString(),
        attachments: [],
      },
      {
        author: "Oficial Santos",
        content: "Perfeito! Seu up foi aprovado. Parabéns pela promoção!",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        attachments: [],
      },
    ],
  },
  {
    id: "002",
    username: "Maria Oliveira",
    userId: "987654321",
    userAvatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    type: "Dúvidas",
    status: "open",
    priority: "medium",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    officerName: null,
    rating: 0,
    messages: [
      {
        author: "Maria Oliveira",
        content: "Tenho algumas dúvidas sobre o regulamento.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        attachments: [],
      },
    ],
  },
  {
    id: "003",
    username: "Pedro Santos",
    userId: "456789123",
    userAvatar: "https://cdn.discordapp.com/embed/avatars/3.png",
    type: "Up de Patente",
    status: "pending",
    priority: "low",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    officerName: "Oficial Lima",
    rating: 0,
    messages: [
      {
        author: "Pedro Santos",
        content: "Solicito up de patente, por favor.",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        attachments: [],
      },
      {
        author: "Oficial Lima",
        content: "Recebido! Vou analisar sua solicitação.",
        timestamp: new Date(Date.now() - 6000000).toISOString(),
        attachments: [],
      },
    ],
  },
]

// Gerar mais tickets para demonstrar a paginação
for (let i = 4; i <= 50; i++) {
  const types = ["Up de Patente", "Dúvidas"]
  const statuses = ["open", "closed", "pending"]
  const priorities = ["high", "medium", "low"]
  const officers = ["Oficial Santos", "Oficial Lima", "Oficial Silva", null]

  ticketsData.push({
    id: String(i).padStart(3, "0"),
    username: `Usuário ${i}`,
    userId: `${100000000 + i}`,
    userAvatar: `https://cdn.discordapp.com/embed/avatars/${i % 6}.png`,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    closedAt: statuses[i % statuses.length] === "closed" ? new Date(Date.now() - i * 1800000).toISOString() : null,
    officerName: officers[i % officers.length],
    rating: statuses[i % statuses.length] === "closed" ? Math.floor(Math.random() * 5) + 1 : 0,
    messages: [
      {
        author: `Usuário ${i}`,
        content: `Mensagem do ticket ${i}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        attachments: [],
      },
    ],
  })
}

// Rotas da API
app.get("/api/tickets", (req, res) => {
  try {
    // Ordenar por data de criação (mais recentes primeiro)
    const sortedTickets = ticketsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({
      success: true,
      tickets: sortedTickets,
      total: sortedTickets.length,
    })
  } catch (error) {
    console.error("Erro ao buscar tickets:", error)
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    })
  }
})

app.get("/api/tickets/:id", (req, res) => {
  try {
    const ticketId = req.params.id
    const ticket = ticketsData.find((t) => t.id === ticketId)

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket não encontrado",
      })
    }

    res.json({
      success: true,
      ticket: ticket,
    })
  } catch (error) {
    console.error("Erro ao buscar ticket:", error)
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    })
  }
})

// Rota para estatísticas
app.get("/api/stats", (req, res) => {
  try {
    const stats = {
      total: ticketsData.length,
      open: ticketsData.filter((t) => t.status === "open").length,
      closed: ticketsData.filter((t) => t.status === "closed").length,
      pending: ticketsData.filter((t) => t.status === "pending").length,
      avgRating:
        ticketsData.filter((t) => t.rating > 0).reduce((sum, t) => sum + t.rating, 0) /
          ticketsData.filter((t) => t.rating > 0).length || 0,
    }

    res.json({
      success: true,
      stats: stats,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    })
  }
})

// Rota principal com fallback
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html")

  // Verificar se o arquivo existe
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    // Fallback: servir HTML inline
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord Tickets Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: white; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 60px; height: 60px; border-radius: 12px; margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #667eea; }
        .table-container { background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
        .table-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        th { background: rgba(102,126,234,0.2); }
        .loading { text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://media.discordapp.net/attachments/1414044312890769448/1414399293476966430/dacacacscs.png" alt="Logo" class="logo">
            <h1>Discord Tickets Dashboard</h1>
            <p>Sistema de Gerenciamento de Tickets</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalTickets">0</div>
                <div>Total de Tickets</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="openTickets">0</div>
                <div>Tickets Abertos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="closedTickets">0</div>
                <div>Tickets Fechados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="pendingTickets">0</div>
                <div>Tickets Pendentes</div>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h2>Lista de Tickets</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuário</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Criado em</th>
                    </tr>
                </thead>
                <tbody id="ticketsTable">
                    <tr><td colspan="5" class="loading">Carregando tickets...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        // Carregar dados
        async function loadData() {
            try {
                const response = await fetch('/api/tickets')
                const data = await response.json()
                
                if (data.success) {
                    updateStats(data.tickets)
                    renderTickets(data.tickets.slice(0, 10))
                }
            } catch (error) {
                console.error('Erro:', error)
                document.getElementById('ticketsTable').innerHTML = 
                    '<tr><td colspan="5" style="text-align: center; color: #f56565;">Erro ao carregar dados</td></tr>'
            }
        }
        
        function updateStats(tickets) {
            const stats = {
                total: tickets.length,
                open: tickets.filter(t => t.status === 'open').length,
                closed: tickets.filter(t => t.status === 'closed').length,
                pending: tickets.filter(t => t.status === 'pending').length
            }
            
            document.getElementById('totalTickets').textContent = stats.total
            document.getElementById('openTickets').textContent = stats.open
            document.getElementById('closedTickets').textContent = stats.closed
            document.getElementById('pendingTickets').textContent = stats.pending
        }
        
        function renderTickets(tickets) {
            const tbody = document.getElementById('ticketsTable')
            
            if (tickets.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum ticket encontrado</td></tr>'
                return
            }
            
            tbody.innerHTML = tickets.map(ticket => \`
                <tr>
                    <td>#\${ticket.id}</td>
                    <td>\${ticket.username}</td>
                    <td>\${ticket.type}</td>
                    <td>\${ticket.status}</td>
                    <td>\${new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
            \`).join('')
        }
        
        // Carregar dados ao inicializar
        document.addEventListener('DOMContentLoaded', loadData)
        
        // Auto-refresh a cada 30 segundos
        setInterval(loadData, 30000)
    </script>
</body>
</html>
    `)
  }
})

// Health check para o Render
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err)
  res.status(500).json({
    success: false,
    error: "Erro interno do servidor",
  })
})

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Rota não encontrada",
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Dashboard rodando em http://localhost:${PORT}`)
  console.log(`📊 API disponível em http://localhost:${PORT}/api/tickets`)
  console.log(`🎨 Interface moderna carregada com sucesso!`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`)
})

// Tratamento de erros do processo
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error)
  process.exit(1)
})

module.exports = app
