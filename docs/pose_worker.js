/* global vision */
let landmarker = null;
let running = false;
let loaded = false;

self.onmessage = async (e) => {
  const { type } = e.data;
  if (type === "init") {
    if (landmarker) landmarker.close();
    const opts = e.data.options || {};
    const model =
      e.data.model === "lite"
        ? "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
        : "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task";
    try {
      if (!loaded) {
        try {
          // Load the MediaPipe vision bundle from the CDN
          importScripts(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.1/vision_bundle.js"
          );
          loaded = true;
        } catch (err) {
          self.postMessage({
            type: "error",
            error: `Failed to load vision bundle: ${err.message}`,
          });
          return;
        }
      }
      const { FilesetResolver, PoseLandmarker } = vision;
      // Resolve WASM files from the CDN
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.1/wasm"
      );
      landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: model, delegate: "GPU" },
        ...opts,
      });
      running = true;
    } catch (err) {
      self.postMessage({ type: "error", error: err.message });
    }
  } else if (type === "frame" && running && landmarker) {
    const bitmap = e.data.image;
    const ts = e.data.ts;
    const t0 = performance.now();
    const res = landmarker.detectForVideo(bitmap, ts);
    const latency = performance.now() - t0;
    bitmap.close();
    self.postMessage({
      type: "result",
      result: { landmarks: res.landmarks },
      latency,
    });
  } else if (type === "close") {
    running = false;
    if (landmarker) landmarker.close();
    landmarker = null;
  }
};
