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
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
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

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")))

// Dados simulados com as 3 categorias
const generateSampleTickets = () => {
  const categories = ["Up de Patente", "Dúvidas", "Corregedoria"]
  const priorities = ["Crítica", "Alta", "Média", "Baixa"]
  const officers = ["Oficial Santos", "Oficial Lima", "Oficial Silva", "Oficial Costa", "Oficial Pereira"]
  const users = [
    { name: "João Silva", discriminator: "#1234" },
    { name: "Maria Santos", discriminator: "#5678" },
    { name: "Pedro Costa", discriminator: "#9012" },
    { name: "Ana Oliveira", discriminator: "#3456" },
    { name: "Carlos Lima", discriminator: "#7890" },
    { name: "Fernanda Souza", discriminator: "#2345" },
    { name: "Roberto Alves", discriminator: "#6789" },
    { name: "Juliana Ferreira", discriminator: "#0123" },
    { name: "Marcos Rodrigues", discriminator: "#4567" },
    { name: "Patrícia Mendes", discriminator: "#8901" },
  ]

  const tickets = []

  for (let i = 1; i <= 150; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const officer = officers[Math.floor(Math.random() * officers.length)]

    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
    const closedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) // Até 24h depois

    const duration = Math.floor((closedAt - createdAt) / (1000 * 60)) // em minutos
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60

    tickets.push({
      id: `TK-${String(i).padStart(3, "0")}`,
      user: {
        name: user.name,
        avatar: `https://cdn.discordapp.com/embed/avatars/${i % 6}.png`,
        discriminator: user.discriminator,
      },
      category: category,
      closedAt: closedAt.toISOString(),
      duration: `${hours}h ${minutes}m`,
      closedBy: officer,
      priority: priority,
      satisfaction: Math.floor(Math.random() * 2) + 4, // 4 ou 5 estrelas
      channelId: `${1000000000000000000 + i}`,
      createdAt: createdAt.toISOString(),
    })
  }

  return tickets.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
}

const sampleTickets = generateSampleTickets()

// Rotas da API
app.get("/api/tickets/stats", (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayTickets = sampleTickets.filter((ticket) => new Date(ticket.closedAt) >= today)

  const totalDuration = sampleTickets.reduce((sum, ticket) => {
    const duration = new Date(ticket.closedAt) - new Date(ticket.createdAt)
    return sum + duration
  }, 0)

  const avgDuration = sampleTickets.length > 0 ? totalDuration / sampleTickets.length : 0
  const avgHours = Math.floor(avgDuration / (1000 * 60 * 60))
  const avgMinutes = Math.floor((avgDuration % (1000 * 60 * 60)) / (1000 * 60))

  const avgSatisfaction =
    sampleTickets.length > 0
      ? sampleTickets.reduce((sum, ticket) => sum + (ticket.satisfaction || 0), 0) / sampleTickets.length
      : 0

  res.json({
    totalClosed: sampleTickets.length,
    todayClosed: todayTickets.length,
    avgResolutionTime: `${avgHours}h ${avgMinutes}m`,
    satisfactionRate: Math.round(avgSatisfaction * 10) / 10,
  })
})

app.get("/api/tickets/closed", (req, res) => {
  res.json(sampleTickets)
})

app.get("/api/tickets/:ticketId/messages", (req, res) => {
  const { ticketId } = req.params
  const ticket = sampleTickets.find((t) => t.id === ticketId)

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado" })
  }

  // Gerar mensagens de exemplo baseadas na categoria
  const messages = []

  // Mensagem inicial do usuário
  let initialMessage = ""
  switch (ticket.category) {
    case "Up de Patente":
      initialMessage =
        "Olá! Gostaria de solicitar um up de patente. Estou há bastante tempo na corporação e acredito que mereço uma promoção."
      break
    case "Dúvidas":
      initialMessage = "Tenho algumas dúvidas sobre o regulamento da corporação. Podem me ajudar?"
      break
    case "Corregedoria":
      initialMessage = "Preciso reportar uma situação que presenciei. Como devo proceder?"
      break
    default:
      initialMessage = "Olá! Preciso de ajuda com uma questão."
  }

  messages.push({
    id: "msg-1",
    author: {
      name: ticket.user.name,
      avatar: ticket.user.avatar,
      isStaff: false,
    },
    content: initialMessage,
    timestamp: ticket.createdAt,
    attachments: [],
  })

  // Resposta do staff
  let staffResponse = ""
  switch (ticket.category) {
    case "Up de Patente":
      staffResponse = "Olá! Vou analisar sua solicitação de promoção. Pode me enviar seus dados e tempo de serviço?"
      break
    case "Dúvidas":
      staffResponse =
        "Olá! Ficarei feliz em esclarecer suas dúvidas. Qual ponto específico do regulamento você gostaria de saber?"
      break
    case "Corregedoria":
      staffResponse =
        "Olá! Obrigado por reportar. Vou encaminhar para a corregedoria. Pode me dar mais detalhes sobre o ocorrido?"
      break
    default:
      staffResponse = "Olá! Como posso ajudá-lo hoje?"
  }

  messages.push({
    id: "msg-2",
    author: {
      name: ticket.closedBy,
      avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
      isStaff: true,
    },
    content: staffResponse,
    timestamp: new Date(new Date(ticket.createdAt).getTime() + 5 * 60 * 1000).toISOString(),
    attachments: [],
  })

  // Mensagem de resolução
  let resolutionMessage = ""
  switch (ticket.category) {
    case "Up de Patente":
      resolutionMessage =
        "Após análise, sua promoção foi aprovada! Parabéns pelo novo cargo. As alterações já foram aplicadas."
      break
    case "Dúvidas":
      resolutionMessage =
        "Espero ter esclarecido todas suas dúvidas! Se precisar de mais alguma coisa, não hesite em abrir outro ticket."
      break
    case "Corregedoria":
      resolutionMessage =
        "O caso foi devidamente registrado e encaminhado para investigação. Obrigado pela colaboração."
      break
    default:
      resolutionMessage = "Problema resolvido com sucesso! Obrigado por entrar em contato."
  }

  messages.push({
    id: "msg-3",
    author: {
      name: ticket.closedBy,
      avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
      isStaff: true,
    },
    content: resolutionMessage,
    timestamp: new Date(new Date(ticket.closedAt).getTime() - 2 * 60 * 1000).toISOString(),
    attachments: [],
  })

  res.json(messages)
})

// Rota principal
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html")

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(`
      <h1>Dashboard de Tickets</h1>
      <p>Arquivo index.html não encontrado. Verifique a estrutura de arquivos.</p>
      <p>Caminho esperado: ${indexPath}</p>
    `)
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    tickets: sampleTickets.length,
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
  console.log(`📊 API disponível em http://localhost:${PORT}/api/tickets/closed`)
  console.log(`🎫 Total de tickets de exemplo: ${sampleTickets.length}`)
  console.log(`🏷️ Categorias: Up de Patente, Dúvidas, Corregedoria`)
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
