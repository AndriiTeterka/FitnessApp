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
const screenshotBtn=document.getElementById('screenshotBtn');

let detector=null; let running=false; let lastTs=performance.now(); let frames=0;
confRange.addEventListener('input',()=>confVal.textContent=Number(confRange.value).toFixed(2));
startBtn.addEventListener('click',async()=>{ await setupBackend(); await createDetector(); await startCamera(); running=true; requestAnimationFrame(loop); });
screenshotBtn.addEventListener('click',()=>{ const off=document.createElement('canvas'); off.width=video.videoWidth; off.height=video.videoHeight; off.getContext('2d').drawImage(video,0,0); const url=off.toDataURL('image/png'); const a=document.createElement('a'); a.href=url; a.download='fitnessapp_frame.png'; a.click();});

async function setupBackend(){ await tf.setBackend('webgl'); await tf.ready(); }
async function createDetector(){ const pd=window.poseDetection; if(!pd){ alert('pose-detection failed to load.'); throw new Error('poseDetection not available'); } const m=pd.SupportedModels.MoveNet; const modelType=modelTypeSel.value==='Thunder'?'SinglePose.Thunder':'SinglePose.Lightning'; detector=await pd.createDetector(m,{modelType,enableSmoothing:true}); chipModel.innerHTML='Model<strong>'+modelTypeSel.value+'</strong>'; }
async function startCamera(){ const stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480},audio:false}); video.srcObject=stream; await video.play(); canvas.width=video.videoWidth; canvas.height=video.videoHeight; }

function drawKeypointsAndSkeleton(kp,thr){ const w=canvas.width,h=canvas.height; ctx.clearRect(0,0,w,h); const pairs=[[5,7],[7,9],[6,8],[8,10],[11,13],[13,15],[12,14],[14,16],[5,6],[11,12],[5,11],[6,12]]; ctx.fillStyle='#66e0a3'; for(let i=0;i<kp.length;i++){ const {y,x,score}=kp[i]; if((score??0)<thr) continue; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill(); } ctx.strokeStyle='#7aa7ff'; ctx.lineWidth=3; for(const [a,b] of pairs){ if((kp[a].score??0)<thr||(kp[b].score??0)<thr) continue; ctx.beginPath(); ctx.moveTo(kp[a].x,kp[a].y); ctx.lineTo(kp[b].x,kp[b].y); ctx.stroke(); }}
function setTips(kp,thr){ tipsList.innerHTML=''; const add=t=>{ const li=document.createElement('li'); li.textContent=t; tipsList.appendChild(li);}; const s=i=>(kp[i].score??0)>=thr; const LS=5,RS=6,LH=11,RH=12,LK=13,RK=14; if(s(LS)&&s(RS)&&s(LH)&&s(RH)&&(s(LK)||s(RK))){ const ms={x:(kp[LS].x+kp[RS].x)/2,y:(kp[LS].y+kp[RS].y)/2}; const mh={x:(kp[LH].x+kp[RH].x)/2,y:(kp[LH].y+kp[RH].y)/2}; const knee=s(LK)?kp[LK]:kp[RK]; const torso=angleDeg(ms,mh,knee); if(torso!=null && torso<150) add('Keep chest up, reduce torso lean.'); } if(s(LK)&&s(LH)&&Math.abs(kp[LK].x-kp[LH].x)>canvas.width*0.2) add('Left knee drifting; align over foot.'); if(s(RK)&&s(RH)&&Math.abs(kp[RK].x-kp[RH].x)>canvas.width*0.2) add('Right knee drifting; align over foot.'); if(!tipsList.children.length) add('Nice form!'); }
function angleDeg(a,b,c){ const v1=[a.x-b.x,a.y-b.y], v2=[c.x-b.x,c.y-b.y]; const dot=v1[0]*v2[0]+v1[1]*v2[1]; const m1=Math.hypot(v1[0],v1[1]), m2=Math.hypot(v2[0],v2[1]); if(m1===0||m2===0) return null; const cos=Math.min(1,Math.max(-1,dot/(m1*m2))); return Math.acos(cos)*180/Math.PI; }
async function loop(){ if(!running) return; const thr=Number(confRange.value); try{ const poses=await detector.estimatePoses(video,{maxPoses:1,flipHorizontal:true}); if(poses && poses[0] && poses[0].keypoints){ drawKeypointsAndSkeleton(poses[0].keypoints,thr); setTips(poses[0].keypoints,thr); updatePoseScore(poses[0].keypoints); } }catch(e){} updateFps(); requestAnimationFrame(loop);} 
function updateFps(){ frames++; const now=performance.now(); if(now-lastTs>=1000){ const fps=frames/((now-lastTs)/1000); fpsEl.innerHTML=`<strong>FPS:</strong> ${fps.toFixed(1)}`; frames=0; lastTs=now; }}
function updatePoseScore(kp){ const el=document.getElementById('poseScore'); const mean=kp.map(p=>p.score??0).reduce((a,b)=>a+b,0)/kp.length; el.innerHTML=`<strong>Pose score:</strong> ${mean.toFixed(2)}`; }


