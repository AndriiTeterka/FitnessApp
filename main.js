const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const confRange = document.getElementById('confRange');
const confVal = document.getElementById('confVal');
const fpsEl = document.getElementById('fps');
const tipsList = document.getElementById('tipsList');
const chipModel = document.getElementById('chipModel');
const screenshotBtn = document.getElementById('screenshotBtn');

let running = false;
let lastTs = performance.now();
let frames = 0;

confRange.addEventListener('input', () => {
  confVal.textContent = Number(confRange.value).toFixed(2);
});

startBtn.addEventListener('click', async () => {
  await startCamera();
  running = true;
  requestAnimationFrame(loop);
});

screenshotBtn.addEventListener('click', () => {
  const off = document.createElement('canvas');
  off.width = video.videoWidth; off.height = video.videoHeight;
  off.getContext('2d').drawImage(video, 0, 0);
  const url = off.toDataURL('image/png');
  const a = document.createElement('a'); a.href = url; a.download = 'fitnessapp_frame.png'; a.click();
});

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
  video.srcObject = stream;
  await video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

function drawKeypointsAndSkeleton(kp, thr) {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const pairs = [
    [5,7],[7,9],[6,8],[8,10],[11,13],[13,15],[12,14],[14,16],[5,6],[11,12],[5,11],[6,12]
  ];
  ctx.fillStyle = '#66e0a3';
  for (let i = 0; i < kp.length; i++) {
    const [y,x,s] = kp[i];
    if (s < thr) continue;
    ctx.beginPath();
    ctx.arc(x*w, y*h, 5, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.strokeStyle = '#7aa7ff';
  ctx.lineWidth = 3;
  for (const [a,b] of pairs) {
    if (kp[a][2] < thr || kp[b][2] < thr) continue;
    ctx.beginPath();
    ctx.moveTo(kp[a][1]*w, kp[a][0]*h);
    ctx.lineTo(kp[b][1]*w, kp[b][0]*h);
    ctx.stroke();
  }
}

function setTips(kp, thr) {
  tipsList.innerHTML = '';
  const add = (t) => { const li = document.createElement('li'); li.textContent = t; tipsList.appendChild(li); };
  // Simple cue: torso lean
  const s = (i)=> kp[i][2] >= thr;
  const LS=5, RS=6, LH=11, RH=12, LK=13, RK=14;
  if (s(LS)&&s(RS)&&s(LH)&&s(RH) && (s(LK)||s(RK))) {
    const msY=(kp[LS][0]+kp[RS][0])/2, msX=(kp[LS][1]+kp[RS][1])/2;
    const mhY=(kp[LH][0]+kp[RH][0])/2, mhX=(kp[LH][1]+kp[RH][1])/2;
    const knee = s(LK)? kp[LK] : kp[RK];
    const torso = angleDeg([msY,msX], [mhY,mhX], knee);
    if (torso != null && torso < 150) add('Keep chest up, reduce torso lean.');
  }
  // Knee drift cue
  if (s(LK) && s(LH) && Math.abs(kp[LK][1] - kp[LH][1]) > 0.2) add('Left knee drifting; align over foot.');
  if (s(RK) && s(RH) && Math.abs(kp[RK][1] - kp[RH][1]) > 0.2) add('Right knee drifting; align over foot.');
  if (!tipsList.children.length) add('Nice form!');
}

function angleDeg(a,b,c){
  const v1=[a[1]-b[1], a[0]-b[0]]; const v2=[c[1]-b[1], c[0]-b[0]];
  const dot=v1[0]*v2[0]+v1[1]*v2[1]; const m1=Math.hypot(v1[0],v1[1]); const m2=Math.hypot(v2[0],v2[1]);
  if (m1===0||m2===0) return null; const cos=Math.min(1,Math.max(-1,dot/(m1*m2)));
  return Math.acos(cos)*180/Math.PI;
}

async function loop(){
  if (!running) return;
  const thr = Number(confRange.value);
  const dataUrl = frameToDataURL(video);
  try {
    const res = await fetch('/infer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ image: dataUrl })});
    if (res.ok) {
      const json = await res.json();
      const kp = json.keypoints;
      drawKeypointsAndSkeleton(kp, thr);
      setTips(kp, thr);
      updatePoseScore(kp);
    }
  } catch(e) { /* ignore transient errors */ }
  updateFps();
  requestAnimationFrame(loop);
}

function frameToDataURL(video){
  const off = document.createElement('canvas');
  off.width = video.videoWidth; off.height = video.videoHeight;
  off.getContext('2d').drawImage(video, 0, 0);
  return off.toDataURL('image/jpeg', 0.6);
}

function updateFps(){
  frames++;
  const now = performance.now();
  if (now - lastTs >= 1000){
    const fps = frames / ((now - lastTs)/1000);
    fpsEl.innerHTML = `<strong>FPS:</strong> ${fps.toFixed(1)}`;
    frames=0; lastTs=now;
  }
}

function updatePoseScore(kp){
  const el = document.getElementById('poseScore');
  const mean = kp.reduce((a,[,,s])=>a+s,0) / kp.length;
  el.innerHTML = `<strong>Pose score:</strong> ${mean.toFixed(2)}`;
}


