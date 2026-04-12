// GUITRAINER -- GT-BOT-ACC-CWH v2
// Nuova UI griglia voicing con filtri gruppo/root/qualita/diatonico

// \u2500\u2500 Estrae root dal nome accordo \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function chordRoot(ch) {
  var n = ch.name || '';
  var R = ['Do#','Re\u266d','Mi\u266d','Fa#','Sol#','La\u266d','Si\u266d','Do','Re','Mi','Fa','Sol','La','Si'];
  for (var i = 0; i < R.length; i++) { if (n.indexOf(R[i]) === 0) return R[i]; }
  return n.split(' ')[0];
}

// \u2500\u2500 acForTonic: filtra accordi per tonica \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function acForTonic(t) {
  return Object.keys(CHORDS).filter(function(k) {
    var ch = CHORDS[k];
    return ch && chordRoot(ch) === t;
  });
}

// \u2500\u2500 Cromatismo root con supporto diesis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _voiRootChrom(r) {
  if (typeof AC_NC !== 'undefined' && AC_NC[r] !== undefined) return AC_NC[r];
  var _sc = {'Do#':1,'Re#':3,'Fa#':6,'Sol#':8,'La#':10};
  return _sc[r] !== undefined ? _sc[r] : -1;
}

// \u2500\u2500 acCmp: match diatonico per chiave CHORDS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function acCmp(k) {
  if (typeof noKeyMode !== 'undefined' && noKeyMode) return 0;
  var ch = CHORDS[k]; if (!ch) return 0;
  var rootChrom = _voiRootChrom(chordRoot(ch)); if (rootChrom < 0) return 0;
  var keyChrom  = typeof AC_NC !== 'undefined' ? AC_NC[activeKey] : -1;
  if (keyChrom === undefined || keyChrom < 0) return 0;
  var isMaj = (tonMode === 'maj');
  var scale = (isMaj ? AC_MAJOR : AC_MINOR).map(function(o) { return (keyChrom + o) % 12; });
  var deg = scale.indexOf(rootChrom); if (deg < 0) return 0;
  var q = ch.qual || '';
  var expected = (isMaj ? AC_DEG_QUAL_MAJ : AC_DEG_QUAL)[deg] || [];
  return expected.some(function(e) { return q.indexOf(e) >= 0; }) ? 2 : 1;
}

// \u2500\u2500 Stub loop scroll (non piu usato ma potrebbe essere chiamato) \u2500\u2500\u2500\u2500\u2500
function acLoopScroll() {}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// STATO GRIGLIA VOICING
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var _acG       = 'MH';
var _acRootF   = 'all';
var _acQualF   = 'all';
var _acNoOpen  = true;
var _acNat     = true;
var _acUIReady = false;

var _VOI_NAT  = ['Do','Re','Mi','Fa','Sol','La','Si'];
var _VOI_SLAB = ['Mi','Si','Sol','Re','La','Mi']; // top->bottom
var _VOI_OPEN = [4, 9, 2, 7, 11, 4];             // cromatismo corde aperte

// \u2500\u2500 Fretboard SVG per card voicing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acFret(frets, rootName) {
  var W=90, H=86, nS=6, nF=4;
  var mL=17, mR=5, mT=20, mB=8;
  var pH=H-mT-mB, pW=W-mL-mR;
  var sG=pH/(nS-1), fW=pW/nF;
  var played=frets.filter(function(f){return f>0;});
  var minF=played.length?Math.min.apply(null,played):0;
  var off=minF>1?minF-1:0;
  var rChrom=_voiRootChrom(rootName||'');
  var s='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">';
  if(off>0){
    s+='<text x="'+(mL+2)+'" y="'+(mT-5)+'" font-size="7.5" fill="#4a8fff" text-anchor="middle">'+minF+'fr</text>';
  } else {
    s+='<rect x="'+mL+'" y="'+mT+'" width="2.5" height="'+pH+'" fill="rgba(255,255,255,.55)" rx="1"/>';
  }
  for(var f=1;f<=nF;f++){
    var x=mL+f*fW;
    s+='<line x1="'+x+'" y1="'+mT+'" x2="'+x+'" y2="'+(mT+pH)+'" stroke="rgba(255,255,255,.12)" stroke-width=".7"/>';
  }
  var alp=[.45,.38,.32,.26,.21,.16];
  var thk=[.5,.6,.75,.9,1.1,1.35];
  for(var row=0;row<nS;row++){
    var y=mT+row*sG;
    s+='<line x1="'+mL+'" y1="'+y+'" x2="'+(mL+pW)+'" y2="'+y+'" stroke="rgba(255,255,255,'+alp[row]+')" stroke-width="'+thk[row]+'"/>';
    s+='<text x="'+(mL-3)+'" y="'+(y+3)+'" font-size="5.5" fill="rgba(255,255,255,.2)" text-anchor="end">'+_VOI_SLAB[row]+'</text>';
  }
  for(var row=0;row<nS;row++){
    var fi=5-row;
    var fv=frets[fi];
    var y=mT+row*sG;
    var xL=mL-10;
    if(fv===-1){
      s+='<text x="'+xL+'" y="'+(y+3.5)+'" font-size="8.5" fill="rgba(255,255,255,.25)" text-anchor="middle">\u00d7</text>';
    } else if(fv===0){
      s+='<circle cx="'+xL+'" cy="'+y+'" r="3.5" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.1"/>';
    } else {
      var fRel=fv-off;
      var chrom=(_VOI_OPEN[fi]+fv)%12;
      var isRoot=(rChrom>=0&&chrom===rChrom);
      var col=isRoot?'#4a8fff':'rgba(255,255,255,.88)';
      s+='<circle cx="'+(mL+(fRel-0.5)*fW)+'" cy="'+y+'" r="6" fill="'+col+'"/>';
    }
  }
  return s+'</svg>';
}

// \u2500\u2500 Filtra VOICINGS con stato corrente \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acFilter() {
  if (typeof VOICINGS === 'undefined') return [];
  return VOICINGS.filter(function(v) {
    if (v.g !== _acG) return false;
    if (_acRootF !== 'all' && v.r !== _acRootF) return false;
    if (_acQualF !== 'all' && v.q !== _acQualF) return false;
    if (_acNat && _VOI_NAT.indexOf(v.r) < 0) return false;
    if (_acNoOpen && v.f.some(function(x) { return x === 0; })) return false;
    return true;
  });
}

// \u2500\u2500 Check diatonico per voicing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acDiat(v) {
  if (typeof noKeyMode !== 'undefined' && noKeyMode) return 0;
  var rc = _voiRootChrom(v.r); if (rc < 0) return 0;
  var kc = typeof AC_NC !== 'undefined' ? AC_NC[activeKey] : -1;
  if (kc === undefined || kc < 0) return 0;
  var isMaj = (tonMode === 'maj');
  var scale = (isMaj ? AC_MAJOR : AC_MINOR).map(function(o) { return (kc + o) % 12; });
  var deg = scale.indexOf(rc); if (deg < 0) return 0;
  var _QMAP = {Maj:'Maggiore',Min:'Minore',Dom7:'Dom 7',Maj7:'Magg 7',Min7:'Min 7'};
  var qual = _QMAP[v.q] || v.q;
  var expected = (isMaj ? AC_DEG_QUAL_MAJ : AC_DEG_QUAL)[deg] || [];
  return expected.some(function(e) { return qual.indexOf(e) >= 0; }) ? 2 : 1;
}

// \u2500\u2500 Renderizza griglia voicing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acRenderGrid() {
  var grid = document.getElementById('_acGrid');
  if (!grid) return;
  var filtered = _acFilter();
  var cnt = document.getElementById('_acCount');
  if (cnt) cnt.textContent = filtered.length + ' voicing';
  var qlL = {Maj:'Magg.',Min:'Min.',Dom7:'Dom 7\u00aa',Maj7:'Magg.7\u00aa',Min7:'Min.7\u00aa'};
  if (!filtered.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 8px;color:rgba(255,255,255,.2);font-size:12px">Nessun voicing trovato</div>';
    return;
  }
  grid.innerHTML = '';
  filtered.forEach(function(v) {
    var idx  = VOICINGS.indexOf(v);
    var vKey = 'VOI_' + idx;
    var inQ  = (typeof acQueue !== 'undefined') && acQueue.indexOf(vKey) >= 0;
    var d    = _acDiat(v);
    var bdr  = d === 2 ? '#27ae60' : 'rgba(255,255,255,.08)';
    var bg   = inQ ? 'rgba(39,174,96,.18)' : '#1c1c1e';
    var card = document.createElement('div');
    card.style.cssText = 'background:'+bg+';border-radius:11px;padding:9px 5px 7px;'
      + 'border:1px solid '+bdr+';display:flex;flex-direction:column;'
      + 'align-items:center;gap:3px;cursor:pointer;transition:opacity .1s;';
    card.innerHTML = _acFret(v.f, v.r)
      + '<div style="font-size:11px;font-weight:600;color:#fff">'+v.r+'</div>'
      + '<div style="font-size:8px;color:rgba(255,255,255,.32)">'+(qlL[v.q]||v.q)+'</div>'
      + '<div style="font-size:8px;color:#4a8fff;font-weight:500">'+(v.p||'aperto')+'</div>';
    card._vKey = vKey;
    card.addEventListener('click', function() {
      var k = this._vKey;
      var qi = acQueue.indexOf(k);
      if (qi >= 0) { acQueue.splice(qi, 1); } else { acQueue.push(k); }
      currentChordKey = k;
      if (typeof updateFretboard === 'function') updateFretboard(k);
      if (typeof acRenderQ     === 'function') acRenderQ();
      if (typeof renderUnified === 'function') renderUnified();
      _acRenderGrid();
    });
    grid.appendChild(card);
  });
}

// \u2500\u2500 Pill style helper \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acPillOn(el, on) {
  el.style.border      = '1px solid '+(on?'#4a8fff':'rgba(255,255,255,.13)');
  el.style.color       = on?'#fff':'rgba(255,255,255,.4)';
  el.style.background  = on?'#4a8fff':'transparent';
}
function _acTglOn(el, on) {
  el.style.border      = '1px solid '+(on?'#4a8fff':'rgba(255,255,255,.13)');
  el.style.color       = on?'#4a8fff':'rgba(255,255,255,.4)';
  el.style.background  = on?'rgba(74,143,255,.15)':'transparent';
}

// \u2500\u2500 Pill HTML \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acPillH(attr, val, label, active) {
  var on=(val===active);
  return '<div data-'+attr+'="'+val+'" style="padding:4px 10px;border-radius:16px;font-size:11px;'
    +'font-weight:500;cursor:pointer;border:1px solid '+(on?'#4a8fff':'rgba(255,255,255,.13)')+';'
    +'color:'+(on?'#fff':'rgba(255,255,255,.4)')+';background:'+(on?'#4a8fff':'transparent')+'">'+label+'</div>';
}

// \u2500\u2500 Tab HTML \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acTabH(g, label, sub, active) {
  var on=(g===active);
  return '<div data-g="'+g+'" style="flex:1;padding:7px 4px;border-radius:8px;font-size:11px;'
    +'font-weight:500;text-align:center;cursor:pointer;border:1px solid '+(on?'#4a8fff':'rgba(255,255,255,.12)')+';'
    +'color:'+(on?'#fff':'rgba(255,255,255,.4)')+';background:'+(on?'#4a8fff':'transparent')+';">'
    +label+'<br><span style="font-size:9px;opacity:.6">'+sub+'</span></div>';
}

// \u2500\u2500 Costruisce UI griglia \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function _acBuildUI() {
  var scroll = document.getElementById('acCscroll');
  var track  = document.getElementById('acCtrack');
  if (scroll) scroll.style.display = 'none';
  if (track)  track.style.display  = 'none';

  var ins = track || scroll;
  if (!ins) { console.warn('[GTR] acCscroll/acCtrack non trovato'); return; }

  var wrap = document.createElement('div');
  wrap.id = '_acWrap';
  wrap.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;';

  // Tab gruppi
  var tabs = '<div style="display:flex;gap:6px;padding:8px 12px 6px;background:#111">'
    + _acTabH('MH','MH','Mi Si Sol Re',_acG)
    + _acTabH('M', 'M', 'Si Sol Re La', _acG)
    + _acTabH('ML','ML','Sol Re La Mi', _acG)
    + '</div>';

  // Filtro root
  var roots=[['all','Tutte'],['Do','Do'],['Re','Re'],['Mi','Mi'],['Fa','Fa'],
    ['Sol','Sol'],['La','La'],['Si','Si'],['Do#','Do#'],['Re#','Re#'],
    ['Fa#','Fa#'],['Sol#','Sol#'],['La#','La#']];
  var rootHtml='<div id="_acRF" style="display:flex;gap:5px;flex-wrap:wrap;padding:4px 12px">';
  roots.forEach(function(r){rootHtml+=_acPillH('root',r[0],r[1],_acRootF);});
  rootHtml+='</div>';

  // Filtro qualita
  var quals=[['all','Tutte'],['Maj','Maj'],['Min','Min'],['Dom7','Dom7'],['Maj7','Maj7'],['Min7','Min7']];
  var qualHtml='<div id="_acQF" style="display:flex;gap:5px;flex-wrap:wrap;padding:4px 12px">';
  quals.forEach(function(q){qualHtml+=_acPillH('qual',q[0],q[1],_acQualF);});
  qualHtml+='</div>';

  // Toggle
  var tNat = '<div id="_acTN" style="padding:4px 10px;border-radius:16px;font-size:11px;cursor:pointer;'
    +'border:1px solid '+(_acNat?'#4a8fff':'rgba(255,255,255,.13)')+';'
    +'color:'+(_acNat?'#4a8fff':'rgba(255,255,255,.4)')+';'
    +'background:'+(_acNat?'rgba(74,143,255,.15)':'transparent')+'">Solo naturali</div>';
  var tOpen= '<div id="_acTO" style="padding:4px 10px;border-radius:16px;font-size:11px;cursor:pointer;'
    +'border:1px solid '+(_acNoOpen?'#4a8fff':'rgba(255,255,255,.13)')+';'
    +'color:'+(_acNoOpen?'#4a8fff':'rgba(255,255,255,.4)')+';'
    +'background:'+(_acNoOpen?'rgba(74,143,255,.15)':'transparent')+'">No aperte</div>';
  var tgHtml='<div style="display:flex;gap:6px;padding:4px 12px 8px;align-items:center">'
    +tNat+tOpen+'<span id="_acCount" style="font-size:10px;color:rgba(255,255,255,.25);margin-left:auto">\u2014</span></div>';

  // Griglia
  var gridHtml='<div id="_acGrid" style="display:grid;grid-template-columns:repeat(3,1fr);'
    +'gap:8px;padding:10px 8px 80px;overflow-y:auto;max-height:52vh;-webkit-overflow-scrolling:touch"></div>';

  wrap.innerHTML = tabs + rootHtml + qualHtml + tgHtml + gridHtml;
  ins.parentNode.insertBefore(wrap, ins.nextSibling);

  // \u2500\u2500 Eventi tab gruppi \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  wrap.querySelectorAll('[data-g]').forEach(function(el) {
    el.addEventListener('click', function() {
      _acG = this.dataset.g;
      wrap.querySelectorAll('[data-g]').forEach(function(t) { _acPillOn(t, t.dataset.g === _acG); });
      _acRenderGrid();
    });
  });

  // \u2500\u2500 Eventi filtro root \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  document.getElementById('_acRF').addEventListener('click', function(e) {
    var t = e.target.closest('[data-root]'); if (!t) return;
    _acRootF = t.dataset.root;
    this.querySelectorAll('[data-root]').forEach(function(p) { _acPillOn(p, p.dataset.root === _acRootF); });
    _acRenderGrid();
  });

  // \u2500\u2500 Eventi filtro qualita \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  document.getElementById('_acQF').addEventListener('click', function(e) {
    var t = e.target.closest('[data-qual]'); if (!t) return;
    _acQualF = t.dataset.qual;
    this.querySelectorAll('[data-qual]').forEach(function(p) { _acPillOn(p, p.dataset.qual === _acQualF); });
    _acRenderGrid();
  });

  // \u2500\u2500 Toggle Solo naturali \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  document.getElementById('_acTN').addEventListener('click', function() {
    _acNat = !_acNat; _acTglOn(this, _acNat); _acRenderGrid();
  });

  // \u2500\u2500 Toggle No aperte \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  document.getElementById('_acTO').addEventListener('click', function() {
    _acNoOpen = !_acNoOpen; _acTglOn(this, _acNoOpen); _acRenderGrid();
  });

  _acUIReady = true;
}

// \u2500\u2500 acBuildChords: entry point principale \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function acBuildChords() {
  var lbl = document.getElementById('acClbl');
  if (lbl) lbl.textContent = 'Accordi \u00b7 ' + (typeof acTonic !== 'undefined' ? acTonic : (typeof activeKey !== 'undefined' ? activeKey : ''));

  // Se la root filter e su 'all' e acTonic e definita, sincronizza
  if (typeof acTonic !== 'undefined' && acTonic && _acRootF !== 'all') {
    // Non forzare -- l'utente controlla il filtro manualmente
  }

  var existing = document.getElementById('_acWrap');
  if (!existing) { _acUIReady = false; }

  if (!_acUIReady) {
    if (existing) existing.parentNode.removeChild(existing);
    _acBuildUI();
  }

  _acRenderGrid();
}

// GT-BOT-ACC-TAB -- Tab switcher: Tutti / Diatonici
var acCurrentTab = 'all';

function acSwitchTab(tab) {
  acCurrentTab = tab;
  var btnAll = document.getElementById('acTabAll');
  var btnDia = document.getElementById('acTabDia');
  var ON = 'rgba(30,107,255,.18)', OFC = '#38B0FF';
  var OFF = 'transparent', OFC2 = 'rgba(255,255,255,.3)';
  if (btnAll) { btnAll.style.background = tab==='all'?ON:OFF; btnAll.style.color = tab==='all'?OFC:OFC2; }
  if (btnDia) { btnDia.style.background = tab==='diat'?ON:OFF; btnDia.style.color = tab==='diat'?OFC:OFC2; }
  if (tab === 'diat') acBuildDiatonici();
  else acBuildChords();
}

function acBuildDiatonici() {
  var lbl = document.getElementById('acClbl');
  if (lbl) lbl.textContent = 'Diatonici · ' + acTonic + (tonMode==='maj'?' Mag':' Min');
  var scroll = document.getElementById('acCscroll');
  var track  = document.getElementById('acCtrack');
  if (!scroll || !track) return;
  var W = scroll.clientWidth || (window.innerWidth - 28);
  var CELL = Math.floor((W - 12) / 3);
  var isMaj = (tonMode === 'maj');
  var scale = isMaj ? AC_MAJOR : AC_MINOR;
  var keyChrom = AC_NC[acTonic] || 0;
  var CN = ['Do','Do#','Re','Mi♭','Mi','Fa','Fa#','Sol','La♭','La','Si♭','Si'];
  var DQUAL = isMaj ? DEGREE_QUAL_MAJ : DEGREE_QUAL;
  var ROMAN_USE = isMaj
    ? ['I','II°','III','IV','V','VI','VII']
    : ['i','ii°','III','iv','v','VI','VII'];
  var cards = [];
  for (var deg = 0; deg < 7; deg++) {
    var noteChrom = (keyChrom + scale[deg]) % 12;
    var noteName = CN[noteChrom];
    var qual = DQUAL[deg];
    var matched = Object.keys(CHORDS).filter(function(k) {
      var ch = CHORDS[k];
      return ch && chordRoot(ch) === noteName && ch.qual === qual;
    });
    if (matched.length) cards.push({ k: matched[0], deg: deg, roman: ROMAN_USE[deg] });
  }
  var makeCard = function(item) {
    var ch = CHORDS[item.k]; if (!ch) return null;
    var inQ = acInQ(item.k);
    var el = document.createElement('div');
    el.className = 'accard fc' + (inQ?' onq':'');
    el.style.width = CELL + 'px'; el.style.margin = '0 4px';
    el.style.scrollSnapAlign = 'start';
    var fret = buildFretCard(ch, CELL - 8, Math.round((CELL - 8) * 0.72));
    el.innerHTML =
      '<div style="font-size:8px;color:rgba(56,176,255,.6);font-weight:600;margin-bottom:1px">'+item.roman+'</div>'
    + '<div class="accard-n">' + ch.name + '</div>'
    + '<div class="accard-q">' + (ch.qual||'') + '</div>'
    + fret;
    el._ck = item.k;
    el.addEventListener('click', function() {
      var ck = this._ck;
      if (acInQ(ck)) acQueue.splice(acQueue.indexOf(ck),1); else acQueue.push(ck);
      currentChordKey = ck; updateFretboard(ck);
      track.querySelectorAll('.accard').forEach(function(c) {
        c.className = 'accard fc'+(acInQ(c._ck)?' onq':'');
      });
      acRenderQ(); renderUnified();
    });
    return el;
  };
  track.innerHTML = ''; var totalW = 0;
  for (var copy = 0; copy < 3; copy++) {
    cards.forEach(function(item) { var el=makeCard(item); if(el) track.appendChild(el); });
    if (copy === 0) totalW = track.scrollWidth;
  }
  scroll.scrollLeft = totalW; scroll._acLooping = false;
  acLoopScroll(scroll, totalW);
}
