// GT-CTR-SEQ -- Unified Zone / Sequenza
// Variante C: card 62x62, banda colorata sinistra, long press drag iOS

var _uDragActive = false;
var _uLPTimer    = null;

function acDelFromQ(i) {
  acQueue.splice(i, 1);
  renderUnified();
  if (typeof acRenderQ === 'function') acRenderQ();
}

function updateUZoneCnt() {
  var n = document.getElementById('uZoneN');
  if (n) n.textContent = acQueue.length;
}

// GT-CTR-SEQ-REN-001 -- renderUnified
function renderUnified() {
  var zone  = document.getElementById('unifiedZone');
  var slots = document.getElementById('mainProgSlots');
  if (!zone || !slots) return;

  updateUZoneCnt();

  var klbl = document.getElementById('uZoneKey');
  if (klbl) klbl.textContent = ' \u00b7 ' + (typeof acTonic !== 'undefined' ? acTonic : activeKey);

  zone.style.display = acQueue.length ? '' : 'none';

  // Comprimi cronologia quando sequenza e attiva
  var hs = document.getElementById('histScroll');
  var hw = document.querySelector('.hist-head');
  if (acQueue.length) {
    if (hs) { hs.style.height = '40px'; hs.style.marginBottom = '0'; }
    if (hw) hw.style.display = 'none';
  } else {
    if (hs) { hs.style.height = '62px'; hs.style.marginBottom = ''; }
    if (hw) hw.style.display = '';
  }

  var beat = (typeof mainProgLoopActive !== 'undefined' && mainProgLoopActive && acQueue.length)
    ? (mainProgStep - 1) % acQueue.length : -1;

  slots.innerHTML = '';

  acQueue.forEach(function(k, i) {
    var ch = CHORDS[k]; if (!ch) return;
    var rootName = (typeof chordRoot === 'function') ? chordRoot(ch) : (ch.notes && ch.notes[0]) || '';
    var ni  = NOTES.indexOf(rootName);
    var col = ni >= 0 ? COLORS[ni] : '#38B0FF';
    var isActive = (i === beat);

    var el = document.createElement('div');
    el.dataset.idx = i;
    // GT-CTR-UNI Variante C
    el.style.cssText =
      'flex-shrink:0;width:62px;height:62px;display:flex;align-items:stretch;'
    + 'border-radius:9px;overflow:visible;position:relative;cursor:pointer;'
    + 'border:.5px solid ' + (isActive ? col : 'rgba(255,255,255,.1)') + ';'
    + (isActive ? 'box-shadow:0 0 10px 1px ' + col + '44;' : '')
    + 'user-select:none;-webkit-user-select:none;';

    el.innerHTML =
      '<div onclick="event.stopPropagation();acDelFromQ(' + i + ')"'
    + ' style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;'
    + 'background:#1a1a1a;border:.5px solid rgba(255,255,255,.18);display:flex;'
    + 'align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,.4);'
    + 'cursor:pointer;z-index:2">\xd7</div>'
    + '<div style="width:3px;background:' + col + ';flex-shrink:0;border-radius:9px 0 0 9px;'
    + (isActive ? 'animation:barFlash 1.6s ease-in-out infinite;' : 'opacity:.65;') + '"></div>'
    + '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;'
    + 'padding:0 6px;gap:2px;min-width:0;overflow:hidden;">'
    + '<div style="font-size:11px;font-weight:500;color:#ffffff;white-space:nowrap;'
    + 'overflow:hidden;text-overflow:ellipsis;line-height:1.2;">' + ch.name + '</div>'
    + '<div style="font-size:6px;color:rgba(255,255,255,.38);white-space:nowrap;">'
    + (ch.qual || '') + '</div>'
    + '</div>';

    // Tap = seleziona accordo
    el.addEventListener('click', function() {
      if (_uDragActive) return;
      currentChordKey = k;
      if (typeof updateFretboard === 'function') updateFretboard(k);
    });

    // GT-CTR-SEQ-DRG-002 -- Long press drag iOS (380ms)
    var _sx = 0, _sy = 0, _clone = null;

    el.addEventListener('touchstart', function(e) {
      _uDragActive = false;
      _sx = e.touches[0].clientX;
      _sy = e.touches[0].clientY;
      _uLPTimer = setTimeout(function() {
        _uDragActive = true;
        uDragIdx = i;
        _clone = el.cloneNode(true);
        _clone.style.cssText = 'position:fixed;opacity:.55;pointer-events:none;z-index:9999;'
          + 'left:' + (_sx - 31) + 'px;top:' + (_sy - 31) + 'px;'
          + 'width:62px;height:62px;transform:scale(1.08);';
        document.body.appendChild(_clone);
        el.style.opacity = '.3';
        if (navigator.vibrate) navigator.vibrate(25);
      }, 380);
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      var dx = Math.abs(e.touches[0].clientX - _sx);
      var dy = Math.abs(e.touches[0].clientY - _sy);
      if (!_uDragActive && (dx > 6 || dy > 6)) {
        clearTimeout(_uLPTimer); return;
      }
      if (!_uDragActive) return;
      e.preventDefault();
      var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      if (_clone) { _clone.style.left = (cx - 31) + 'px'; _clone.style.top = (cy - 31) + 'px'; }
      var t   = document.elementFromPoint(cx, cy);
      var tgt = t && t.closest('[data-idx]');
      slots.querySelectorAll('[data-idx]').forEach(function(s) {
        s.style.borderColor = 'rgba(255,255,255,.1)';
      });
      if (tgt && tgt !== el) tgt.style.borderColor = '#38B0FF';
    }, { passive: false });

    el.addEventListener('touchend', function(e) {
      clearTimeout(_uLPTimer);
      if (_clone) { _clone.remove(); _clone = null; }
      el.style.opacity = '1';
      if (!_uDragActive) { _uDragActive = false; return; }
      _uDragActive = false;
      var cx  = e.changedTouches[0].clientX, cy = e.changedTouches[0].clientY;
      var t   = document.elementFromPoint(cx, cy);
      var tgt = t && t.closest('[data-idx]');
      slots.querySelectorAll('[data-idx]').forEach(function(s) {
        s.style.borderColor = 'rgba(255,255,255,.1)';
      });
      if (tgt && +tgt.dataset.idx !== uDragIdx) {
        var item = acQueue.splice(uDragIdx, 1)[0];
        acQueue.splice(+tgt.dataset.idx, 0, item);
        renderUnified();
        if (typeof acRenderQ === 'function') acRenderQ();
      }
      uDragIdx = -1;
    }, { passive: true });

    slots.appendChild(el);
  });

  // Bottone +
  if (acQueue.length < 12) {
    var add = document.createElement('div');
    add.style.cssText = 'flex-shrink:0;min-width:46px;height:62px;'
      + 'border:.5px dashed rgba(255,255,255,.18);border-radius:10px;'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'font-size:22px;font-weight:200;color:rgba(255,255,255,.2);cursor:pointer;';
    add.textContent = '+';
    add.addEventListener('click', function() {
      if (typeof togglePanel === 'function') togglePanel('p-accordo', 'bot', null);
    });
    slots.appendChild(add);
  }
}
