#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
//  GUITRAINER — migrate.js
//  Legge il backup HTML e popola tutti i 20 file sorgente
//  Uso: node migrate.js Guitrainer_Backup_Ultimate_V2.html
// ═══════════════════════════════════════════════════════════════════════
const fs   = require('fs')
const path = require('path')

const srcFile = process.argv[2]
if (!srcFile || !fs.existsSync(srcFile)) {
  console.error(`❌  File non trovato: ${srcFile || '(nessun argomento)'}`)
  console.error('    Uso: node migrate.js Guitrainer_Backup_Ultimate_V2.html')
  process.exit(1)
}

const src = fs.readFileSync(srcFile, 'utf8')
console.log(`📂  Lettura: ${srcFile}  (${Math.round(src.length/1024)} KB)\n`)

// ── Estrai CSS e JS dal HTML ──────────────────────────────────────────
function between(str, open, close) {
  const a = str.indexOf(open);  if (a<0) return ''
  const b = str.indexOf(close, a+open.length); if (b<0) return ''
  return str.slice(a+open.length, b).trim()
}

const cssRaw  = between(src, '<style>',  '</style>')
const jsRaw   = between(src, '<script>', '</script>')
const bodyRaw = between(src, '<body>',   '</body>')

if (!jsRaw) { console.error('❌  Script non trovato nel HTML'); process.exit(1) }

// ── Splitta dati dalla logica ─────────────────────────────────────────
// I dati (NOTES…OPEN_CHROM) vengono prima di noteColorForStringFret
const LOGIC_MARK = 'function noteColorForStringFret'
const logicIdx   = jsRaw.indexOf(LOGIC_MARK)
if (logicIdx < 0) { console.error('❌  Marker logica non trovato'); process.exit(1) }

let jsData = jsRaw.slice(0, logicIdx).trim()
let jsApp  = jsRaw.slice(logicIdx).trim()

// Sposta AC_NC / AC_MINOR / AC_DEG_QUAL in jsData
const acMark  = '// Compatibility maps'
const acEnd   = '\nadjBPM(0);'
const acA = jsApp.indexOf(acMark)
if (acA >= 0) {
  const acB = jsApp.indexOf(acEnd, acA)
  if (acB >= 0) {
    jsData += '\n\n' + jsApp.slice(acA, acB).trim()
    jsApp   = jsApp.slice(0, acA) + jsApp.slice(acB)
  }
}

// ── Funzioni di utilità ───────────────────────────────────────────────
function extractBetween(js, startMark, ...endMarks) {
  const a = js.indexOf(startMark); if (a<0) return ''
  let b = js.length
  for (const m of endMarks) {
    const idx = js.indexOf(m, a + startMark.length)
    if (idx > 0 && idx < b) b = idx
  }
  return js.slice(a, b).trim()
}

function extractFunctions(js, ...names) {
  let out = ''
  for (const name of names) {
    // Cerca "function name(" oppure "var name = function" oppure "name = function"
    const patterns = [
      new RegExp(`((?:^|\\n)(?:\\/\\/[^\\n]*\\n)*function\\s+${name}\\s*\\()`, 'm'),
      new RegExp(`((?:^|\\n)(?:\\/\\/[^\\n]*\\n)*(?:var|let|const)\\s+${name}\\s*=\\s*function)`, 'm'),
      new RegExp(`((?:^|\\n)${name}\\s*=\\s*function)`, 'm'),
    ]
    let found = false
    for (const pat of patterns) {
      const m = pat.exec(js)
      if (!m) continue
      const start = m.index
      // trova la chiusura bilanciando le graffe
      let depth=0, i=start, inStr=false, strChar='', inLC=false
      while (i < js.length) {
        const c = js[i]
        if (inLC) { if (c==='\n') inLC=false; i++; continue }
        if (!inStr && c==='/' && js[i+1]==='/') { inLC=true; i+=2; continue }
        if (!inStr && (c==='"'||c==="'"||c==='`')) { inStr=true; strChar=c; i++; continue }
        if (inStr && c===strChar && js[i-1]!=='\\') { inStr=false; i++; continue }
        if (!inStr && c==='{') depth++
        if (!inStr && c==='}') { depth--; if (depth===0){ i++; break } }
        i++
      }
      out += '\n\n' + js.slice(start, i).trim()
      found = true
      break
    }
    if (!found) console.warn(`  ⚠️   Funzione non trovata: ${name}`)
  }
  return out.trim()
}

function extractVars(js, ...names) {
  let out = ''
  for (const name of names) {
    const pat = new RegExp(`((?:^|\\n)var\\s+${name}\\b[\\s\\S]*?;)`, 'm')
    const m = pat.exec(js)
    if (m) out += '\n' + m[1].trim()
    else console.warn(`  ⚠️   Variabile non trovata: ${name}`)
  }
  return out.trim()
}

// ── Sezione init (alla fine dello script) ─────────────────────────────
function extractInit(js) {
  // Tutto ciò che viene dopo l'ultima definizione di funzione "grande"
  const markers = [
    'adjBPM(0);',
    'setTonMode(',
    'setKey(0)',
    'setTimeout(function(){',
  ]
  let earliest = js.length
  for (const m of markers) {
    const i = js.indexOf(m)
    if (i > 0 && i < earliest) earliest = i
  }
  return js.slice(earliest).trim()
}

// ── FILE: src/data/chords.js ─────────────────────────────────────────
function buildDataFile() {
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Data Constants
// File: src/data/chords.js   |   GT-GLB-DAT
// ═══════════════════════════════════════════════════════════════════════

${jsData}
`
}

// ── FILE: src/center/fretboard.js ────────────────────────────────────
function buildFretboardFile() {
  const code = extractFunctions(jsApp,
    'noteColorForStringFret', 'buildFretSvg', 'buildFretCard',
    'updateFretboard', 'renderChordPicker', 'toggleFretVisibility'
  )
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Center › Fretboard
// File: src/center/fretboard.js   |   GT-CTR-FRB
//
//   GT-CTR-FRB-COL-001  noteColorForStringFret()
//   GT-CTR-FRB-SVG-001  buildFretSvg()         — fretboard grande
//     GT-CTR-FRB-SVG-001a  Dimensioni W*0.44   ← cambia qui per resize
//     GT-CTR-FRB-SVG-001b  Capotasto (nut)
//     GT-CTR-FRB-SVG-001c  Tasti verticali
//     GT-CTR-FRB-SVG-001d  Corde (spessore e→E)
//     GT-CTR-FRB-SVG-001e  Barrè
//     GT-CTR-FRB-SVG-001f  Dots note
//     GT-CTR-FRB-SVG-001g  Numeri dita
//   GT-CTR-FRB-CRD-001  buildFretCard()         — mini fretboard card
//     GT-CTR-FRB-CRD-001a  fRatio=1.6
//     GT-CTR-FRB-CRD-001b  Numero tasto sopra nut
//   GT-CTR-FRB-UPD-001  updateFretboard()
//   GT-CTR-FRB-VIS-001  toggleFretVisibility()
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/center/circle.js ───────────────────────────────────────
function buildCircleFile() {
  const code = extractFunctions(jsApp,
    'setKey', 'setTonMode', 'toggleRingLayer', 'setMode'
  )
  const modes = extractVars(jsApp, 'MODES')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Center › Cerchio delle Quinte
// File: src/center/circle.js   |   GT-CTR-CIR
//
//   GT-CTR-CIR-KEY-001  setKey(idx)
//   GT-CTR-CIR-RNG-002  Anello R2 diatonici
//   GT-CTR-CIR-RNG-003  Anello R3 dom.sec.
//   GT-CTR-CIR-RNG-004  Anello R4 tritono
//   GT-CTR-CIR-TGL-001  toggleRingLayer()
//   GT-CTR-CIR-MOD-001  setMode()  — semplice/normale/difficile/libero
//   GT-CTR-CIR-TON-001  setTonMode() — MIN/MAJ
// ═══════════════════════════════════════════════════════════════════════

${modes}

${code}
`
}

// ── FILE: src/center/history.js ──────────────────────────────────────
function buildHistoryFile() {
  const code = extractFunctions(jsApp, 'addHist', 'clearHist', 'renderHist')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Center › Cronologia Accordi
// File: src/center/history.js   |   GT-CTR-HIS
//
//   GT-CTR-HIS-ADD-001  addHist()
//   GT-CTR-HIS-REN-001  renderHist()
//   GT-CTR-HIS-CLR-001  clearHist()
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/center/sequence.js ─────────────────────────────────────
function buildSequenceFile() {
  const code = extractFunctions(jsApp,
    'renderUnified', 'acDelFromQ', 'updateUZoneCnt',
    'renderMainProg', 'clearMainProg'
  )
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Center › Unified Zone / Sequenza
// File: src/center/sequence.js   |   GT-CTR-SEQ
//
//   GT-CTR-SEQ-REN-001  renderUnified()   — disegna slot
//   GT-CTR-SEQ-DEL-001  acDelFromQ()      — rimuove accordo
//   GT-CTR-SEQ-ADD-001  Bottone "+"       — apre pannello Accordo
//   GT-CTR-SEQ-DRG-001  Drag desktop
//   GT-CTR-SEQ-DRG-002  Drag iOS touch
//   GT-CTR-SEQ-CNT-001  updateUZoneCnt()
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/top/tonalita.js ─────────────────────────────────────────
function buildTonalitaFile() {
  // setKey e setTonMode sono in circle.js, qui solo gnToggle e buildGenera
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Tonalità
// File: src/top/tonalita.js   |   GT-TOP-TON
// Nota: setKey() e setTonMode() si trovano in src/center/circle.js
//       GT-CTR-CIR-KEY-001 e GT-CTR-CIR-TON-001
//
//   GT-TOP-TON-MOD-001  setTonMode() → vedi circle.js
//   GT-TOP-TON-KEY-001  setKey()     → vedi circle.js
// ═══════════════════════════════════════════════════════════════════════
// (nessuna logica aggiuntiva — il pannello p-tonalita è solo HTML)
`
}

// ── FILE: src/top/modalita.js ─────────────────────────────────────────
function buildModalitaFile() {
  const code = extractFunctions(jsApp, 'setStudioMode')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Modalità
// File: src/top/modalita.js   |   GT-TOP-MOD
//
//   GT-TOP-MOD-STU-001  setStudioMode()
//     GT-TOP-MOD-STU-001a  Accordi
//     GT-TOP-MOD-STU-001b  Armonia
//     GT-TOP-MOD-STU-001c  Scale
//     GT-TOP-MOD-STU-001d  Acc. + Scale
//     GT-TOP-MOD-STU-001e  Arm. + Scale
//   GT-TOP-MOD-CER-001  setMode() → vedi circle.js
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/top/genera.js ───────────────────────────────────────────
function buildGeneraFile() {
  const code = extractFunctions(jsApp,
    'gnToggle', 'buildGenera', 'buildGen',
    'advanceGen', 'renderGenSlots', 'toggleGenLoop'
  )
  const vars = extractVars(jsApp, 'gnFlags')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Genera Accordi
// File: src/top/genera.js   |   GT-TOP-GEN
//
//   GT-TOP-GEN-BSE-001a  pill Diatonico
//   GT-TOP-GEN-BSE-001b  pill Random Tonale
//   GT-TOP-GEN-REG-001a  Dominanti Secondarie
//   GT-TOP-GEN-REG-001b  Sostituzione Tritono
//   GT-TOP-GEN-REG-001c  Intercambio Modale
//   GT-TOP-GEN-REG-001d  Accordo Napoletano
//   GT-TOP-GEN-BLD-001   buildGenera()
//   GT-TOP-GEN-TGL-001   gnToggle()
//   GT-TOP-GEN-LOP-001   toggleGenLoop()
// ═══════════════════════════════════════════════════════════════════════

${vars}

${code}
`
}

// ── FILE: src/top/cerchio.js ──────────────────────────────────────────
function buildCerchioFile() {
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Cerchio (Toggle Anelli)
// File: src/top/cerchio.js   |   GT-TOP-CER
// Nota: toggleRingLayer() si trova in src/center/circle.js GT-CTR-CIR-TGL-001
//
//   GT-TOP-CER-R2-001  Toggle Diatonici   → chiama toggleRingLayer('r2s',…)
//   GT-TOP-CER-R3-001  Toggle Dom.Sec.    → chiama toggleRingLayer('r3s',…)
//   GT-TOP-CER-R4-001  Toggle Tritono     → chiama toggleRingLayer('r4s',…)
// ═══════════════════════════════════════════════════════════════════════
// (il pannello p-cerchio è solo HTML — la logica è in circle.js)
`
}

// ── FILE: src/top/opzioni/training.js ────────────────────────────────
function buildTrainingFile() {
  const code = extractFunctions(jsApp,
    'toggleFree', 'toggleRandMode', 'syncRandToggle', 'toggleNoKeyMode'
  )
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Opzioni › Allenamento
// File: src/top/opzioni/training.js   |   GT-TOP-OPZ-ALN
//
//   GT-TOP-OPZ-ALN-TGL-001a  toggleFree()      — Libero Senza Tonalità
//   GT-TOP-OPZ-ALN-TGL-001b  toggleNoKeyMode()
//   GT-TOP-OPZ-ALN-TGL-002a  toggleRandMode()  — Random Accordi
//   GT-TOP-OPZ-ALN-TGL-002b  syncRandToggle()  — sincronizza UI toggle
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/top/opzioni/types.js ───────────────────────────────────
function buildTypesFile() {
  const code = extractFunctions(jsApp,
    'toggleDropdown', 'setRandType', 'getRandPool', 'getRandPoolFull', 'getNextRandChord'
  )
  const vars = extractVars(jsApp, 'randQual')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Opzioni › Tipo Accordi
// File: src/top/opzioni/types.js   |   GT-TOP-OPZ-TYP
//
//   GT-TOP-OPZ-TYP-MAJ-001  Dropdown MAJ (Magg./Magg7/Dom7/Power5)
//   GT-TOP-OPZ-TYP-MIN-001  Dropdown MIN (Min./Min7/Power5)
//   GT-TOP-OPZ-TYP-MIX-001  Dropdown MIX (9 opzioni)
//   GT-TOP-OPZ-TYP-FN-001   toggleDropdown()
//   GT-TOP-OPZ-TYP-FN-002   setRandType()
//   GT-TOP-OPZ-TYP-MAP-001  QUAL_MAP
//   GT-TOP-OPZ-TYP-MAP-002  getRandPoolFull()   — pool con filtri zona+qualità
//   GT-TOP-OPZ-TYP-MAP-003  getNextRandChord()  — anti-repeat last 3
// ═══════════════════════════════════════════════════════════════════════

${vars}

${code}

// GT-TOP-OPZ-TYP-MAP-001 — chiudi dropdown cliccando fuori
document.addEventListener('click', function(e){
  if(!e.target.closest('#majTypeBtn,#minTypeBtn,#mixTypeBtn,#majDrop,#minDrop,#mixDrop')){
    ['majDrop','minDrop','mixDrop'].forEach(function(id){
      var d=document.getElementById(id); if(d) d.style.display='none';
    });
  }
});
`
}

// ── FILE: src/top/opzioni/positions.js ──────────────────────────────
function buildPositionsFile() {
  const code = extractFunctions(jsApp,
    'setPosMode', 'setPosZone', 'matchZone', 'matchFretPos', 'setFretPos'
  )
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Top › Opzioni › Sistema Posizioni
// File: src/top/opzioni/positions.js   |   GT-TOP-OPZ-POS
//
//   GT-TOP-OPZ-POS-MOD-001a  setPosMode('near')  — mostra nearPosRow
//   GT-TOP-OPZ-POS-MOD-001b  setPosMode('wide')  — mostra widePosRow
//   GT-TOP-OPZ-POS-ZON-002   Zone Near (Tutto 0-3 4-6 7-9 10-12)
//   GT-TOP-OPZ-POS-ZON-003   Zone Wide (Tutto 1-5 5-8 8-12)
//   GT-TOP-OPZ-POS-FLT-001   matchZone()         — filtra per zona
//   GT-TOP-OPZ-POS-FLT-002   matchFretPos()      — filtra per posMode
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/bottom/accordo/notes.js ────────────────────────────────
function buildNotesFile() {
  const code = extractFunctions(jsApp, 'acBuildNotes', 'acLoopScroll')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Accordo › Note Wheel
// File: src/bottom/accordo/notes.js   |   GT-BOT-ACC-NWH
//
//   GT-BOT-ACC-NWH-BLD-001a  3 copie per scroll infinito
//   GT-BOT-ACC-NWH-BLD-001b  CELL = clientWidth / 4
//   GT-BOT-ACC-NWH-SCR-001a  Salto avanti se scrollLeft < 30%
//   GT-BOT-ACC-NWH-SCR-001b  Salto indietro se scrollLeft > 170%
//   GT-BOT-ACC-NWH-TAP-001   Click → aggiorna acTonic + rebuild chords
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/bottom/accordo/chords.js ───────────────────────────────
function buildAccordoChordsFile() {
  const code = extractFunctions(jsApp, 'acCmp', 'acForTonic', 'acBuildChords')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Accordo › Chord Wheel
// File: src/bottom/accordo/chords.js   |   GT-BOT-ACC-CWH
//
//   GT-BOT-ACC-CWH-CMP-001a  acCmp() → 2=diatonico, 1=parziale, 0=fuori
//   GT-BOT-ACC-CWH-FLT-001   acForTonic()    — filtra per tonica
//   GT-BOT-ACC-CWH-BLD-001   acBuildChords() — wheel 3 copie infinite
//   GT-BOT-ACC-CWH-BLD-001b  CELL = (clientWidth-12) / 3
//   GT-BOT-ACC-CWH-BLD-001c  Card: mini fretboard + nome + qualità
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/bottom/accordo/queue.js ────────────────────────────────
function buildQueueFile() {
  const code = extractFunctions(jsApp,
    'acInQ', 'acAddQ', 'acClearQ', 'acRenderQ'
  )
  const vars = extractVars(jsApp, 'acDragIdx')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Accordo › Queue Strip
// File: src/bottom/accordo/queue.js   |   GT-BOT-ACC-QUE
//
//   GT-BOT-ACC-QUE-INQ-001  acInQ()      — check presenza in queue
//   GT-BOT-ACC-QUE-ADD-001  acAddQ()     — aggiunge a queue
//   GT-BOT-ACC-QUE-CLR-001  acClearQ()   — svuota queue
//   GT-BOT-ACC-QUE-REN-001  acRenderQ()  — disegna chip
//   GT-BOT-ACC-QUE-DRG-001  Drag desktop
//   GT-BOT-ACC-QUE-DRG-002  Drag iOS touch
// ═══════════════════════════════════════════════════════════════════════

${vars}

${code}
`
}

// ── FILE: src/bottom/analisi.js ──────────────────────────────────────
function buildAnalisiFile() {
  const code = extractFunctions(jsApp, 'updateAnalisi')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Analisi Armonica
// File: src/bottom/analisi.js   |   GT-BOT-ANA
//
//   GT-BOT-ANA-SCL-001   Modalità Scala  — gradi se queue vuota
//   GT-BOT-ANA-QUE-001   Modalità Queue  — analisi accordi
//   GT-BOT-ANA-FTR-001a  Footer: Dominante Secondaria
//   GT-BOT-ANA-FTR-001b  Footer: Sostituzione Tritono
//   GT-BOT-ANA-FTR-001c  Footer: Relativa Maggiore
// ═══════════════════════════════════════════════════════════════════════

${code}
`
}

// ── FILE: src/bottom/giri/classici.js ────────────────────────────────
function buildGiriClassiciFile() {
  const giriSvg = extractVars(jsApp, 'GIRI_SVG')
  const giriDat = extractVars(jsApp, 'GIRI')
  const code    = extractFunctions(jsApp,
    'renderGiroCarousel', 'renderGiroSlots', 'giroAddToQueue'
  )
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Giri › Classici
// File: src/bottom/giri/classici.js   |   GT-BOT-GIR-CLS
//
//   GT-BOT-GIR-CLS-DAT-001  Array GIRI (12 giri predefiniti)
//     GT-BOT-GIR-CLS-DAT-001a  I–IV–V     GT-BOT-GIR-CLS-DAT-001g  Andalusa
//     GT-BOT-GIR-CLS-DAT-001b  I–V–vi–IV  GT-BOT-GIR-CLS-DAT-001h  Canon
//     GT-BOT-GIR-CLS-DAT-001c  II–V–I     GT-BOT-GIR-CLS-DAT-001i  Dark
//     GT-BOT-GIR-CLS-DAT-001d  I–6–2–5   GT-BOT-GIR-CLS-DAT-001j  Epica
//     GT-BOT-GIR-CLS-DAT-001e  6–4–1–5   GT-BOT-GIR-CLS-DAT-001k  Ballad
//     GT-BOT-GIR-CLS-DAT-001f  Blues      GT-BOT-GIR-CLS-DAT-001l  Modale
//   GT-BOT-GIR-CLS-SVG-001  GIRI_SVG (icone inline)
//   GT-BOT-GIR-CLS-CAR-001  renderGiroCarousel()
//   GT-BOT-GIR-CLS-SLT-001  renderGiroSlots()
//   GT-BOT-GIR-CLS-ADD-001  giroAddToQueue()
// ═══════════════════════════════════════════════════════════════════════

${giriSvg}

${giriDat}

${code}
`
}

// ── FILE: src/bottom/giri/builder.js ─────────────────────────────────
function buildGiriBuilderFile() {
  const degVars = extractVars(jsApp, 'DEGREE_ROMAN', 'DEGREE_QUAL')
  const code    = extractFunctions(jsApp,
    'degToChord', 'bestChordForDeg', 'buildProgFromDegs',
    'gToggleDeg', 'gClearDegs', 'renderDegSeq', 'gBuildFromDegs',
    'toggleMainProgLoop', 'setTipoProg', 'setStile', 'buildTipoProg'
  )
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Giri › Costruttore
// File: src/bottom/giri/builder.js   |   GT-BOT-GIR-BLD
//
//   GT-BOT-GIR-BLD-BTN-001  7 pulsanti gradi (i ii° III iv V VI VII)
//   GT-BOT-GIR-BLD-TGL-001  gToggleDeg()         — aggiunge grado
//   GT-BOT-GIR-BLD-REN-001  renderDegSeq()        — mostra sequenza
//   GT-BOT-GIR-BLD-CLR-001  gClearDegs()          — azzera
//   GT-BOT-GIR-BLD-GEN-001  gBuildFromDegs()      — genera
//   GT-BOT-GIR-BLD-LOP-001  toggleMainProgLoop()  — loop
//   GT-BOT-GIR-BLD-HLP-001  bestChordForDeg()     — trova accordo per grado
//   GT-BOT-GIR-BLD-HLP-002  buildProgFromDegs()   — costruisce progressione
// ═══════════════════════════════════════════════════════════════════════

${degVars}

${code}
`
}

// ── FILE: src/bottom/giri/presets.js ─────────────────────────────────
function buildGiriPresetsFile() {
  const presets = extractVars(jsApp, 'PRESETS')
  const code    = extractFunctions(jsApp, 'renderPresetList', 'gSwitchTab')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Giri › Preset
// File: src/bottom/giri/presets.js   |   GT-BOT-GIR-PRE
//
//   GT-BOT-GIR-PRE-DAT-001  Array PRESETS (12 progressioni rapide)
//   GT-BOT-GIR-PRE-REN-001  renderPresetList()
//   GT-BOT-GIR-PRE-TAP-001  Click preset → buildProgFromDegs()
//   GT-BOT-GIR-PRE-TAB-001  gSwitchTab()  — switcha tra tab 1/2/3
// ═══════════════════════════════════════════════════════════════════════

${presets}

${code}
`
}

// ── FILE: src/bottom/metro.js ─────────────────────────────────────────
function buildMetroFile() {
  const code = extractFunctions(jsApp,
    'gtn', 'getACtx', 'playClick',
    'startM', 'stopM', 'togglePlay',
    'adjBPM', 'tapTempo', 'onBeat',
    'setBPA', 'selPP', 'onPlayBtn', 'ripple'
  )
  const vars = extractVars(jsApp, '_audioCtx', '_clickVol', 'taps', 'metro', 'beat')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Bottom › Metronomo
// File: src/bottom/metro.js   |   GT-BOT-MET
//
//   GT-BOT-MET-CTX-001   getACtx()      — AudioContext iOS safe
//   GT-BOT-MET-CLK-001   playClick()    — click audio oscillatore
//     GT-BOT-MET-CLK-001a  forte: 1200 Hz
//     GT-BOT-MET-CLK-001b  debole: 800 Hz
//     GT-BOT-MET-CLK-001c  envelope: 8ms ramp + 80ms decay
//   GT-BOT-MET-SRT-001   startM()
//   GT-BOT-MET-STP-001   stopM()
//   GT-BOT-MET-BPM-001   adjBPM()       — modifica BPM
//     GT-BOT-MET-BPM-001a   aggiorna display + arc SVG
//     GT-BOT-MET-BPM-001b   aggiorna slider + bigBpmDisp
//   GT-BOT-MET-TAP-001   tapTempo()
//   GT-BOT-MET-BET-001   onBeat()       — callback ogni beat
//   GT-BOT-MET-BPA-001   setBPA()       — beat per accordo
//   GT-BOT-MET-PLY-002   onPlayBtn()
// ═══════════════════════════════════════════════════════════════════════

var TN=[[40,"GRAVE"],[60,"LARGO"],[66,"LARGHETTO"],[76,"ADAGIO"],
  [108,"ANDANTE"],[120,"MODERATO"],[156,"ALLEGRO"],[176,"VIVACE"],
  [200,"PRESTO"],[220,"PRESTISSIMO"]];

${vars}

${code}
`
}

// ── FILE: src/core.js ─────────────────────────────────────────────────
function buildCoreFile() {
  const stateBlock = extractBetween(jsApp, '// STATE', 'function gtn')
  const panelFns   = extractFunctions(jsApp, 'togglePanel', 'closeAllPanels')
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Core
// File: src/core.js   |   GT-GLB-COR
//
//   GT-GLB-COR-STA-001  Stato globale (bpm, playing, activeIdx…)
//   GT-GLB-COR-PNL-001  togglePanel()
//   GT-GLB-COR-PNL-002  closeAllPanels()
// ═══════════════════════════════════════════════════════════════════════

${stateBlock || '// stato estratto dal backup HTML'}

${panelFns}

// GT-GLB-COR-UTL-001b — ripple (usato da tapTempo)
function ripple(){var c=document.getElementById("rpl");if(!c)return;var r=0;c.setAttribute("opacity","0.35");var ri=setInterval(function(){r+=8;c.setAttribute("r",r);c.setAttribute("opacity",Math.max(0,0.35-r/160));if(r>160){clearInterval(ri);c.setAttribute("r","0");}},16);}
`
}

// ── FILE: src/init.js ─────────────────────────────────────────────────
function buildInitFile() {
  const initBlock = extractInit(jsApp)
  return `// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Init
// File: src/init.js   |   GT-GLB-INI
//
//   GT-GLB-INI-AUD-001   adjBPM(0)
//   GT-GLB-INI-TON-001   setTonMode()
//   GT-GLB-INI-KEY-001   setKey(0)
//   GT-GLB-INI-FRB-001   updateFretboard()
//   GT-GLB-INI-RND-001   randMode = true
//   GT-GLB-INI-GIR-001   renderGiroCarousel() + renderPresetList()
//   GT-GLB-INI-HKS-001   Hook togglePanel per ogni pannello
// ═══════════════════════════════════════════════════════════════════════

// GT-GLB-INI-HKS-001 — Hook togglePanel per pannello accordo
var _tpOrigAC = togglePanel;
togglePanel = function(id, dir, barEl) {
  _tpOrigAC(id, dir, barEl);
  if (id === 'p-accordo') {
    setTimeout(function() {
      acTonic = activeKey;
      acBuildNotes(); acBuildChords(); acRenderQ();
    }, 200);
  }
  if (id === 'p-giri') {
    setTimeout(function() { gSwitchTab(gCurrentTab); }, 100);
  }
  if (id === 'p-analisi') updateAnalisi();
};

// Override acRenderQ per aggiornare anche unified
var _origAcRenderQ = acRenderQ;
acRenderQ = function() {
  _origAcRenderQ.apply(this, arguments);
  renderUnified();
};

// Override acDelFromQ
function acDelFromQ(i) { acQueue.splice(i,1); acRenderQ(); }

${initBlock}
`
}

// ── FILE: src/top/opzioni/display.js (mantieni esistente) ────────────
function shouldSkipDisplay() {
  return fs.existsSync('src/top/opzioni/display.js') &&
    fs.readFileSync('src/top/opzioni/display.js','utf8').includes('GT-TOP-OPZ-DSP-BKG')
}

// ── FILE: template.html ───────────────────────────────────────────────
function buildTemplate() {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"/>
<title>Guitrainer</title>
<!-- CSS_PLACEHOLDER -->
</head>
<body>
${bodyRaw}
<!-- JS_PLACEHOLDER -->
</body>
</html>`
}

// ── Scrittura file ────────────────────────────────────────────────────
const FILES = {
  'template.html':                         buildTemplate(),
  'src/data/chords.js':                    buildDataFile(),
  'src/core.js':                           buildCoreFile(),
  'src/center/circle.js':                  buildCircleFile(),
  'src/center/fretboard.js':               buildFretboardFile(),
  'src/center/history.js':                 buildHistoryFile(),
  'src/center/sequence.js':                buildSequenceFile(),
  'src/top/tonalita.js':                   buildTonalitaFile(),
  'src/top/modalita.js':                   buildModalitaFile(),
  'src/top/genera.js':                     buildGeneraFile(),
  'src/top/cerchio.js':                    buildCerchioFile(),
  'src/top/opzioni/training.js':           buildTrainingFile(),
  'src/top/opzioni/types.js':              buildTypesFile(),
  'src/top/opzioni/positions.js':          buildPositionsFile(),
  'src/bottom/accordo/notes.js':           buildNotesFile(),
  'src/bottom/accordo/chords.js':          buildAccordoChordsFile(),
  'src/bottom/accordo/queue.js':           buildQueueFile(),
  'src/bottom/analisi.js':                 buildAnalisiFile(),
  'src/bottom/giri/classici.js':           buildGiriClassiciFile(),
  'src/bottom/giri/builder.js':            buildGiriBuilderFile(),
  'src/bottom/giri/presets.js':            buildGiriPresetsFile(),
  'src/bottom/metro.js':                   buildMetroFile(),
  'src/init.js':                           buildInitFile(),
}

let written = 0
for (const [fname, content] of Object.entries(FILES)) {
  if (fname === 'src/top/opzioni/display.js' && shouldSkipDisplay()) {
    console.log(`  ⏭️   Saltato (già completo): ${fname}`)
    continue
  }
  const full = path.join(__dirname, fname)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
  const kb = Math.round(content.length / 1024)
  console.log(`  ✅  ${fname.padEnd(42)} (${kb} KB)`)
  written++
}

console.log(`\n🎸  Migrazione completata — ${written} file scritti`)
console.log('─────────────────────────────────────────')
console.log('  Avvia con:  npm start')
console.log('  Oppure:     node server.js')
console.log('─────────────────────────────────────────')
