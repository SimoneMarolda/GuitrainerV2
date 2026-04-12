// GUITRAINER -- GT-CORE
// Funzioni core e stato globale


function noteColorForStringFret(strIdx, fret) {
  // strIdx: 0=low E ... 5=high e  fret: 0=open
  const chrom = (OPEN_CHROM[strIdx] + fret) % 12;
  const nqIdx = CHROM_TO_NQ[chrom];
  return COLORS[nqIdx];
}

function buildFretSvg(ch, W, H, noLabels) {
  const frets   = ch.frets;
  const fingers = ch.fingers;
  const barre   = ch.barre || 0;
  const chNotes = ch.notes || [];

  const mL = noLabels ? 14 : 26;
  const mR = 6;
  const mT = 14;
  const mB = 20;
  const nFrets = 5, nStr = 6;
  const pW = W - mL - mR, pH = H - mT - mB;
  const fW = pW / nFrets;
  const sG = pH / (nStr - 1);

  const strOrder  = [5,4,3,2,1,0];
  const strNames  = ['e','B','G','D','A','E'];
  const strThick  = [0.4, 0.55, 0.72, 0.92, 1.15, 1.45];
  const strAlpha  = ['.18', '.22', '.28', '.35', '.44', '.54'];
  const sY  = i => mT + i * sG;
  const dotX = n => mL + (n - 0.5) * fW;

  const active = frets.filter(f => f > 0);
  let minFr = active.length ? Math.min(...active) - 1 : 0;
  if (barre > 0) minFr = barre - 1;

  const gid = 'cg' + W;
  const CN = {0:'Do',1:'Re♭',2:'Re',3:'Mi♭',4:'Mi',5:'Fa',6:'Fa#',7:'Sol',8:'La♭',9:'La',10:'Si♭',11:'Si'};

  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#0A22F0"/><stop offset="100%" stop-color="#38B0FF"/>
</linearGradient></defs>`;

  s += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${mT+pH}" stroke="rgba(255,255,255,.68)" stroke-width="3.5" stroke-linecap="round"/>`;

  for (let n = 1; n <= nFrets; n++) {
    s += `<line x1="${mL+n*fW}" y1="${mT}" x2="${mL+n*fW}" y2="${mT+pH}" stroke="rgba(255,255,255,.13)" stroke-width=".6"/>`;
  }

  for (let i = 0; i < nStr; i++) {
    const y = sY(i);
    s += `<line x1="${mL}" y1="${y}" x2="${W-mR}" y2="${y}" stroke="rgba(255,255,255,${strAlpha[i]})" stroke-width="${strThick[i]}"/>`;
  }

  // fret number shown in HTML above fretboard via fretStartLbl

  if (barre > 0) {
    const fp = barre - minFr;
    if (fp >= 1 && fp <= nFrets) {
      const cx = dotX(fp), dotR = Math.min(sG*0.36, fW*0.28);
      s += `<rect x="${cx-fW*.36}" y="${sY(0)-dotR*.9}" width="${fW*.72}" height="${sY(nStr-1)-sY(0)+dotR*1.8}" rx="${dotR}" fill="rgba(30,107,255,.42)"/>`;
    }
  }

  for (let di = 0; di < nStr; di++) {
    const si  = strOrder[di];
    const f   = frets[si];
    const fn  = fingers[si];
    const y   = sY(di);
    const lx  = mL - 20;
    const sx  = mL - 9;

    if (!noLabels) s += `<text x="${lx}" y="${y+3.5}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,.28)" font-family="-apple-system" letter-spacing="0">${strNames[di]}</text>`;

    if (f === -1) {
      s += `<text x="${sx}" y="${y+3.5}" text-anchor="middle" font-size="9.5" fill="rgba(255,255,255,.25)" font-family="-apple-system">✕</text>`;
    } else if (f === 0) {
      s += `<circle cx="${sx}" cy="${y}" r="4" fill="none" stroke="rgba(255,255,255,.38)" stroke-width=".9"/>`;
    } else {
      const fp2 = f - minFr;
      if (fp2 >= 1 && fp2 <= nFrets) {
        const cx   = dotX(fp2);
        const dotR = Math.min(sG*0.37, fW*0.31);
        const chrom    = (OPEN_CHROM[si] + f) % 12;
        const noteName = CN[chrom] || '';
        const isRoot   = (chNotes[0] && noteName === chNotes[0]);
        const fontSize = dotR * (noteName.length > 2 ? 0.72 : 0.82);

        if (isRoot) {
          const rx = dotR * 0.38;
          s += `<rect x="${cx-dotR*1.12}" y="${y-dotR*1.12}" width="${dotR*2.24}" height="${dotR*2.24}" rx="${rx}" fill="url(#${gid})"/>`;
          s += `<text x="${cx}" y="${y+dotR*.34}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#fff" font-family="-apple-system" font-weight="700">${noteName}</text>`;
        } else {
          s += `<circle cx="${cx}" cy="${y}" r="${dotR*1.1}" fill="rgba(255,255,255,.90)"/>`;
          s += `<text x="${cx}" y="${y+dotR*.34}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="rgba(0,0,0,.85)" font-family="-apple-system" font-weight="600">${noteName}</text>`;
        }
      }
    }
  }

  for (let di = 0; di < nStr; di++) {
    const si = strOrder[di];
    const f  = frets[si];
    const fn = fingers[si];
    const fp2 = f > 0 ? f - minFr : -1;
    if (fn > 0 && fp2 >= 1 && fp2 <= nFrets) {
      const cx = dotX(fp2);
      s += `<text x="${cx}" y="${mT+pH+mB-7}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.32)" font-family="-apple-system">${fn}</text>`;
    }
  }

  s += '</svg>';
  return s;
}


// STATE
let bpm=100,playing=false,metro=null,taps=[];
let beat=0,activeIdx=3,activeKey="La";
let history=[],genChords=[],genStep=0,genActive=false;
let numChords=4,barsPerChord=4;
let seqChords=[null,null,null,null],seqStep=0,seqLoopActive=false;
let ringState={r2s:true,r3s:false,r4s:false};
let activePanelId=null,currentChordKey="Lam";

function gtn(b){let n="GRAVE";for(let[t,l]of TN)if(b>=t)n=l;return n;}

var tonMode="maj";
var gnNumChords=4;
var gnFlags={diat:true,rand:false,secdom:false,triton:false,modal:false,neap:false};

function setTonMode(mode){
  tonMode=mode;
  var mn=document.getElementById("tonMinBtn"),mj=document.getElementById("tonMajBtn");
  if(mn){mn.style.background=mode==="min"?"rgba(30,107,255,.18)":"transparent";
         mn.style.color=mode==="min"?"#38B0FF":"rgba(255,255,255,.3)";}
  if(mj){mj.style.background=mode==="maj"?"rgba(30,107,255,.18)":"transparent";
         mj.style.color=mode==="maj"?"#38B0FF":"rgba(255,255,255,.3)";}
  var kd=document.getElementById("keyDisp");
  if(kd) kd.textContent=activeKey+(mode==="min"?" Min":" Maj");
  if(mode==="maj"){
    var MAJ=[0,2,4,5,7,9,11],kc=AC_NC[activeKey]||0;
    var scM=MAJ.map(function(o){return(kc+o)%12;});
    document.querySelectorAll(".r2s").forEach(function(s,i){
      var nc=AC_NC[NOTES[i]]; var on=nc!==undefined&&scM.includes(nc);
      s.setAttribute("fill",on?COLORS[i]:"rgba(255,255,255,.03)");
      s.setAttribute("opacity",(on&&ringState.r2s)?"0.55":"0.07");
    });
  } else { setKey(activeIdx); }
}

function gnToggle(key,el){
  gnFlags[key]=!gnFlags[key];
  el.classList.toggle("on",gnFlags[key]);
}

function buildGenera(){
  var kc=AC_NC[activeKey]||0;
  var sc=AC_MINOR.map(function(o){return(kc+o)%12;});
  var CN={0:"Do",1:"Re♭",2:"Re",3:"Mi♭",4:"Mi",5:"Fa",6:"Fa#",7:"Sol",8:"La♭",9:"La",10:"Si♭",11:"Si"};
  var pool=[];
  if(gnFlags.diat) pool=pool.concat([0,0,0,3,4,5,6,1]);
  if(gnFlags.rand) pool=pool.concat([0,1,2,3,4,5,6]);
  if(!pool.length) pool=[0,3,4,5];
  var degs=[]; for(var i=0;i<gnNumChords;i++) degs.push(pool[Math.floor(Math.random()*pool.length)]);
  var out=[];
  degs.forEach(function(d,i){
    var k=bestChordForDeg(d); if(!k) return;
    // Dominante secondaria: inserisci V7/grado PRIMA di ogni accordo
    if(gnFlags.secdom){
      var tc=sc[d]; var dc=(tc+7)%12; var dn=CN[dc];
      var dk=Object.keys(CHORDS).find(function(k2){var ch=CHORDS[k2];return ch&&ch.notes&&ch.notes[0]===dn&&(ch.qual||"").indexOf("Dom.")>=0;});
      if(dk) out.push(dk);
    }
    if(gnFlags.triton&&d===4&&Math.random()<0.5){
      var tc2=(sc[4]+6)%12; var tn=CN[tc2];
      var tk=Object.keys(CHORDS).find(function(k2){var ch=CHORDS[k2];return ch&&ch.notes&&ch.notes[0]===tn&&(ch.qual||"").indexOf("Dom.")>=0;});
      if(tk){out.push(tk);return;}
    }
    if(gnFlags.modal&&(d===3||d===6)&&Math.random()<0.4){
      var MI=[0,2,4,5,7,9,11]; var mc=(kc+MI[Math.min(d,6)])%12; var mn=CN[mc];
      var mk=Object.keys(CHORDS).find(function(k2){var ch=CHORDS[k2];return ch&&ch.notes&&ch.notes[0]===mn&&ch.qual==="Maggiore";});
      if(mk){out.push(mk);return;}
    }
    if(gnFlags.neap&&d===4&&i>0&&Math.random()<0.35){
      var nc=(kc+1)%12; var nn=CN[nc];
      var nk=Object.keys(CHORDS).find(function(k2){var ch=CHORDS[k2];return ch&&ch.notes&&ch.notes[0]===nn&&ch.qual==="Maggiore";});
      if(nk) out.push(nk);
    }
    out.push(k);
  });
  if(!out.length) return;
  acQueue=out.slice(0,12);
  renderUnified(); acRenderQ();
}

function adjBPM(d){
  bpm=Math.max(20,Math.min(300,bpm+d));
  const bn=document.getElementById("bpmN"); if(bn) bn.textContent=bpm;
  const tn=document.getElementById("tnm"); if(tn) tn.textContent=gtn(bpm);
  const arc=document.getElementById("bpmArc");
  if(arc){const r=parseFloat(arc.getAttribute("r")),c=2*Math.PI*r;arc.setAttribute("stroke-dasharray",`${(c*(bpm-20)/280).toFixed(1)} ${c.toFixed(1)}`);}
  const sl=document.getElementById("bpmSlider"); if(sl) sl.value=bpm;
  const sv=document.getElementById("bpmSlVal"); if(sv) sv.textContent=bpm;
  const bb=document.getElementById("bigBpmDisp"); if(bb) bb.textContent=bpm;
  if(playing) startM();
}

// ── WEB AUDIO CLICK ────────────────────────────────────────
var _audioCtx = null;
var _clickVol = 0.7;
function getACtx(){
  if(!_audioCtx){
    try{_audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
  }
  if(_audioCtx && _audioCtx.state==='suspended') _audioCtx.resume();
  return _audioCtx;
}
function playClick(strong){
  var ctx=getACtx(); if(!ctx) return;
  var osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = strong ? 1200 : 800;
  osc.type = 'sine';
  var t=ctx.currentTime;
  gain.gain.setValueAtTime(0.001,t);
  gain.gain.linearRampToValueAtTime(_clickVol, t+0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t+0.08);
  osc.start(t); osc.stop(t+0.07);
}

function startM(){var _ac=getACtx();if(_ac&&_ac.state==='suspended')_ac.resume();clearInterval(metro);playing=true;document.getElementById("pBtn").textContent="■";metro=setInterval(onBeat,60000/bpm);}
function stopM(){clearInterval(metro);playing=false;beat=0;beatCount=0;mainProgStep=0;document.getElementById("pBtn").textContent="▶";const bf=document.getElementById("bfl");if(bf)bf.setAttribute("stroke","rgba(30,107,255,0)");}
function togglePlay(){playing?stopM():startM();}
function tapTempo(){const n=Date.now();taps.push(n);if(taps.length>1){const d=taps.slice(1).map((t,i)=>t-taps[i]);bpm=Math.round(60000/(d.reduce((a,b)=>a+b)/d.length));adjBPM(0);}if(taps.length>6)taps=taps.slice(-4);ripple();}

function onBeat(){
  beat++;const strong=(beat%4===1);
  playClick(strong); // audio click
  const segs=document.querySelectorAll(".r1s");
  if(segs[activeIdx]){const bo=parseFloat(segs[activeIdx].getAttribute("data-bop")||"0.88");segs[activeIdx].setAttribute("opacity","1");setTimeout(()=>segs[activeIdx].setAttribute("opacity",bo),strong?150:70);}
  const bf=document.getElementById("bfl");
  if(bf){bf.setAttribute("stroke",strong?"rgba(30,107,255,.55)":"rgba(30,107,255,.22)");bf.setAttribute("stroke-width",strong?"2":"1");setTimeout(()=>bf.setAttribute("stroke","rgba(30,107,255,0)"),85);}
  if(strong){if(genActive)advanceGen();else if(seqLoopActive)advanceSeq();
  // Only add to history in free/tonality mode, not in randMode or sequenza loop
  // randMode and mainProgLoopActive handle their own history
  }
}

function ripple(){const c=document.getElementById("rpl");if(!c)return;let r=0;c.setAttribute("opacity","0.35");const ri=setInterval(()=>{r+=8;c.setAttribute("r",r);c.setAttribute("opacity",Math.max(0,0.35-r/160));if(r>160){clearInterval(ri);c.setAttribute("r","0");}},16);}

function setKey(idx){
  activeIdx=idx;activeKey=NOTES[idx];
  const sc=SCALES[activeKey]||[];
  const sdl=sc.map(n=>(n+7)%12);
  const tri=(idx+6)%12;
  // ring 1
  document.querySelectorAll(".r1s").forEach((s,i)=>{const op=i===idx?"0.88":"0.16";s.setAttribute("opacity",op);s.setAttribute("data-bop",op);});
  document.querySelectorAll(".r1l").forEach((l,i)=>{l.setAttribute("fill",i===idx?"rgba(255,255,255,.95)":"rgba(255,255,255,.28)");l.setAttribute("font-size",i===idx?"8":"6");l.setAttribute("font-weight",i===idx?"700":"300");});
  // ring 2
  document.querySelectorAll(".r2s").forEach((s,i)=>{const ok=sc.includes(i);s.setAttribute("fill",ok?COLORS[i]:"rgba(255,255,255,.03)");s.setAttribute("opacity",(ok&&ringState.r2s)?"0.55":"0.07");});
  // ring 3
  document.querySelectorAll(".r3s").forEach((s,i)=>{const ok=sdl.includes(i);s.setAttribute("fill",ok?"#FF9340":"rgba(255,255,255,.03)");s.setAttribute("opacity",(ok&&ringState.r3s)?"0.6":"0.05");});
  // ring 4
  document.querySelectorAll(".r4s").forEach((s,i)=>{s.setAttribute("fill",i===tri?"#9B22CC":"rgba(255,255,255,.03)");s.setAttribute("opacity",(i===tri&&ringState.r4s)?"0.7":"0.04");});

  var _kd=document.getElementById("keyDisp");
  if(_kd && !(typeof randMode!=="undefined" && randMode)){
    _kd.textContent=(activeKey+(typeof tonMode!=="undefined"&&tonMode==="maj"?" MAJ":" MIN")).toUpperCase();
    _kd.style.color=COLORS[idx]||"#38B0FF";
  }
  // pick default chord based on tonMode
  const minKey=activeKey+"m";
  const majKey=activeKey;
  const defKey=(typeof tonMode!=='undefined'&&tonMode==='maj')
    ? (CHORDS[majKey]?majKey:(CHORDS[minKey]?minKey:activeKey))
    : (CHORDS[minKey]?minKey:activeKey);
  currentChordKey=defKey;
  updateFretboard(defKey);
  updateAnalisi();
  addHist(activeKey, tonMode==="maj"?"Maggiore":"Minore");
  acTonic = activeKey;  // keep accordi panel in sync
  closeAllPanels();
}

// ── FRETBOARD ─────────────────────────────────────────────────────
function updateFretboard(chKey){
  currentChordKey=chKey;
  const ch=CHORDS[chKey]||CHORDS["Lam"];
  // In random/studio mode, keyDisp follows the current chord
  if(typeof randMode!=='undefined' && randMode){
    const _kd=document.getElementById('keyDisp');
    if(_kd && ch){
      _kd.textContent=ch.name.toUpperCase();
      const ni=NOTES.indexOf(ch.notes&&ch.notes[0]);
      _kd.style.color=ni>=0?(COLORS[ni]||'#38B0FF'):'#38B0FF';
    }
  }
  // centered header — hide in randMode (keyDisp already shows it)
  var _nd=document.getElementById("chordNameDisp");
  var _nd2=document.getElementById("chordNotesDisp");
  if(typeof randMode!=='undefined' && randMode){
    if(_nd) _nd.style.display='none';
    if(_nd2) _nd2.style.display='none';
  } else {
    if(_nd){ _nd.style.display=''; _nd.textContent=ch.name; }
    if(_nd2){ _nd2.style.display=''; _nd2.textContent=ch.notes.join(" · "); }
  }
  const wrap=document.getElementById("fretboardWrap");
  const W=Math.min(wrap.clientWidth||window.innerWidth||360,360);
  const H=Math.round(W*0.44);
  wrap.innerHTML=buildFretSvg(ch,W,H);
  // Fret start label (top-left, above nut)
  var _fl=document.getElementById('fretStartLbl');
  if(_fl){
    var _af=ch.frets.filter(function(f){return f>0;});
    var _mf=_af.length?Math.min.apply(null,_af):0;
    _fl.textContent = _mf>1 ? _mf+'ᵃ' : '';
  }

  // big panel
  const bf=document.getElementById("bigFretWrap");
  if(bf){const bw=Math.min((bf.clientWidth||340),360);bf.innerHTML=buildFretSvg(ch,bw,Math.round(bw*0.30));}
  const bcn=document.getElementById("bigChordName"); if(bcn) bcn.textContent=ch.name;
  const bcno=document.getElementById("bigChordNotes"); if(bcno) bcno.textContent=ch.notes.join(" · ");
  // chord picker list
  renderChordPicker();
}

function renderChordPicker(){
  const list=document.getElementById("chordPickerList"); if(!list) return;
  list.innerHTML="";
  const available=KEY_CHORD_MAP[activeKey]||[];
  available.forEach(k=>{
    const ch=CHORDS[k]; if(!ch) return;
    const isSel=(k===currentChordKey);
    const d=document.createElement("div");
    d.style.cssText=`padding:3px 9px;border:.5px solid rgba(255,255,255,${isSel?".4":".12"});border-radius:7px;font-size:11px;font-weight:300;color:#fff;cursor:pointer;background:rgba(255,255,255,${isSel?".06":"0"})`;
    d.textContent=ch.name;
    d.addEventListener("click",()=>updateFretboard(k));
    list.appendChild(d);
  });
}

// ── ANALISI ───────────────────────────────────────────────────────
function updateAnalisi(){
  var body=document.getElementById("analisiBody"); if(!body) return;
  var kc=AC_NC[activeKey]||0;
  var isMaj=(typeof tonMode!=='undefined'&&tonMode==='maj');
  var AC_MAJ=[0,2,4,5,7,9,11];
  var sc=(isMaj?AC_MAJ:AC_MINOR).map(function(o){return(kc+o)%12;});
  var CN={0:"Do",1:"Re♭",2:"Re",3:"Mi♭",4:"Mi",5:"Fa",6:"Fa#",7:"Sol",8:"La♭",9:"La",10:"Si♭",11:"Si"};
  var DR=isMaj?["I","ii","iii","IV","V","vi","vii°"]:["i","ii°","III","iv","v","VI","VII"];
  var DQ=isMaj?["Maggiore","Minore","Minore","Maggiore","Maggiore","Minore","Dim."]:["Minore","Dim.","Maggiore","Minore","Minore","Maggiore","Maggiore"];
  var FN=["Tonica — riposo e risoluzione","Sopratonica — tensione debole","Mediante — relativa maggiore","Sottodominante — prepara la dominante","Dominante — massima tensione","Sopradominante — tonica secondaria","VII grado — sensibile modale"];
  var rows="";
  if(acQueue.length>0){
    rows+="<div style='font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:6px'>Accordi selezionati · "+activeKey+(isMaj?' Maj':' Min')+"</div>";
    acQueue.forEach(function(k,i){
      var ch=CHORDS[k];if(!ch)return;
      var rc=AC_NC[ch.notes&&ch.notes[0]];
      var deg=(rc!==undefined)?sc.indexOf(rc):-1;
      var col=deg>=0?"#18CC66":"rgba(255,153,0,.5)";
      var role=deg>=0?DR[deg]+" grado · "+DQ[deg]:"Fuori scala";
      var fn=deg>=0?FN[deg]:"Dominante sec., intercambio modale o sost. tritono";
      var nx=(i<acQueue.length-1&&CHORDS[acQueue[i+1]])?" → "+CHORDS[acQueue[i+1]].name:"";
      rows+="<div style='padding:7px 9px;border:.5px solid "+col+"44;border-radius:9px;background:"+col+"09;margin-bottom:4px'>"+"<div style='display:flex;align-items:center;gap:7px;margin-bottom:2px'>"+"<span style='font-size:12px;font-weight:600;color:"+col+"'>"+ch.name+"</span>"+"<span style='font-size:8px;color:rgba(255,255,255,.38)'>"+role+"</span>"+(nx?"<span style='margin-left:auto;font-size:8px;color:rgba(255,255,255,.22)'>"+nx+"</span>":"")+"</div><div style='font-size:8px;color:rgba(255,255,255,.42);line-height:1.4'>"+fn+"</div></div>";
    });
  }else{
    rows+="<div style='font-size:7px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:6px'>Scala "+activeKey+(isMaj?' Maggiore':' Minore Naturale')+"</div>";
    sc.forEach(function(ch,deg){
      rows+="<div style='display:flex;align-items:center;gap:8px;padding:5px 8px;border-bottom:.5px solid rgba(255,255,255,.06)'>"+"<span style='font-size:9px;color:rgba(255,255,255,.3);width:22px'>"+DR[deg]+"</span>"+"<span style='font-size:13px;color:#fff;width:34px'>"+(CN[String(ch)]||"")+"</span>"+"<span style='font-size:8px;color:rgba(255,255,255,.35);flex-shrink:0'>"+DQ[deg]+"</span>"+"<span style='font-size:8px;color:rgba(255,255,255,.28);margin-left:auto'>"+FN[deg]+"</span></div>";
    });
  }
  var dc=(kc+7)%12,tc=(kc+6)%12,rc=(kc+3)%12;
  rows+="<div style='height:.5px;background:rgba(255,255,255,.07);margin:8px 0'></div>"+"<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px'>"+"<div style='padding:6px;border:.5px solid rgba(255,147,64,.3);border-radius:8px;text-align:center'>"+"<div style='font-size:7px;color:rgba(255,147,64,.7);text-transform:uppercase;margin-bottom:2px'>Dom.Sec.</div>"+"<div style='font-size:11px;color:#fff'>"+(CN[String(dc)]||"")+"7</div></div>"+"<div style='padding:6px;border:.5px solid rgba(155,34,204,.3);border-radius:8px;text-align:center'>"+"<div style='font-size:7px;color:rgba(155,34,204,.7);text-transform:uppercase;margin-bottom:2px'>Tritono</div>"+"<div style='font-size:11px;color:#fff'>"+(CN[String(tc)]||"")+"7</div></div>"+"<div style='padding:6px;border:.5px solid rgba(34,221,204,.3);border-radius:8px;text-align:center'>"+"<div style='font-size:7px;color:rgba(34,221,204,.7);text-transform:uppercase;margin-bottom:2px'>Relativa</div>"+"<div style='font-size:11px;color:#fff'>"+(CN[String(rc)]||"")+" Maj</div></div></div>";
  body.innerHTML=rows;
}

// ── HISTORY ───────────────────────────────────────────────────────
function addHist(key, qual){
  const idx=NOTES.indexOf(key);
  history.push({key,idx,qual:qual||''}); if(history.length>32) history.shift();
  renderHist();
}
function clearHist(){history=[];renderHist();}
function renderHist(){
  const scroll=document.getElementById("histScroll"); if(!scroll) return;
  const prev=scroll.scrollLeft;
  scroll.innerHTML="";
  history.forEach((h,i)=>{
    const cur=(i===history.length-1);
    const hCol=COLORS[h.idx]||'rgba(255,255,255,.4)';
    const chip=document.createElement("div");
    chip.title="Riparti da qui";
    chip.style.cssText='flex-shrink:0;width:50px;height:50px;display:flex;align-items:stretch;'
      +'border-radius:9px;overflow:visible;cursor:pointer;position:relative;transition:border-color .2s;'
      +'border:.5px solid '+(cur?hCol:'rgba(255,255,255,.1)')+';'
      +(cur?'box-shadow:0 0 10px 1px '+hCol+'44;':'');
    chip.innerHTML=
      '<div onclick="event.stopPropagation();history.splice('+i+',1);renderHist()" '
      +'style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;'
      +'background:#1a1a1a;border:.5px solid rgba(255,255,255,.18);display:flex;align-items:center;'
      +'justify-content:center;font-size:9px;color:rgba(255,255,255,.4);cursor:pointer;z-index:2">×</div>'
      +'<div style="width:3px;--bc:'+hCol+';background:'+hCol+';flex-shrink:0;border-radius:9px 0 0 9px;'
      +(cur?'animation:barFlash 1.6s ease-in-out infinite;':'opacity:.65;')+'"></div>'
      +'<div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 7px;gap:2px;">'
      +'<div style="font-size:12px;font-weight:400;color:#fff;white-space:nowrap;line-height:1.1">'+h.key+'</div>'
      +'<div style="font-size:6.5px;color:rgba(255,255,255,.38)">'+(h.qual||'')+'</div>'
      +'</div>';
    chip.addEventListener("click",()=>{history=history.slice(0,i+1);setKey(h.idx);});
    scroll.appendChild(chip);
  });
  const atEnd=scroll.scrollWidth-scroll.clientWidth-prev<60||prev===0;
  if(atEnd)scroll.scrollLeft=scroll.scrollWidth; else scroll.scrollLeft=prev;
}

// ── GENERATIVA ────────────────────────────────────────────────────
function buildGen(){const sc=SCALES[activeKey]||[];genChords=[];genStep=0;for(let i=0;i<numChords;i++)genChords.push(sc[Math.floor(Math.random()*sc.length)]);renderGenSlots();}
function advanceGen(){if(!genChords.length)return;setKey(genChords[genStep%genChords.length]);genStep++;renderGenSlots();}
function renderGenSlots(){const w=document.getElementById("genSlots");if(!w)return;w.innerHTML="";genChords.forEach((ci,i)=>{const d=document.createElement("div");d.style.cssText=`flex-shrink:0;padding:4px 9px;border:.5px solid ${COLORS[ci]}55;border-radius:7px;font-size:11px;color:#fff;cursor:pointer;background:${COLORS[ci]}14`;d.textContent=NOTES[ci];d.addEventListener("click",()=>setKey(ci));w.appendChild(d);});}
function toggleGenLoop(){genActive=!genActive;const btn=document.getElementById("genLoopBtn");if(btn)btn.textContent=genActive?"■ Stop":"▶ Loop";if(genActive&&!playing)startM();}

// ── SEQ ───────────────────────────────────────────────────────────
function renderSeqSlots(){const w=document.getElementById("seqSlots");if(!w)return;w.innerHTML="";seqChords.forEach((key,i)=>{const active=seqLoopActive&&i===seqStep%4;const idx=key?NOTES.indexOf(key):-1;const d=document.createElement("div");d.style.cssText=`flex:1;height:42px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:.5px solid ${active?"#1E6BFF":idx>=0?COLORS[idx]+"44":"rgba(255,255,255,.1)"};border-radius:8px;cursor:pointer;background:${active?"rgba(30,107,255,.12)":idx>=0?COLORS[idx]+"10":"#000"};font-size:${key?"13px":"11px"};font-weight:300;color:${key?"#fff":"rgba(255,255,255,.2)"};gap:1px`;d.innerHTML=key?`<span>${key}</span><span style="font-size:6px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.3)">${i+1}</span>`:`<span>+</span>`;d.addEventListener("click",()=>{seqChords[i]=activeKey;renderSeqSlots();});w.appendChild(d);});}
function clearSeq(){seqChords=[null,null,null,null];seqStep=0;seqLoopActive=false;const btn=document.getElementById("seqLoopBtn");if(btn)btn.textContent="▶ Loop";renderSeqSlots();}
function advanceSeq(){const filled=seqChords.filter(c=>c!==null);if(!filled.length)return;const key=seqChords[seqStep%4];if(key)setKey(NOTES.indexOf(key));seqStep++;renderSeqSlots();}
function toggleSeqLoop(){seqLoopActive=!seqLoopActive;const btn=document.getElementById("seqLoopBtn");if(btn)btn.textContent=seqLoopActive?"■ Stop":"▶ Loop";if(seqLoopActive&&!playing)startM();}

// ── RING TOGGLE ───────────────────────────────────────────────────
function toggleRingLayer(cls,el,src){ringState[cls]=!ringState[cls];const on=ringState[cls];setKey(activeIdx);const legMap={r2s:"leg2",r3s:"leg3",r4s:"leg4"};const legEl=document.getElementById(legMap[cls]);if(legEl)legEl.classList.toggle("off",!on);const txtMap={r2s:"rl2txt",r3s:"rl3txt",r4s:"rl4txt"};const txtEl=document.getElementById(txtMap[cls]);if(txtEl)txtEl.textContent=on?"ON":"OFF";}

// ── MODE ──────────────────────────────────────────────────────────
const MODES={semplice:{size:200,r2:false,r3:false,r4:false,legend:false},normale:{size:230,r2:true,r3:false,r4:false,legend:true},giri:{size:230,r2:true,r3:true,r4:false,legend:true},genera:{size:230,r2:true,r3:true,r4:false,legend:true},difficile:{size:260,r2:true,r3:true,r4:true,legend:true},libero:{size:200,r2:false,r3:false,r4:false,legend:false},studio:{size:260,r2:true,r3:true,r4:true,legend:true}};
function setMode(m,el){if(el){el.closest(".sg").querySelectorAll(".sgi").forEach(x=>x.classList.remove("on"));el.classList.add("on");}document.getElementById("modeLbl").textContent=m.charAt(0).toUpperCase()+m.slice(1);const cfg=MODES[m]||MODES.semplice;const wrap=document.getElementById("svgWrap"),svg=document.getElementById("mainSvg");if(wrap){wrap.style.width=cfg.size+"px";wrap.style.height=cfg.size+"px";}if(svg){svg.setAttribute("width",cfg.size);svg.setAttribute("height",cfg.size);}ringState.r2s=cfg.r2;ringState.r3s=cfg.r3;ringState.r4s=cfg.r4;const leg=document.getElementById("ringLegend");if(leg)leg.style.display=cfg.legend?"flex":"none";setKey(activeIdx);closeAllPanels();}

// ── PANELS ────────────────────────────────────────────────────────
function togglePanel(id,dir,barEl){if(activePanelId===id){closeAllPanels();return;}closeAllPanels();const panel=document.getElementById(id);if(!panel)return;panel.classList.remove("top-panel","bot-panel");panel.classList.add(dir==="top"?"top-panel":"bot-panel");panel.classList.add("on");document.getElementById("panelOverlay").classList.add("on");if(barEl)barEl.classList.add("sel");activePanelId=id;if(id==="p-accordo"){setTimeout(function(){acTonic=activeKey;if(typeof acBuildNotes==="function")acBuildNotes();if(typeof acSwitchTab==="function")acSwitchTab(typeof acCurrentTab!=="undefined"?acCurrentTab:"all");},30);}if(id==="p-analisi")updateAnalisi();if(id==="p-giri")renderSeqSlots();if(id==="p-genera")renderGenSlots();}
function closeAllPanels(){document.querySelectorAll(".panel").forEach(p=>p.classList.remove("on"));document.getElementById("panelOverlay").classList.remove("on");document.querySelectorAll(".bar-item").forEach(b=>b.classList.remove("sel"));activePanelId=null;}
function selPP(el){el.closest("div").querySelectorAll(".pp").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");}

// ── INIT ──────────────────────────────────────────────────────────
// Compatibility maps — must be declared before init calls



var acTonic = "La";

var acQueue = [];  // must be before init



var curStile = 'standard';
var curTipoProg = 'base4';
var curFretPos = 'all';
var noKeyMode = false;
var mainProg = [];
var mainProgStep = 0;
var mainProgLoopActive = false;
var selGiroId = '';
var degSequence = [];  // for builder tab
var gCurrentTab = 1;
var dragProgIdx = -1;

// Chord lookup: find best chord for a degree in activeKey
function degToChord(deg) {
  var sc = SCALES[activeKey] || [];
  if (!sc.length) return null;
  var noteChrom = sc[deg]; if (noteChrom === undefined) return null;
  var CHNAMES = ['Do','Do#','Re','Mi♭','Mi','Fa','Fa#','Sol','La♭','La','Si♭','Si'];
  var noteName = CHNAMES[noteChrom]; if (!noteName) return null;
  var targetQual = DEGREE_QUAL[deg] || 'Maggiore';
  var all = Object.keys(CHORDS);
  // 1. exact note + qual
  for (var i=0;i<all.length;i++){
    var ch=CHORDS[all[i]];
    if (ch&&ch.notes&&ch.notes[0]===noteName&&ch.qual===targetQual){
      if (matchFretPos(all[i])) return all[i];
    }
  }
  // 2. any chord with that root note
  for (var i=0;i<all.length;i++){
    var ch=CHORDS[all[i]];
    if (ch&&ch.notes&&ch.notes[0]===noteName) return all[i];
  }
  return null;
}

// Fret position filter
function matchFretPos(chKey) {
  if (curFretPos==='all') return true;
  var ch = CHORDS[chKey]; if (!ch) return false;
  var active = ch.frets.filter(function(f){return f>0;});
  var minF = active.length ? Math.min.apply(null,active) : 0;
  if (curFretPos==='open')  return ch.frets.some(function(f){return f===0;}) && minF<=4;
  if (curFretPos==='low')   return minF<=5;
  if (curFretPos==='mid')   return minF>=4&&minF<=9;
  if (curFretPos==='high')  return minF>=8;
  if (curFretPos==='mix')   return true;
  return true;
}

function bestChordForDeg(deg) {
  // Use AC_MINOR (chromatic semitone offsets) not SCALES (NQ circle indices)
  var kc = AC_NC[activeKey]; if (kc===undefined) return null;
  var sc = AC_MINOR.map(function(o){return(kc+o)%12;});
  var noteChrom = sc[deg]; if (noteChrom===undefined) return null;
  var CHNAMES=['Do','Do#','Re','Mi♭','Mi','Fa','Fa#','Sol','La♭','La','Si♭','Si'];
  var noteName = CHNAMES[noteChrom]; if (!noteName) return null;
  var targetQual = DEGREE_QUAL[deg]||'Maggiore';
  var all = Object.keys(CHORDS);
  // prefer position-matched
  var matched = all.filter(function(k){
    var ch=CHORDS[k];
    return ch&&ch.notes&&ch.notes[0]===noteName&&ch.qual===targetQual&&matchFretPos(k);
  });
  if (matched.length) return curFretPos==='mix'
    ? matched[Math.floor(Math.random()*matched.length)] : matched[0];
  // fallback: any with note
  var any = all.filter(function(k){var ch=CHORDS[k];return ch&&ch.notes&&ch.notes[0]===noteName;});
  return any.length ? any[0] : null;
}

// Build progression from degrees array
function buildProgFromDegs(degs) {
  // Write directly to acQueue so renderUnified shows results
  acQueue = [];
  degs.forEach(function(d){
    var k = bestChordForDeg(d); if (k) acQueue.push(k);
  });
  mainProg = acQueue.slice();
  mainProgStep = 0;
  renderUnified();
  acRenderQ();
  renderGiroSlots();
}

// Tipo prog
function setTipoProg(el) {
  document.querySelectorAll('#tipoProgRow .fpill').forEach(function(p){p.classList.remove('on');});
  el.classList.add('on');
  curTipoProg = el.dataset.tp;
}
function buildTipoProg() {
  var tp = TIPO_PROGS[curTipoProg]; if (!tp) return;
  var stile = STILI[curStile];
  var degs = tp.degs;
  if (!degs || curTipoProg==='random') {
    // random from stile override or scale degrees
    var pool = (stile&&stile.degOverride) ? stile.degOverride : [0,1,2,3,4,5,6];
    degs = [];
    for (var i=0;i<6;i++) degs.push(pool[Math.floor(Math.random()*pool.length)]);
  } else if (stile && stile.degOverride) {
    // blend stile
    degs = degs.map(function(d){ return stile.degOverride[Math.floor(Math.random()*stile.degOverride.length)]||d; });
  }
  buildProgFromDegs(degs);
  renderGenSlots();
  closeAllPanels();
}

// Stile
function setStile(el) {
  document.querySelectorAll('#stileRow .fpill').forEach(function(p){p.classList.remove('on');});
  el.classList.add('on');
  curStile = el.dataset.stile;
}

// Fret position
function setFretPos(pos, el) {
  curFretPos = pos;
  document.querySelectorAll('[data-pos]').forEach(function(p){p.classList.toggle('on',p.dataset.pos===pos);});
  // rebuild current prog if active
  if (mainProg.length && selGiroId) {
    var g=GIRI.find(function(x){return x.id===selGiroId;});
    if (g) buildProgFromDegs(g.degs);
  }
  acBuildChords();
}

// No-key mode
function toggleNoKeyMode() {
  noKeyMode = !noKeyMode;
  var btn = document.getElementById('noKeyBtn');
  if (btn) {
    btn.innerHTML = noKeyMode ? '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="display:inline-block;vertical-align:middle"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.1"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1"/><circle cx="7" cy="7" r=".8" fill="currentColor"/></svg>' : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="display:inline-block;vertical-align:middle"><circle cx="5.5" cy="6" r="3" stroke="currentColor" stroke-width="1.1"/><line x1="7.5" y1="7.5" x2="12.5" y2="7.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><line x1="10.5" y1="7.5" x2="10.5" y2="9.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>';
    btn.style.color = noKeyMode ? '#FF9900' : 'rgba(255,255,255,.4)';
    btn.style.borderColor = noKeyMode ? 'rgba(255,153,0,.4)' : 'rgba(255,255,255,.12)';
  }
  var kd = document.getElementById('keyDisp');
  if (kd) kd.style.opacity = noKeyMode ? '.3' : '1';
  acBuildChords();
}

// Main prog loop toggle
function toggleMainProgLoop() {
  mainProgLoopActive = !mainProgLoopActive;
  ['mpLoopBtn','gLoopBtn','gLoopBtn2'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.textContent = mainProgLoopActive ? '■ Stop' : '▶ Loop';
  });
  if (mainProgLoopActive && !playing) startM();
  else if (!mainProgLoopActive && playing) stopM();
}

function clearMainProg() {
  mainProg=[]; mainProgStep=0; mainProgLoopActive=false; selGiroId='';
  ['mpLoopBtn','gLoopBtn','gLoopBtn2'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent='▶ Loop';
  });
  renderMainProg();
}

// renderMainProg → delegate to unified (mainProg is now acQueue)
function renderMainProg() {
  mainProg = acQueue.map(function(k) { return k; }); // sync
  renderUnified();
  var dummy = document.getElementById('mainProgSlots'); // keep for compat
  if(!dummy) return;
}

function removeFromMainProg(i){mainProg.splice(i,1);renderMainProg();}

// Render giro slots (inside p-giri panel)
function renderGiroSlots(){
  var sl=document.getElementById('giroSlots'); if(!sl) return;
  if(!mainProg.length){sl.innerHTML='<div style="font-size:10px;color:rgba(255,255,255,.2);padding:8px 0">Seleziona un giro sopra</div>';return;}
  sl.innerHTML='';
  mainProg.forEach(function(k,i){
    var ch=CHORDS[k]; if(!ch) return;
    var col=COLORS[NOTES.indexOf(ch.notes&&ch.notes[0])]||'#38B0FF';
    var el=document.createElement('div');
    el.style.cssText='flex-shrink:0;padding:3px 5px;border-radius:6px;border:.5px solid '+col+'44;'
      +'background:'+col+'12;cursor:pointer;text-align:center;min-width:34px;';
    el.innerHTML='<div style="font-size:8px;font-weight:500;color:'+col+'">'+ch.name+'</div>'
      +'<div style="font-size:7px;color:rgba(255,255,255,.3)">'+(i+1)+'</div>';
    el.addEventListener('click',function(){updateFretboard(k);currentChordKey=k;});
    sl.appendChild(el);
  });
}

// Giro panel carousel
function renderGiroCarousel(){
  var car=document.getElementById('giroCarousel'); if(!car) return;
  car.innerHTML="";
  GIRI.forEach(function(g){
    var el=document.createElement("div");
    el.className="giro-card"+(g.id===selGiroId?" sel":"");
    var svg=GIRI_SVG[g.id]||"";
    el.innerHTML='<div style="opacity:.65;margin-bottom:3px;color:rgba(255,255,255,.8)">'+svg+'</div>'
      +"<div class='giro-name'>"+g.name+"</div>"
      +"<div class='giro-genre'>"+g.genre+"</div>"
      +"<div class='giro-degs'>"
      +g.degs.slice(0,6).map(function(d,i){
        return "<span class='giro-deg"+(i===0?" root":"")+"'>" + DEGREE_ROMAN[d] + "</span>";
      }).join("")+(g.degs.length>6?"<span class='giro-deg'>…</span>":"")
      +"</div>";
    el.addEventListener("click",function(){
      selGiroId=g.id;
      var lbl=document.getElementById("giroActiveLbl"); if(lbl) lbl.textContent=g.name;
      var gl=document.getElementById("giroGradLbl"); if(gl) gl.textContent="· "+g.name;
      acQueue=[];               // overwrite
      buildProgFromDegs(g.degs);
      renderGiroCarousel();
    });
    car.appendChild(el);
  });
}

// Presets panel
var PRESETS = [
  {name:'II–V–I',         genre:'Jazz Standard',   degs:[1,4,0,0]},
  {name:'I–V–vi–IV',      genre:'Pop / Rock',       degs:[0,4,5,3]},
  {name:'i–VI–III–VII',   genre:'Epica / Orchestrale',degs:[0,5,2,6]},
  {name:'I–6–2–5',        genre:'Jazz Swing',       degs:[0,5,1,4]},
  {name:'i–VII–VI–VII',   genre:'Dark / Metal',     degs:[0,6,5,6]},
  {name:'I–IV–V',         genre:'Blues / Rock',     degs:[0,3,4,0]},
  {name:'6–4–1–5',        genre:'Pop Emotivo',      degs:[5,3,0,4]},
  {name:'Canon',          genre:'Classica',         degs:[0,4,5,2,3,0,3,4]},
  {name:'Ballad 1–3–6–4', genre:'Ballata',          degs:[0,2,5,3]},
  {name:'Circle 5ª',      genre:'Jazz Modale',      degs:[0,4,1,5,2,6,3,0]},
  {name:'Andalusa',       genre:'Flamenco',         degs:[5,6,4,0]},
  {name:'Modal Drone',    genre:'Jazz Modale',      degs:[0,0,6,6,0,0,5,5]},
];

function renderPresetList(){
  var el=document.getElementById('gPresetList'); if(!el) return;
  el.innerHTML='';
  PRESETS.forEach(function(p,pi){
    var row=document.createElement('div');
    row.className='preset-row-item';
    row.innerHTML='<div style="flex:1">'
      +'<div class="preset-name">'+p.name+'</div>'
      +'<div class="preset-genre">'+p.genre+'</div>'
      +'</div>'
      +'<div class="preset-degs">'
      +p.degs.slice(0,5).map(function(d){return '<span class="giro-deg">'+DEGREE_ROMAN[d]+'</span>';}).join('')
      +(p.degs.length>5?'<span class="giro-deg">…</span>':'')
      +'</div>';
    row.addEventListener('click',function(){
      el.querySelectorAll('.preset-row-item').forEach(function(r){r.classList.remove('active');});
      row.classList.add('active');
      buildProgFromDegs(p.degs);
    });
    el.appendChild(row);
  });
}

// Giro tab switching
function gSwitchTab(n){
  gCurrentTab=n;
  [1,2,3].forEach(function(i){
    var btn=document.getElementById('gTab'+i);
    var body=document.getElementById('gTabBody'+i);
    if(btn) btn.classList.toggle('on',i===n);
    if(body) body.style.display=(i===n?'block':'none');
  });
  if(n===1) renderGiroCarousel();
  if(n===3) renderPresetList();
}

// Degree builder
function gToggleDeg(d){
  degSequence.push(d);
  renderDegSeq();
}
function gClearDegs(){degSequence=[];renderDegSeq();}
function renderDegSeq(){
  var el=document.getElementById('degSeq'); if(!el) return;
  if(!degSequence.length){
    el.innerHTML='<div style="font-size:10px;color:rgba(255,255,255,.2)">Tap sui gradi sopra →</div>';
    return;
  }
  el.innerHTML=degSequence.map(function(d,i){
    return '<div style="flex-shrink:0;padding:3px 8px;border-radius:7px;border:.5px solid var(--b2);'
      +'background:rgba(30,107,255,.09);font-size:11px;font-weight:500;color:#38B0FF;cursor:pointer"'
      +' onclick="degSequence.splice('+i+',1);renderDegSeq()">'+DEGREE_ROMAN[d]+'</div>';
  }).join('');
}
function gBuildFromDegs(){
  if(!degSequence.length)return;
  buildProgFromDegs(degSequence);
}

// ── UNIFIED ACCORDI + PROGRESSIONE ────────────────────────────────────────
// acQueue IS the progressione. One list, drag-reorderable, plays with metronome.
var uDragIdx = -1;

function renderUnified() {
  var zone = document.getElementById('unifiedZone');
  var slots = document.getElementById('mainProgSlots');
  var cnt   = document.getElementById('uZoneCnt');
  var klbl  = document.getElementById('uZoneKey');
  if (!zone || !slots) return;

  if (klbl) klbl.textContent = ' · ' + (acTonic || activeKey);
  if (cnt)  cnt.textContent = '(' + acQueue.length + ')';
  updateUZoneCnt();
  zone.style.display = acQueue.length ? '' : 'none';
  // Compact cronologia when sequenza is active
  // Collapse cronologia when sequenza active
  var _hs = document.getElementById('histScroll');
  var _hw = document.querySelector('.hist-head');
  if(acQueue.length){
    if(_hs){ _hs.style.height='40px'; _hs.style.marginBottom='0'; }
    if(_hw){ _hw.style.display='none'; }
  } else {
    if(_hs){ _hs.style.height='62px'; _hs.style.marginBottom=''; }
    if(_hw){ _hw.style.display=''; }
  }

  // Also update mainProgCnt if referenced elsewhere
  var mc = document.getElementById('mainProgCnt');
  if (mc) mc.textContent = '(' + acQueue.length + ')';

  slots.innerHTML = '';
  // mainProgStep already incremented → use -1 to get current chord index
  var beat = mainProgLoopActive ? (mainProgStep - 1) % Math.max(acQueue.length, 1) : -1;

  acQueue.forEach(function(k, i) {
    var ch = CHORDS[k]; if (!ch) return;
    var c   = acCmp(k);
    var col = COLORS[NOTES.indexOf(ch.notes && ch.notes[0])] || '#38B0FF';
    var border = c===2 ? '#18CC66' : c===1 ? 'rgba(255,153,0,.5)' : col + '44';
    var isActive = (i === beat);

    var el = document.createElement('div');
    // no class needed — all style is inline
    el.draggable = true;
    el.dataset.idx = i;
    // Card stile E v5: 50×50, barra sinistra, × top-right, barFlash attivo
    el.style.cssText =
      'flex-shrink:0;width:50px;height:50px;display:flex;align-items:stretch;'
    + 'border-radius:9px;overflow:visible;cursor:pointer;position:relative;transition:border-color .2s;'
    + 'border:.5px solid ' + (isActive ? col : 'rgba(255,255,255,.1)') + ';'
    + (isActive ? 'box-shadow:0 0 10px 1px '+col+'44;' : '');

    el.innerHTML =
      // × button top-right
      '<div onclick="event.stopPropagation();acDelFromQ('+i+')" style="position:absolute;top:-5px;right:-5px;'
    + 'width:16px;height:16px;border-radius:50%;background:#1a1a1a;border:.5px solid rgba(255,255,255,.18);'
    + 'display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,.4);'
    + 'cursor:pointer;z-index:2">×</div>'
      // left bar
    + '<div style="width:3px;--bc:'+col+';background:'+col+';flex-shrink:0;border-radius:9px 0 0 9px;'
    + (isActive ? 'animation:barFlash 1.6s ease-in-out infinite;' : 'opacity:.65;') + '"></div>'
      // text
    + '<div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 7px;gap:2px;">'
    + '<div style="font-size:12px;font-weight:400;color:#fff;white-space:nowrap;line-height:1.1">' + ch.name + '</div>'
    + '<div style="font-size:6.5px;color:rgba(255,255,255,.38)">' + (ch.qual||'') + '</div>'
    + '</div>';

    // Click = play
    el.addEventListener('click', function() {
      currentChordKey = k; updateFretboard(k);
    });

    // Desktop drag
    el.addEventListener('dragstart', function(e) {
      uDragIdx = i;
      setTimeout(function() { el.style.opacity = '.4'; }, 0);
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', function() {
      el.style.opacity = '1';
      slots.querySelectorAll('.prog-slot').forEach(function(s) { s.classList.remove('drag-over-slot'); });
    });
    el.addEventListener('dragover', function(e) {
      e.preventDefault(); el.classList.add('drag-over-slot');
    });
    el.addEventListener('dragleave', function() { el.classList.remove('drag-over-slot'); });
    el.addEventListener('drop', function(e) {
      e.preventDefault(); el.classList.remove('drag-over-slot');
      var to = +el.dataset.idx;
      if (uDragIdx < 0 || uDragIdx === to) return;
      var item = acQueue.splice(uDragIdx, 1)[0];
      acQueue.splice(to, 0, item);
      uDragIdx = -1; renderUnified();
    });

    // iOS touch drag
    var _tx = 0, _ty = 0, _clone = null;
    el.addEventListener('touchstart', function(e) {
      uDragIdx = i; _tx = e.touches[0].clientX; _ty = e.touches[0].clientY;
      _clone = el.cloneNode(true);
      _clone.style.cssText = 'position:fixed;opacity:.55;pointer-events:none;z-index:9999;'
        + 'left:' + (_tx - 31) + 'px;top:' + (_ty - 31) + 'px;width:62px;height:62px;';
      document.body.appendChild(_clone);
      el.style.opacity = '.4';
    }, {passive: true});
    el.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      if (_clone) { _clone.style.left = (cx-31) + 'px'; _clone.style.top = (cy-31) + 'px'; }
      var t = document.elementFromPoint(cx, cy);
      var target = t && t.closest('.prog-slot[data-idx]');
      slots.querySelectorAll('.prog-slot').forEach(function(s) { s.classList.remove('drag-over-slot'); });
      if (target && target !== el) target.classList.add('drag-over-slot');
    }, {passive: false});
    el.addEventListener('touchend', function(e) {
      if (_clone) { _clone.remove(); _clone = null; }
      el.style.opacity = '1';
      var cx = e.changedTouches[0].clientX, cy = e.changedTouches[0].clientY;
      var t = document.elementFromPoint(cx, cy);
      var target = t && t.closest('.prog-slot[data-idx]');
      slots.querySelectorAll('.prog-slot').forEach(function(s) { s.classList.remove('drag-over-slot'); });
      if (target && +target.dataset.idx !== uDragIdx) {
        var item = acQueue.splice(uDragIdx, 1)[0];
        acQueue.splice(+target.dataset.idx, 0, item);
      }
      uDragIdx = -1; renderUnified();
    }, {passive: true});

    slots.appendChild(el);
  });

  // Add button
  if (acQueue.length < 12) {
    var add = document.createElement('div');
    add.style.cssText = 'flex-shrink:0;min-width:46px;height:62px;border:.5px dashed rgba(255,255,255,.18);'
      + 'border-radius:10px;display:flex;align-items:center;justify-content:center;'
      + 'font-size:22px;font-weight:200;color:rgba(255,255,255,.2);cursor:pointer;';
    add.textContent = '+';
    add.title = 'Apri pannello accordi per aggiungere';
    add.addEventListener('click', function() {
      togglePanel('p-accordo','bot',null);
    });
    slots.appendChild(add);
  }
}

function acDelFromQ(i) { acQueue.splice(i, 1); acRenderQ(); }

// Override acRenderQ to also render unified zone
var _origAcRenderQ = acRenderQ;
acRenderQ = function() {
  _origAcRenderQ.apply(this, arguments);
  renderUnified();
};

// Override clearMainProg to use acQueue
clearMainProg = function() {
  acQueue = []; mainProgLoopActive = false; mainProgStep = 0;
  ['mpLoopBtn','gLoopBtn','gLoopBtn2'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.textContent = '▶ Loop';
  });
  acRenderQ();
};

// Override onBeat to advance main prog
var _origOnBeat = onBeat;
onBeat = function(){
  _origOnBeat.apply(this,arguments);
  // Count beats for beatsPerAccord
  beatCount = (typeof beatCount !== 'undefined') ? beatCount+1 : 1;
  var bpa = (typeof beatsPerAccord !== 'undefined') ? beatsPerAccord : 4;
  var chordTick = (beatCount % bpa === 1) || bpa===1;

  if(mainProgLoopActive && acQueue.length){
    if(chordTick){
      var k = acQueue[mainProgStep % acQueue.length];
      mainProgStep++;
      if(k){
        updateFretboard(k); currentChordKey = k;
        var ch = CHORDS[k];
        if(ch && ch.notes && ch.notes[0]){
          var ni = NOTES.indexOf(ch.notes[0]);
          if(ni >= 0){
            activeIdx = ni; activeKey = NOTES[ni];
            document.querySelectorAll('.r1s').forEach(function(seg,i){
              var bo = parseFloat(seg.getAttribute('data-bop')||'0.16');
              seg.setAttribute('opacity', i===ni ? '0.88' : bo);
            });
            var _kd = document.getElementById('keyDisp');
            if(_kd) {
              // In sequenza mode show chord name, not tonality
              _kd.textContent = ch.name.toUpperCase();
              _kd.style.color = COLORS[ni]||'#38B0FF';
            }
          }
        }
      }
      renderUnified();
    }
  } else if(randMode && chordTick){
    // Anti-repeat random mode
    var rk = getNextRandChord();
    if(rk){
      updateFretboard(rk);
      currentChordKey = rk;
      // Update circle to follow chord root
      var rch = CHORDS[rk];
      if(rch && rch.notes && rch.notes[0]){
        var rni = NOTES.indexOf(rch.notes[0]);
        if(rni >= 0){
          activeIdx = rni;
          document.querySelectorAll('.r1s').forEach(function(seg,i){
            // Reset data-bop: only active note gets 0.88
            var newBop = i===rni ? '0.88' : '0.16';
            seg.setAttribute('data-bop', newBop);
            seg.setAttribute('opacity', newBop);
          });
        }
      }
      // Add to history
      addHist(rch && rch.notes ? (rch.notes[0]||'') : '', rch ? (rch.qual||'') : '');
    }
  }
};

// Override acForTonic to apply fret position filter
var _origAcForTonic = acForTonic;
acForTonic = function(t){
  var all=_origAcForTonic(t);
  if(curFretPos==='all') return all;
  var f=all.filter(matchFretPos);
  return f.length?f:all;
};

// Override acCmp for no-key mode (wraps the already-fixed acCmp)
var _origAcCmpNK = acCmp;
acCmp = function(k) {
  if (noKeyMode) return 0;
  return _origAcCmpNK(k);
};

// Override togglePanel to init giri panel
var _tpGiri=togglePanel;
togglePanel=function(id,dir,barEl){
  _tpGiri(id,dir,barEl);
  if(id==='p-giri'){
    setTimeout(function(){
      gSwitchTab(gCurrentTab);
    },100);
  }
};



// ── Rand quality state ─────────────────────────────────────
var randQual = { maj:'Maggiore', min:'Minore', mix:'mix' };

function toggleDropdown(id){
  // close all other dropdowns first
  ['majDrop','minDrop','mixDrop'].forEach(function(did){
    if(did!==id){ var d=document.getElementById(did); if(d) d.style.display='none'; }
  });
  var el=document.getElementById(id);
  if(el) el.style.display = el.style.display==='block' ? 'none' : 'block';
}
// Close dropdowns when clicking outside
document.addEventListener('click', function(e){
  if(!e.target.closest('#majTypeBtn,#minTypeBtn,#mixTypeBtn,#majDrop,#minDrop,#mixDrop')){
    ['majDrop','minDrop','mixDrop'].forEach(function(id){
      var d=document.getElementById(id); if(d) d.style.display='none';
    });
  }
});

function setRandType(grp, el){
  var drop = grp==='maj'?'majDrop':grp==='min'?'minDrop':'mixDrop';
  var lbl  = grp==='maj'?'majTypeLbl':grp==='min'?'minTypeLbl':'mixTypeLbl';
  document.querySelectorAll('#'+drop+' .ddopt').forEach(function(o){o.classList.remove('on');});
  el.classList.add('on');
  randQual[grp] = el.dataset.v;
  var l=document.getElementById(lbl); if(l) l.textContent=el.textContent;
  document.getElementById(drop).style.display='none';
}

// Build pool of chord keys for random mode based on current filters
function getRandPool(){
  var all = Object.keys(CHORDS);
  var pool = [];
  // Qual filters
  var QUAL_MAP = {
    'Maggiore':  ['Maggiore'],
    'Magg. 7ª':  ['Magg. 7ª'],
    'Dom. 7ª':   ['Dom. 7ª'],
    'Power 5ª':  ['Power 5ª'],
    'Minore':    ['Minore'],
    'Min. 7ª':   ['Min. 7ª'],
    // mix types
    'mix':       ['Maggiore','Minore'],
    'minmaj':    ['Maggiore','Minore'],
    '7mm':       ['Magg. 7ª','Min. 7ª'],
    'normmm':    ['Maggiore','Minore'],
    'totale':    ['Maggiore','Minore','Magg. 7ª','Min. 7ª'],
    '5th':       ['Power 5ª'],
    '7th5th':    ['Magg. 7ª','Min. 7ª','Power 5ª'],
    'majfull':   ['Maggiore','Magg. 7ª','Power 5ª'],
    'minfull':   ['Minore','Min. 7ª','Power 5ª'],
  };
  // Determine active quals
  var quals = [];
  ['maj','min','mix'].forEach(function(grp){
    var v = randQual[grp];
    var q = QUAL_MAP[v]||[];
    quals = quals.concat(q);
  });
  // Remove duplicates
  quals = quals.filter(function(v,i,a){return a.indexOf(v)===i;});

  all.forEach(function(k){
    var ch=CHORDS[k]; if(!ch) return;
    if(quals.indexOf(ch.qual)>=0 && matchFretPos(k)) pool.push(k);
  });
  return pool.length ? pool : all.filter(function(k){return !!CHORDS[k];});
}

var randMode = false;
var curTheme = 'dark';
var curFontSize = 'normal';

// Play btn: se c'è progressione, avanza loop; altrimenti start/stop metro
function onPlayBtn(){
  if(acQueue.length){
    toggleMainProgLoop();
    var pb=document.getElementById('pBtn');
    if(pb) pb.textContent = mainProgLoopActive ? '■' : '▶';
  } else {
    // randMode or empty queue: simple start/stop
    togglePlay();
    if(!playing) { beatCount=0; progStep=0; }
  }
}

// Random chord mode
function toggleRandMode(){
  randMode = !randMode;
  // Show cronologia only in randMode
  var _hw=document.querySelector('.hist-wrap');
  if(_hw) _hw.style.display = randMode ? '' : 'none';
  var _kd=document.getElementById("keyDisp");
  if(_kd){
    if(randMode){
      _kd.textContent="";  // hide tonality when random
    } else {
      // restore
      _kd.textContent=(activeKey+(tonMode==="maj"?" MAJ":" MIN")).toUpperCase();
      _kd.style.color=COLORS[activeIdx]||"#38B0FF";
    }
  }
  var t=document.getElementById('randThumb');
  var bg=document.getElementById('randToggle');
  if(t){ t.style.left = randMode ? '19px':'2px'; t.style.background = randMode?'#38B0FF':'rgba(255,255,255,.4)'; }
  if(bg){ bg.style.background = randMode?'rgba(30,107,255,.25)':'rgba(255,255,255,.1)'; bg.style.borderColor=randMode?'#1E6BFF':'rgba(255,255,255,.2)'; }
}

// Theme system
var THEMES = {
  dark:     {bg:'#000000', surface:'#111', text:'#ffffff', textSub:'rgba(255,255,255,.4)', border:'rgba(255,255,255,.1)'},
  light:    {bg:'#f0f0f0', surface:'#e8e8e8', text:'#111111', textSub:'rgba(0,0,0,.55)', border:'rgba(0,0,0,.15)'},
  gray:     {bg:'#1a1a1a', surface:'#2a2a2a', text:'#ffffff', textSub:'rgba(255,255,255,.45)', border:'rgba(255,255,255,.12)'},
  gradient: {bg:'linear-gradient(135deg,#050510 0%,#0a0520 100%)', surface:'rgba(30,107,255,.08)', text:'#ffffff', textSub:'rgba(255,255,255,.4)', border:'rgba(30,107,255,.2)'},
};
function setTheme(el){
  document.querySelectorAll('[data-theme]').forEach(function(p){p.classList.remove('on');});
  el.classList.add('on');
  curTheme = el.dataset.theme;
  var t = THEMES[curTheme]||THEMES.dark;
  var r = document.documentElement;
  r.style.setProperty('--theme-bg', t.bg);
  r.style.setProperty('--theme-surf', t.surface);
  r.style.setProperty('--theme-text', t.text);
  r.style.setProperty('--theme-sub', t.textSub);
  r.style.setProperty('--theme-border', t.border);
  // Apply globally
  document.body.style.background = t.bg;
  document.body.style.color = t.text;
  document.querySelectorAll(
    '.screen,.topbar,.botbar,.panel,.scroll-center,.sgi,.fpill,.accard,.giro-card,.preset-row-item'
  ).forEach(function(el2){
    if(el2.classList.contains('fpill')) return; // handled by CSS var
    el2.style.background = (curTheme==='gradient'&&el2.classList.contains('scroll-center')) ? '' : t.bg;
    el2.style.color = t.text;
  });
  // Force text contrast on labels
  document.querySelectorAll('.p-title,.srow-l,.bi-label').forEach(function(el2){
    el2.style.color = curTheme==='light' ? '#111' : '';
  });
}
function setFontSize(el){
  document.querySelectorAll('[data-fsize]').forEach(function(p){p.classList.remove('on');});
  el.classList.add('on');
  curFontSize = el.dataset.fsize;
  var scale = curFontSize==='large' ? '110%' : curFontSize==='xlarge' ? '125%' : '100%';
  document.documentElement.style.fontSize = scale;
}

// Aggiungi giro corrente in coda (senza sovrascrivere)
function giroAddToQueue(){
  // mainProg ha gli accordi del giro corrente
  mainProg.forEach(function(k){ if(k && !acInQ(k)) acQueue.push(k); });
  // Se vuole accordi duplicati (stesso giro più volte), usa push senza check:
  // mainProg.forEach(function(k){ if(k) acQueue.push(k); });
  renderUnified(); acRenderQ();
}

// ── SEQUENZA state ────────────────────────────────────────────────────
var fretHidden = false;
var beatsPerAccord = 4;   // default 4/4
var beatCount = 0;        // counts beats since last chord change
var randHistory = [];     // anti-repeat: last 3 chord keys used
var posMode = 'near';     // 'near' | 'wide'
var posZone = 'all';      // current zone string
var studioMode = 'accordi'; // current studio mode

// ── updateUZoneCnt ─────────────────────────────────────────────────────
function updateUZoneCnt(){
  var n=document.getElementById('uZoneN');
  if(n) n.textContent=acQueue.length;
}

// ── setBPA — beats per accordo ─────────────────────────────────────────
function setBPA(el){
  document.querySelectorAll('[data-bpa]').forEach(function(p){p.classList.remove('sel');});
  el.classList.add('sel');
  beatsPerAccord = +el.dataset.bpa;
  beatCount = 0;
}

// ── setStudioMode ──────────────────────────────────────────────────────
function setStudioMode(mode, el){
  studioMode = mode;
  el.closest('.sg').querySelectorAll('.sgi').forEach(function(s){s.classList.remove('on');});
  el.classList.add('on');
  // In accordi mode: activate randMode, disable tonality constraint
  if(mode==='accordi'){ 
    if(!randMode){ randMode=true; syncRandToggle(); }
  }
}

// ── setPosMode / setPosZone ────────────────────────────────────────────
function setPosMode(mode, el){
  posMode = mode;
  document.querySelectorAll('[data-posmode]').forEach(function(p){p.classList.remove('on');});
  el.classList.add('on');
  var nearRow=document.getElementById('nearPosRow');
  var wideRow=document.getElementById('widePosRow');
  if(nearRow) nearRow.style.display = mode==='near' ? 'flex' : 'none';
  if(wideRow) wideRow.style.display = mode==='wide' ? 'flex' : 'none';
  posZone='all';
  document.querySelectorAll('[data-zone]').forEach(function(p){p.classList.toggle('on',p.dataset.zone==='all');});
}
function setPosZone(zone, el){
  posZone = zone;
  var row = posMode==='near' ? 'nearPosRow' : 'widePosRow';
  var container = document.getElementById(row);
  if(container) container.querySelectorAll('[data-zone]').forEach(function(p){
    p.classList.toggle('on', p.dataset.zone===zone);
  });
}

// ── matchZone — check if chord fret is in selected zone ────────────────
function matchZone(k){
  if(posZone==='all') return true;
  var ch=CHORDS[k]; if(!ch) return false;
  var af=ch.frets.filter(function(f){return f>0;});
  if(!af.length) return posZone==='0-3'||posZone==='all'||posZone==='1-5';
  var minF=Math.min.apply(null,af), maxF=Math.max.apply(null,af);
  var zones={
    '0-3':  function(){return minF<=3;},
    '4-6':  function(){return minF>=4&&minF<=6;},
    '7-9':  function(){return minF>=7&&minF<=9;},
    '10-12':function(){return minF>=10;},
    '1-5':  function(){return minF>=1&&minF<=5;},
    '5-8':  function(){return minF>=5&&minF<=8;},
    '8-12': function(){return minF>=8;},
  };
  return zones[posZone] ? zones[posZone]() : true;
}

// ── getRandPool override with zone + anti-repeat ───────────────────────
function getRandPoolFull(){
  var all = Object.keys(CHORDS);
  // Quality filter (from randQual)
  var QUAL_MAP = {
    'Maggiore':['Maggiore'],'Magg. 7ª':['Magg. 7\u00aa'],
    'Dom. 7ª':['Dom. 7\u00aa'],'Power 5ª':['Power 5\u00aa'],
    'Minore':['Minore'],'Min. 7ª':['Min. 7\u00aa'],
    'mix':['Maggiore','Minore'],'minmaj':['Maggiore','Minore'],
    '7mm':['Magg. 7\u00aa','Min. 7\u00aa'],'normmm':['Maggiore','Minore'],
    'totale':['Maggiore','Minore','Magg. 7\u00aa','Min. 7\u00aa'],
    '5th':['Power 5\u00aa'],'7th5th':['Magg. 7\u00aa','Min. 7\u00aa','Power 5\u00aa'],
    'majfull':['Maggiore','Magg. 7\u00aa','Power 5\u00aa'],
    'minfull':['Minore','Min. 7\u00aa','Power 5\u00aa'],
  };
  var quals=[];
  if(typeof randQual !== 'undefined'){
    ['maj','min','mix'].forEach(function(grp){
      (QUAL_MAP[randQual[grp]]||[]).forEach(function(q){ if(quals.indexOf(q)<0) quals.push(q); });
    });
  }
  if(!quals.length) quals=['Maggiore','Minore'];
  // In default accordi mode: only natural notes (no # or b)
  var naturalNotes=['Do','Re','Mi','Fa','Sol','La','Si'];
  var pool=all.filter(function(k){
    var ch=CHORDS[k]; if(!ch) return false;
    if(quals.indexOf(ch.qual)<0) return false;
    if(!matchZone(k)) return false;
    // default accordi mode: only natural roots
    if(studioMode==='accordi' && ch.notes && ch.notes[0]){
      if(naturalNotes.indexOf(ch.notes[0])<0) return false;
    }
    return true;
  });
  return pool.length ? pool : all.filter(function(k){return !!CHORDS[k];});
}

// ── getNextRandChord — anti-repeat last 3 ─────────────────────────────
function getNextRandChord(){
  var pool = getRandPoolFull();
  // exclude last 3
  var avail = pool.filter(function(k){ return randHistory.indexOf(k)<0; });
  if(!avail.length) avail = pool; // fallback: use full pool
  var chosen = avail[Math.floor(Math.random()*avail.length)];
  // update history
  randHistory.push(chosen);
  if(randHistory.length>3) randHistory.shift();
  return chosen;
}

// ── toggleFretVisibility ───────────────────────────────────────────────
function toggleFretVisibility(){
  fretHidden = !fretHidden;
  var fw = document.getElementById('fretboardWrap');
  var ob = document.getElementById('occhioBtn');
  var fh = document.getElementById('fretHiddenInfo');
  if(fw) fw.style.display = fretHidden ? 'none' : '';
  if(ob) ob.style.color = fretHidden ? '#38B0FF' : 'rgba(255,255,255,.45)';
  if(!fh){
    fh = document.createElement('div');
    fh.id = 'fretHiddenInfo';
    fh.style.cssText = 'text-align:center;padding:8px 0;font-size:13px;font-weight:300;color:rgba(255,255,255,.35);letter-spacing:.5px;display:none';
    var cs = document.querySelector('.chord-section');
    if(cs) cs.appendChild(fh);
  }
  if(fretHidden){
    var ch=CHORDS[currentChordKey];
    var af=ch?(ch.frets.filter(function(f){return f>0;})):[]; 
    var minF=af.length?Math.min.apply(null,af):0;
    fh.style.display='block';
    fh.textContent = minF>0 ? '( '+minF+'ᵃ tasto )' : '( corde aperte )';
  } else {
    fh.style.display='none';
  }
}

// ── syncRandToggle ─────────────────────────────────────────────────────
function syncRandToggle(){
  var t=document.getElementById('randThumb'),bg=document.getElementById('randToggle');
  if(t){ t.style.left=randMode?'19px':'2px'; t.style.background=randMode?'#38B0FF':'rgba(255,255,255,.4)'; }
  if(bg){ bg.style.background=randMode?'rgba(30,107,255,.25)':'rgba(255,255,255,.1)'; bg.style.borderColor=randMode?'#1E6BFF':'rgba(255,255,255,.2)'; }
}


// Init
setTimeout(function(){
  renderMainProg();
  renderGiroCarousel();
  renderPresetList();
},300);


// ── Accordi panel functions (from backup) ──

// ════════════════════════════════════════════════════════════════════════
// ACCORDO PANEL — native browser scroll, CSS snap, 3-copy infinite loop
// ════════════════════════════════════════════════════════════════════════

// Compatibility: 2=full diatonic, 1=partial (root in scale, wrong quality), 0=none
// Uses proper natural minor scale computed from activeKey chromatic value// Natural minor scale intervals (semitones from root): W H W W H W W// degree: 0=i(min) 1=ii°(dim) 2=III(maj) 3=iv(min) 4=v(min)/V(maj) 5=VI(maj) 6=VII(maj)

// Mini fretboard for chord cards — approved style
function buildFretCard(ch, W, H){
  const frets   = ch.frets;
  const chNotes = ch.notes || [];
  const rootName = chNotes[0] || '';
  const nFrets = 4, nStr = 6, fRatio = 1.6;
  const mL=12, mR=5, mT=28, mB=8;
  const sG = (H - mT - mB) / (nStr-1);
  const fW = sG * fRatio;
  const pH = (nStr-1)*sG, pW = nFrets*fW;
  const svgW = mL+pW+mR;
  const strOrder=[5,4,3,2,1,0];
  const strThick=[.5,.6,.7,.85,1.05,1.3];
  const strAlpha=['.16','.2','.26','.33','.42','.52'];
  const active=frets.filter(f=>f>0);
  const minFr=active.length?Math.min(...active)-1:0;
  const fStart=active.length?Math.min(...active):1;
  const dotX=n=>mL+(n-0.5)*fW;
  const sY=i=>mT+i*sG;
  const CN={0:'Do',1:'Re♭',2:'Re',3:'Mi♭',4:'Mi',5:'Fa',6:'Fa#',7:'Sol',8:'La♭',9:'La',10:'Si♭',11:'Si'};
  const gid='cc'+(rootName||'').replace(/\W/g,'')+(W||0);

  let s=`<svg viewBox="0 0 ${svgW} ${H}" width="${svgW}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#0A22F0"/><stop offset="100%" stop-color="#38B0FF"/>
</linearGradient></defs>`;

  // Fret number top-left, above nut
  s+=`<text x="${mL}" y="${mT-12}" text-anchor="start" font-size="10" font-weight="800"
    fill="rgba(255,255,255,.78)" font-family="-apple-system">${fStart}</text>`;

  // NUT
  s+=`<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${mT+pH}"
    stroke="rgba(255,255,255,.68)" stroke-width="3.2" stroke-linecap="round"/>`;

  // FRETS
  for(let n=1;n<=nFrets;n++)
    s+=`<line x1="${mL+n*fW}" y1="${mT}" x2="${mL+n*fW}" y2="${mT+pH}"
      stroke="rgba(255,255,255,.14)" stroke-width=".6"/>`;

  // STRINGS e(thin)→E(thick)
  for(let i=0;i<nStr;i++){
    const y=sY(i);
    s+=`<line x1="${mL}" y1="${y}" x2="${svgW-mR}" y2="${y}"
      stroke="rgba(255,255,255,${strAlpha[i]})" stroke-width="${strThick[i]}"/>`;
  }

  // DOTS
  for(let di=0;di<nStr;di++){
    const si=strOrder[di], f=frets[si], y=sY(di), sx=mL-7;
    if(f===-1){
      s+=`<text x="${sx}" y="${y+3.5}" text-anchor="middle" font-size="8.5"
        fill="rgba(255,255,255,.22)" font-family="-apple-system">×</text>`;
    } else if(f===0){
      s+=`<circle cx="${sx}" cy="${y}" r="3"
        fill="none" stroke="rgba(255,255,255,.38)" stroke-width=".85"/>`;
    } else {
      const fp=f-minFr;
      if(fp>=1&&fp<=nFrets){
        const cx=dotX(fp), dr=Math.min(sG*.40,fW*.28);
        const chrom=(OPEN_CHROM[si]+f)%12, nn=CN[chrom]||'';
        const isRoot=(nn===rootName);
        const fs=dr*(nn.length>2?.82:1.02);
        if(isRoot){
          s+=`<rect x="${cx-dr*1.12}" y="${y-dr*1.12}" width="${dr*2.24}" height="${dr*2.24}"
            rx="${dr*.3}" fill="url(#${gid})"/>`;
          s+=`<text x="${cx}" y="${y+dr*.36}" text-anchor="middle" dominant-baseline="middle"
            font-size="${fs}" fill="#fff" font-family="-apple-system" font-weight="700">${nn}</text>`;
        } else {
          s+=`<circle cx="${cx}" cy="${y}" r="${dr*1.08}" fill="rgba(255,255,255,.90)"/>`;
          s+=`<text x="${cx}" y="${y+dr*.36}" text-anchor="middle" dominant-baseline="middle"
            font-size="${fs}" fill="rgba(0,0,0,.88)" font-family="-apple-system" font-weight="600">${nn}</text>`;
        }
      }
    }
  }
  s+='</svg>';
  return s;
}

function acCmp(k) {
  var ch = CHORDS[k];
  if (!ch || !ch.notes || !ch.notes[0]) return 0;
  var rootChrom = AC_NC[ch.notes[0]];
  if (rootChrom === undefined) return 0;
  // Get active key chromatic
  var keyChrom = AC_NC[activeKey];
  if (keyChrom === undefined) return 0;
  // Build natural minor scale for activeKey
  var scale = AC_MINOR.map(function(o) { return (keyChrom + o) % 12; });
  // Find if root is in scale
  var deg = scale.indexOf(rootChrom);
  if (deg < 0) return 0;  // not in scale
  // Check quality matches expected for this degree
  var q = ch.qual || '';
  var expected = AC_DEG_QUAL[deg] || [];
  var fullMatch = expected.some(function(e) { return q.indexOf(e) >= 0; });
  return fullMatch ? 2 : 1;  // 2=full, 1=partial (root in scale, unexpected quality)
}

function acForTonic(t) {
  return Object.keys(CHORDS).filter(function(k) {
    var ch = CHORDS[k]; return ch && ch.notes && ch.notes[0] === t;
  });
}


function acInQ(k) { return acQueue.indexOf(k) >= 0; }
function acAddQ(k) { if(k && !acInQ(k)){ acQueue.push(k); acRenderQ(); } }
function acClearQ() { acQueue = []; acRenderQ(); acBuildChords(); }

// ── 3-copy seamless scroll loop ──────────────────────────────────────────
// Works with native scroll: when scrollLeft < totalW*0.3, jump to totalW+scrollLeft (silent)
// Looks invisible because we move by exactly totalW = no visual change
function acLoopScroll(el, totalW) {
  el.addEventListener('scroll', function() {
    if (el._acLooping) return;
    if (el.scrollLeft < totalW * 0.3) {
      el._acLooping = true;
      el.scrollLeft += totalW;
      requestAnimationFrame(function() { el._acLooping = false; });
    } else if (el.scrollLeft >= totalW * 1.7) {
      el._acLooping = true;
      el.scrollLeft -= totalW;
      requestAnimationFrame(function() { el._acLooping = false; });
    }
  }, { passive: true });
}

// ── NOTE WHEEL ───────────────────────────────────────────────────────────
function acBuildNotes() {
  var scroll = document.getElementById('acNscroll');
  var track  = document.getElementById('acNtrack');
  if (!scroll || !track) return;

  var W = scroll.clientWidth || (window.innerWidth - 28);
  var CELL = Math.floor(W / 4);  // 4 pills visible

  document.getElementById('acTlbl').textContent = acTonic;

  var makeNote = function(n, i) {
    var col = COLORS[i]; var on = (n === acTonic);
    var el = document.createElement('div');
    el.className = 'acnpill' + (on ? ' on' : '');
    el.style.width = (CELL - 6) + 'px';
    el.style.margin = '0 3px';
    el.style.borderColor = on ? col : 'rgba(255,255,255,.12)';
    el.style.color       = on ? col : 'rgba(255,255,255,.4)';
    el.style.background  = on ? col + '22' : '#000';
    el.textContent = n;
    el._ni = i;  // note index
    return el;
  };

  // Build 3 copies
  track.innerHTML = '';
  var totalW = 0;
  for (var copy = 0; copy < 3; copy++) {
    NOTES.forEach(function(n, i) {
      var el = makeNote(n, i);
      el.addEventListener('click', function() {
        if (acTonic === NOTES[this._ni]) return;
        acTonic = NOTES[this._ni];
        // Update all pills in-place (no rebuild)
        track.querySelectorAll('.acnpill').forEach(function(p) {
          var ni = p._ni; var on = (NOTES[ni] === acTonic); var col = COLORS[ni];
          p.className = 'acnpill' + (on ? ' on' : '');
          p.style.borderColor = on ? col : 'rgba(255,255,255,.12)';
          p.style.color = on ? col : 'rgba(255,255,255,.4)';
          p.style.background = on ? col + '22' : '#000';
        });
        document.getElementById('acTlbl').textContent = acTonic;
        acBuildChords();
      });
      track.appendChild(el);
    });
    if (copy === 0) totalW = track.scrollWidth;
  }

  // Start at middle copy
  scroll.scrollLeft = totalW;
  scroll._acLooping = false;
  acLoopScroll(scroll, totalW);
}

// ── CHORD WHEEL ──────────────────────────────────────────────────────────
function acBuildChords() {
  var lbl = document.getElementById('acClbl');
  if (lbl) lbl.textContent = 'Accordi \xb7 ' + acTonic;

  var scroll = document.getElementById('acCscroll');
  var track  = document.getElementById('acCtrack');
  if (!scroll || !track) return;

  var W = scroll.clientWidth || (window.innerWidth - 28);
  var CELL = Math.floor((W - 12) / 3);  // 3 cards visible
  var cards = acForTonic(acTonic);
  if (!cards.length) return;

  var makeCard = function(k) {
    var ch = CHORDS[k]; if (!ch) return null;
    // Use acTonic-based compatibility for the chord picker panel
    var _savedKey = activeKey;
    activeKey = acTonic;
    var c = acCmp(k);
    activeKey = _savedKey;
    var inQ = acInQ(k);
    var cls = 'accard' + (c===2?' fc':c===1?' pc':'') + (inQ?' onq':'');
    var fret = buildFretCard(ch, CELL - 8, Math.round((CELL - 8) * 0.72));
    var el = document.createElement('div');
    el.className = cls;
    el.style.width = CELL + 'px';
    el.style.margin = '0 4px';
    el.style.scrollSnapAlign = 'start';
    el.innerHTML =
      '<div class="accard-n">' + ch.name + '</div>'
    + '<div class="accard-q">' + (ch.qual || '') + '</div>'
    + fret;
    el._ck = k;
    el.addEventListener('click', function() {
      var ck = this._ck;
      if (acInQ(ck)) {
        acQueue.splice(acQueue.indexOf(ck), 1);
      } else {
        acQueue.push(ck);
      }
      currentChordKey = ck;
      updateFretboard(ck);
      // update card borders in-place
      track.querySelectorAll('.accard').forEach(function(card) {
        var k2 = card._ck; var c2 = acCmp(k2); var inQ2 = acInQ(k2);
        card.className = 'accard' + (c2===2?' fc':c2===1?' pc':'') + (inQ2?' onq':'');
      });
      acRenderQ();       // updates panel queue strip
      renderUnified();   // updates main page unified zone
    });
    return el;
  };

  track.innerHTML = '';
  var totalW = 0;
  for (var copy = 0; copy < 3; copy++) {
    cards.forEach(function(k) {
      var el = makeCard(k); if (el) track.appendChild(el);
    });
    if (copy === 0) totalW = track.scrollWidth;
  }

  // Start at middle copy
  scroll.scrollLeft = totalW;
  scroll._acLooping = false;
  acLoopScroll(scroll, totalW);
}

// ── QUEUE with drag-to-reorder ──────────────────────────────────────────
var acDragIdx = -1;
function acRenderQ() {
  var scroll = document.getElementById('acQscroll'); if (!scroll) return;
  var cnt   = document.getElementById('acQcnt');
  var empty = document.getElementById('acQempty');
  if (cnt) cnt.textContent = '(' + acQueue.length + ')';
  scroll.querySelectorAll('.acqchip').forEach(function(el) { el.remove(); });
  if (!acQueue.length) { if (empty) empty.style.display='block'; return; }
  if (empty) empty.style.display = 'none';

  acQueue.forEach(function(k, i) {
    var ch = CHORDS[k]; if (!ch) return;
    var c   = acCmp(k);
    var cls = 'acqchip' + (c===2?' fc':c===1?' pc':'');
    var el  = document.createElement('div');
    el.className = cls;
    el.draggable = true;
    el.dataset.idx = i;
    el.innerHTML =
      '<div class="acqchip-idx">' + (i+1) + '</div>'
    + '<div>' + ch.name + '</div>'
    + '<div class="acqchip-qual">' + (ch.qual||'') + '</div>'
    + '<div class="acqrm">\xd7</div>';

    // Select chord
    el.addEventListener('click', function(e) {
      if (e.target.classList.contains('acqrm')) return;
      currentChordKey = k; updateFretboard(k);
    });
    // Remove
    el.querySelector('.acqrm').addEventListener('click', function(e) {
      e.stopPropagation();
      acQueue.splice(i, 1);
      acRenderQ(); acBuildChords();
    });
    // Drag source
    el.addEventListener('dragstart', function(e) {
      acDragIdx = i;
      setTimeout(function() { el.classList.add('dragging'); }, 0);
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', function() {
      el.classList.remove('dragging');
      scroll.querySelectorAll('.acqchip').forEach(function(c2) {
        c2.classList.remove('drag-over');
      });
    });
    // Drag target
    el.addEventListener('dragover', function(e) {
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', function() {
      el.classList.remove('drag-over');
    });
    el.addEventListener('drop', function(e) {
      e.preventDefault();
      el.classList.remove('drag-over');
      var to = +el.dataset.idx;
      if (acDragIdx < 0 || acDragIdx === to) return;
      var item = acQueue.splice(acDragIdx, 1)[0];
      acQueue.splice(to, 0, item);
      acDragIdx = -1;
      acRenderQ(); acBuildChords();
    });

    // Touch drag (for iOS)
    var tx = 0, ty = 0, clone = null;
    el.addEventListener('touchstart', function(e) {
      acDragIdx = i;
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
      clone = el.cloneNode(true);
      clone.style.cssText = 'position:fixed;opacity:.6;pointer-events:none;z-index:999;'
        + 'left:' + (tx - el.offsetWidth/2) + 'px;top:' + (ty - el.offsetHeight/2) + 'px;';
      document.body.appendChild(clone);
      el.classList.add('dragging');
    }, {passive:true});
    el.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      if (clone) { clone.style.left=(cx-el.offsetWidth/2)+'px'; clone.style.top=(cy-el.offsetHeight/2)+'px'; }
      // Highlight target
      var target = document.elementFromPoint(cx, cy);
      var chip = target && target.closest('.acqchip');
      scroll.querySelectorAll('.acqchip').forEach(function(c2) { c2.classList.remove('drag-over'); });
      if (chip && chip !== el) chip.classList.add('drag-over');
    }, {passive:false});
    el.addEventListener('touchend', function(e) {
      if (clone) { clone.remove(); clone=null; }
      el.classList.remove('dragging');
      var cx = e.changedTouches[0].clientX, cy = e.changedTouches[0].clientY;
      var target = document.elementFromPoint(cx, cy);
      var chip = target && target.closest('.acqchip[data-idx]');
      scroll.querySelectorAll('.acqchip').forEach(function(c2) { c2.classList.remove('drag-over'); });
      if (chip && +chip.dataset.idx !== acDragIdx) {
        var item = acQueue.splice(acDragIdx, 1)[0];
        acQueue.splice(+chip.dataset.idx, 0, item);
        acRenderQ(); acBuildChords();
      }
      acDragIdx = -1;
    }, {passive:true});

    scroll.appendChild(el);
  });
}

// ── INIT HOOK ────────────────────────────────────────────────────────────
var _tpOrigAC = togglePanel;
togglePanel = function(id, dir, barEl) {
  _tpOrigAC(id, dir, barEl);
  if (id === 'p-accordo') {
    setTimeout(function() {
      acTonic = activeKey;
      acBuildNotes();
      acBuildChords();
      acRenderQ();
    }, 200);
  }
};


// ════════════════════════════════════════════════════════════════════
// GIRI ARMONICI & FEATURES
// ════════════════════════════════════════════════════════════════════

// Degrees in natural minor scale (chromatic offsets)
// 0=i  1=ii°  2=III  3=iv  4=V  5=VI  6=VII
