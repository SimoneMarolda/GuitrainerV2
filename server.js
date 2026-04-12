#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
//  GUITRAINER — Dev Server
//  Serve l'app su localhost con live reload automatico
//
//  Uso:  node server.js
//  URL:  http://localhost:3000
// ═══════════════════════════════════════════════════════════
const http = require('http')
const fs   = require('fs')
const path = require('path')

const PORT     = 3000
const JS_ORDER = [
  'src/data/chords.js',
  'src/core.js',
  'src/center/circle.js',
  'src/center/fretboard.js',
  'src/center/history.js',
  'src/center/sequence.js',
  'src/top/tonalita.js',
  'src/top/modalita.js',
  'src/top/genera.js',
  'src/top/cerchio.js',
  'src/top/opzioni/training.js',
  'src/top/opzioni/types.js',
  'src/top/opzioni/positions.js',
  'src/top/opzioni/display.js',
  'src/bottom/accordo/notes.js',
  'src/bottom/accordo/chords.js',
  'src/bottom/accordo/queue.js',
  'src/bottom/analisi.js',
  'src/bottom/giri/classici.js',
  'src/bottom/giri/builder.js',
  'src/bottom/giri/presets.js',
  'src/bottom/metro.js',
  'src/init.js',
]

// ── Build in memoria ─────────────────────────────────────────────────
function buildHTML() {
  const css  = fs.readFileSync('src/style.css', 'utf8')
  const js   = JS_ORDER
    .map(f => `\n// ════ ${f} ════\n${fs.readFileSync(f, 'utf8')}\n`)
    .join('\n')
  const tmpl = fs.readFileSync('template.html', 'utf8')
  return tmpl
    .replace('<!-- CSS_PLACEHOLDER -->', `<style>\n${css}\n</style>`)
    .replace('<!-- JS_PLACEHOLDER -->', `<script>\n${js}\n</script>`)
}

// ── Stato ─────────────────────────────────────────────────────────────
let cachedHTML = ''
let needsReload = false
let buildError  = null

try {
  cachedHTML = buildHTML()
  console.log('  ✅  Build iniziale OK')
} catch (e) {
  buildError = e.message
  console.error('  ❌  Build error:', e.message)
}

// ── Watch src/ per cambiamenti ────────────────────────────────────────
const watchDirs = ['src', 'template.html'].filter(f => fs.existsSync(f))
watchDirs.forEach(target => {
  const isDir = fs.statSync(target).isDirectory()
  fs.watch(target, { recursive: isDir }, (ev, fname) => {
    const label = isDir ? `src/${fname}` : target
    console.log(`  ↻  ${label}`)
    try {
      cachedHTML  = buildHTML()
      needsReload = true
      buildError  = null
      console.log('  ✅  Rebuild OK')
    } catch (e) {
      buildError = e.message
      console.error('  ❌  Build error:', e.message)
    }
  })
})

// ── HTTP Server ───────────────────────────────────────────────────────
http.createServer((req, res) => {

  // Endpoint polling per live reload
  if (req.url === '/__reload') {
    res.setHeader('Content-Type', 'text/plain')
    if (buildError) {
      res.end('error:' + buildError)
    } else if (needsReload) {
      needsReload = false
      res.end('1')
    } else {
      res.end('0')
    }
    return
  }

  // Pagina principale
  if (buildError) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(`<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem;background:#111;color:#f55">
      <h2>❌ Build Error</h2><pre>${buildError}</pre>
      <p style="color:#aaa">Salva un file in src/ per fare rebuild automatico</p>
      <script>setInterval(()=>fetch('/__reload').then(r=>r.text()).then(v=>{if(v==='1'||v.startsWith('error:'))location.reload()}),800)</script>
    </body></html>`)
    return
  }

  // Inietta script live-reload nell'HTML
  const page = cachedHTML.replace(
    '</body>',
    `<script>
      ;(function(){
        function poll(){
          fetch('/__reload').then(r=>r.text()).then(v=>{
            if(v==='1') location.reload()
            else if(v.startsWith('error:')) console.error('Build error:',v)
            else setTimeout(poll, 800)
          }).catch(()=>setTimeout(poll,1500))
        }
        setTimeout(poll, 800)
      })()
    </script></body>`
  )

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(page)

}).listen(PORT, () => {
  console.log('')
  console.log('─────────────────────────────────────────')
  console.log('  🎸  Guitrainer Dev Server')
  console.log(`  🌐  http://localhost:${PORT}`)
  console.log('  👀  Watching src/ e template.html …')
  console.log('  💾  Salva un file → rebuild automatico')
  console.log('─────────────────────────────────────────')
})
