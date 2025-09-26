const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Dados de exemplo mais realistas
const sampleTickets = [
  {
    id: "TK-001",
    user: {
      name: "João Silva",
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      discriminator: "#1234",
    },
    category: "Up de Patente",
    closedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    duration: "2h 15m",
    closedBy: "Sgt. Martinez",
    priority: "Alta",
    satisfaction: 5,
    channelId: "123456789",
  },
  {
    id: "TK-002",
    user: {
      name: "Maria Santos",
      avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
      discriminator: "#5678",
    },
    category: "Dúvidas",
    closedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: "45m",
    closedBy: "Cap. Rodriguez",
    priority: "Média",
    satisfaction: 4,
    channelId: "123456790",
  },
  {
    id: "TK-003",
    user: {
      name: "Pedro Costa",
      avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
      discriminator: "#9012",
    },
    category: "Corregedoria",
    closedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: "1h 30m",
    closedBy: "Ten. Silva",
    priority: "Crítica",
    satisfaction: 5,
    channelId: "123456791",
  },
]

// Gerar mais tickets de exemplo
for (let i = 4; i <= 50; i++) {
  const categories = ["Up de Patente", "Dúvidas", "Corregedoria"]
  const priorities = ["Crítica", "Alta", "Média", "Baixa"]
  const officers = ["Sgt. Martinez", "Cap. Rodriguez", "Ten. Silva", "Cb. Santos", "Sd. Oliveira"]
  const names = ["Ana", "Carlos", "Beatriz", "Diego", "Elena", "Fernando", "Gabriela", "Hugo", "Isabel", "Jorge"]
  const surnames = [
    "Silva",
    "Santos",
    "Costa",
    "Oliveira",
    "Pereira",
    "Lima",
    "Alves",
    "Ferreira",
    "Rodrigues",
    "Martins",
  ]

  const randomHours = Math.floor(Math.random() * 48) + 1 // 1-48 horas atrás
  const randomDuration = Math.floor(Math.random() * 180) + 15 // 15-195 minutos

  sampleTickets.push({
    id: `TK-${String(i).padStart(3, "0")}`,
    user: {
      name: `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`,
      avatar: `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`,
      discriminator: `#${Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0")}`,
    },
    category: categories[Math.floor(Math.random() * categories.length)],
    closedAt: new Date(Date.now() - randomHours * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - (randomHours + Math.floor(randomDuration / 60)) * 60 * 60 * 1000).toISOString(),
    duration: `${Math.floor(randomDuration / 60)}h ${randomDuration % 60}m`,
    closedBy: officers[Math.floor(Math.random() * officers.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    satisfaction: Math.floor(Math.random() * 2) + 4, // 4 ou 5 estrelas
    channelId: `12345679${i}`,
  })
}

// Mensagens de exemplo para cada ticket
const sampleMessages = {
  "TK-001": [
    {
      id: "msg-1",
      author: {
        name: "João Silva",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        isStaff: false,
      },
      content:
        "Olá! Gostaria de solicitar minha promoção para Cabo. Estou no servidor há 3 meses e cumpri todos os requisitos.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-2",
      author: {
        name: "Sgt. Martinez",
        avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
        isStaff: true,
      },
      content: "Olá João! Vou analisar sua solicitação. Pode me enviar um print do seu tempo de serviço?",
      timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-3",
      author: {
        name: "João Silva",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        isStaff: false,
      },
      content: "Claro! Aqui está o print do meu tempo de serviço.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      attachments: [
        {
          name: "tempo-servico.png",
          url: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Tempo+de+Serviço",
          type: "image",
        },
      ],
    },
    {
      id: "msg-4",
      author: {
        name: "Sgt. Martinez",
        avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
        isStaff: true,
      },
      content: "Perfeito! Sua documentação está em ordem. Promoção aprovada! Parabéns, Cabo João! 🎉",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
  ],
  "TK-002": [
    {
      id: "msg-1",
      author: {
        name: "Maria Santos",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        isStaff: false,
      },
      content: "Oi! Sou nova no servidor e tenho algumas dúvidas sobre as regras de patrulhamento.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-2",
      author: {
        name: "Cap. Rodriguez",
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        isStaff: true,
      },
      content: "Olá Maria! Seja bem-vinda! Quais são suas dúvidas específicas sobre patrulhamento?",
      timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-3",
      author: {
        name: "Maria Santos",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        isStaff: false,
      },
      content: "Quero saber sobre os horários de patrulha e como reportar ocorrências.",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-4",
      author: {
        name: "Cap. Rodriguez",
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        isStaff: true,
      },
      content:
        "As patrulhas são 24/7, você pode entrar quando quiser. Para reportar, use o canal #ocorrencias. Vou te enviar o manual completo!",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      attachments: [
        {
          name: "manual-patrulhamento.pdf",
          url: "#",
          type: "file",
        },
      ],
    },
  ],
  "TK-003": [
    {
      id: "msg-1",
      author: {
        name: "Pedro Costa",
        avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
        isStaff: false,
      },
      content: "Preciso reportar um comportamento inadequado de um oficial durante uma abordagem.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-2",
      author: {
        name: "Ten. Silva",
        avatar: "https://cdn.discordapp.com/embed/avatars/5.png",
        isStaff: true,
      },
      content: "Entendo a gravidade da situação. Pode me fornecer detalhes específicos e evidências?",
      timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-3",
      author: {
        name: "Pedro Costa",
        avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
        isStaff: false,
      },
      content: "Tenho prints da conversa e um vídeo da situação. O oficial foi muito agressivo sem motivo.",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      attachments: [
        {
          name: "evidencia-conversa.png",
          url: "https://via.placeholder.com/600x400/DC2626/FFFFFF?text=Evidência+da+Conversa",
          type: "image",
        },
        {
          name: "video-abordagem.mp4",
          url: "#",
          type: "file",
        },
      ],
    },
    {
      id: "msg-4",
      author: {
        name: "Ten. Silva",
        avatar: "https://cdn.discordapp.com/embed/avatars/5.png",
        isStaff: true,
      },
      content:
        "Obrigado pelas evidências. Vou encaminhar para investigação imediata. O oficial será suspenso preventivamente.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-5",
      author: {
        name: "Ten. Silva",
        avatar: "https://cdn.discordapp.com/embed/avatars/5.png",
        isStaff: true,
      },
      content: "Caso resolvido. O oficial foi punido adequadamente. Obrigado por reportar!",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      attachments: [],
    },
  ],
}

// Rotas da API
app.get("/api/tickets/stats", (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayTickets = sampleTickets.filter((ticket) => new Date(ticket.closedAt) >= today)

  const totalDuration = sampleTickets.reduce((sum, ticket) => {
  if (!ticket.duration || typeof ticket.duration !== "string") {
    return sum; // ignora tickets sem duração válida
  }

  const [hours, minutes] = ticket.duration.split("h ");
  const totalMinutes =
    (parseInt(hours, 10) || 0) * 60 +
    (parseInt((minutes || "").replace("m", ""), 10) || 0);

  return sum + totalMinutes;
}, 0);


  const avgDurationMinutes = Math.floor(totalDuration / sampleTickets.length)
  const avgHours = Math.floor(avgDurationMinutes / 60)
  const avgMins = avgDurationMinutes % 60

  const avgSatisfaction = sampleTickets.reduce((sum, ticket) => sum + ticket.satisfaction, 0) / sampleTickets.length

  res.json({
    totalClosed: sampleTickets.length,
    todayClosed: todayTickets.length,
    avgResolutionTime: `${avgHours}h ${avgMins}m`,
    satisfactionRate: Math.round(avgSatisfaction * 10) / 10,
  })
})

app.get("/api/tickets/closed", (req, res) => {
  const sortedTickets = sampleTickets.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
  res.json(sortedTickets)
})

app.get("/api/tickets/:ticketId/messages", (req, res) => {
  const { ticketId } = req.params
  const messages = sampleMessages[ticketId] || []
  res.json(messages)
})

app.post("/api/tickets/add", (req, res) => {
  try {
    const ticketData = req.body
    sampleTickets.push(ticketData)

    if (ticketData.messages && ticketData.channelId) {
      sampleMessages[ticketData.id] = ticketData.messages
    }

    res.json({ success: true, message: "Ticket adicionado com sucesso" })
  } catch (error) {
    console.error("Erro ao adicionar ticket:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Servir arquivos estáticos
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Algo deu errado!" })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Dashboard disponível em: http://localhost:${PORT}`)
  console.log(`✅ API funcionando com ${sampleTickets.length} tickets de exemplo`)
})

module.exports = app
