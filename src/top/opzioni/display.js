// ═══════════════════════════════════════════════════════════════════════
// GUITRAINER — Opzioni › Display
// File: src/top/opzioni/display.js
// Codice radice: GT-TOP-OPZ-DSP
//
// INDICE:
//   GT-TOP-OPZ-DSP-THM-001  → Temi (dark, light, gray, gradient)
//   GT-TOP-OPZ-DSP-BKG-001  → Background personalizzabile (solid/gradient)
//   GT-TOP-OPZ-DSP-BKG-002  → Palette colori predefiniti
//   GT-TOP-OPZ-DSP-BKG-003  → Gradient presets
//   GT-TOP-OPZ-DSP-BKG-004  → Slider angolo gradient
//   GT-TOP-OPZ-DSP-BKG-005  → Color picker custom (input color)
//   GT-TOP-OPZ-DSP-FNT-001  → Dimensione testo (normale / grande / extra)
//   GT-TOP-OPZ-DSP-INI-001  → Inizializzazione pannello background
// ═══════════════════════════════════════════════════════════════════════


// ── GT-TOP-OPZ-DSP-THM-001 — Temi ───────────────────────────────────
/*
   Ogni tema sovrascrive le variabili CSS :root dichiarate in style.css
   → GT-GLB-STY-VAR-001 e GT-GLB-STY-THM-001
   Il background viene gestito separatamente da setBackground().
*/
var THEMES = {
  dark: {
    textClass:  '',
    vars: {
      '--c-text':   '#ffffff',
      '--c-sub':    'rgba(255,255,255,.35)',
      '--c-border': 'rgba(255,255,255,.10)',
      '--c-surf':   '#111111',
    }
  },
  light: {
    textClass: 'theme-light',
    vars: {
      '--c-text':   '#111111',
      '--c-sub':    'rgba(0,0,0,.45)',
      '--c-border': 'rgba(0,0,0,.12)',
      '--c-surf':   '#e8e8e8',
    }
  },
  gray: {
    textClass: 'theme-gray',
    vars: {
      '--c-text':   '#ffffff',
      '--c-sub':    'rgba(255,255,255,.45)',
      '--c-border': 'rgba(255,255,255,.12)',
      '--c-surf':   '#2a2a2a',
    }
  },
}

// GT-TOP-OPZ-DSP-THM-002 — applica tema
function setTheme(el) {
  document.querySelectorAll('[data-theme]').forEach(function(p) { p.classList.remove('on') })
  el.classList.add('on')
  curTheme = el.dataset.theme
  var t = THEMES[curTheme] || THEMES.dark
  var root = document.documentElement

  // Rimuovi classi tema precedenti
  root.classList.remove('theme-light', 'theme-gray')
  if (t.textClass) root.classList.add(t.textClass)

  // Applica variabili CSS
  Object.keys(t.vars).forEach(function(k) {
    root.style.setProperty(k, t.vars[k])
  })
}


// ── GT-TOP-OPZ-DSP-BKG-001 — Background personalizzabile ────────────
/*
   Il background è separato dal tema (colori testo/bordi).
   Può essere:
     - solid   → un colore singolo (--gt-bg-color)
     - gradient → sfumatura tra due colori (--gt-bg-grad-start / end)

   Riferimento CSS → GT-GLB-STY-BKG-001 in style.css
*/

// GT-TOP-OPZ-DSP-BKG-002 — Palette solidi predefiniti
var BG_SOLID_PRESETS = [
  { label: 'Nero',       color: '#000000' },
  { label: 'Notte',      color: '#050510' },
  { label: 'Antracite',  color: '#0f0f0f' },
  { label: 'Navy',       color: '#020818' },
  { label: 'Grafite',    color: '#1a1a1a' },
  { label: 'Fumo',       color: '#111318' },
  { label: 'Bordeaux',   color: '#110008' },
  { label: 'Foresta',    color: '#040f06' },
]

// GT-TOP-OPZ-DSP-BKG-003 — Gradient presets
var BG_GRADIENT_PRESETS = [
  { label: 'Deep Space',  start: '#000000', end: '#050518', angle: '135deg' },
  { label: 'Midnight',    start: '#000000', end: '#0a0030', angle: '160deg' },
  { label: 'Aurora',      start: '#000000', end: '#001a18', angle: '120deg' },
  { label: 'Sunset Dark', start: '#0a0000', end: '#1a0008', angle: '145deg' },
  { label: 'Ocean Deep',  start: '#000510', end: '#001020', angle: '180deg' },
  { label: 'Forest Dark', start: '#000a04', end: '#001408', angle: '135deg' },
]

// GT-TOP-OPZ-DSP-BKG-004 — Applica background (solid o gradient)
function setBackground(opts) {
  /*
    opts: {
      type:  'solid' | 'gradient',
      color: '#000000',              // solo se type=solid
      start: '#000000',              // solo se type=gradient
      end:   '#050518',
      angle: '135deg'
    }
  */
  var root = document.documentElement
  root.classList.remove('gt-bg-gradient')

  if (opts.type === 'gradient') {
    root.classList.add('gt-bg-gradient')
    root.style.setProperty('--gt-bg-grad-start', opts.start || curBgGradStart)
    root.style.setProperty('--gt-bg-grad-end',   opts.end   || curBgGradEnd)
    root.style.setProperty('--gt-bg-grad-angle', opts.angle || curBgGradAngle)
    curBgType      = 'gradient'
    curBgGradStart = opts.start || curBgGradStart
    curBgGradEnd   = opts.end   || curBgGradEnd
    curBgGradAngle = opts.angle || curBgGradAngle
  } else {
    root.style.setProperty('--gt-bg-color', opts.color || curBgColor)
    curBgType  = 'solid'
    curBgColor = opts.color || curBgColor
  }
}

// GT-TOP-OPZ-DSP-BKG-005 — Render pannello background
function renderBgPanel() {
  var panel = document.getElementById('gtBgPanel')
  if (!panel) return

  panel.innerHTML =
    // Intestazione
    '<div style="font-size:8px;letter-spacing:2px;text-transform:uppercase;'
    + 'color:rgba(255,255,255,.3);margin-bottom:10px">Sfondo</div>'

    // Toggle Solid / Gradient
    + '<div style="display:flex;gap:4px;margin-bottom:10px">'
    + '  <div class="fpill' + (curBgType==='solid'?' on':'') + '" onclick="setBgType(\'solid\',this)">Tinta Unita</div>'
    + '  <div class="fpill' + (curBgType==='gradient'?' on':'') + '" onclick="setBgType(\'gradient\',this)">Gradient</div>'
    + '</div>'

    // Sezione Solid
    + '<div id="gtBgSolidSec" style="display:' + (curBgType==='solid'?'block':'none') + '">'
    + '  <div style="font-size:7px;color:rgba(255,255,255,.28);text-transform:uppercase;'
    + '    letter-spacing:1.5px;margin-bottom:6px">Colore</div>'
    + '  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">'
    + BG_SOLID_PRESETS.map(function(p) {
        return '<div class="gt-bg-swatch' + (curBgColor===p.color?' sel':'') + '"'
          + ' style="background:' + p.color + '"'
          + ' title="' + p.label + '"'
          + ' onclick="setBackground({type:\'solid\',color:\'' + p.color + '\'});refreshSwatches(this)"></div>'
      }).join('')
    + '  </div>'
    + '  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
    + '    <div style="font-size:8px;color:rgba(255,255,255,.4)">Custom:</div>'
    + '    <input type="color" value="' + curBgColor + '"'
    + '      onchange="setBackground({type:\'solid\',color:this.value})"'
    + '      style="width:32px;height:24px;border:none;border-radius:6px;cursor:pointer;background:none">'
    + '  </div>'
    + '</div>'

    // Sezione Gradient
    + '<div id="gtBgGradSec" style="display:' + (curBgType==='gradient'?'block':'none') + '">'
    + '  <div style="font-size:7px;color:rgba(255,255,255,.28);text-transform:uppercase;'
    + '    letter-spacing:1.5px;margin-bottom:6px">Preset Gradient</div>'
    + '  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">'
    + BG_GRADIENT_PRESETS.map(function(p) {
        var grad = 'linear-gradient(' + p.angle + ',' + p.start + ',' + p.end + ')'
        return '<div class="gt-bg-swatch"'
          + ' style="background:' + grad + ';width:40px;height:28px;border-radius:8px"'
          + ' title="' + p.label + '"'
          + ' onclick="setBackground({type:\'gradient\',start:\'' + p.start
          + '\',end:\'' + p.end + '\',angle:\'' + p.angle + '\'})"></div>'
      }).join('')
    + '  </div>'

    // Slider angolo — GT-TOP-OPZ-DSP-BKG-004
    + '  <div style="font-size:7px;color:rgba(255,255,255,.28);text-transform:uppercase;'
    + '    letter-spacing:1.5px;margin-bottom:4px">'
    + '    Angolo <span id="gtBgAngleVal">' + curBgGradAngle + '</span></div>'
    + '  <input type="range" min="0" max="360" value="' + parseInt(curBgGradAngle) + '"'
    + '    oninput="var a=this.value+\'deg\';'
    + '      document.getElementById(\'gtBgAngleVal\').textContent=a;'
    + '      setBackground({type:\'gradient\',angle:a})">'

    // Color picker custom gradient — GT-TOP-OPZ-DSP-BKG-005
    + '  <div style="display:flex;align-items:center;gap:8px;margin-top:4px">'
    + '    <input type="color" value="' + curBgGradStart + '"'
    + '      onchange="setBackground({type:\'gradient\',start:this.value})"'
    + '      style="width:32px;height:24px;border:none;border-radius:6px;cursor:pointer;background:none">'
    + '    <div style="flex:1;height:1px;background:linear-gradient(90deg,' + curBgGradStart + ',' + curBgGradEnd + ')"></div>'
    + '    <input type="color" value="' + curBgGradEnd + '"'
    + '      onchange="setBackground({type:\'gradient\',end:this.value})"'
    + '      style="width:32px;height:24px;border:none;border-radius:6px;cursor:pointer;background:none">'
    + '  </div>'
    + '</div>'

  panel.classList.add('on')
}

// Toggle tipo background (solid/gradient) nel picker
function setBgType(type, el) {
  curBgType = type
  document.querySelectorAll('[onclick*="setBgType"]').forEach(function(p) { p.classList.remove('on') })
  el.classList.add('on')
  var s = document.getElementById('gtBgSolidSec')
  var g = document.getElementById('gtBgGradSec')
  if (s) s.style.display = type === 'solid' ? 'block' : 'none'
  if (g) g.style.display = type === 'gradient' ? 'block' : 'none'
}

// Aggiorna selezione swatch
function refreshSwatches(el) {
  document.querySelectorAll('.gt-bg-swatch').forEach(function(s) { s.classList.remove('sel') })
  el.classList.add('sel')
}


// ── GT-TOP-OPZ-DSP-FNT-001 — Dimensione testo ───────────────────────
function setFontSize(el) {
  document.querySelectorAll('[data-fsize]').forEach(function(p) { p.classList.remove('on') })
  el.classList.add('on')
  curFontSize = el.dataset.fsize
  var root = document.documentElement
  root.classList.remove('gt-font-large', 'gt-font-xlarge')
  if (curFontSize === 'large')  root.classList.add('gt-font-large')
  if (curFontSize === 'xlarge') root.classList.add('gt-font-xlarge')
}


// ── GT-TOP-OPZ-DSP-INI-001 — Inizializzazione ───────────────────────
function displayInit() {
  // Applica background default (solid nero)
  setBackground({ type: 'solid', color: '#000000' })
}
