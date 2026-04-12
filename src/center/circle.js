// GT-CTR-CIR -- Cerchio delle Quinte + setKey

// GT-CTR-CIR-KEY-001 -- setKey
function setKey(idx) {
  activeIdx = idx; activeKey = NOTES[idx];
  var sc  = SCALES[activeKey] || [];
  var sdl = sc.map(function(n) { return (n + 7) % 12; });
  var tri = (idx + 6) % 12;

  // Ring 1 -- settori esterni
  document.querySelectorAll('.r1s').forEach(function(s, i) {
    var op = i === idx ? '0.88' : '0.16';
    s.setAttribute('opacity', op); s.setAttribute('data-bop', op);
  });
  document.querySelectorAll('.r1l').forEach(function(l, i) {
    l.setAttribute('fill', i === idx ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.28)');
    l.setAttribute('font-size', i === idx ? '8' : '6');
    l.setAttribute('font-weight', i === idx ? '700' : '300');
  });
  // Ring 2 -- diatonici
  document.querySelectorAll('.r2s').forEach(function(s, i) {
    var ok = sc.indexOf(i) >= 0;
    s.setAttribute('fill', ok ? COLORS[i] : 'rgba(255,255,255,.03)');
    s.setAttribute('opacity', (ok && ringState.r2s) ? '0.55' : '0.07');
  });
  // Ring 3 -- dominanti secondarie
  document.querySelectorAll('.r3s').forEach(function(s, i) {
    var ok = sdl.indexOf(i) >= 0;
    s.setAttribute('fill', ok ? '#FF9340' : 'rgba(255,255,255,.03)');
    s.setAttribute('opacity', (ok && ringState.r3s) ? '0.6' : '0.05');
  });
  // Ring 4 -- tritono
  document.querySelectorAll('.r4s').forEach(function(s, i) {
    s.setAttribute('fill', i === tri ? '#9B22CC' : 'rgba(255,255,255,.03)');
    s.setAttribute('opacity', (i === tri && ringState.r4s) ? '0.7' : '0.04');
  });

  // GT-CTR-CIR-LBL-001 -- key display
  var kd = document.getElementById('keyDisp');
  if (kd && !randMode) {
    kd.textContent = (activeKey + (tonMode === 'maj' ? ' MAJ' : ' MIN')).toUpperCase();
    kd.style.color = COLORS[idx] || '#38B0FF';
  }

  // Default chord
  var minKey = activeKey + 'm';
  var defKey = (tonMode === 'maj')
    ? (CHORDS[activeKey] ? activeKey : (CHORDS[minKey] ? minKey : activeKey))
    : (CHORDS[minKey]    ? minKey    : activeKey);
  currentChordKey = defKey;
  if (typeof updateFretboard === 'function') updateFretboard(defKey);
  if (typeof updateAnalisi   === 'function') updateAnalisi();
  if (typeof addHist         === 'function') addHist(activeKey, tonMode === 'maj' ? 'Maggiore' : 'Minore');

  acTonic = activeKey;

  // GT-PNL-TON: se un giro e attivo, ricostruisce la progressione con la nuova tonalita
  if (selGiroId && typeof GIRI !== 'undefined' && typeof buildProgFromDegs === 'function') {
    var ga = null;
    for (var gi = 0; gi < GIRI.length; gi++) {
      if (GIRI[gi].id === selGiroId) { ga = GIRI[gi]; break; }
    }
    if (ga) { acQueue = []; buildProgFromDegs(ga.degs); }
  }

  closeAllPanels();
}

// GT-CTR-CIR-TGL-001 -- toggleRingLayer
function toggleRingLayer(cls, el, src) {
  ringState[cls] = !ringState[cls];
  setKey(activeIdx);
  var legMap = { r2s: 'leg2', r3s: 'leg3', r4s: 'leg4' };
  var legEl  = document.getElementById(legMap[cls]);
  if (legEl) legEl.classList.toggle('off', !ringState[cls]);
  var txtMap = { r2s: 'rl2txt', r3s: 'rl3txt', r4s: 'rl4txt' };
  var txtEl  = document.getElementById(txtMap[cls]);
  if (txtEl) txtEl.textContent = ringState[cls] ? 'ON' : 'OFF';
}

// GT-CTR-CIR-MOD-001 -- setMode
var MODES = {
  semplice:  { size: 200, r2: false, r3: false, r4: false, legend: false },
  normale:   { size: 230, r2: true,  r3: false, r4: false, legend: true  },
  difficile: { size: 260, r2: true,  r3: true,  r4: true,  legend: true  },
  libero:    { size: 200, r2: false, r3: false, r4: false, legend: false }
};
function setMode(m, el) {
  if (el) {
    el.closest('.sg').querySelectorAll('.sgi').forEach(function(x) { x.classList.remove('on'); });
    el.classList.add('on');
  }
  document.getElementById('modeLbl').textContent = m.charAt(0).toUpperCase() + m.slice(1);
  var cfg  = MODES[m] || MODES.semplice;
  var wrap = document.getElementById('svgWrap');
  var svg  = document.getElementById('mainSvg');
  if (wrap) { wrap.style.width = cfg.size + 'px'; wrap.style.height = cfg.size + 'px'; }
  if (svg)  { svg.setAttribute('width', cfg.size); svg.setAttribute('height', cfg.size); }
  ringState.r2s = cfg.r2; ringState.r3s = cfg.r3; ringState.r4s = cfg.r4;
  var leg = document.getElementById('ringLegend');
  if (leg) leg.style.display = cfg.legend ? 'flex' : 'none';
  setKey(activeIdx);
  closeAllPanels();
}
