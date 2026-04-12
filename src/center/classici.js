// GT-BOT-GIR-CLS -- Giri Classici

var GIRI_SVG = {
  ivv:    '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2.5" fill="currentColor" opacity=".7"/></svg>',
  "1564": '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="5.5" y="5.5" width="5" height="5" fill="currentColor" opacity=".6"/></svg>',
  "251":  '<svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1.5 15,14 1,14" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  "1625": '<svg width="16" height="16" viewBox="0 0 16 16"><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" stroke-width="1.2"/><line x1="8" y1="1.5" x2="8" y2="14.5" stroke="currentColor" stroke-width="1.2"/></svg>',
  "6415": '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5L14.5 6v4L8 14.5 1.5 10V6Z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  blues:  '<svg width="16" height="16" viewBox="0 0 16 16"><line x1="1.5" y1="4" x2="14.5" y2="4" stroke="currentColor" stroke-width="1.3"/><line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" stroke-width=".9" opacity=".6"/><line x1="1.5" y1="12" x2="14.5" y2="12" stroke="currentColor" stroke-width=".6" opacity=".4"/></svg>',
  and:    '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1.5 14.5Q8 1.5 14.5 14.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  canon:  '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1.5 8C4 1.5 12 1.5 14.5 8C12 14.5 4 14.5 1.5 8" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  dark:   '<svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1.5 14.5,6 12,14.5 4,14.5 1.5,6" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  epic:   '<svg width="16" height="16" viewBox="0 0 16 16"><line x1="8" y1="1.5" x2="8" y2="14.5" stroke="currentColor" stroke-width="1.3"/><line x1="2" y1="5.5" x2="14" y2="5.5" stroke="currentColor" stroke-width=".9" opacity=".55"/></svg>',
  ballad: '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="8" y1="8" x2="8" y2="2.5" stroke="currentColor" stroke-width="1.3"/></svg>',
  modal:  '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="5.5" width="13" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
};

var GIRI = [
  {id:'ivv',   name:'I\u2013IV\u2013V',    genre:'Pop \u00b7 Rock',   degs:[0,3,4,0]},
  {id:'1564',  name:'I\u2013V\u2013vi\u2013IV', genre:'Pop',          degs:[0,4,5,3]},
  {id:'251',   name:'II\u2013V\u2013I',    genre:'Jazz',         degs:[1,4,0,0]},
  {id:'1625',  name:'I\u20136\u20132\u20135',   genre:'Jazz \u00b7 Swing', degs:[0,5,1,4]},
  {id:'6415',  name:'6\u20134\u20131\u20135',   genre:'Pop Emotivo',  degs:[5,3,0,4]},
  {id:'blues', name:'Blues',     genre:'Blues \u00b7 Soul', degs:[0,0,3,3,4,3,0,4]},
  {id:'and',   name:'Andalusa',  genre:'Flamenco',     degs:[5,6,4,0]},
  {id:'canon', name:'Canon',     genre:'Classica',     degs:[0,4,5,2,3,0,3,4]},
  {id:'dark',  name:'Dark',      genre:'Metal \u00b7 Dark', degs:[0,6,5,6]},
  {id:'epic',  name:'Epica',     genre:'Orchestrale',  degs:[0,5,2,6]},
  {id:'ballad',name:'Ballad',    genre:'Ballata',      degs:[0,2,5,3]},
  {id:'modal', name:'Modale',    genre:'Jazz Modale',  degs:[0,0,6,6]}
];

var DEGREE_ROMAN = ['i','ii\u00b0','III','iv','V','VI','VII'];

// GT-BOT-GIR-CLS-CAR-001 -- renderGiroCarousel
function renderGiroCarousel() {
  var car = document.getElementById('giroCarousel');
  if (!car) return;
  car.innerHTML = '';
  GIRI.forEach(function(g) {
    var el = document.createElement('div');
    el.className = 'giro-card' + (g.id === selGiroId ? ' sel' : '');
    el.innerHTML =
      '<div style="opacity:.65;margin-bottom:3px;color:rgba(255,255,255,.8)">' + (GIRI_SVG[g.id] || '') + '</div>'
    + '<div class="giro-name">' + g.name + '</div>'
    + '<div class="giro-genre">' + g.genre + '</div>'
    + '<div class="giro-degs">'
    + g.degs.slice(0, 6).map(function(d, i) {
        return '<span class="giro-deg' + (i === 0 ? ' root' : '') + '">'
          + (DEGREE_ROMAN[d] || d) + '</span>';
      }).join('')
    + (g.degs.length > 6 ? '<span class="giro-deg">\u2026</span>' : '')
    + '</div>';
    el.addEventListener('click', function() {
      selGiroId = g.id;
      var lbl = document.getElementById('giroActiveLbl');
      if (lbl) lbl.textContent = g.name;
      var gl = document.getElementById('giroGradLbl');
      if (gl) gl.textContent = '\u00b7 ' + g.name;
      // FIX: disattiva randMode quando un giro e selezionato
      randMode = false;
      if (typeof syncRandToggle === 'function') syncRandToggle();
      // Costruisce progressione diatonica corretta
      acQueue = [];
      if (typeof buildProgFromDegs === 'function') buildProgFromDegs(g.degs);
      renderGiroCarousel();
    });
    car.appendChild(el);
  });
}

// GT-BOT-GIR-CLS-SLT-001 -- renderGiroSlots
function renderGiroSlots() {
  var sl = document.getElementById('giroSlots');
  if (!sl) return;
  if (!mainProg.length) {
    sl.innerHTML = '<div style="font-size:10px;color:rgba(255,255,255,.2);padding:8px 0">Seleziona un giro sopra</div>';
    return;
  }
  sl.innerHTML = '';
  mainProg.forEach(function(k, i) {
    var ch = CHORDS[k]; if (!ch) return;
    var rootName = (typeof chordRoot === 'function') ? chordRoot(ch) : (ch.notes && ch.notes[0]) || '';
    var ni  = NOTES.indexOf(rootName);
    var col = ni >= 0 ? COLORS[ni] : '#38B0FF';
    var el  = document.createElement('div');
    el.style.cssText = 'flex-shrink:0;padding:3px 5px;border-radius:6px;'
      + 'border:.5px solid ' + col + '44;background:' + col + '12;'
      + 'cursor:pointer;text-align:center;min-width:34px;';
    el.innerHTML =
      '<div style="font-size:8px;font-weight:500;color:' + col + '">' + ch.name + '</div>'
    + '<div style="font-size:7px;color:rgba(255,255,255,.3)">' + (i + 1) + '</div>';
    el.addEventListener('click', function() {
      currentChordKey = k;
      if (typeof updateFretboard === 'function') updateFretboard(k);
    });
    sl.appendChild(el);
  });
}

// GT-BOT-GIR-CLS-ADD-001 -- giroAddToQueue
function giroAddToQueue() {
  mainProg.forEach(function(k) { if (k && acQueue.indexOf(k) < 0) acQueue.push(k); });
  if (typeof renderUnified === 'function') renderUnified();
  if (typeof acRenderQ    === 'function') acRenderQ();
}
