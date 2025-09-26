let currentPage = 1
const ticketsPerPage = 10
let totalTickets = 0
let allTickets = []

// Carregar tickets ao inicializar
document.addEventListener("DOMContentLoaded", () => {
  loadTickets()
  // Auto-refresh a cada 30 segundos
  setInterval(loadTickets, 30000)
})

async function loadTickets() {
  try {
    showLoading()
    const response = await fetch("/api/tickets")
    const data = await response.json()

    if (data.success) {
      allTickets = data.tickets || []
      totalTickets = allTickets.length
      updateStats()
      renderTickets()
      renderPagination()
    } else {
      showError("Erro ao carregar tickets: " + data.error)
    }
  } catch (error) {
    console.error("Erro ao carregar tickets:", error)
    showError("Erro de conexão com o servidor")
  }
}

function updateStats() {
  const stats = {
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === "open").length,
    closed: allTickets.filter((t) => t.status === "closed").length,
    pending: allTickets.filter((t) => t.status === "pending").length,
  }

  // Animação dos números
  animateNumber("totalTickets", stats.total)
  animateNumber("openTickets", stats.open)
  animateNumber("closedTickets", stats.closed)
  animateNumber("pendingTickets", stats.pending)
}

function animateNumber(elementId, targetValue) {
  const element = document.getElementById(elementId)
  const currentValue = Number.parseInt(element.textContent) || 0
  const increment = targetValue > currentValue ? 1 : -1
  const duration = 1000 // 1 segundo
  const steps = Math.abs(targetValue - currentValue)
  const stepDuration = duration / steps

  if (steps === 0) return

  let current = currentValue
  const timer = setInterval(() => {
    current += increment
    element.textContent = current

    if (current === targetValue) {
      clearInterval(timer)
    }
  }, stepDuration)
}

function renderTickets() {
  const startIndex = (currentPage - 1) * ticketsPerPage
  const endIndex = startIndex + ticketsPerPage
  const ticketsToShow = allTickets.slice(startIndex, endIndex)

  const tbody = document.getElementById("ticketsTable")

  if (ticketsToShow.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 50px; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <br>
                    Nenhum ticket encontrado
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = ticketsToShow
    .map(
      (ticket) => `
        <tr>
            <td>
                <span style="font-weight: 700; color: var(--primary);">#${ticket.id}</span>
            </td>
            <td>
                <div class="user-info">
                    <img src="${ticket.userAvatar || "https://cdn.discordapp.com/embed/avatars/0.png"}" 
                         alt="Avatar" class="user-avatar">
                    <div>
                        <div style="font-weight: 600;">${ticket.username}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${ticket.userId}</div>
                    </div>
                </div>
            </td>
            <td>
                <span style="font-weight: 600; color: var(--primary);">${ticket.type || "Geral"}</span>
            </td>
            <td>
                <span class="status-badge status-${ticket.status}">
                    ${getStatusText(ticket.status)}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${ticket.priority || "medium"}">
                    ${getPriorityText(ticket.priority || "medium")}
                </span>
            </td>
            <td>
                <div style="font-weight: 600;">${formatDate(ticket.createdAt)}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${formatTime(ticket.createdAt)}</div>
            </td>
            <td>
                <div class="rating">
                    ${generateStars(ticket.rating || 0)}
                </div>
            </td>
            <td>
                <button class="view-btn" onclick="viewTicket('${ticket.id}')">
                    <i class="fas fa-eye"></i>
                    Ver Detalhes
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function renderPagination() {
  const totalPages = Math.ceil(totalTickets / ticketsPerPage)
  const pagination = document.getElementById("pagination")
  const paginationInfo = document.getElementById("paginationInfo")

  // Atualizar informações
  const startItem = (currentPage - 1) * ticketsPerPage + 1
  const endItem = Math.min(currentPage * ticketsPerPage, totalTickets)
  paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${totalTickets} tickets`

  if (totalPages <= 1) {
    pagination.innerHTML = `<div class="pagination-info">${paginationInfo.outerHTML}</div>`
    return
  }

  let paginationHTML = `<div class="pagination-info">${paginationInfo.outerHTML}</div>`

  // Botão Anterior
  paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `

  // Números das páginas
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  // Primeira página
  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`
    if (startPage > 2) {
      paginationHTML += `<span style="padding: 0 10px; color: var(--text-secondary);">...</span>`
    }
  }

  // Páginas visíveis
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? "active" : ""}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `
  }

  // Última página
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span style="padding: 0 10px; color: var(--text-secondary);">...</span>`
    }
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`
  }

  // Botão Próxima
  paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? "disabled" : ""}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `

  pagination.innerHTML = paginationHTML
}

function changePage(page) {
  const totalPages = Math.ceil(totalTickets / ticketsPerPage)
  if (page < 1 || page > totalPages) return

  currentPage = page
  renderTickets()
  renderPagination()

  // Scroll suave para o topo da tabela
  document.querySelector(".table-container").scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

async function viewTicket(ticketId) {
  try {
    const response = await fetch(`/api/tickets/${ticketId}`)
    const data = await response.json()

    if (data.success) {
      showTicketModal(data.ticket)
    } else {
      showError("Erro ao carregar detalhes do ticket")
    }
  } catch (error) {
    console.error("Erro ao carregar ticket:", error)
    showError("Erro de conexão com o servidor")
  }
}

function showTicketModal(ticket) {
  const modal = document.getElementById("messageModal")
  const ticketInfo = document.getElementById("ticketInfo")
  const messagesContainer = document.getElementById("messagesContainer")

  // Informações do ticket
  ticketInfo.innerHTML = `
        <div class="info-item">
            <div class="info-label">ID do Ticket</div>
            <div class="info-value">#${ticket.id}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Usuário</div>
            <div class="info-value">${ticket.username}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Tipo</div>
            <div class="info-value">${ticket.type || "Geral"}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">
                <span class="status-badge status-${ticket.status}">
                    ${getStatusText(ticket.status)}
                </span>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Prioridade</div>
            <div class="info-value">
                <span class="priority-badge priority-${ticket.priority || "medium"}">
                    ${getPriorityText(ticket.priority || "medium")}
                </span>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Criado em</div>
            <div class="info-value">${formatDate(ticket.createdAt)} às ${formatTime(ticket.createdAt)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Avaliação</div>
            <div class="info-value">
                <div class="rating">${generateStars(ticket.rating || 0)}</div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Oficial Responsável</div>
            <div class="info-value">${ticket.officerName || "Não atribuído"}</div>
        </div>
    `

  // Mensagens
  if (ticket.messages && ticket.messages.length > 0) {
    messagesContainer.innerHTML = ticket.messages
      .map(
        (msg) => `
            <div class="message">
                <div class="message-header">
                    <span class="message-author">${msg.author}</span>
                    <span class="message-time">${formatDate(msg.timestamp)} às ${formatTime(msg.timestamp)}</span>
                </div>
                <div class="message-content">${msg.content}</div>
                ${
                  msg.attachments
                    ? msg.attachments
                        .map(
                          (att) => `
                    <div style="margin-top: 10px;">
                        <a href="${att.url}" target="_blank" style="color: var(--primary); text-decoration: none;">
                            <i class="fas fa-paperclip"></i> ${att.name}
                        </a>
                    </div>
                `,
                        )
                        .join("")
                    : ""
                }
            </div>
        `,
      )
      .join("")
  } else {
    messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <br>
                Nenhuma mensagem encontrada
            </div>
        `
  }

  modal.classList.add("show")
}

function closeModal() {
  const modal = document.getElementById("messageModal")
  modal.classList.remove("show")
}

// Fechar modal ao clicar fora
document.getElementById("messageModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal()
  }
})

// Funções auxiliares
function getStatusText(status) {
  const statusMap = {
    open: "Aberto",
    closed: "Fechado",
    pending: "Pendente",
  }
  return statusMap[status] || status
}

function getPriorityText(priority) {
  const priorityMap = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  }
  return priorityMap[priority] || priority
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function generateStars(rating) {
  const maxStars = 5
  let stars = ""
  for (let i = 1; i <= maxStars; i++) {
    if (i <= rating) {
      stars += '<i class="fas fa-star star"></i>'
    } else {
      stars += '<i class="far fa-star star empty"></i>'
    }
  }
  return stars
}

function showLoading() {
  const tbody = document.getElementById("ticketsTable")
  tbody.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <div class="spinner"></div>
            </td>
        </tr>
    `
}

function showError(message) {
  const tbody = document.getElementById("ticketsTable")
  tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 50px; color: var(--error);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <br>
                ${message}
                <br><br>
                <button class="refresh-btn" onclick="loadTickets()" style="margin-top: 10px;">
                    <i class="fas fa-sync-alt"></i>
                    Tentar Novamente
                </button>
            </td>
        </tr>
    `
}

// Atalhos de teclado
document.addEventListener("keydown", (e) => {
  // ESC para fechar modal
  if (e.key === "Escape") {
    closeModal()
  }

  // F5 para atualizar
  if (e.key === "F5") {
    e.preventDefault()
    loadTickets()
  }

  // Setas para navegação
  if (e.key === "ArrowLeft" && e.ctrlKey) {
    e.preventDefault()
    changePage(currentPage - 1)
  }

  if (e.key === "ArrowRight" && e.ctrlKey) {
    e.preventDefault()
    changePage(currentPage + 1)
  }
})
