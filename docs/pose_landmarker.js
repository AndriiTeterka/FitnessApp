const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
let confidenceThreshold = 0.6;
const fpsEl = document.getElementById("fps");
const tipsList = document.getElementById("tipsList");
const chipModel = document.getElementById("chipModel");
const flipBtn = document.getElementById("flipBtn");
const cameraSel = document.getElementById("cameraSelect");
const cameraWrapper = document.getElementById("cameraWrapper");

const DEFAULT_OPTIONS = {
  runningMode: "VIDEO",
  numPoses: 1,
  minPoseDetectionConfidence: 0.60,
  minPosePresenceConfidence: 0.75,
  minTrackingConfidence: 0.70,
  outputSegmentationMasks: false,
};

const PROFILES = {
  lowLight: {
    minPoseDetectionConfidence: 0.55,
    minPosePresenceConfidence: 0.70,
    minTrackingConfidence: 0.60,
  },
  repMoment: { minPosePresenceConfidence: 0.80 },
  budget: {
    minPoseDetectionConfidence: 0.55,
    minPosePresenceConfidence: 0.70,
    minTrackingConfidence: 0.65,
  },
};

let currentOptions = { ...DEFAULT_OPTIONS };
let running = false;
let currentStream = null;
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let usingFrontCamera = true;
let worker = null;
let usingLiteModel = false;
let lastSent = 0;
let detectionInterval = 1000 / 60;
let frames = 0;
let lastFpsTs = performance.now();
const landmarkHistory = [];
const lastGoodLandmarks = {};
const smoothedLandmarks = {};
let lastFrameTs = performance.now();
let lastCorrectionTs = 0;
const ruleFrames = { torso: 0, leftKnee: 0, rightKnee: 0 };
let trackingLowSince = null;

const LANDMARK_NAMES = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
];

const SKELETON_SEGMENTS = [
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_wrist", "left_index"],
  ["left_wrist", "left_pinky"],
  ["left_wrist", "left_thumb"],
  ["right_wrist", "right_index"],
  ["right_wrist", "right_pinky"],
  ["right_wrist", "right_thumb"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["left_ankle", "left_heel"],
  ["left_heel", "left_foot_index"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["right_ankle", "right_heel"],
  ["right_heel", "right_foot_index"],
  ["left_shoulder", "right_shoulder"],
  ["left_hip", "right_hip"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
];

const FACE_LANDMARKS = new Set([
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
]);

if (!isMobile) {
  flipBtn.style.display = "none";
  cameraWrapper.style.display = "";
  populateCameras();
  usingFrontCamera = false;
} else {
  cameraWrapper.style.display = "none";
}

startBtn.addEventListener("click", async () => {
  await startCamera();
  await createWorker("heavy");
  running = true;
  requestAnimationFrame(loop);
});

flipBtn.addEventListener("click", async () => {
  usingFrontCamera = !usingFrontCamera;
  if (running) {
    running = false;
    worker.postMessage({ type: "close" });
    await startCamera();
    await createWorker(usingLiteModel ? "lite" : "heavy");
    running = true;
    requestAnimationFrame(loop);
  } else {
    applyTransforms();
  }
});

cameraSel.addEventListener("change", async () => {
  if (running) {
    running = false;
    worker.postMessage({ type: "close" });
    await startCamera();
    await createWorker(usingLiteModel ? "lite" : "heavy");
    running = true;
    requestAnimationFrame(loop);
  }
});

window.addEventListener("orientationchange", applyTransforms);

async function createWorker(model) {
  if (worker) worker.terminate();
  worker = new Worker("./pose_worker.js");
  worker.onmessage = handleWorkerMessage;
  worker.postMessage({ type: "init", options: currentOptions, model });
  chipModel.innerHTML = `Model<strong>${model === "lite" ? "Lite" : "Heavy"}</strong>`;
  usingLiteModel = model === "lite";
}

function handleWorkerMessage(e) {
  if (e.data.type === "error") {
    console.error("Worker failed to load vision bundle:", e.data.error);
    return;
  }
  if (e.data.type !== "result") return;
  const res = e.data.result;
  const latency = e.data.latency;
  const keypoints = resultsToKeypoints(res);
  if (keypoints) {
    const sm = smoothKeypoints(keypoints);
    drawKeypointsAndSkeleton(sm);
    setTips(sm);
    updatePoseScore(sm);
    logLandmarks(sm);
    checkTracking(sm);
  }
  updateFps();
  adaptFrameRate(latency);
}

function adaptFrameRate(latency) {
  detectionInterval = latency > 80 ? 1000 / 30 : 1000 / 60;
}

function checkTracking(kp) {
  const valid = kp.filter((p) => p);
  if (!valid.length) return;
  const avg = valid.reduce((a, p) => a + (p.score || 0), 0) / valid.length;
  const now = performance.now();
  if (avg < 0.5) {
    if (!trackingLowSince) trackingLowSince = now;
    if (now - trackingLowSince > 500 && !usingLiteModel) {
      createWorker("lite");
      trackingLowSince = null;
    }
  } else {
    trackingLowSince = null;
  }
}

async function loop() {
  if (!running) return;
  const now = performance.now();
  if (now - lastSent >= detectionInterval) {
    const bitmap = await createImageBitmap(video);
    worker.postMessage({ type: "frame", image: bitmap, ts: now }, [bitmap]);
    lastSent = now;
  }
  requestAnimationFrame(loop);
}

async function populateCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const vids = devices.filter((d) => d.kind === "videoinput");
  cameraSel.innerHTML = "";
  vids.forEach((d, i) => {
    const o = document.createElement("option");
    o.value = d.deviceId;
    o.text = d.label || `Camera ${i + 1}`;
    cameraSel.appendChild(o);
  });
}

async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
  }
  const constraints = { video: {}, audio: false };
  if (isMobile) {
    constraints.video.facingMode = usingFrontCamera ? "user" : "environment";
    constraints.video.width = { ideal: 640 };
    constraints.video.height = { ideal: 480 };
  } else {
    constraints.video.width = { ideal: 1280 };
    constraints.video.height = { ideal: 720 };
    if (cameraSel.value) {
      constraints.video.deviceId = { exact: cameraSel.value };
    }
  }
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  currentStream = stream;
  const facing = stream.getVideoTracks()[0].getSettings().facingMode;
  usingFrontCamera = !facing || facing === "user" || facing === "front";
  const ready = new Promise((r) => {
    if (video.readyState >= 1) r();
    else video.addEventListener("loadedmetadata", r, { once: true });
  });
  video.srcObject = stream;
  await ready;
  await video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  applyTransforms();
}

function applyTransforms() {
  const transforms = [];
  if (usingFrontCamera) transforms.push("scaleX(-1)");
  if (window.innerHeight > window.innerWidth) transforms.push("rotate(90deg)");
  const t = transforms.join(" ");
  video.style.transform = t;
  canvas.style.transform = t;
}

const VIS_THRESHOLD = 0.6;
const PRES_THRESHOLD = 0.6;
const HOLD_MS = 250;

function resultsToKeypoints(res) {
  if (!res.landmarks || !res.landmarks.length) return null;
  const lm = res.landmarks[0];
  const now = performance.now();
  return lm.map((p, i) => {
    const name = LANDMARK_NAMES[i];
    const vis = p.visibility ?? 0;
    const pres = p.presence ?? 0;
    if (vis >= VIS_THRESHOLD && pres >= PRES_THRESHOLD) {
      const kp = {
        x: p.x * canvas.width,
        y: p.y * canvas.height,
        score: Math.max(vis, pres),
        name,
      };
      lastGoodLandmarks[name] = { ...kp, ts: now };
      return kp;
    }
    const last = lastGoodLandmarks[name];
    if (last && now - last.ts <= HOLD_MS) return last;
    return null;
  });
}

function smoothKeypoints(kp) {
  const now = performance.now();
  const dt = (now - lastFrameTs) / 1000;
  lastFrameTs = now;
  const cutoff = 3; // tuned for 30-60 FPS
  const alpha = 1 - Math.exp(-2 * Math.PI * cutoff * dt);
  return kp.map((p) => {
    if (!p) return null;
    const prev = smoothedLandmarks[p.name];
    if (prev) {
      p.x = prev.x + alpha * (p.x - prev.x);
      p.y = prev.y + alpha * (p.y - prev.y);
    }
    smoothedLandmarks[p.name] = { x: p.x, y: p.y, score: p.score };
    return p;
  });
}

function drawKeypointsAndSkeleton(keypoints) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const byName = {};
  for (const p of keypoints) {
    if (p && p.name) byName[p.name] = p;
  }
  ctx.fillStyle = "#66e0a3";
  for (const p of keypoints) {
    if (!p || FACE_LANDMARKS.has(p.name)) continue;
    const s = p.score ?? 0;
    if (s < confidenceThreshold) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#7aa7ff";
  ctx.lineWidth = 3;
  for (const [a, b] of SKELETON_SEGMENTS) {
    const pa = byName[a];
    const pb = byName[b];
    if (!pa || !pb) continue;
    if ((pa.score ?? 0) < confidenceThreshold || (pb.score ?? 0) < confidenceThreshold) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
}

function setTips(keypoints) {
  const now = performance.now();
  const byName = {};
  for (const p of keypoints) {
    if (p && p.name) byName[p.name] = p;
  }
  const get = (n) => byName[n];
  const s = (n) => (get(n)?.score ?? 0) >= confidenceThreshold;
  const LS = "left_shoulder";
  const RS = "right_shoulder";
  const LH = "left_hip";
  const RH = "right_hip";
  const LK = "left_knee";
  const RK = "right_knee";
  const tips = [];
  let torsoBad = false;
  if (s(LS) && s(RS) && s(LH) && s(RH) && (s(LK) || s(RK))) {
    const ms = { x: (get(LS).x + get(RS).x) / 2, y: (get(LS).y + get(RS).y) / 2 };
    const mh = { x: (get(LH).x + get(RH).x) / 2, y: (get(LH).y + get(RH).y) / 2 };
    const knee = s(LK) ? get(LK) : get(RK);
    const torso = angleDeg(ms, mh, knee);
    if (torso != null && torso < 150) torsoBad = true;
  }
  ruleFrames.torso = torsoBad ? ruleFrames.torso + 1 : 0;
  if (ruleFrames.torso >= 3 && now - lastCorrectionTs > 1500) {
    tips.push("Keep chest up, reduce torso lean.");
    lastCorrectionTs = now;
    ruleFrames.torso = 0;
  }
  let leftKneeBad = false;
  if (s(LK) && s(LH) && Math.abs(get(LK).x - get(LH).x) > canvas.width * 0.2) leftKneeBad = true;
  ruleFrames.leftKnee = leftKneeBad ? ruleFrames.leftKnee + 1 : 0;
  if (ruleFrames.leftKnee >= 3 && now - lastCorrectionTs > 1500) {
    tips.push("Left knee drifting; align over foot.");
    lastCorrectionTs = now;
    ruleFrames.leftKnee = 0;
  }
  let rightKneeBad = false;
  if (s(RK) && s(RH) && Math.abs(get(RK).x - get(RH).x) > canvas.width * 0.2) rightKneeBad = true;
  ruleFrames.rightKnee = rightKneeBad ? ruleFrames.rightKnee + 1 : 0;
  if (ruleFrames.rightKnee >= 3 && now - lastCorrectionTs > 1500) {
    tips.push("Right knee drifting; align over foot.");
    lastCorrectionTs = now;
    ruleFrames.rightKnee = 0;
  }
  tipsList.innerHTML = "";
  if (!tips.length) tips.push("Nice form!");
  for (const t of tips) {
    const li = document.createElement("li");
    li.textContent = t;
    tipsList.appendChild(li);
  }
}

function angleDeg(a, b, c) {
  const v1 = [a.x - b.x, a.y - b.y];
  const v2 = [c.x - b.x, c.y - b.y];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const m1 = Math.hypot(v1[0], v1[1]);
  const m2 = Math.hypot(v2[0], v2[1]);
  if (m1 === 0 || m2 === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function updateFps() {
  frames++;
  const now = performance.now();
  if (now - lastFpsTs >= 1000) {
    const fps = (frames * 1000) / (now - lastFpsTs);
    fpsEl.innerHTML = `<strong>FPS:</strong> ${fps.toFixed(1)}`;
    frames = 0;
    lastFpsTs = now;
  }
}

function updatePoseScore(kp) {
  const el = document.getElementById("poseScore");
  const valid = kp.filter((p) => p);
  const mean = valid.reduce((a, b) => a + (b.score || 0), 0) / valid.length;
  el.innerHTML = `<strong>Pose score:</strong> ${mean.toFixed(2)}`;
}

function logLandmarks(kp) {
  const snapshot = kp
    .filter((p) => p)
    .map((p) => ({ x: p.x, y: p.y, score: p.score, name: p.name }));
  landmarkHistory.push({ ts: performance.now(), keypoints: snapshot });
  if (landmarkHistory.length > 1000) landmarkHistory.shift();
}

