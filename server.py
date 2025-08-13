import base64
import io
import os
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

# Prefer TensorFlow CPU for server inference
import tensorflow as tf  # type: ignore
import tensorflow_hub as hub  # type: ignore


APP_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(APP_DIR, "web")

# Ensure TF Hub cache is local to project to avoid repeated downloads
os.environ.setdefault("TFHUB_CACHE_DIR", os.path.join(APP_DIR, "models", "hub_cache"))

app = FastAPI()
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def get_index() -> HTMLResponse:
    index_path = os.path.join(WEB_DIR, "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="index.html not found")
    with open(index_path, "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())


@app.get("/tfjs", response_class=HTMLResponse)
def get_tfjs() -> HTMLResponse:
    tfjs_path = os.path.join(WEB_DIR, "tfjs.html")
    if not os.path.exists(tfjs_path):
        raise HTTPException(status_code=404, detail="tfjs.html not found")
    with open(tfjs_path, "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


# Load MoveNet SinglePose Thunder from TF Hub (higher accuracy, slower than Lightning)
try:
    _movenet = hub.load("https://tfhub.dev/google/movenet/singlepose/thunder/4")
    model_fn = _movenet.signatures["serving_default"]
except Exception as e:  # pragma: no cover
    # Provide a clearer error when model fails to download (network restrictions)
    raise RuntimeError(
        "Failed to load MoveNet from TF Hub. Ensure internet access at least once, or provide a local SavedModel."
    ) from e


def _decode_data_url_to_bgr(data_url: str) -> np.ndarray:
    # Expected format: data:image/jpeg;base64,<base64-encoded>
    if "," not in data_url:
        raise ValueError("Invalid data URL")
    header, b64 = data_url.split(",", 1)
    img_bytes = base64.b64decode(b64)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    frame_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if frame_bgr is None:
        raise ValueError("Failed to decode image")
    return frame_bgr


def _infer_keypoints(frame_bgr: np.ndarray) -> List[List[float]]:
    # Prepare input: RGB int32 [1,256,256,3] for Thunder
    img_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (256, 256), interpolation=cv2.INTER_LINEAR)
    tensor = img_resized.astype(np.int32)[None, ...]
    outputs = model_fn(tf.convert_to_tensor(tensor, dtype=tf.int32))
    keypoints_with_scores = outputs["output_0"].numpy()  # [1,1,17,3]
    kps = keypoints_with_scores[0, 0, :, :].tolist()  # 17x3
    return kps


@app.post("/infer")
def infer(payload: dict) -> dict:
    try:
        data_url = payload.get("image")
        if not data_url:
            raise ValueError("Missing 'image' field")
        frame_bgr = _decode_data_url_to_bgr(data_url)
        keypoints = _infer_keypoints(frame_bgr)
        return {"keypoints": keypoints}
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(e)) from e


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)


