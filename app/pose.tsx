import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PoseScreen() {
  const html = useMemo(() => `<!doctype html>
  <html>
    <head>
      <meta charset=\"utf-8\" />
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />
      <style>
        html, body { margin: 0; padding: 0; height: 100%; background: #000000; color: #fff; font-family: -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
        #app { position: fixed; inset: 0; display: grid; grid-template-rows: auto 1fr auto; }
        header { padding: 12px 16px; background: #111633; border-bottom: 1px solid rgba(255,255,255,0.08); }
        header h1 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.2px; }
        main { position: relative; }
        video, canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        canvas { pointer-events: none; }
        .pill { position: absolute; z-index: 2; bottom: 16px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); padding: 8px 12px; border-radius: 999px; font-size: 12px; }
      </style>
      <script src=\"https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js\"></script>
      <script src=\"https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js\"></script>
      <script src=\"https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js\"></script>
      <script>
        (function(){
          const state = { facing: 'user', stream: null, pose: null, switching: false };
          const video = document.createElement('video');
          video.setAttribute('playsinline', '');
          video.setAttribute('autoplay', '');
          video.muted = true;
          // Hide the raw video element to avoid initial unflipped flicker; we render only on canvas
          video.style.display = 'none';
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          function showPill(text) {
            const pill = document.createElement('div');
            pill.className = 'pill';
            pill.textContent = text;
            document.querySelector('main').appendChild(pill);
          }

          function createUI() {
            const btn = document.createElement('button');
            btn.textContent = 'Switch Camera';
            btn.id = 'switch';
            btn.style.position = 'absolute';
            btn.style.top = '12px';
            btn.style.right = '12px';
            btn.style.zIndex = '3';
            btn.style.background = '#ffffff22';
            btn.style.border = '1px solid rgba(255,255,255,0.25)';
            btn.style.color = 'white';
            btn.style.padding = '8px 10px';
            btn.style.borderRadius = '10px';
            btn.style.backdropFilter = 'blur(6px)';
            document.querySelector('main').appendChild(btn);
            btn.addEventListener('click', async function(){
              state.facing = state.facing === 'user' ? 'environment' : 'user';
              await startStream(state.facing);
            });
          }

          async function startStream(preferredFacing) {
            state.switching = true;
            try {
              if (state.stream) { state.stream.getTracks().forEach(function(t){ t.stop(); }); }
            } catch (e) {}
            video.srcObject = null;

            async function tryGet(c) {
              try {
                const s = await navigator.mediaDevices.getUserMedia(c);
                state.stream = s;
                video.srcObject = s;
                if (video.readyState >= 2) { try { await video.play(); } catch (e) {} }
                video.onloadedmetadata = function(){ try { video.play(); } catch (e) {} };
                return true;
              } catch (e) { return false; }
            }

            function pickDeviceIdByFacing(devices, facing) {
              try {
                const vids = devices.filter(function(d){ return d.kind === 'videoinput'; });
                if (vids.length === 0) return null;
                function labelMatches(label, facingWanted) {
                  const L = (label || '').toLowerCase();
                  if (facingWanted === 'environment') return L.indexOf('back') >= 0 || L.indexOf('rear') >= 0 || L.indexOf('environment') >= 0;
                  return L.indexOf('front') >= 0 || L.indexOf('user') >= 0 || L.indexOf('face') >= 0;
                }
                var match = vids.find(function(d){ return labelMatches(d.label, facing); });
                if (match) return match.deviceId;
                var opp = vids.find(function(d){ return labelMatches(d.label, facing === 'user' ? 'environment' : 'user'); });
                if (opp) return opp.deviceId;
                return vids[0].deviceId;
              } catch (e) { return null; }
            }

            var devices = [];
            try { devices = await navigator.mediaDevices.enumerateDevices(); } catch (e) {}
            var deviceId = pickDeviceIdByFacing(devices, preferredFacing);

            if (deviceId && await tryGet({ video: { deviceId: { exact: deviceId } }, audio: false })) { state.switching = false; return true; }
            if (await tryGet({ video: { facingMode: preferredFacing }, audio: false })) { state.switching = false; return true; }
            if (await tryGet({ video: { facingMode: preferredFacing === 'user' ? 'environment' : 'user' }, audio: false })) { state.switching = false; return true; }
            if (await tryGet({ video: true, audio: false })) { state.switching = false; return true; }
            state.switching = false;
            return false;
          }

          async function setup() {
            const mainEl = document.querySelector('main');
            mainEl.appendChild(video);
            mainEl.appendChild(canvas);
            createUI();

            const pose = new Pose({ locateFile: function(file) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/' + file; } });
            pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
            pose.onResults(onResults);
            state.pose = pose;

            // Start stream before any rendering to avoid initial flip state
            const ok = await startStream(state.facing);
            if (!ok) {
              showPill('Camera permission is required or no camera available');
              return;
            }

            resize();
            window.addEventListener('resize', resize);

            async function tick() {
              if (!state.switching && state.stream && video && video.videoWidth > 0 && video.videoHeight > 0) {
                try { await pose.send({ image: video }); } catch (e) {}
              }
              requestAnimationFrame(tick);
            }
            tick();
          }

          function resize() {
            const el = document.querySelector('main');
            const w = el.clientWidth, h = el.clientHeight;
            canvas.width = w; canvas.height = h;
          }

          function onResults(results) {
            const w = canvas.width, h = canvas.height;
            const mirror = state.facing === 'user';
            ctx.save();
            // Fill black to ensure black letterbox bars
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Compute contain geometry to avoid distortion
            const imgW = (results.image && results.image.width) ? results.image.width : (video ? video.videoWidth : w);
            const imgH = (results.image && results.image.height) ? results.image.height : (video ? video.videoHeight : h);
            const s = Math.min(w / imgW, h / imgH);
            const drawW = imgW * s, drawH = imgH * s;
            const dx = (w - drawW) / 2, dy = (h - drawH) / 2;

            // Apply mirroring transform for front camera so video and overlay both flip consistently
            if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }

            // Clip to the video frame rectangle so nothing is drawn on the black bars
            ctx.save();
            ctx.beginPath();
            ctx.rect(dx, dy, drawW, drawH);
            ctx.clip();

            // Draw video frame
            if (results.image) { ctx.drawImage(results.image, dx, dy, drawW, drawH); }

            if (results.poseLandmarks) {
              // Prepare scaled landmark points in pixels (no extra mirroring here, since context may be flipped)
              const scaled = results.poseLandmarks.map(function(lm){
                var px = dx + lm.x * drawW;
                var py = dy + lm.y * drawH;
                return { x: px, y: py, z: lm.z, visibility: lm.visibility };
              });

              // Draw body connectors (exclude head indices < 11)
              const BODY_START = 11;
              // When mirroring the canvas, we still use the same connections; left/right remain consistent visually
              const bodyConnections = (POSE_CONNECTIONS || []).filter(function(pair){ return pair[0] >= BODY_START && pair[1] >= BODY_START; });
              ctx.lineWidth = 4; ctx.strokeStyle = '#4F46E5';
              for (var i = 0; i < bodyConnections.length; i++) {
                var a = scaled[bodyConnections[i][0]]; var b = scaled[bodyConnections[i][1]];
                if (!a || !b) continue;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
              }

              // Draw body landmark points
              ctx.fillStyle = '#22d3ee';
              for (var j = BODY_START; j < scaled.length; j++) {
                var p = scaled[j]; if (!p) continue;
                ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill();
              }

              // Head rectangle (indices 0..10)
              var hx1 = Infinity, hy1 = Infinity, hx2 = -Infinity, hy2 = -Infinity, hasHead = false;
              for (var k = 0; k <= 10; k++) {
                var hpt = scaled[k];
                if (!hpt || hpt.x == null || hpt.y == null) continue;
                hasHead = true;
                if (hpt.x < hx1) hx1 = hpt.x; if (hpt.y < hy1) hy1 = hpt.y;
                if (hpt.x > hx2) hx2 = hpt.x; if (hpt.y > hy2) hy2 = hpt.y;
              }
              if (hasHead) {
                const pad = 8; // add some padding around head
                const rx = Math.max(0, hx1 - pad);
                const ry = Math.max(0, hy1 - pad);
                const rw = Math.min(w - rx, (hx2 - hx1) + pad * 2);
                const rh = Math.min(h - ry, (hy2 - hy1) + pad * 2);
                ctx.lineWidth = 3; ctx.strokeStyle = '#f59e0b';
                ctx.strokeRect(rx, ry, rw, rh);
              }
            }

            // Restore to remove the clip (and keep any mirror transform until final restore)
            ctx.restore();
            ctx.restore();
          }

          document.addEventListener('DOMContentLoaded', setup);
        })();
      </script>
    </head>
    <body>
      <div id=\"app\">
        <header><h1>MediaPipe Pose</h1></header>
        <main>
          <div class=\"pill\">Live pose detection</div>
        </main>
        <footer style=\"padding: 8px 12px; font-size: 11px; color: #a0a4b8; text-align: center;\">Keep your device steady for best results</footer>
      </div>
    </body>
  </html>` as const, []);

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html, baseUrl: 'https://mediapipe.local' }}
      allowFileAccess
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      // Enable camera on Android WebView
      {...(Platform.OS === 'android' ? {
        onPermissionRequest: (event: any) => {
          try {
            event?.grant?.(event?.resources ?? []);
          } catch {}
        },
      } : {})}
    />
  );
}


