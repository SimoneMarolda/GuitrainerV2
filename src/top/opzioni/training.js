// GT-TOP-OPZ-ALN -- Allenamento: Libero + Random

// GT-TOP-OPZ-ALN-TGL-001 -- toggleFree
// Libero = noKeyMode ON + solo note naturali nel pool random
function toggleFree() {
  noKeyMode = !noKeyMode;
  var t  = document.getElementById('freeThumb');
  var bg = document.getElementById('freeToggle');
  if (t)  { t.style.left       = noKeyMode ? '19px' : '2px'; t.style.background = noKeyMode ? '#38B0FF' : 'rgba(255,255,255,.4)'; }
  if (bg) { bg.style.background = noKeyMode ? 'rgba(30,107,255,.25)' : 'rgba(255,255,255,.1)'; bg.style.borderColor = noKeyMode ? '#1E6BFF' : 'rgba(255,255,255,.2)'; }
  var kd = document.getElementById('keyDisp');
  if (kd) kd.style.opacity = noKeyMode ? '.3' : '1';
  if (typeof acBuildChords === 'function') acBuildChords();
}

// GT-TOP-OPZ-ALN-TGL-002 -- toggleRandMode
function toggleRandMode() {
  randMode = !randMode;
  var hw = document.querySelector('.hist-wrap');
  if (hw) hw.style.display = randMode ? '' : 'none';
  var kd = document.getElementById('keyDisp');
  if (kd) {
    if (randMode) {
      kd.textContent = '';
    } else {
      kd.textContent = (activeKey + (tonMode === 'maj' ? ' MAJ' : ' MIN')).toUpperCase();
      kd.style.color  = COLORS[activeIdx] || '#38B0FF';
    }
  }
  syncRandToggle();
}

// GT-TOP-OPZ-ALN-TGL-002b -- syncRandToggle
function syncRandToggle() {
  var t  = document.getElementById('randThumb');
  var bg = document.getElementById('randToggle');
  if (t)  { t.style.left       = randMode ? '19px' : '2px'; t.style.background = randMode ? '#38B0FF' : 'rgba(255,255,255,.4)'; }
  if (bg) { bg.style.background = randMode ? 'rgba(30,107,255,.25)' : 'rgba(255,255,255,.1)'; bg.style.borderColor = randMode ? '#1E6BFF' : 'rgba(255,255,255,.2)'; }
}

// GT-TOP-OPZ-ALN-POL-001 -- getRandPool con filtro note naturali
// Usato da onBeat quando randMode e attivo
var NATURAL_NOTES = ['Do','Re','Mi','Fa','Sol','La','Si'];

function getRandPoolFull() {
  var all  = Object.keys(CHORDS);
  var QUAL_MAP = {
    'Maggiore':['Maggiore'],'Magg. 7\u00aa':['Magg. 7\u00aa'],
    'Dom. 7\u00aa':['Dom. 7\u00aa'],'Power 5\u00aa':['Power 5\u00aa'],
    'Minore':['Minore'],'Min. 7\u00aa':['Min. 7\u00aa'],
    'mix':['Maggiore','Minore'],'minmaj':['Maggiore','Minore'],
    '7mm':['Magg. 7\u00aa','Min. 7\u00aa'],'normmm':['Maggiore','Minore'],
    'totale':['Maggiore','Minore','Magg. 7\u00aa','Min. 7\u00aa'],
    '5th':['Power 5\u00aa'],'7th5th':['Magg. 7\u00aa','Min. 7\u00aa','Power 5\u00aa'],
    'majfull':['Maggiore','Magg. 7\u00aa','Power 5\u00aa'],
    'minfull':['Minore','Min. 7\u00aa','Power 5\u00aa']
  };
  var quals = [];
  ['maj','min','mix'].forEach(function(grp) {
    var q = QUAL_MAP[randQual[grp]] || [];
    q.forEach(function(v) { if (quals.indexOf(v) < 0) quals.push(v); });
  });
  if (!quals.length) quals = ['Maggiore','Minore'];

  var pool = all.filter(function(k) {
    var ch = CHORDS[k]; if (!ch) return false;
    if (quals.indexOf(ch.qual) < 0) return false;
    // FIX: usa chordRoot invece di ch.notes[0]
    var root = (typeof chordRoot === 'function') ? chordRoot(ch) : (ch.notes && ch.notes[0]) || '';
    // Libero (noKeyMode) = solo note naturali
    if (noKeyMode && NATURAL_NOTES.indexOf(root) < 0) return false;
    // Filtro zona
    if (typeof matchZone === 'function' && !matchZone(k)) return false;
    return true;
  });
  return pool.length ? pool : all.filter(function(k) { return !!CHORDS[k]; });
}

function getNextRandChord() {
  var pool  = getRandPoolFull();
  var avail = pool.filter(function(k) { return randHistory.indexOf(k) < 0; });
  if (!avail.length) avail = pool;
  var chosen = avail[Math.floor(Math.random() * avail.length)];
  randHistory.push(chosen);
  if (randHistory.length > 3) randHistory.shift();
  return chosen;
}
