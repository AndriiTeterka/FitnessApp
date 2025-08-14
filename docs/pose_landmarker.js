import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

const video=document.getElementById('video');
const canvas=document.getElementById('overlay');
const ctx=canvas.getContext('2d');
const startBtn=document.getElementById('startBtn');
const confRange=document.getElementById('confRange');
const confVal=document.getElementById('confVal');
const fpsEl=document.getElementById('fps');
const tipsList=document.getElementById('tipsList');
const chipModel=document.getElementById('chipModel');
const flipBtn=document.getElementById('flipBtn');
const cameraSel=document.getElementById('cameraSelect');
const cameraWrapper=document.getElementById('cameraWrapper');

let landmarker=null; let running=false; let lastTs=performance.now(); let frames=0;
let currentStream=null; const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent); let usingFrontCamera=true;
const LANDMARK_NAMES=[
  'nose','left_eye_inner','left_eye','left_eye_outer','right_eye_inner','right_eye','right_eye_outer',
  'left_ear','right_ear','mouth_left','mouth_right','left_shoulder','right_shoulder','left_elbow','right_elbow',
  'left_wrist','right_wrist','left_pinky','right_pinky','left_index','right_index','left_thumb','right_thumb',
  'left_hip','right_hip','left_knee','right_knee','left_ankle','right_ankle','left_heel','right_heel','left_foot_index','right_foot_index'
];
if(!isMobile){ flipBtn.style.display='none'; cameraWrapper.style.display=''; populateCameras(); usingFrontCamera=false; }
else{ cameraWrapper.style.display='none'; }
confRange.addEventListener('input',()=>confVal.textContent=Number(confRange.value).toFixed(2));
startBtn.addEventListener('click',async()=>{ await startCamera(); await createLandmarker(); running=true; requestAnimationFrame(loop); });
flipBtn.addEventListener('click',async()=>{ usingFrontCamera=!usingFrontCamera; if(running){ running=false; if(landmarker) landmarker.close(); landmarker=null; await startCamera(); await createLandmarker(); running=true; requestAnimationFrame(loop); } else { applyMirror(); } });
cameraSel.addEventListener('change',async()=>{ if(running){ running=false; if(landmarker) landmarker.close(); landmarker=null; await startCamera(); await createLandmarker(); running=true; requestAnimationFrame(loop); } });

async function createLandmarker(){
  const vision=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm");
  const modelUrl="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
  const modelResp=await fetch(modelUrl);
  const modelData=await modelResp.arrayBuffer();
  landmarker=await PoseLandmarker.createFromOptions(vision,{ baseOptions:{ modelAssetBuffer:modelData, delegate:"GPU" }, runningMode:"VIDEO", numPoses:1, minPoseDetectionConfidence:0.3, minPosePresenceConfidence:0.3, minTrackingConfidence:0.3 });
  chipModel.innerHTML='Model<strong>Lite</strong>';
}
async function populateCameras(){ const devices=await navigator.mediaDevices.enumerateDevices(); const vids=devices.filter(d=>d.kind==='videoinput'); cameraSel.innerHTML=''; vids.forEach((d,i)=>{ const o=document.createElement('option'); o.value=d.deviceId; o.text=d.label||`Camera ${i+1}`; cameraSel.appendChild(o); }); }
async function startCamera(){ if(currentStream){ currentStream.getTracks().forEach(t=>t.stop()); } const constraints={video:{},audio:false}; if(isMobile){ constraints.video.facingMode=usingFrontCamera?'user':'environment'; constraints.video.width={ideal:320}; constraints.video.height={ideal:240}; } else { constraints.video.width=640; constraints.video.height=480; if(cameraSel.value){ constraints.video.deviceId={exact:cameraSel.value}; } } const stream=await navigator.mediaDevices.getUserMedia(constraints); currentStream=stream; const facing=stream.getVideoTracks()[0].getSettings().facingMode; usingFrontCamera=!facing || facing==='user' || facing==='front'; video.srcObject=stream; await video.play(); canvas.width=video.videoWidth; canvas.height=video.videoHeight; applyMirror(); }
function applyMirror(){ if(usingFrontCamera){ video.style.transform='scaleX(-1)'; canvas.style.transform='scaleX(-1)'; } else { video.style.transform=''; canvas.style.transform=''; } }
function resultsToKeypoints(res){ if(!res.landmarks||!res.landmarks.length) return null; const lm=res.landmarks[0]; return lm.map((p,i)=>({x:p.x*canvas.width,y:p.y*canvas.height,score:p.visibility??0,name:LANDMARK_NAMES[i]})); }
function drawKeypointsAndSkeleton(kp,thr){ const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h); const byName={}; for(const p of kp){ if(p&&p.name) byName[p.name]=p; } const segs=[[ 'left_shoulder','left_elbow'],['left_elbow','left_wrist'], ['right_shoulder','right_elbow'],['right_elbow','right_wrist'], ['left_wrist','left_index'],['left_wrist','left_pinky'],['left_wrist','left_thumb'], ['right_wrist','right_index'],['right_wrist','right_pinky'],['right_wrist','right_thumb'], ['left_hip','left_knee'],['left_knee','left_ankle'],['left_ankle','left_heel'],['left_heel','left_foot_index'], ['right_hip','right_knee'],['right_knee','right_ankle'],['right_ankle','right_heel'],['right_heel','right_foot_index'], ['left_shoulder','right_shoulder'],['left_hip','right_hip'], ['left_shoulder','left_hip'],['right_shoulder','right_hip'] ]; const FACE_NAMES=new Set(['nose','left_eye_inner','left_eye','left_eye_outer','right_eye_inner','right_eye','right_eye_outer','left_ear','right_ear','mouth_left','mouth_right']); ctx.fillStyle='#66e0a3'; for(const p of kp){ if(!p) continue; if(FACE_NAMES.has(p.name)) continue; const s=p.score??0; if(s<thr) continue; ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill(); } ctx.strokeStyle='#7aa7ff'; ctx.lineWidth=3; for(const [a,b] of segs){ const pa=byName[a],pb=byName[b]; if(!pa||!pb) continue; if((pa.score??0)<thr||(pb.score??0)<thr) continue; ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke(); } }
function setTips(kp,thr){ tipsList.innerHTML=''; const add=t=>{ const li=document.createElement('li'); li.textContent=t; tipsList.appendChild(li);}; const byName={}; for(const p of kp){ if(p&&p.name) byName[p.name]=p; } const get=n=>byName[n]; const s=n=>((get(n)?.score)??0)>=thr; const LS='left_shoulder',RS='right_shoulder',LH='left_hip',RH='right_hip',LK='left_knee',RK='right_knee'; if(s(LS)&&s(RS)&&s(LH)&&s(RH)&&(s(LK)||s(RK))){ const ms={x:(get(LS).x+get(RS).x)/2,y:(get(LS).y+get(RS).y)/2}; const mh={x:(get(LH).x+get(RH).x)/2,y:(get(LH).y+get(RH).y)/2}; const knee=s(LK)?get(LK):get(RK); const torso=angleDeg(ms,mh,knee); if(torso!=null&&torso<150) add('Keep chest up, reduce torso lean.'); } if(s(LK)&&s(LH)&&Math.abs(get(LK).x-get(LH).x)>canvas.width*0.2) add('Left knee drifting; align over foot.'); if(s(RK)&&s(RH)&&Math.abs(get(RK).x-get(RH).x)>canvas.width*0.2) add('Right knee drifting; align over foot.'); if(!tipsList.children.length) add('Nice form!'); }
function angleDeg(a,b,c){ const v1=[a.x-b.x,a.y-b.y],v2=[c.x-b.x,c.y-b.y]; const dot=v1[0]*v2[0]+v1[1]*v2[1]; const m1=Math.hypot(v1[0],v1[1]),m2=Math.hypot(v2[0],v2[1]); if(m1===0||m2===0) return null; const cos=Math.min(1,Math.max(-1,dot/(m1*m2))); return Math.acos(cos)*180/Math.PI; }
async function loop(){ if(!running) return; const thr=Number(confRange.value); try{ const res=landmarker.detectForVideo(video,performance.now()); const keypoints=resultsToKeypoints(res); if(keypoints){ drawKeypointsAndSkeleton(keypoints,thr); setTips(keypoints,thr); updatePoseScore(keypoints); } }catch(e){ console.warn('detectForVideo failed; resetting landmarker',e); try{ await createLandmarker(); }catch(_){} } updateFps(); requestAnimationFrame(loop); }
function updateFps(){ frames++; const now=performance.now(); if(now-lastTs>=1000){ const fps=frames/((now-lastTs)/1000); fpsEl.innerHTML=`<strong>FPS:</strong> ${fps.toFixed(1)}`; frames=0; lastTs=now; }}
function updatePoseScore(kp){ const el=document.getElementById('poseScore'); const mean=kp.map(p=>p.score??0).reduce((a,b)=>a+b,0)/kp.length; el.innerHTML=`<strong>Pose score:</strong> ${mean.toFixed(2)}`; }

