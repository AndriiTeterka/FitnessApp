// Web Worker executing MediaPipe PoseLandmarker inference.
// Use classic worker script with importScripts so MediaPipe can internally load
// additional resources using importScripts as well.
importScripts("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2");
const visionNS = self.tasksVision || self;
const { PoseLandmarker, FilesetResolver } = visionNS;

let landmarker = null;
let options = null;

const MODEL_URLS = {
  heavy:
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
  lite:
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
};

self.onmessage = async (e) => {
  const { type } = e.data;
  if (type === "init") {
    const { model, options: opts } = e.data;
    options = opts;
    await loadModel(model);
    self.postMessage({ type: "ready" });
  } else if (type === "frame") {
    const { bitmap, ts } = e.data;
    if (!landmarker) {
      bitmap.close();
      return;
    }
    const res = landmarker.detectForVideo(bitmap, ts);
    bitmap.close();
    self.postMessage({ type: "result", result: res, ts });
  }
};

async function loadModel(model) {
  if (landmarker) landmarker.close();
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm",
  );
  landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URLS[model], delegate: "GPU" },
    ...options,
  });
}

