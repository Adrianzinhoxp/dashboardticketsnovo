// Gerenciamento de tema
let currentTheme = localStorage.getItem("theme") || "dark"

function initTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme)
  updateThemeIcon()
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark"
  document.documentElement.setAttribute("data-theme", currentTheme)
  localStorage.setItem("theme", currentTheme)
  updateThemeIcon()

  // Animação suave na transição
  document.body.style.transition = "all 0.3s ease"
  setTimeout(() => {
    document.body.style.transition = ""
  }, 300)
}

function updateThemeIcon() {
  const themeToggle = document.querySelector(".theme-toggle i")
  if (themeToggle) {
    themeToggle.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }
}

// Inicializar tema ao carregar a página
document.addEventListener("DOMContentLoaded", initTheme)

// Detectar preferência do sistema
if (window.matchMedia && !localStorage.getItem("theme")) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  currentTheme = prefersDark ? "dark" : "light"
  initTheme()
}

// Escutar mudanças na preferência do sistema
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("theme")) {
    currentTheme = e.matches ? "dark" : "light"
    initTheme()
  }
})
