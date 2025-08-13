import argparse
import sys
import time
from pathlib import Path

import cv2
import numpy as np


def find_first_existing(paths):
    for p in paths:
        if Path(p).exists():
            return str(p)
    return None


def load_interpreter(model_path):
    try:
        # Prefer lightweight tflite-runtime if available
        from tflite_runtime.interpreter import Interpreter  # type: ignore
        return Interpreter(model_path=model_path)
    except Exception:
        try:
            import tensorflow as tf  # type: ignore
            return tf.lite.Interpreter(model_path=model_path)  # type: ignore
        except Exception as e:
            print("ERROR: Could not import tflite runtime or tensorflow.")
            print("Install one of:\n  pip install tflite-runtime\n  or\n  pip install tensorflow-cpu")
            raise e


def load_tfhub_model():
    try:
        import tensorflow as tf  # type: ignore
        import tensorflow_hub as hub  # type: ignore
    except Exception as e:
        print("ERROR: TF Hub backend not available. Install:\n  pip install tensorflow-cpu tensorflow-hub")
        raise e

    # MoveNet SinglePose Lightning (TF Hub SavedModel)
    module = hub.load("https://tfhub.dev/google/movenet/singlepose/lightning/4")
    model = module.signatures['serving_default']
    # Returns callable: input int32 [1,H,W,3] -> {'output_0': [1,1,17,3]}
    return model


def preprocess_frame(frame_bgr, input_shape, input_dtype):
    # input_shape: [1, H, W, 3]
    target_h = int(input_shape[1])
    target_w = int(input_shape[2])
    img_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
    if input_dtype == np.uint8:
        tensor = img_resized.astype(np.uint8)[None, ...]
    else:
        # Many float models accept [0..1] floats
        tensor = (img_resized.astype(np.float32) / 255.0)[None, ...]
    return tensor


def draw_keypoints_and_skeleton(frame_bgr, keypoints, score_threshold=0.3):
    h, w = frame_bgr.shape[:2]
    # Pairs follow MoveNet indexing
    pairs = [
        (5, 7), (7, 9),    # left arm
        (6, 8), (8, 10),   # right arm
        (11, 13), (13, 15),  # left leg
        (12, 14), (14, 16),  # right leg
        (5, 6), (11, 12),  # shoulders, hips
        (5, 11), (6, 12)   # torso diagonals
    ]
    # Points
    for i in range(17):
        y, x, s = keypoints[i]
        if s < score_threshold:
            continue
        px = int(x * w)
        py = int(y * h)
        cv2.circle(frame_bgr, (px, py), 4, (102, 224, 163), thickness=-1)
    # Lines
    for a, b in pairs:
        sa = keypoints[a][2]
        sb = keypoints[b][2]
        if sa < score_threshold or sb < score_threshold:
            continue
        ax = int(keypoints[a][1] * w)
        ay = int(keypoints[a][0] * h)
        bx = int(keypoints[b][1] * w)
        by = int(keypoints[b][0] * h)
        cv2.line(frame_bgr, (ax, ay), (bx, by), (122, 199, 255), thickness=2)


def main():
    parser = argparse.ArgumentParser(description="MoveNet (TFLite) desktop demo")
    parser.add_argument("--model", type=str, default="",
                        help="Path to MoveNet TFLite model. If not provided, will search ./models/")
    parser.add_argument("--camera", type=int, default=0, help="Camera index (default 0)")
    parser.add_argument("--mirror", action="store_true", help="Mirror preview horizontally")
    parser.add_argument("--threshold", type=float, default=0.3, help="Keypoint score threshold")
    parser.add_argument("--backend", type=str, default="auto", choices=["auto","tflite","tfhub","tf"],
                        help="Inference backend: auto (default), tflite, tfhub (remote), or tf (local SavedModel)")
    parser.add_argument("--tf-saved-model", type=str, default="",
                        help="Path to local TF SavedModel directory for MoveNet (used when --backend tf or auto with path provided)")
    args = parser.parse_args()

    backend = args.backend
    use_tfhub = False
    interpreter = None
    model_fn = None
    input_shape = None
    input_dtype = None

    if backend in ("auto", "tflite"):
        # Resolve model path
        model_path = args.model.strip()
        if not model_path:
            model_path = find_first_existing([
                Path("models/movenet_lightning_int8.tflite"),
                Path("models/movenet_lightning_float32.tflite"),
                Path("models/movenet_lightning.tflite"),  # float16
            ])
        if model_path:
            try:
                print(f"Using TFLite model: {model_path}")
                interpreter = load_interpreter(model_path)
                interpreter.allocate_tensors()
                in_details = interpreter.get_input_details()[0]
                out_details = interpreter.get_output_details()[0]
                input_shape = in_details["shape"]
                input_dtype = in_details["dtype"]
                print(f"Input: shape={input_shape}, dtype={input_dtype}")
            except Exception as e:
                print("WARN: TFLite backend failed:", e)
                interpreter = None
        else:
            print("WARN: No local TFLite model found.")

    # Try local TF SavedModel if requested
    if interpreter is None and backend in ("auto", "tf"):
        sm_dir = args.tf_saved_model.strip()
        if sm_dir:
            try:
                print(f"Loading local TF SavedModel from: {sm_dir}")
                import tensorflow as tf  # type: ignore
                model_fn = tf.saved_model.load(sm_dir).signatures['serving_default']
                input_shape = np.array([1, 192, 192, 3], dtype=np.int32)
                input_dtype = np.int32
                use_tfhub = True
                print("Local TF SavedModel loaded.")
            except Exception as e:
                print("ERROR: Failed to load local TF SavedModel:", e)
                if backend == "tf":
                    sys.exit(1)
        elif backend == "tf":
            print("ERROR: --backend tf requires --tf-saved-model <dir> pointing to MoveNet SavedModel.")
            sys.exit(1)

    # Try TF Hub if still no backend and allowed
    if interpreter is None and not use_tfhub and backend in ("auto", "tfhub"):
        try:
            print("Falling back to TF Hub backend (requires internet for first load)...")
            model_fn = load_tfhub_model()
            # TF Hub MoveNet Lightning expects 192x192 int32
            import tensorflow as tf  # type: ignore
            input_shape = np.array([1, 192, 192, 3], dtype=np.int32)
            input_dtype = np.int32
            use_tfhub = True
            print("TF Hub MoveNet ready.")
        except Exception as e:
            print("ERROR: TF Hub backend failed:", e)
            sys.exit(1)

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"ERROR: Cannot open camera index {args.camera}")
        sys.exit(1)

    last_time = time.time()
    frames = 0
    fps = 0.0

    window_name = "MoveNet TFLite - Desktop"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("WARN: Failed to read frame from camera")
                break

            if args.mirror:
                frame = cv2.flip(frame, 1)

            # Prepare input and run
            if not use_tfhub:
                input_tensor = preprocess_frame(frame, input_shape, input_dtype)
                interpreter.set_tensor(in_details["index"], input_tensor)
                interpreter.invoke()
                keypoints_with_scores = interpreter.get_tensor(out_details["index"])  # [1,1,17,3]
                kps = keypoints_with_scores[0, 0, :, :]  # [17,3]
            else:
                # TF Hub MoveNet expects int32 RGB [0..255], shape [1,192,192,3]
                import tensorflow as tf  # type: ignore
                target_h = 192
                target_w = 192
                img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img_resized = cv2.resize(img_rgb, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
                tensor = img_resized.astype(np.int32)[None, ...]
                outputs = model_fn(tf.convert_to_tensor(tensor, dtype=tf.int32))
                keypoints_with_scores = outputs['output_0'].numpy()  # [1,1,17,3]
                kps = keypoints_with_scores[0, 0, :, :]

            # Draw
            draw_keypoints_and_skeleton(frame, kps, score_threshold=args.threshold)

            # FPS
            frames += 1
            now = time.time()
            if now - last_time >= 1.0:
                fps = frames / (now - last_time)
                frames = 0
                last_time = now
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (50, 230, 150), 2)

            cv2.imshow(window_name, frame)
            key = cv2.waitKey(1) & 0xFF
            if key == 27 or key == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()


