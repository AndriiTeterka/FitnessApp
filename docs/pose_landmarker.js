// Main thread controller for MediaPipe PoseLandmarker running in a Web Worker.
// Implements default pose-detection parameters, landmark gating, temporal
// smoothing, decision logic and adaptive performance for a single-person gym
// coaching scenario.

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const fpsEl = document.getElementById("fps");
const tipsList = document.getElementById("tipsList");
const chipModel = document.getElementById("chipModel");
const flipBtn = document.getElementById("flipBtn");
const cameraSel = document.getElementById("cameraSelect");
const cameraWrapper = document.getElementById("cameraWrapper");

// ---------- Pose configuration -------------------------------------------------

const DEFAULT_OPTIONS = {
  runningMode: "VIDEO",
  numPoses: 1,
  minPoseDetectionConfidence: 0.6,
  minPosePresenceConfidence: 0.75,
  minTrackingConfidence: 0.7,
  outputSegmentationMasks: false,
};

// Additional profiles to tweak runtime behaviour when needed.
export const PROFILES = {
  lowLight: {
    minPoseDetectionConfidence: 0.55,
    minPosePresenceConfidence: 0.7,
    minTrackingConfidence: 0.6,
  },
  repScoring: { minPosePresenceConfidence: 0.8 },
  budget: {
    minPoseDetectionConfidence: 0.55,
    minPosePresenceConfidence: 0.7,
    minTrackingConfidence: 0.65,
  },
};

// ---------- Camera / worker setup ---------------------------------------------

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let usingFrontCamera = isMobile;
let currentStream = null;

let worker = null;
let workerReady = false;
let workerBusy = false;
let model = "heavy"; // heavy by default, swaps to lite if tracking degrades

const offscreen = new OffscreenCanvas(1280, 720);
let lastSent = 0;
let minFrameInterval = 0; // adaptive frame drop when latency is high
let lowScoreStart = null;

// ---------- Landmark smoothing & gating ---------------------------------------

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

const lastValid = {};
const smoothed = {};
const HOLD_MS = 250;
const ALPHA = 0.2; // EMA smoothing factor tuned for ~30–60 FPS

// ---------- Decision logic -----------------------------------------------------

const ruleCounters = { torso: 0, leftKnee: 0, rightKnee: 0 };
let lastCorrectionTime = 0;

// ---------- Event handlers -----------------------------------------------------

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
  initWorker(model, DEFAULT_OPTIONS);
  running = true;
  requestAnimationFrame(loop);
});

flipBtn.addEventListener("click", async () => {
  usingFrontCamera = !usingFrontCamera;
  if (running) {
    await startCamera();
  } else {
    applyTransforms();
  }
});

cameraSel.addEventListener("change", async () => {
  if (running) {
    await startCamera();
  }
});

window.addEventListener("orientationchange", applyTransforms);

// ---------- Worker interaction -------------------------------------------------

async function initWorker(modelName, opts) {
  if (worker) worker.terminate();
  // Classic worker script loads MediaPipe via importScripts.
  worker = new Worker("./pose_worker.js");
  workerReady = false;
  worker.onmessage = (e) => {
    const { type } = e.data;
    if (type === "ready") {
      workerReady = true;
      chipModel.innerHTML = `Model<strong>${modelName === "lite" ? "Lite" : "Heavy"}</strong>`;
    } else if (type === "result") {
      workerBusy = false;
      const { result, ts } = e.data;
      handleResult(result, ts);
      const latency = performance.now() - ts;
      minFrameInterval = latency > 80 ? 33 : 0; // adapt to ~30 FPS when slow
    }
  };
  worker.postMessage({ type: "init", model: modelName, options: opts });
}

// ---------- Camera handling ----------------------------------------------------

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
  if (currentStream) currentStream.getTracks().forEach((t) => t.stop());
  const constraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: usingFrontCamera ? "user" : "environment",
    },
    audio: false,
  };
  if (!isMobile && cameraSel.value) {
    constraints.video.deviceId = { exact: cameraSel.value };
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

// ---------- Main loop ---------------------------------------------------------

let running = false;
function loop() {
  if (!running) return;
  const now = performance.now();
  if (workerReady && !workerBusy && now - lastSent >= minFrameInterval) {
    const ctxOff = offscreen.getContext("2d");
    ctxOff.drawImage(video, 0, 0, offscreen.width, offscreen.height);
    const bitmap = offscreen.transferToImageBitmap();
    workerBusy = true;
    lastSent = now;
    worker.postMessage({ type: "frame", bitmap, ts: now }, [bitmap]);
  }
  requestAnimationFrame(loop);
}

// ---------- Result handling ----------------------------------------------------

function handleResult(res, ts) {
  const keypoints = processLandmarks(res, ts);
  drawKeypointsAndSkeleton(keypoints);
  evaluateRules(keypoints, ts);
  updatePoseScore(res);
  updateFps();
}

function processLandmarks(res, ts) {
  if (!res.landmarks || !res.landmarks.length) return [];
  const lm = res.landmarks[0];
  const out = [];
  lm.forEach((p, i) => {
    const name = LANDMARK_NAMES[i];
    const vis = p.visibility ?? 0;
    const pres = p.presence ?? 0;
    if (vis >= 0.6 && pres >= 0.6) {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      lastValid[name] = { x, y, ts };
    }
    const last = lastValid[name];
    if (last && ts - last.ts <= HOLD_MS) {
      const s = smoothed[name] || { x: last.x, y: last.y };
      s.x = ALPHA * last.x + (1 - ALPHA) * s.x;
      s.y = ALPHA * last.y + (1 - ALPHA) * s.y;
      smoothed[name] = s;
      out.push({ name, x: s.x, y: s.y });
    } else {
      delete lastValid[name];
      delete smoothed[name];
      out.push(null);
    }
  });
  return out;
}

function drawKeypointsAndSkeleton(keypoints) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const byName = {};
  keypoints.forEach((p) => {
    if (p) byName[p.name] = p;
  });
  ctx.fillStyle = "#66e0a3";
  for (const p of keypoints) {
    if (!p || FACE_LANDMARKS.has(p.name)) continue;
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
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
}

function evaluateRules(keypoints, ts) {
  const msgs = [];
  const byName = {};
  keypoints.forEach((p) => {
    if (p) byName[p.name] = p;
  });
  const get = (n) => byName[n];

  const torso = angleDeg(mid(get("left_shoulder"), get("right_shoulder")), mid(get("left_hip"), get("right_hip")), get("left_knee") || get("right_knee"));
  if (torso != null && torso < 150) ruleCounters.torso++; else ruleCounters.torso = 0;
  if (ruleCounters.torso >= 3 && ts - lastCorrectionTime > 1500) {
    msgs.push("Keep chest up, reduce torso lean.");
    lastCorrectionTime = ts;
  }

  const lk = get("left_knee"), lh = get("left_hip");
  if (lk && lh && Math.abs(lk.x - lh.x) > canvas.width * 0.2) ruleCounters.leftKnee++; else ruleCounters.leftKnee = 0;
  if (ruleCounters.leftKnee >= 3 && ts - lastCorrectionTime > 1500) {
    msgs.push("Left knee drifting; align over foot.");
    lastCorrectionTime = ts;
  }

  const rk = get("right_knee"), rh = get("right_hip");
  if (rk && rh && Math.abs(rk.x - rh.x) > canvas.width * 0.2) ruleCounters.rightKnee++; else ruleCounters.rightKnee = 0;
  if (ruleCounters.rightKnee >= 3 && ts - lastCorrectionTime > 1500) {
    msgs.push("Right knee drifting; align over foot.");
    lastCorrectionTime = ts;
  }

  tipsList.innerHTML = "";
  if (!msgs.length) {
    const li = document.createElement("li");
    li.textContent = "Nice form!";
    tipsList.appendChild(li);
  } else {
    for (const m of msgs) {
      const li = document.createElement("li");
      li.className = "warn";
      li.textContent = m;
      tipsList.appendChild(li);
    }
  }
}

function mid(a, b) {
  if (!a || !b) return null;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function angleDeg(a, b, c) {
  if (!a || !b || !c) return null;
  const v1 = [a.x - b.x, a.y - b.y];
  const v2 = [c.x - b.x, c.y - b.y];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const m1 = Math.hypot(v1[0], v1[1]);
  const m2 = Math.hypot(v2[0], v2[1]);
  if (m1 === 0 || m2 === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function updatePoseScore(res) {
  const el = document.getElementById("poseScore");
  if (!res.landmarks || !res.landmarks.length) {
    el.innerHTML = `<strong>Pose score:</strong> –`;
    return;
  }
  const lm = res.landmarks[0];
  const mean = lm
    .map((p) => Math.min(p.visibility ?? 0, p.presence ?? 0))
    .reduce((a, b) => a + b, 0) / lm.length;
  el.innerHTML = `<strong>Pose score:</strong> ${mean.toFixed(2)}`;

  // Model swapper: if tracking quality drops below 0.5 for 500ms, use lite model
  if (mean < 0.5) {
    if (!lowScoreStart) lowScoreStart = performance.now();
    if (performance.now() - lowScoreStart > 500 && model !== "lite") {
      model = "lite";
      initWorker("lite", { ...DEFAULT_OPTIONS, ...PROFILES.budget });
    }
  } else {
    lowScoreStart = null;
  }
}

// FPS display
let lastFpsTs = performance.now();
let frames = 0;
function updateFps() {
  frames++;
  const now = performance.now();
  if (now - lastFpsTs >= 1000) {
    const fps = frames / ((now - lastFpsTs) / 1000);
    fpsEl.innerHTML = `<strong>FPS:</strong> ${fps.toFixed(1)}`;
    frames = 0;
    lastFpsTs = now;
  }
}

