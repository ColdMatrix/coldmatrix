/* ==========================================================================
   ColdMatrix Internet Speed Test — Flagship Premium Edition
   Engine: gauge rendering, animation, and network measurement
   ========================================================================== */

const CX = 200, CY = 200, R = 160;
const START_ANGLE = 135;   // degrees, 0 = 3 o'clock, clockwise positive
const SWEEP_ANGLE = 270;
const MAJOR_TICKS = [0,1,5,10,20,50,100,200,500,1000];
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Logarithmic scale: maps a speed value (Mbps) to a 0..1 fraction along the sweep ---
function valueToFraction(v){
  v = Math.max(0, v);
  const f = Math.log10(v+1) / Math.log10(1001);
  return Math.min(1, Math.max(0, f));
}
function angleForFraction(f){ return START_ANGLE + f * SWEEP_ANGLE; }
function polarToXY(angleDeg, radius){
  const rad = angleDeg * Math.PI / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

// --- Build the static gauge face (ticks, labels, track) ---
function buildGaugeFace(){
  const svg = document.getElementById('gaugeSvg');

  const track = document.createElementNS('http://www.w3.org/2000/svg','path');
  track.setAttribute('class','gauge-track');
  track.setAttribute('d', describeArcPath(START_ANGLE, START_ANGLE+SWEEP_ANGLE, R));
  svg.appendChild(track);

  const minorValues = [2,3,4,6,7,8,9,15,25,30,40,60,70,80,90,150,250,300,400,600,700,800,900];
  minorValues.forEach(v=>{
    const f = valueToFraction(v);
    const angle = angleForFraction(f);
    const p1 = polarToXY(angle, R-14);
    const p2 = polarToXY(angle, R-4);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',p1.x); line.setAttribute('y1',p1.y);
    line.setAttribute('x2',p2.x); line.setAttribute('y2',p2.y);
    line.setAttribute('class','gauge-tick-minor');
    line.dataset.value = v;
    svg.appendChild(line);
  });

  MAJOR_TICKS.forEach(v=>{
    const f = valueToFraction(v);
    const angle = angleForFraction(f);
    const p1 = polarToXY(angle, R-20);
    const p2 = polarToXY(angle, R-2);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',p1.x); line.setAttribute('y1',p1.y);
    line.setAttribute('x2',p2.x); line.setAttribute('y2',p2.y);
    line.setAttribute('class','gauge-tick-major');
    svg.appendChild(line);

    const lp = polarToXY(angle, R-36);
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', lp.x); text.setAttribute('y', lp.y);
    text.setAttribute('class','gauge-tick-label');
    text.setAttribute('text-anchor','middle');
    text.setAttribute('dominant-baseline','middle');
    text.textContent = v;
    svg.appendChild(text);
  });

  const arc = document.createElementNS('http://www.w3.org/2000/svg','path');
  arc.setAttribute('id','gaugeArc');
  arc.setAttribute('class','gauge-arc');
  arc.setAttribute('stroke','url(#arcGradient)');
  svg.appendChild(arc);

  const needle = document.createElementNS('http://www.w3.org/2000/svg','g');
  needle.setAttribute('id','gaugeNeedle');
  needle.setAttribute('class','gauge-needle');
  needle.innerHTML = `
    <path d="M ${CX-6} ${CY} L ${CX+R-30} ${CY-5} L ${CX+R-14} ${CY} L ${CX+R-30} ${CY+5} Z" fill="url(#needleGradient)"/>
    <circle cx="${CX}" cy="${CY}" r="10" fill="url(#needleGradient)"/>
  `;
  svg.appendChild(needle);

  setArcProgress(0);
}

function describeArcPath(startDeg, endDeg, radius){
  const p1 = polarToXY(startDeg, radius);
  const p2 = polarToXY(endDeg, radius);
  const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
}

let currentFraction = 0;
function setArcProgress(fraction){
  fraction = Math.min(1, Math.max(0, fraction));
  const endAngle = START_ANGLE + fraction * SWEEP_ANGLE;
  const arc = document.getElementById('gaugeArc');
  if(fraction > 0.002){
    arc.setAttribute('d', describeArcPath(START_ANGLE, endAngle, R));
    arc.style.display = 'block';
  } else {
    arc.style.display = 'none';
  }

  const needle = document.getElementById('gaugeNeedle');
  needle.setAttribute('transform', `rotate(${endAngle - START_ANGLE} ${CX} ${CY})`);

  document.querySelectorAll('.gauge-tick-minor').forEach(t=>{
    const v = parseFloat(t.dataset.value);
    t.classList.toggle('lit', valueToFraction(v) <= fraction);
  });

  currentFraction = fraction;
}

function setNeedleVisible(visible){
  document.getElementById('gaugeNeedle').classList.toggle('hidden', !visible);
}

function animateNumberTo(target, duration=600){
  const el = document.getElementById('gaugeValueNum');
  const start = parseFloat(el.textContent) || 0;
  const startTime = performance.now();
  function step(now){
    const t = Math.min(1, (now-startTime)/duration);
    const eased = 1 - Math.pow(1-t, 3);
    const val = start + (target-start)*eased;
    el.textContent = val.toFixed(1);
    setArcProgress(valueToFraction(val));
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function pulseValue(){
  const el = document.getElementById('gaugeValueNum');
  el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
}

// --- Particle background (lightweight canvas) ---
function initParticles(){
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const count = REDUCED_MOTION ? 0 : 45;
  for(let i=0;i<count;i++){
    particles.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15, r: Math.random()*1.6+0.4 });
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(79,195,247,0.35)';
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=w; if(p.x>w) p.x=0; if(p.y<0) p.y=h; if(p.y>h) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 120){
          ctx.strokeStyle = `rgba(79,195,247,${0.08*(1-dist/120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke();
        }
      }
    }
    if(!REDUCED_MOTION) requestAnimationFrame(draw);
  }
  draw();
}

function renderJitterWave(samples){
  const path = document.getElementById('jitterPath');
  if(!samples || !samples.length){ path.setAttribute('d',''); return; }
  const w = 300, h = 40;
  const max = Math.max(...samples, 1);
  const step = w / (samples.length - 1 || 1);
  let d = '';
  samples.forEach((s,i)=>{
    const x = i*step;
    const y = h - (s/max)*h*0.85 - 4;
    d += (i===0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  });
  path.setAttribute('d', d.trim());
}

// ============================================================
// NETWORK MEASUREMENT (Cloudflare public speed-test endpoints)
// ============================================================
async function fetchServerMeta(){
  try{
    const res = await fetch('https://speed.cloudflare.com/meta', {cache:'no-store'});
    const data = await res.json();
    return { city: data.city || 'Unknown', country: data.country || '', colo: data.colo || '' };
  }catch(e){ return { city:'Global Network', country:'', colo:'' }; }
}

async function testPing(samples=6){
  const times = [];
  for(let i=0;i<samples;i++){
    if(testCancelled) break;
    const t0 = performance.now();
    try{
      currentAbortController = new AbortController();
      await fetch('https://speed.cloudflare.com/__down?bytes=1000&cachebust=' + Math.random(), {cache:'no-store', signal: currentAbortController.signal});
      times.push(performance.now()-t0);
    }catch(e){}
    if(testCancelled) break;
    await new Promise(r=>setTimeout(r,60));
  }
  if(!times.length) return { ping:null, jitter:null, samples:[] };
  const ping = Math.min(...times);
  const avg = times.reduce((a,b)=>a+b,0)/times.length;
  const jitter = Math.sqrt(times.reduce((a,b)=>a+Math.pow(b-avg,2),0)/times.length);
  return { ping, jitter, samples: times };
}

async function testDownload(onProgress){
  const sizeBytes = 24 * 1000 * 1000;
  const t0 = performance.now();
  currentAbortController = new AbortController();
  const res = await fetch('https://speed.cloudflare.com/__down?bytes=' + sizeBytes + '&cachebust=' + Math.random(), {cache:'no-store', signal: currentAbortController.signal});
  const reader = res.body.getReader();
  let received = 0;
  while(true){
    if(testCancelled){ try{ reader.cancel(); }catch(e){} break; }
    const {done, value} = await reader.read();
    if(done) break;
    received += value.length;
    const elapsed = (performance.now()-t0)/1000;
    if(elapsed > 0.05) onProgress((received*8)/elapsed/1e6);
  }
  const total = (performance.now()-t0)/1000;
  return (received*8)/total/1e6;
}

async function testUpload(onProgress){
  return new Promise((resolve)=>{
    const sizeBytes = 8 * 1000 * 1000;
    const data = new Blob([new Uint8Array(sizeBytes)]);
    const xhr = new XMLHttpRequest();
    currentXHR = xhr;
    const t0 = performance.now();
    xhr.open('POST', 'https://speed.cloudflare.com/__up', true);
    xhr.upload.onprogress = function(e){
      const elapsed = (performance.now()-t0)/1000;
      if(elapsed > 0.05 && e.loaded) onProgress((e.loaded*8)/elapsed/1e6);
    };
    xhr.onloadend = function(){ if(!testCancelled) resolve((sizeBytes*8)/((performance.now()-t0)/1000)/1e6); };
    xhr.onerror = function(){ resolve(null); };
    xhr.onabort = function(){ resolve(null); };
    xhr.send(data);
  });
}

// ============================================================
// MAIN TEST FLOW
// ============================================================
let lastResults = null;
let testCancelled = false;
let currentAbortController = null;
let currentXHR = null;

function cancelTest(){
  testCancelled = true;
  if(currentAbortController) currentAbortController.abort();
  if(currentXHR) currentXHR.abort();
  const startBtn = document.getElementById('startBtn');
  startBtn.classList.remove('cancel');
  startBtn.disabled = false;
  startBtn.textContent = 'Test Again';
  document.getElementById('gaugeStatus').textContent = 'Test Cancelled';
  document.getElementById('gaugeUnit').textContent = '';
  setNeedleVisible(false);
  animateNumberTo(0, 0);
}

async function runSpeedTest(){
  testCancelled = false;
  const startBtn = document.getElementById('startBtn');
  startBtn.disabled = false;
  startBtn.textContent = 'Cancel Test';
  startBtn.classList.add('cancel');
  document.getElementById('resultsGrid').classList.remove('show');
  document.getElementById('shareBarWrap').style.display = 'none';
  setNeedleVisible(true);
  animateNumberTo(0, 200);

  fetchServerMeta().then(meta=>{
    document.getElementById('serverCity').textContent = meta.city + (meta.country ? ', ' + meta.country : '');
    document.getElementById('serverColo').textContent = meta.colo ? ('Edge node: ' + meta.colo) : '';
  });

  document.getElementById('gaugeStatus').textContent = 'Testing Ping...';
  const pingResult = await testPing();
  if(testCancelled) return;
  document.getElementById('rPing').textContent = pingResult.ping ? pingResult.ping.toFixed(0) : '—';
  document.getElementById('rJitter').textContent = pingResult.jitter ? pingResult.jitter.toFixed(1) : '—';
  renderJitterWave(pingResult.samples);

  document.getElementById('gaugeStatus').textContent = 'Testing Download...';
  document.getElementById('gaugeUnit').textContent = 'Mbps ↓ Download';
  let down = 0;
  try{ down = await testDownload((mbps)=>{ animateNumberTo(mbps, 120); }); }catch(e){ down = 0; }
  if(testCancelled) return;
  animateNumberTo(down, 300);
  pulseValue();
  document.getElementById('rDown').textContent = down ? down.toFixed(1) : '—';

  await new Promise(r=>setTimeout(r,500));
  if(testCancelled) return;

  document.getElementById('gaugeStatus').textContent = 'Testing Upload...';
  document.getElementById('gaugeUnit').textContent = 'Mbps ↑ Upload';
  animateNumberTo(0, 250);
  await new Promise(r=>setTimeout(r,300));
  if(testCancelled) return;
  let up = null;
  try{ up = await testUpload((mbps)=>{ animateNumberTo(mbps, 120); }); }catch(e){ up = null; }
  if(testCancelled) return;
  if(up){ animateNumberTo(up, 300); pulseValue(); }
  document.getElementById('rUp').textContent = up ? up.toFixed(1) : '—';

  document.getElementById('gaugeStatus').textContent = 'Test Complete';
  document.getElementById('gaugeUnit').textContent = up ? 'Mbps ↑ Upload' : 'Upload unavailable';
  setTimeout(()=> setNeedleVisible(false), REDUCED_MOTION ? 0 : 900);

  document.getElementById('resultsGrid').classList.add('show');
  document.getElementById('shareBarWrap').style.display = 'flex';
  startBtn.classList.remove('cancel');
  startBtn.disabled = false;
  startBtn.textContent = 'Test Again';

  lastResults = { ping: pingResult.ping, jitter: pingResult.jitter, down, up };
  saveHistory(lastResults);
  renderHistory();

  document.getElementById('pvPing').textContent = (pingResult.ping ? pingResult.ping.toFixed(0) : '—') + ' ms';
  document.getElementById('pvDown').textContent = (down ? down.toFixed(1) : '—') + ' Mbps';
  document.getElementById('pvUp').textContent = (up ? up.toFixed(1) : '—') + ' Mbps';
}

// ---------- History (stored locally in this browser only) ----------
function saveHistory(result){
  try{
    const hist = JSON.parse(localStorage.getItem('cm_speedtest_history') || '[]');
    hist.unshift({ ...result, time: new Date().toISOString() });
    localStorage.setItem('cm_speedtest_history', JSON.stringify(hist.slice(0,5)));
  }catch(e){}
}
function renderHistory(){
  let hist = [];
  try{ hist = JSON.parse(localStorage.getItem('cm_speedtest_history') || '[]'); }catch(e){}
  const wrap = document.getElementById('historyList');
  if(!hist.length){ wrap.innerHTML = '<div style="color:var(--muted); font-size:0.85rem;">No previous tests yet on this device.</div>'; return; }
  wrap.innerHTML = hist.map(h=>{
    const d = new Date(h.time);
    return `<div class="history-item">
      <span>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
      <span><strong>${h.down?h.down.toFixed(1):'—'}</strong>↓ / <strong>${h.up?h.up.toFixed(1):'—'}</strong>↑ Mbps, <strong>${h.ping?h.ping.toFixed(0):'—'}</strong>ms</span>
    </div>`;
  }).join('');
}

// ---------- Share / download ----------
async function captureCanvas(){
  const el = document.getElementById('shareCapture');
  el.style.display = 'block';
  const canvas = await html2canvas(el, {backgroundColor:'#ffffff', scale:2});
  el.style.display = 'none';
  return canvas;
}
async function downloadResult(type){
  const canvas = await captureCanvas();
  if(type === 'pdf'){
    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l':'p', unit:'px', format:[canvas.width, canvas.height] });
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('ColdMatrix-Speed-Test.pdf');
  } else {
    const mime = type === 'jpg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = 'ColdMatrix-Speed-Test.' + type;
    link.href = canvas.toDataURL(mime, 0.95);
    link.click();
  }
}
async function shareWhatsApp(){
  const canvas = await captureCanvas();
  canvas.toBlob(async (blob)=>{
    const file = new File([blob], 'ColdMatrix-Speed-Test.png', {type:'image/png'});
    const caption = 'Thank you so much for using and trusting ColdMatrix Tools — your 24/7 business companion.\n📧 contact@coldmatrixtools.com  |  💬 +92 333 3228470';
    if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({ files:[file], title:'My Speed Test', text: caption }); return; }catch(e){}
    }
    const link = document.createElement('a'); link.download='ColdMatrix-Speed-Test.png'; link.href = canvas.toDataURL('image/png'); link.click();
    window.open('https://wa.me/?text=' + encodeURIComponent(caption), '_blank');
  });
}

// ---------- Install prompt ----------
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt = e; const b=document.getElementById('installBarTool'); if(b) b.style.display='block'; });
function installAppTool(){
  if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt.userChoice.then(()=>{ document.getElementById('installBarTool').style.display='none'; }); }
  else { alert('📱 Android: "Add to Home Screen" in Chrome.\niPhone: Share → Add to Home Screen.'); }
}
if('serviceWorker' in navigator){ navigator.serviceWorker.register('/service-worker.js').catch(()=>{}); }

// ---------- Init ----------
window.addEventListener('DOMContentLoaded', ()=>{
  buildGaugeFace();
  initParticles();
  renderHistory();
  document.getElementById('startBtn').addEventListener('click', function(){
    if(this.classList.contains('cancel')){ cancelTest(); }
    else{ runSpeedTest(); }
  });
});
