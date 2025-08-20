import React, { useEffect, useMemo } from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  isActive: boolean;
  onPermissionChange?: (hasPermission: boolean) => void;
};

export function CameraView({ isActive, onPermissionChange }: Props) {
  useEffect(() => {
    if (onPermissionChange) {
      // Assume permission granted in native app context; WebView will show a message if not
      onPermissionChange(true);
    }
  }, [onPermissionChange]);

  const html = useMemo(() => `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <style>
        html, body { margin: 0; padding: 0; height: 100%; background: #000000; color: #fff; font-family: -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
        #app { position: fixed; inset: 0; display: grid; grid-template-rows: auto 1fr auto; }
        header { display:none }
        main { position: relative; height: 100%; width: 100%; background:#000; }
        video, canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        canvas { pointer-events: none; background: transparent; }
        .pill { position: absolute; z-index: 2; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); padding: 6px 10px; border-radius: 999px; font-size: 12px; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js"></script>
      <script>
        (function(){
          // Basic shim for legacy getUserMedia
          try {
            if (!navigator.mediaDevices) { navigator.mediaDevices = {}; }
            if (!navigator.mediaDevices.getUserMedia) {
              navigator.mediaDevices.getUserMedia = function(constraints){
                const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                if (!getUserMedia) return Promise.reject(new Error('getUserMedia not supported'));
                return new Promise(function(resolve, reject){ getUserMedia.call(navigator, constraints, resolve, reject); });
              }
            }
          } catch (e) {}

          const state = { facing: 'user', stream: null, pose: null, switching: false };
          const video = document.createElement('video');
          video.setAttribute('playsinline', '');
          video.setAttribute('autoplay', '');
          video.muted = true;
          // Show raw video immediately to avoid initial black screen while ML warms up
          video.style.display = 'block';
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // Place video beneath canvas so it shows the live preview directly
          canvas.style.zIndex = '2';
          video.style.zIndex = '1';

          const debug = document.createElement('div');
          debug.style.cssText = 'position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.5);padding:6px 8px;border-radius:6px;font-size:11px;z-index:3;';
          function setDebug(msg){ debug.textContent = msg; }

          function showPill(text) {
            const pill = document.createElement('div');
            pill.className = 'pill';
            pill.textContent = text;
            document.querySelector('main').appendChild(pill);
          }

          async function startStream(preferredFacing) {
            state.switching = true;
            try { if (state.stream) { state.stream.getTracks().forEach(function(t){ t.stop(); }); } } catch (e) {}
            video.srcObject = null;

            async function tryGet(c) {
              try {
                const s = await navigator.mediaDevices.getUserMedia(c);
                state.stream = s;
                video.srcObject = s;
                const playVideo = async () => { try { await video.play(); } catch (e) {} };
                if (video.readyState >= 2) { await playVideo(); }
                video.onloadedmetadata = playVideo;
                video.oncanplay = playVideo;
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
            var deviceId = pickDeviceIdByFacing(devices, preferredFacing || state.facing);

            if (deviceId && await tryGet({ video: { deviceId: { exact: deviceId } }, audio: false })) { state.switching = false; return true; }
            if (await tryGet({ video: { facingMode: preferredFacing || state.facing }, audio: false })) { state.switching = false; return true; }
            if (await tryGet({ video: true, audio: false })) { state.switching = false; return true; }
            state.switching = false; return false;
          }

          async function setup() {
            const mainEl = document.querySelector('main');
            mainEl.appendChild(video);
            mainEl.appendChild(canvas);
            mainEl.appendChild(debug);

            const pose = new Pose({ locateFile: function(file) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/' + file; } });
            pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
            pose.onResults(onResults);
            state.pose = pose;

            const ok = await startStream('user');
            if (!ok) { showPill('Camera permission is required or no camera available'); return; }

            resize();
            window.addEventListener('resize', resize);

            function drawFallbackFrame() { /* no-op when using native video element for preview */ }

            // Use requestAnimationFrame; we rely on native <video> for preview and only draw overlays
            let raf;
            async function tick() {
              try {
                if (!state.switching && state.stream && video.videoWidth > 0 && video.videoHeight > 0) {
                  if (pose) { await pose.send({ image: video }); }
                }
                setDebug('video: ' + video.videoWidth + 'x' + video.videoHeight + ' readyState:' + video.readyState);
              } catch (e) {}
              raf = requestAnimationFrame(tick);
            }
            raf = requestAnimationFrame(tick);
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
            ctx.clearRect(0, 0, w, h);

            const imgW = (results.image && results.image.width) ? results.image.width : (video ? video.videoWidth : w);
            const imgH = (results.image && results.image.height) ? results.image.height : (video ? video.videoHeight : h);
            const s = Math.min(w / imgW, h / imgH);
            const drawW = imgW * s, drawH = imgH * s;
            const dx = (w - drawW) / 2, dy = (h - drawH) / 2;

            if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); try { video.style.transform = 'scaleX(-1)'; } catch (e) {} }
            else { try { video.style.transform = 'none'; } catch (e) {} }

            // Do not draw the video on canvas; let the <video> show directly and keep canvas only for overlays
            ctx.save();
            const drawX = mirror ? (w - dx - drawW) : dx;
            ctx.beginPath(); ctx.rect(drawX, dy, drawW, drawH); ctx.clip();

            if (results.poseLandmarks) {
              const scaled = results.poseLandmarks.map(function(lm){
                var px = drawX + lm.x * drawW;
                var py = dy + lm.y * drawH;
                return { x: px, y: py, z: lm.z, visibility: lm.visibility };
              });

              const BODY_START = 11;
              const bodyConnections = (POSE_CONNECTIONS || []).filter(function(pair){ return pair[0] >= BODY_START && pair[1] >= BODY_START; });
              ctx.lineWidth = 3; ctx.strokeStyle = '#4F46E5';
              for (var i = 0; i < bodyConnections.length; i++) {
                var a = scaled[bodyConnections[i][0]]; var b = scaled[bodyConnections[i][1]];
                if (!a || !b) continue; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
              }
              ctx.fillStyle = '#22d3ee';
              for (var j = BODY_START; j < scaled.length; j++) { var p = scaled[j]; if (!p) continue; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill(); }

              var hx1 = Infinity, hy1 = Infinity, hx2 = -Infinity, hy2 = -Infinity, hasHead = false;
              for (var k = 0; k <= 10; k++) { var hpt = scaled[k]; if (!hpt) continue; hasHead = true; if (hpt.x < hx1) hx1 = hpt.x; if (hpt.y < hy1) hy1 = hpt.y; if (hpt.x > hx2) hx2 = hpt.x; if (hpt.y > hy2) hy2 = hpt.y; }
              if (hasHead) { const pad = 6; const rx = Math.max(0, hx1 - pad); const ry = Math.max(0, hy1 - pad); const rw = Math.min(w - rx, (hx2 - hx1) + pad * 2); const rh = Math.min(h - ry, (hy2 - hy1) + pad * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = '#f59e0b'; ctx.strokeRect(rx, ry, rw, rh); }
            }
            ctx.restore();
            ctx.restore();
          }

          document.addEventListener('DOMContentLoaded', setup);
        })();
      </script>
    </head>
    <body>
      <div id="app">
        <header></header>
        <main></main>
        <footer></footer>
      </div>
    </body>
  </html>` as const, []);

  const cameraHeight = Math.round(Dimensions.get('window').height * 0.7);
  return (
    <View style={{ height: cameraHeight }}>
      {isActive ? (
        <WebView
          originWhitelist={["*"]}
          source={{ html, baseUrl: 'https://mediapipe.local' }}
          allowFileAccess
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          style={{ height: '100%', width: '100%', backgroundColor: 'black' }}
          {...(Platform.OS === 'android' ? {
            onPermissionRequest: (event: any) => {
              try { event?.grant?.(event?.resources ?? []); } catch {}
            },
          } : {})}
        />
      ) : (
        <View style={{ backgroundColor: '#F3F4F6', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#6B7280' }}>Click "Start Tracking" to activate the camera</Text>
        </View>
      )}
    </View>
  );
}


