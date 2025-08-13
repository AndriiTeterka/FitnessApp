// Minimal MoveNet TFLite + camera demo with simple tips
// Notes on HTTPS for mobile: to access the camera from your phone, host this over HTTPS or use localhost over USB via dev server tunneling. Desktop localhost works over HTTP.

const VIDEO_SIZE = { width: 640, height: 480 };
const MOVENET_INPUT = 192; // MoveNet Lightning
const MOVENET_LOCAL_FILES = [
    "./models/movenet_lightning_int8.tflite",
    "./models/movenet_lightning_float32.tflite",
    "./models/movenet_lightning.tflite"
];
const MOVENET_REMOTE_URLS = [
    "https://huggingface.co/datasets/xenova/transformers.js-models/resolve/main/movenet/singlepose/lightning/tflite/int8/4.tflite",
    "https://huggingface.co/datasets/xenova/transformers.js-models/resolve/main/movenet/singlepose/lightning/tflite/float32/4.tflite",
    "https://storage.googleapis.com/tfhub-lite-models/google/lite-model/movenet/singlepose/lightning/tflite/float16/4.tflite"
];
const MOVENET_TFJS_GRAPH_URL = "https://storage.googleapis.com/tfhub-tfjs-modules/google/tfjs-model/movenet/singlepose/lightning/4/model.json";
let useTfjsFallback = false;
let pdDetector = null;
let graphModel = null;

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const loadingEl = document.getElementById("loading");
const startBtn = document.getElementById("startBtn");
const flipBtn = document.getElementById("flipBtn");
const confRange = document.getElementById("confRange");
const confVal = document.getElementById("confVal");
const fpsEl = document.getElementById("fps");
const tipsList = document.getElementById("tipsList");

let tfliteModel = null;
let isRunning = false;
let facingMode = "user"; // front camera default
let lastFrameTs = performance.now();
let frameCounter = 0;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Access globals from UMD scripts explicitly
const TF = globalThis.tf;
const TFLITE = globalThis.tflite;

// Hide loading initially; show only while fetching model
if (loadingEl) loadingEl.style.display = "none";

async function loadModel() {
    if (!loadingEl) return;
    loadingEl.style.display = "block";
    try {
        if (TFLITE && typeof TFLITE.setWasmPath === "function") {
            TFLITE.setWasmPath('./tflite-wasm/');
        }
        if (!TFLITE || typeof TFLITE.loadTFLiteModel !== "function") {
            throw new Error("TFLite web runtime not available");
        }
        // Try local candidates first, then remote fallbacks
        const urls = [...MOVENET_LOCAL_FILES, ...MOVENET_REMOTE_URLS];
        let lastErr = null;
        for (const url of urls) {
            try {
                console.log("Loading MoveNet from:", url);
                tfliteModel = await TFLITE.loadTFLiteModel(url);
                console.log("Model loaded.");
                break;
            } catch (err) {
                console.warn("Failed to load model from", url, err);
                lastErr = err;
            }
        }
        if (!tfliteModel && lastErr) throw lastErr;
    } catch (e) {
        console.error("Model load failed", e);
        // Fallback to TFJS PoseDetection MoveNet if TFLite fails
        try {
            console.log('Loading TFJS MoveNet fallback...');
            useTfjsFallback = true;
            await ensurePoseDetectionLoaded();
            await initTfjsFallbackDetector();
        } catch (err) {
            console.warn('TFJS pose-detection fallback failed, trying direct GraphModel...', err);
            try {
                await ensureGraphModelLoaded();
                pushTip('Using TFJS GraphModel fallback');
            } catch (e2) {
                console.error('GraphModel fallback init failed', e2);
                pushTip("Model failed to load. Preview will run without tips.");
            }
        }
async function initTfjsFallbackDetector() {
    if (pdDetector) return;
    if (!window.poseDetection) throw new Error('pose-detection script not loaded');
    await tf.setBackend('webgl');
    await tf.ready();
    // Try MoveNet first
    try {
        const movenet = window.poseDetection.SupportedModels.MoveNet;
        pdDetector = await window.poseDetection.createDetector(movenet, { modelType: 'Lightning' });
        console.log('TFJS MoveNet fallback ready');
        return;
    } catch (e) {
        console.warn('TFJS MoveNet fallback failed, trying PoseNet...', e);
    }
    // Fallback to PoseNet for maximum compatibility
    try {
        const posenet = window.poseDetection.SupportedModels.PoseNet;
        pdDetector = await window.poseDetection.createDetector(posenet, {
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 257, height: 200 },
            multiplier: 0.75,
            quantBytes: 2
        });
        console.log('TFJS PoseNet fallback ready');
        pushTip('Using PoseNet fallback');
    } catch (e2) {
        console.error('TFJS PoseNet fallback failed', e2);
        throw e2;
    }
}

async function ensurePoseDetectionLoaded() {
    if (window.poseDetection) return true;
    // Try unpkg first, then jsdelivr
    const loadScript = (src) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
    });
    try {
        await loadScript('https://unpkg.com/@tensorflow-models/pose-detection@3.5.0/dist/pose-detection.min.js');
        return true;
    } catch (_) {
        try {
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@3.5.0/dist/pose-detection.min.js');
            return true;
        } catch (e2) {
            console.error('Failed loading pose-detection UMD from both CDNs', e2);
            return false;
        }
    }
}

async function ensureGraphModelLoaded() {
    if (graphModel) return;
    // tf.min.js should include converter; if not, this will throw
    await tf.ready();
    graphModel = await tf.loadGraphModel(MOVENET_TFJS_GRAPH_URL);
    console.log('TFJS GraphModel MoveNet ready');
}

    } finally {
        loadingEl.style.display = "none";
    }
}

async function startCamera() {
    if (isRunning) return;
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: VIDEO_SIZE.width, height: VIDEO_SIZE.height, facingMode },
        audio: false
    });
    video.srcObject = stream;
    await video.play();
    canvas.width = video.videoWidth || VIDEO_SIZE.width;
    canvas.height = video.videoHeight || VIDEO_SIZE.height;
    isRunning = true;
    requestAnimationFrame(loop);
}

async function stopCamera() {
    isRunning = false;
    if (video.srcObject) {
        for (const track of video.srcObject.getTracks()) track.stop();
        video.srcObject = null;
    }
}

function drawKeypointsAndSkeleton(keypoints, scoreThreshold) {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const pairs = [
        [5, 7], [7, 9], // left arm
        [6, 8], [8, 10], // right arm
        [11, 13], [13, 15], // left leg
        [12, 14], [14, 16], // right leg
        [5, 6], [11, 12], // shoulders, hips
        [5, 11], [6, 12], // torso diagonals
    ];
    // Points
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#7aa7ff";
    ctx.fillStyle = "#66e0a3";
    for (let i = 0; i < keypoints.length; i++) {
        const [y, x, s] = keypoints[i];
        if (s < scoreThreshold) continue;
        const px = x * w; const py = y * h;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    // Skeleton
    ctx.strokeStyle = "#66e0a3";
    for (const [a, b] of pairs) {
        const sa = keypoints[a][2];
        const sb = keypoints[b][2];
        if (sa < scoreThreshold || sb < scoreThreshold) continue;
        const ax = keypoints[a][1] * w, ay = keypoints[a][0] * h;
        const bx = keypoints[b][1] * w, by = keypoints[b][0] * h;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
    }
}

function angleBetween(a, b, c) {
    // returns angle ABC in degrees; points are [y,x,score]
    const ay = a[0], ax = a[1];
    const by = b[0], bx = b[1];
    const cy = c[0], cx = c[1];
    const v1x = ax - bx, v1y = ay - by;
    const v2x = cx - bx, v2y = cy - by;
    const dot = v1x * v2x + v1y * v2y;
    const m1 = Math.hypot(v1x, v1y);
    const m2 = Math.hypot(v2x, v2y);
    if (m1 === 0 || m2 === 0) return null;
    const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
}

function updateTips(keypoints, scoreThreshold) {
    tipsList.innerHTML = "";
    const s = i => keypoints[i][2] >= scoreThreshold;
    const add = text => {
        const li = document.createElement("li");
        li.textContent = text;
        tipsList.appendChild(li);
    };
    // Simple cues: keep back straight during squat-like pose
    const LEFT_SHOULDER = 5, RIGHT_SHOULDER = 6, LEFT_HIP = 11, RIGHT_HIP = 12, LEFT_KNEE = 13, RIGHT_KNEE = 14;
    if (s(LEFT_SHOULDER) && s(RIGHT_SHOULDER) && s(LEFT_HIP) && s(RIGHT_HIP)) {
        const midShoulder = [
            (keypoints[LEFT_SHOULDER][0] + keypoints[RIGHT_SHOULDER][0]) / 2,
            (keypoints[LEFT_SHOULDER][1] + keypoints[RIGHT_SHOULDER][1]) / 2,
            1
        ];
        const midHip = [
            (keypoints[LEFT_HIP][0] + keypoints[RIGHT_HIP][0]) / 2,
            (keypoints[LEFT_HIP][1] + keypoints[RIGHT_HIP][1]) / 2,
            1
        ];
        // angle at hip between shoulders-midHip-knees approx for torso tilt
        if ((s(LEFT_KNEE) || s(RIGHT_KNEE))) {
            const knee = s(LEFT_KNEE) ? keypoints[LEFT_KNEE] : keypoints[RIGHT_KNEE];
            const torsoAngle = angleBetween(midShoulder, midHip, knee);
            if (torsoAngle != null && torsoAngle < 150) {
                add("Keep chest up, reduce torso lean.");
            }
        }
    }
    // Knees tracking over toes check proxy: knee vs hip x-distance
    if (s(LEFT_KNEE) && s(LEFT_HIP)) {
        if (Math.abs(keypoints[LEFT_KNEE][1] - keypoints[LEFT_HIP][1]) > 0.2) {
            add("Left knee drifting; align over foot.");
        }
    }
    if (s(RIGHT_KNEE) && s(RIGHT_HIP)) {
        if (Math.abs(keypoints[RIGHT_KNEE][1] - keypoints[RIGHT_HIP][1]) > 0.2) {
            add("Right knee drifting; align over foot.");
        }
    }
    if (!tipsList.children.length) {
        add("Nice form! Hold steady.");
    }
}

// Helper to append a tip message to the tips list
function pushTip(text) {
    const li = document.createElement("li");
    li.textContent = text;
    tipsList.appendChild(li);
}

function updateFps() {
    frameCounter++;
    const now = performance.now();
    if (now - lastFrameTs >= 1000) {
        const fps = frameCounter / ((now - lastFrameTs) / 1000);
        fpsEl.innerHTML = `<strong>FPS:</strong> ${fps.toFixed(1)}`;
        lastFrameTs = now;
        frameCounter = 0;
    }
}

async function loop() {
    if (!isRunning) return;

    if (tfliteModel) {
        // Prepare input tensor: 192x192 RGB
        const scoreThreshold = Number(confRange.value);
        const input = TF.tidy(() => {
            const tfimg = TF.browser.fromPixels(video);
            const resized = TF.image.resizeBilinear(tfimg, [MOVENET_INPUT, MOVENET_INPUT], true);
            const casted = resized.cast("int32");
            const batched = casted.expandDims(0);
            return batched;
        });
        let result;
        try {
            result = tfliteModel.predict(input);
        } catch (e) {
            console.error(e);
        } finally {
            input.dispose();
        }
        if (result) {
            // result shape: [1,1,17,3]
            const data = await result.data();
            result.dispose();
            const keypoints = [];
            // Flatten indexing: [1,1,17,3] -> 17x3 in order
            for (let i = 0; i < 17; i++) {
                const idx = i * 3;
                keypoints.push([data[idx + 0], data[idx + 1], data[idx + 2]]);
            }
            drawKeypointsAndSkeleton(keypoints, scoreThreshold);
            updateTips(keypoints, scoreThreshold);
        }
    } else if (useTfjsFallback && window.poseDetection) {
        if (!pdDetector) {
            try { await initTfjsFallbackDetector(); } catch (e) { /* already logged */ }
        }
        try {
            if (!pdDetector) throw new Error('Detector not ready');
            const poses = await pdDetector.estimatePoses(video, { maxPoses: 1, flipHorizontal: facingMode === 'user' });
            if (poses && poses[0] && poses[0].keypoints) {
                const scoreThreshold = Number(confRange.value);
                // poses[0].keypoints: [{x,y,score,name}, ...]
                const kp = poses[0].keypoints.map(p => [p.y / video.videoHeight, p.x / video.videoWidth, p.score || 0]);
                drawKeypointsAndSkeleton(kp, scoreThreshold);
                updateTips(kp, scoreThreshold);
            }
        } catch (err) {
            console.error('TFJS fallback inference failed', err);
        }
    } else if (graphModel) {
        // Direct TFJS GraphModel path
        const scoreThreshold = Number(confRange.value);
        const input = tf.tidy(() => {
            const tfimg = tf.browser.fromPixels(video);
            const resized = tf.image.resizeBilinear(tfimg, [MOVENET_INPUT, MOVENET_INPUT], true);
            // MoveNet GraphModel expects int32
            const casted = resized.cast('int32');
            const batched = casted.expandDims(0);
            return batched;
        });
        let out;
        try {
            out = graphModel.execute(input);
        } catch (e) {
            console.error('GraphModel execute failed', e);
        } finally {
            input.dispose();
        }
        if (out) {
            const data = await out.data();
            out.dispose();
            const keypoints = [];
            for (let i = 0; i < 17; i++) {
                const idx = i * 3;
                keypoints.push([data[idx + 0], data[idx + 1], data[idx + 2]]);
            }
            drawKeypointsAndSkeleton(keypoints, scoreThreshold);
            updateTips(keypoints, scoreThreshold);
        }
    }
    updateFps();
    requestAnimationFrame(loop);
}

// UI events
confRange.addEventListener("input", () => {
    confVal.textContent = Number(confRange.value).toFixed(2);
});

startBtn.addEventListener("click", async () => {
    await startCamera();
    if (!tfliteModel) {
        // Load model in background; camera will continue
        loadModel();
    }
});

flipBtn.addEventListener("click", async () => {
    facingMode = facingMode === "user" ? "environment" : "user";
    await stopCamera();
    if (!tfliteModel) {
        await loadModel();
    }
    await startCamera();
});

// Defer model load until user starts camera


