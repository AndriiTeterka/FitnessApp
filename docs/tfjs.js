const video=document.getElementById('video');
const canvas=document.getElementById('overlay');
const ctx=canvas.getContext('2d');
const startBtn=document.getElementById('startBtn');
const confRange=document.getElementById('confRange');
const confVal=document.getElementById('confVal');
const modelTypeSel=document.getElementById('modelType');
const fpsEl=document.getElementById('fps');
const tipsList=document.getElementById('tipsList');
const chipModel=document.getElementById('chipModel');
const flipBtn=document.getElementById('flipBtn');

let detector=null; let running=false; let lastTs=performance.now(); let frames=0;
let currentStream=null; let usingFrontCamera=true;
confRange.addEventListener('input',()=>confVal.textContent=Number(confRange.value).toFixed(2));
startBtn.addEventListener('click',async()=>{ await setupBackend(); await createDetector(); await startCamera(); running=true; requestAnimationFrame(loop); });
flipBtn.addEventListener('click',async()=>{ usingFrontCamera=!usingFrontCamera; if(running){ await startCamera(); await createDetector(); } else { applyMirror(); } });

async function setupBackend(){ await tf.setBackend('webgl'); await tf.ready(); }
async function createDetector(){
  const pd=window.poseDetection; if(!pd){ alert('pose-detection failed to load.'); throw new Error('poseDetection not available'); }
  const m=pd.SupportedModels.BlazePose;
  const type=modelTypeSel.value; // 'lite' | 'full' | 'heavy'
  chipModel.innerHTML='Model<strong>'+type.charAt(0).toUpperCase()+type.slice(1)+'</strong>';
  // Try MediaPipe runtime first; if it fails, fallback to TFJS runtime
  try{
    detector=await pd.createDetector(m,{
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
      modelType: type,
      enableSmoothing: true,
      selfieMode: usingFrontCamera,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }catch(e){
    console.warn('Mediapipe runtime failed, falling back to TFJS', e);
    detector=await pd.createDetector(m,{
      runtime: 'tfjs',
      modelType: type,
      enableSmoothing: true
    });
  }
}
async function startCamera(){
  if(currentStream){ currentStream.getTracks().forEach(t=>t.stop()); }
  const stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode: usingFrontCamera?'user':'environment'},audio:false});
  currentStream=stream; video.srcObject=stream; await video.play(); canvas.width=video.videoWidth; canvas.height=video.videoHeight; applyMirror(); }

function applyMirror(){
  if(usingFrontCamera){ video.style.transform='scaleX(-1)'; canvas.style.transform='scaleX(-1)'; }
  else{ video.style.transform=''; canvas.style.transform=''; }
}

function drawKeypointsAndSkeleton(kp,thr){
  const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h);
  const byName={}; for(const p of kp){ if(p && p.name) byName[p.name]=p; }
  const segs=[
    ['left_shoulder','left_elbow'],['left_elbow','left_wrist'],
    ['right_shoulder','right_elbow'],['right_elbow','right_wrist'],
    ['left_wrist','left_index'],['left_wrist','left_pinky'],['left_wrist','left_thumb'],
    ['right_wrist','right_index'],['right_wrist','right_pinky'],['right_wrist','right_thumb'],
    ['left_hip','left_knee'],['left_knee','left_ankle'],['left_ankle','left_heel'],['left_heel','left_foot_index'],
    ['right_hip','right_knee'],['right_knee','right_ankle'],['right_ankle','right_heel'],['right_heel','right_foot_index'],
    ['left_shoulder','right_shoulder'],['left_hip','right_hip'],
    ['left_shoulder','left_hip'],['right_shoulder','right_hip']
  ];
  const FACE_NAMES=new Set(['nose','left_eye_inner','left_eye','left_eye_outer','right_eye_inner','right_eye','right_eye_outer','left_ear','right_ear','mouth_left','mouth_right']);
  ctx.fillStyle='#66e0a3';
  for(const p of kp){ if(!p) continue; if(FACE_NAMES.has(p.name)) continue; const s=p.score??0; if(s<thr) continue; ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill(); }
  ctx.strokeStyle='#7aa7ff'; ctx.lineWidth=3;
  for(const [a,b] of segs){ const pa=byName[a], pb=byName[b]; if(!pa||!pb) continue; if((pa.score??0)<thr||(pb.score??0)<thr) continue; ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke(); }
}
function setTips(kp,thr){
  tipsList.innerHTML=''; const add=t=>{ const li=document.createElement('li'); li.textContent=t; tipsList.appendChild(li);};
  const byName={}; for(const p of kp){ if(p && p.name) byName[p.name]=p; }
  const get=n=>byName[n]; const s=n=>((get(n)?.score)??0)>=thr;
  const LS='left_shoulder', RS='right_shoulder', LH='left_hip', RH='right_hip', LK='left_knee', RK='right_knee';
  if(s(LS)&&s(RS)&&s(LH)&&s(RH) && (s(LK)||s(RK))){
    const ms={x:(get(LS).x+get(RS).x)/2, y:(get(LS).y+get(RS).y)/2};
    const mh={x:(get(LH).x+get(RH).x)/2, y:(get(LH).y+get(RH).y)/2};
    const knee = s(LK)? get(LK) : get(RK);
    const torso=angleDeg(ms,mh,knee); if(torso!=null && torso<150) add('Keep chest up, reduce torso lean.');
  }
  if(s(LK)&&s(LH) && Math.abs(get(LK).x-get(LH).x)>canvas.width*0.2) add('Left knee drifting; align over foot.');
  if(s(RK)&&s(RH) && Math.abs(get(RK).x-get(RH).x)>canvas.width*0.2) add('Right knee drifting; align over foot.');
  if(!tipsList.children.length) add('Nice form!');
}
function angleDeg(a,b,c){ const v1=[a.x-b.x,a.y-b.y], v2=[c.x-b.x,c.y-b.y]; const dot=v1[0]*v2[0]+v1[1]*v2[1]; const m1=Math.hypot(v1[0],v1[1]), m2=Math.hypot(v2[0],v2[1]); if(m1===0||m2===0) return null; const cos=Math.min(1,Math.max(-1,dot/(m1*m2))); return Math.acos(cos)*180/Math.PI; }
async function loop(){ if(!running) return; const thr=Number(confRange.value); try{ const poses=await detector.estimatePoses(video,{maxPoses:1,flipHorizontal:false,timestamp:performance.now()}); if(poses && poses[0] && poses[0].keypoints){ drawKeypointsAndSkeleton(poses[0].keypoints,thr); setTips(poses[0].keypoints,thr); updatePoseScore(poses[0].keypoints); } }catch(e){ console.warn('estimatePoses failed; resetting detector', e); try{ await createDetector(); }catch(_){} } updateFps(); requestAnimationFrame(loop);} 
function updateFps(){ frames++; const now=performance.now(); if(now-lastTs>=1000){ const fps=frames/((now-lastTs)/1000); fpsEl.innerHTML=`<strong>FPS:</strong> ${fps.toFixed(1)}`; frames=0; lastTs=now; }}
function updatePoseScore(kp){ const el=document.getElementById('poseScore'); const mean=kp.map(p=>p.score??0).reduce((a,b)=>a+b,0)/kp.length; el.innerHTML=`<strong>Pose score:</strong> ${mean.toFixed(2)}`; }


