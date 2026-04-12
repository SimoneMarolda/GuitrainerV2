// GUITRAINER GT-BOT-GIR-BLD -- FIX: chordRoot() invece di ch.notes[0]

// Estrae root dal nome accordo: "Re Min" -> "Re", "La\u266d 7" -> "La\u266d"
function chordRoot(ch) {
  var n = ch.name || '';
  var R = ['Do#','Re\u266d','Mi\u266d','Fa#','Sol#','La\u266d','Si\u266d','Do','Re','Mi','Fa','Sol','La','Si'];
  for (var i = 0; i < R.length; i++) { if (n.indexOf(R[i]) === 0) return R[i]; }
  return n.split(' ')[0];
}

var DEGREE_ROMAN     = ['i','ii\u00b0','III','iv','V','VI','VII'];
var DEGREE_QUAL      = ['Minore','Diminuito','Maggiore','Minore','Maggiore','Maggiore','Maggiore'];
var DEGREE_QUAL_MAJ  = ['Maggiore','Minore','Minore','Maggiore','Maggiore','Minore','Diminuito'];

function gToggleDeg(d) { degSequence.push(d); renderDegSeq(); }
function gClearDegs()   { degSequence = []; renderDegSeq(); }

function renderDegSeq() {
  var el = document.getElementById('degSeq'); if (!el) return;
  if (!degSequence.length) {
    el.innerHTML = '<div style="font-size:10px;color:rgba(255,255,255,.2)">Tap sui gradi sopra</div>';
    return;
  }
  el.innerHTML = degSequence.map(function(d, i) {
    return '<div style="flex-shrink:0;padding:3px 8px;border-radius:7px;border:.5px solid var(--b2);'
      + 'background:rgba(30,107,255,.09);font-size:11px;font-weight:500;color:#38B0FF;cursor:pointer"'
      + ' onclick="degSequence.splice('+i+',1);renderDegSeq()">'+DEGREE_ROMAN[d]+'</div>';
  }).join('');
}

function gBuildFromDegs() { if (!degSequence.length) return; buildProgFromDegs(degSequence); }

function toggleMainProgLoop() {
  mainProgLoopActive = !mainProgLoopActive;
  ['mpLoopBtn','gLoopBtn','gLoopBtn2'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=mainProgLoopActive?'\u25a0 Stop':'\u25b6 Loop';
  });
  if (mainProgLoopActive && !playing) startM();
  else if (!mainProgLoopActive && playing) stopM();
}

function clearMainProg() {
  acQueue=[]; mainProgLoopActive=false; mainProgStep=0;
  ['mpLoopBtn','gLoopBtn','gLoopBtn2'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent='\u25b6 Loop';
  });
  if (typeof acRenderQ==='function') acRenderQ();
}

// FIX GT-BOT-GIR-BLD-HLP-001: usa chordRoot(ch) e AC_MAJOR in modo MAJ
function bestChordForDeg(deg) {
  var kc = AC_NC[activeKey]; if (kc === undefined) return null;
  var isMaj = (tonMode === 'maj');
  var sc = (isMaj ? AC_MAJOR : AC_MINOR).map(function(o){ return (kc+o)%12; });
  var noteChrom = sc[deg]; if (noteChrom === undefined) return null;
  var CN = ['Do','Do#','Re','Mi\u266d','Mi','Fa','Fa#','Sol','La\u266d','La','Si\u266d','Si'];
  var noteName = CN[noteChrom]; if (!noteName) return null;
  var targetQual = (isMaj ? DEGREE_QUAL_MAJ : DEGREE_QUAL)[deg] || 'Maggiore';
  var all = Object.keys(CHORDS);
  var matched = all.filter(function(k){
    var ch=CHORDS[k];
    return ch && chordRoot(ch)===noteName && ch.qual===targetQual && matchFretPos(k);
  });
  if (matched.length) return (typeof curFretPos!=='undefined'&&curFretPos==='mix')
    ? matched[Math.floor(Math.random()*matched.length)] : matched[0];
  var any = all.filter(function(k){ var ch=CHORDS[k]; return ch && chordRoot(ch)===noteName; });
  return any.length ? any[0] : null;
}

// GT-BOT-GIR-BLD-PRG-001
function buildProgFromDegs(degs) {
  acQueue = [];
  degs.forEach(function(d){ var k=bestChordForDeg(d); if(k) acQueue.push(k); });
  mainProg = acQueue.slice();
  mainProgStep = 0;
  if (typeof renderUnified   === 'function') renderUnified();
  if (typeof acRenderQ       === 'function') acRenderQ();
  if (typeof renderGiroSlots === 'function') renderGiroSlots();
}
