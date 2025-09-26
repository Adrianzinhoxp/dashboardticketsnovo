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
        imgSrc: ["'self'", "data:", "https://", "blob:", "https://media.discordapp.net", "https://cdn.discordapp.com"],
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

  // Gerar conversas mais realistas e detalhadas
  const messages = []
  const messageTemplates = {
    "Up de Patente": [
      {
        user: "Olá! Gostaria de solicitar um up de patente. Estou há bastante tempo na corporação e acredito que mereço uma promoção. Tenho me dedicado muito e seguido todas as regras.",
        staff:
          "Olá! Obrigado por entrar em contato. Vou analisar sua solicitação de promoção. Para isso, preciso que você me envie algumas informações: tempo de serviço, patente atual, e principais contribuições para a corporação.",
        user2:
          "Claro! Estou na corporação há 3 meses, atualmente sou Soldado, e tenho participado ativamente das operações. Sempre cumpro os horários e ajudo outros membros quando necessário.",
        staff2:
          "Perfeito! Vou verificar seu histórico no sistema. Suas informações estão corretas e seu comportamento tem sido exemplar. Após análise com a alta cúpula, sua promoção foi aprovada! Parabéns, agora você é Cabo. As alterações já foram aplicadas no sistema.",
        user3:
          "Muito obrigado! Fico muito feliz com a promoção. Continuarei me dedicando ainda mais para honrar essa nova patente. Vocês são uma equipe incrível! 🎉",
      },
      {
        user: "Boa tarde! Venho solicitar respeitosamente um up de patente. Acredito ter cumprido todos os requisitos necessários.",
        staff:
          "Boa tarde! Vou verificar sua solicitação. Pode me informar há quanto tempo está na corporação e qual sua patente atual?",
        user2:
          "Estou há 2 meses e meio na corporação, sou Soldado atualmente. Tenho participado de todas as operações possíveis e sempre respeitei a hierarquia.",
        staff2:
          "Analisando seu perfil... Vejo que você tem um bom histórico de participação. Sua promoção foi aprovada! Agora você é Cabo. Continue assim!",
        user3: "Excelente! Muito obrigado pela oportunidade. Prometo continuar dando o meu melhor! 💪",
      },
    ],
    Dúvidas: [
      {
        user: "Olá! Tenho algumas dúvidas sobre o regulamento da corporação. Podem me ajudar?",
        staff:
          "Olá! Claro, ficarei feliz em esclarecer suas dúvidas. Qual ponto específico do regulamento você gostaria de saber mais?",
        user2:
          "Gostaria de saber sobre os horários de operação, como funciona o sistema de faltas, e quais são as punições por descumprimento de regras.",
        staff2:
          "Ótimas perguntas! Sobre os horários: temos operações diárias às 20h e 22h. Faltas são toleradas até 3 por mês, acima disso há advertência. As punições variam de advertência verbal até rebaixamento, dependendo da gravidade. Alguma dúvida específica sobre esses pontos?",
        user3: "Perfeito! Esclareceu todas minhas dúvidas. Muito obrigado pela atenção e paciência! 😊",
      },
      {
        user: "Oi! Sou novo na corporação e tenho dúvidas sobre como funciona o sistema de patentes.",
        staff:
          "Olá! Seja bem-vindo! O sistema de patentes funciona por tempo de serviço e desempenho. Começamos como Recruta, depois Soldado, Cabo, e assim por diante. Cada promoção tem requisitos específicos.",
        user2:
          "Entendi! E quanto tempo normalmente leva para subir de patente? Existe algum requisito especial além do tempo?",
        staff2:
          "Geralmente leva de 1-2 meses entre promoções, mas depende do seu desempenho, participação em operações, e comportamento. Não há requisitos especiais, apenas dedicação e respeito às regras!",
        user3: "Muito obrigado pelas informações! Vou me esforçar ao máximo. Vocês são muito atenciosos! 👍",
      },
    ],
    Corregedoria: [
      {
        user: "Preciso reportar uma situação que presenciei. Como devo proceder?",
        staff:
          "Olá! Obrigado por reportar. A corregedoria leva todas as denúncias a sério. Pode me dar mais detalhes sobre o ocorrido? Manteremos sigilo total sobre sua identidade.",
        user2:
          "Vi um membro da corporação agindo de forma inadequada durante uma operação, desrespeitando civis e não seguindo os protocolos estabelecidos. Tenho prints como evidência.",
        staff2:
          "Entendo a gravidade da situação. Por favor, envie as evidências que possui. Vou encaminhar imediatamente para a corregedoria interna. O caso será investigado com total seriedade e as medidas cabíveis serão tomadas.",
        user3:
          "Obrigado pela atenção. Enviei as evidências por DM. Espero que a situação seja resolvida adequadamente.",
      },
      {
        user: "Gostaria de fazer uma denúncia anônima sobre comportamento inadequado de um superior.",
        staff:
          "Olá! Todas as denúncias são tratadas com máxima seriedade e sigilo. Pode relatar o que aconteceu? Sua identidade será protegida durante todo o processo.",
        user2:
          "Um superior tem abusado da autoridade, fazendo ameaças e criando um ambiente hostil. Outros membros também estão incomodados mas têm medo de falar.",
        staff2:
          "Essa é uma situação muito grave. Vou encaminhar imediatamente para a alta corregedoria. Será aberta uma investigação sigilosa. Obrigado por ter a coragem de reportar. Situações assim não são toleradas em nossa corporação.",
        user3: "Agradeço pela seriedade no tratamento. Espero que a situação seja resolvida para o bem de todos.",
      },
    ],
  }

  // Selecionar template baseado na categoria
  const templates = messageTemplates[ticket.category] || messageTemplates["Dúvidas"]
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)]

  let messageId = 1
  const baseTime = new Date(ticket.createdAt).getTime()

  // Mensagem inicial do usuário
  messages.push({
    id: `msg-${messageId++}`,
    author: {
      name: ticket.user.name,
      avatar: ticket.user.avatar,
      isStaff: false,
    },
    content: selectedTemplate.user,
    timestamp: new Date(baseTime).toISOString(),
    attachments: [],
  })

  // Resposta do staff
  messages.push({
    id: `msg-${messageId++}`,
    author: {
      name: ticket.closedBy,
      avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
      isStaff: true,
    },
    content: selectedTemplate.staff,
    timestamp: new Date(baseTime + 5 * 60 * 1000).toISOString(),
    attachments: [],
  })

  // Segunda mensagem do usuário (se existir)
  if (selectedTemplate.user2) {
    messages.push({
      id: `msg-${messageId++}`,
      author: {
        name: ticket.user.name,
        avatar: ticket.user.avatar,
        isStaff: false,
      },
      content: selectedTemplate.user2,
      timestamp: new Date(baseTime + 10 * 60 * 1000).toISOString(),
      attachments:
        ticket.category === "Corregedoria"
          ? [
              {
                name: "evidencia.png",
                url: "https://via.placeholder.com/300x200/667eea/ffffff?text=Evidência",
                type: "image",
              },
            ]
          : [],
    })
  }

  // Segunda resposta do staff (se existir)
  if (selectedTemplate.staff2) {
    messages.push({
      id: `msg-${messageId++}`,
      author: {
        name: ticket.closedBy,
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        isStaff: true,
      },
      content: selectedTemplate.staff2,
      timestamp: new Date(baseTime + 20 * 60 * 1000).toISOString(),
      attachments: [],
    })
  }

  // Mensagem final do usuário (se existir)
  if (selectedTemplate.user3) {
    messages.push({
      id: `msg-${messageId++}`,
      author: {
        name: ticket.user.name,
        avatar: ticket.user.avatar,
        isStaff: false,
      },
      content: selectedTemplate.user3,
      timestamp: new Date(new Date(ticket.closedAt).getTime() - 2 * 60 * 1000).toISOString(),
      attachments: [],
    })
  }

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
