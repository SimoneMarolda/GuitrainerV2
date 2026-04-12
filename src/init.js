// GUITRAINER -- GT-GLB-INI
// Init pulito: solo chiamate di avvio, nessuna definizione di funzione duplicata.
// Questo file SOSTITUISCE quello generato da migrate.js che contiene duplicati.

// GT-GLB-INI-HKS-001 -- Hook togglePanel
var _tpOrigINI = togglePanel;
togglePanel = function(id, dir, barEl) {
  _tpOrigINI(id, dir, barEl);
  if (id === 'p-accordo') {
    setTimeout(function() {
      acTonic = activeKey;
      if (typeof acBuildNotes  === 'function') acBuildNotes();
      if (typeof acBuildChords === 'function') acBuildChords();
      if (typeof acRenderQ     === 'function') acRenderQ();
    }, 200);
  }
  if (id === 'p-giri') {
    setTimeout(function() {
      if (typeof gSwitchTab === 'function') gSwitchTab(gCurrentTab);
    }, 100);
  }
  if (id === 'p-analisi') {
    if (typeof updateAnalisi === 'function') updateAnalisi();
  }
};

// GT-GLB-INI-HKS-002 -- Override acRenderQ per aggiornare unified zone
var _origAcRenderQINI = acRenderQ;
acRenderQ = function() {
  _origAcRenderQINI.apply(this, arguments);
  if (typeof renderUnified === 'function') renderUnified();
};

// GT-GLB-INI-AUD-001 -- Avvio display BPM
adjBPM(0);

// GT-GLB-INI-TON-001 -- Tonalita iniziale: Do MAJ
setTonMode('maj');
setKey(0);

// GT-GLB-INI-FRB-001 -- Fretboard iniziale
setTimeout(function() {
  if (typeof updateFretboard === 'function') updateFretboard('Do');
  // GT-GLB-INI-RND-001 -- Random mode OFF di default
  randMode = false;
  if (typeof syncRandToggle === 'function') syncRandToggle();
  // Cronologia visibile
  var hw = document.querySelector('.hist-wrap');
  if (hw) hw.style.display = '';
  // GT-GLB-INI-GIR-001 -- Carousel e preset
  if (typeof renderGiroCarousel === 'function') renderGiroCarousel();
  if (typeof renderPresetList   === 'function') renderPresetList();
}, 150);
