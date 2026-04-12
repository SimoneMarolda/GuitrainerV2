// GT-TOP-TON -- Tonalita / setTonMode

// GT-TOP-TON-MOD-001 -- setTonMode
function setTonMode(mode) {
  tonMode = mode;
  var mn = document.getElementById('tonMinBtn');
  var mj = document.getElementById('tonMajBtn');
  if (mn) {
    mn.style.background = mode === 'min' ? 'rgba(30,107,255,.18)' : 'transparent';
    mn.style.color       = mode === 'min' ? '#38B0FF' : 'rgba(255,255,255,.3)';
  }
  if (mj) {
    mj.style.background = mode === 'maj' ? 'rgba(30,107,255,.18)' : 'transparent';
    mj.style.color       = mode === 'maj' ? '#38B0FF' : 'rgba(255,255,255,.3)';
  }
  var kd = document.getElementById('keyDisp');
  if (kd && !randMode) {
    kd.textContent = (activeKey + (mode === 'maj' ? ' MAJ' : ' MIN')).toUpperCase();
    kd.style.color = COLORS[activeIdx] || '#38B0FF';
  }
  // Aggiorna ring 2 per modo maggiore
  if (mode === 'maj' && typeof AC_MAJOR !== 'undefined') {
    var kc = AC_NC[activeKey] || 0;
    var scM = AC_MAJOR.map(function(o) { return (kc + o) % 12; });
    // Converti cromatico a indice NOTES tramite CHROM_TO_NQ
    document.querySelectorAll('.r2s').forEach(function(s, i) {
      var chrom = AC_NC[NOTES[i]];
      var ok    = (chrom !== undefined) && scM.indexOf(chrom) >= 0;
      s.setAttribute('fill', ok ? COLORS[i] : 'rgba(255,255,255,.03)');
      s.setAttribute('opacity', (ok && ringState.r2s) ? '0.55' : '0.07');
    });
  } else {
    setKey(activeIdx);
  }
  // Ricostruisce giro se attivo
  if (selGiroId && typeof GIRI !== 'undefined' && typeof buildProgFromDegs === 'function') {
    var ga = null;
    for (var gi = 0; gi < GIRI.length; gi++) {
      if (GIRI[gi].id === selGiroId) { ga = GIRI[gi]; break; }
    }
    if (ga) { acQueue = []; buildProgFromDegs(ga.degs); }
  }
}
