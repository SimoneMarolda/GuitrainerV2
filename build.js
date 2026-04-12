#!/usr/bin/env node
const fs   = require('fs')
const path = require('path')

const JS_ORDER = [
  'src/data/chords.js',
  'src/data/voicings.js',
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

function build() {
  var missing = ['template.html'].concat(JS_ORDER).filter(function(f){ return !fs.existsSync(f); })
  if (missing.length) {
    missing.forEach(function(f){ console.error('  x  File mancante: ' + f) })
    process.exit(1)
  }

  var css = fs.existsSync('src/style.css') ? fs.readFileSync('src/style.css', 'utf8') : ''

  var js = JS_ORDER
    .map(function(f){ return '\n// ==== ' + f + ' ====\n' + fs.readFileSync(f, 'utf8') + '\n' })
    .join('\n')

  var tmpl = fs.readFileSync('template.html', 'utf8')
  var out = tmpl
    .replace('<!-- CSS_PLACEHOLDER -->', '<style>\n' + css + '\n</style>')
    .replace('<!-- JS_PLACEHOLDER -->', '<script>\n' + js + '\n</script>')

  out = out.split('\n').filter(function(l) {
    var t = l.trim()
    return t !== '```' && t !== '```html' && t !== '```js' && t !== '```javascript' && t !== '```css'
  }).join('\n')

  fs.mkdirSync('dist', { recursive: true })
  var dest = path.join('dist', 'index.html')
  fs.writeFileSync(dest, out, 'utf8')
  var kb = Math.round(fs.statSync(dest).size / 1024)
  console.log('Build OK: dist/index.html  (' + kb + ' KB)')
  return dest
}

build()
