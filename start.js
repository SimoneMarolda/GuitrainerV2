#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
//  GUITRAINER — start.js
//  Avvio automatico: migrazione (se necessaria) + dev server
//
//  Uso: node start.js
//  Oppure: npm start
// ═══════════════════════════════════════════════════════════════════════
const fs           = require('fs')
const path         = require('path')
const { execSync, spawn } = require('child_process')

const PORT = 3000

// ── Cerca il backup HTML ──────────────────────────────────────────────
function findBackup() {
  const candidates = fs.readdirSync('.').filter(f =>
    f.endsWith('.html') && f !== 'template.html' &&
    !f.startsWith('dist') && fs.statSync(f).size > 50000
  )
  return candidates[0] || null
}

// ── Controlla se la migrazione è già stata fatta ──────────────────────
function isMigrated() {
  const key = 'src/data/chords.js'
  if (!fs.existsSync(key)) return false
  const content = fs.readFileSync(key, 'utf8')
  // Il file è stato popolato se contiene la vera definizione CHORDS
  return content.includes('const CHORDS') || content.includes('var CHORDS') ||
         content.includes('"Do":') || content.includes('"Lam":')
}

// ── Controlla se il template esiste ──────────────────────────────────
function hasTemplate() {
  return fs.existsSync('template.html') &&
    fs.readFileSync('template.html', 'utf8').includes('CSS_PLACEHOLDER')
}

// ── Banner ────────────────────────────────────────────────────────────
console.log('')
console.log('  🎸  GUITRAINER — Dev Server')
console.log('─────────────────────────────────────────')

// ── Step 1: migrazione ────────────────────────────────────────────────
if (!isMigrated()) {
  console.log('  📦  File sorgente non ancora popolati.')

  const backup = findBackup()
  if (!backup) {
    console.error('')
    console.error('  ❌  Backup HTML non trovato.')
    console.error('  ↳   Copia il tuo file HTML in questa cartella:')
    console.error('      cp ~/Guitrainer_Backup_Ultimate_V2.html .')
    console.error('      node start.js')
    console.error('')
    process.exit(1)
  }

  console.log(`  📂  Backup trovato: ${backup}`)
  console.log('  ⚙️   Migrazione in corso...\n')

  try {
    execSync(`node migrate.js "${backup}"`, { stdio: 'inherit' })
    console.log('')
  } catch (e) {
    console.error('  ❌  Migrazione fallita. Controlla il file backup.')
    process.exit(1)
  }
} else {
  console.log('  ✅  File sorgente già presenti.')
}

// ── Step 2: avvia dev server ──────────────────────────────────────────
console.log(`  🌐  Avvio server su http://localhost:${PORT}`)
console.log('  👀  Live reload attivo — salva un file per rebuild')
console.log('─────────────────────────────────────────')
console.log('')

// Avvia server.js come processo figlio
const server = spawn('node', ['server.js'], { stdio: 'inherit' })
server.on('exit', code => process.exit(code || 0))
