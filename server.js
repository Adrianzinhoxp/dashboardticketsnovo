const express = require("express")
const cors = require("cors")
const path = require("path")
const helmet = require("helmet")
const compression = require("compression")

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
app.use(express.static(path.join(__dirname, "public")))

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

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
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
