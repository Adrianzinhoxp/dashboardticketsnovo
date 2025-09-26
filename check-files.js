const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando estrutura de arquivos...")
console.log("📁 Diretório atual:", __dirname)

// Verificar arquivos na raiz
console.log("\n📋 Arquivos na raiz:")
try {
  const rootFiles = fs.readdirSync(__dirname)
  rootFiles.forEach((file) => {
    const filePath = path.join(__dirname, file)
    const stats = fs.statSync(filePath)
    console.log(`  ${stats.isDirectory() ? "📁" : "📄"} ${file}`)
  })
} catch (error) {
  console.error("❌ Erro ao ler diretório raiz:", error.message)
}

// Verificar pasta public
const publicDir = path.join(__dirname, "public")
console.log("\n📋 Pasta public:")
if (fs.existsSync(publicDir)) {
  try {
    const publicFiles = fs.readdirSync(publicDir)
    publicFiles.forEach((file) => {
      console.log(`  📄 ${file}`)
    })
  } catch (error) {
    console.error("❌ Erro ao ler pasta public:", error.message)
  }
} else {
  console.log("  ❌ Pasta public não existe!")
}

// Verificar arquivo index.html
const indexPath = path.join(__dirname, "public", "index.html")
console.log("\n🔍 Verificando index.html:")
console.log(`  📍 Caminho: ${indexPath}`)
console.log(`  ✅ Existe: ${fs.existsSync(indexPath)}`)

if (fs.existsSync(indexPath)) {
  const stats = fs.statSync(indexPath)
  console.log(`  📏 Tamanho: ${stats.size} bytes`)
  console.log(`  📅 Modificado: ${stats.mtime}`)
}

console.log("\n✅ Verificação concluída!")
