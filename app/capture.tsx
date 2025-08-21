import tw from '@/utils/tw';
import React, { useMemo, useState } from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Capture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const { height: screenH, width: screenW } = Dimensions.get('window');
  // Use 3:4 aspect for the frame, and keep it a touch smaller than before
  const cameraHeight = Math.min(screenH * 0.68, (screenW - 32) * 4 / 3);

  const html = useMemo(() => `<!doctype html>
  <html>
    <head>
      <meta charset=\"utf-8\" />
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\" />
      <style>
        html, body { margin: 0; padding: 0; height: 100%; background: #000; }
        #root { position: fixed; inset: 0; }
        /* Hide raw video to avoid initial flipped flash; we render only on canvas */
        video { display: none; }
        canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
        .metric { position: absolute; top: 12px; padding: 8px 10px; border-radius: 12px; background: rgba(0,0,0,0.55); color: #fff; font-family: -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
        .metric.left { left: 12px; }
        .metric.right { right: 12px; }
        .metric .title { font-size: 12px; opacity: 0.9; }
        .metric .value { font-size: 18px; font-weight: 700; margin-top: 2px; }
      </style>
      <script src=\"https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js\"></script>
      <script src=\"https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js\"></script>
      <script>
        (function(){
          const state = { facing: 'user', stream: null };
          const video = document.createElement('video');
          video.setAttribute('playsinline','');
          video.setAttribute('autoplay','');
          video.muted = true;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const repsEl = document.createElement('div'); repsEl.className = 'metric left'; repsEl.innerHTML = '<div class="title">Reps</div><div class="value" id="reps">0</div>';
          const scoreEl = document.createElement('div'); scoreEl.className = 'metric right'; scoreEl.innerHTML = '<div class="title">Posture Score</div><div class="value" id="score">--</div>';

          function containDraw(img) {
            const w = canvas.width, h = canvas.height;
            const iw = img.width || video.videoWidth; const ih = img.height || video.videoHeight;
            const s = Math.min(w/iw, h/ih); const dw = iw*s, dh = ih*s; const dx = (w-dw)/2, dy = (h-dh)/2;
            return { dx, dy, dw, dh };
          }

          async function start() {
            if (state.stream) { try { state.stream.getTracks().forEach(t=>t.stop()); } catch(e){} }
            try {
              const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: state.facing }, audio: false });
              state.stream = s; video.srcObject = s; video.onloadedmetadata = () => { try { video.play(); } catch(e){} };
            } catch(e) {}
          }

          // Simple elbow-angle based rep counter and posture score
          let phaseDown = false; let reps = 0;
          function angle(a,b,c){ if(!a||!b||!c) return NaN; const abx=a.x-b.x, aby=a.y-b.y, cbx=c.x-b.x, cby=c.y-b.y; const dot=abx*cbx+aby*cby; const mab=Math.hypot(abx,aby), mcb=Math.hypot(cbx,cby); if(mab===0||mcb===0) return NaN; const cos=Math.max(-1,Math.min(1,dot/(mab*mcb))); return Math.acos(cos)*180/Math.PI; }
          function postureScore(lm){ const sx=(lm[11]?.x+lm[12]?.x)/2, sy=(lm[11]?.y+lm[12]?.y)/2; const hx=(lm[23]?.x+lm[24]?.x)/2, hy=(lm[23]?.y+lm[24]?.y)/2; if([sx,sy,hx,hy].some(v=>!isFinite(v))) return 0; const vx=hx-sx, vy=hy-sy; const dev=Math.abs(Math.atan2(vx,vy))*180/Math.PI; return Math.max(0, Math.min(100, Math.round(100 - dev*1.5))); }

          function onResults(results) {
            const w = canvas.width, h = canvas.height; ctx.clearRect(0,0,w,h);
            const { dx, dy, dw, dh } = containDraw(results.image || video);
            // Mirror output so it behaves like a selfie view
            ctx.save(); ctx.translate(w,0); ctx.scale(-1,1); if (results.image) { ctx.drawImage(results.image, dx, dy, dw, dh); } ctx.restore();

            if (!results.poseLandmarks) return;
            const pts = results.poseLandmarks;
            // Simple draw: mirror coordinates to match mirrored video
            function mapP(p){ return { x: w - (dx + p.x*dw), y: dy + p.y*dh } }
            const C = (POSE_CONNECTIONS||[]).filter(c=>c[0]>=11 && c[1]>=11);
            ctx.lineWidth = 4; ctx.strokeStyle = '#4F46E5';
            for (let i=0;i<C.length;i++){ const a = mapP(pts[C[i][0]]), b = mapP(pts[C[i][1]]); if(!a||!b) continue; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
            ctx.fillStyle = '#22d3ee';
            for (let j=11;j<pts.length;j++){ const p = mapP(pts[j]); ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill(); }

            // Rep counter (push-up style using elbow angle)
            const le = angle(pts[11], pts[13], pts[15]); const re = angle(pts[12], pts[14], pts[16]);
            const elbow = Math.min(le || 999, re || 999);
            if (!isNaN(elbow)) {
              if (!phaseDown && elbow < 70) phaseDown = true;
              if (phaseDown && elbow > 150) { reps++; phaseDown = false; }
            }
            const score = postureScore(pts);
            const repsNode = document.getElementById('reps'); if (repsNode) repsNode.textContent = String(reps);
            const scoreNode = document.getElementById('score'); if (scoreNode) scoreNode.textContent = score + '%';
          }

          function resize(){ const el = document.getElementById('root'); canvas.width = el.clientWidth; canvas.height = el.clientHeight; }

          document.addEventListener('DOMContentLoaded', async function(){
            const root = document.getElementById('root'); root.appendChild(video); root.appendChild(canvas); root.appendChild(repsEl); root.appendChild(scoreEl);
            const pose = new Pose({ locateFile: f => 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/' + f });
            pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
            pose.onResults(onResults);
            await start();
            resize(); window.addEventListener('resize', resize);
            async function tick(){ try { await pose.send({ image: video }); } catch(e){} requestAnimationFrame(tick); }
            tick();
          });
        })();
      </script>
    </head>
    <body>
      <div id=\"root\"></div>
    </body>
  </html>` as const, []);
  return (
    <View style={tw`flex-1 bg-[#0b0f19]`}>
      {/* Header */}
      <View style={tw`px-6 py-6`}>
        <Text style={tw`text-3xl font-extrabold text-white text-center mb-1`}>Motion Tracker</Text>
        <Text style={tw`text-gray-400 text-center`}>AI-powered posture correction</Text>
      </View>

      {/* Camera Container */}
      <View style={tw`mx-4 mb-6`}>
        <View style={tw`bg-[#111827] rounded-2xl overflow-hidden border border-[#1f2937]`}>
          <View style={[tw`relative`, { height: cameraHeight }]}>
            {isCapturing ? (
              <WebView
                originWhitelist={["*"]}
                source={{ html, baseUrl: 'https://mediapipe.local' }}
                allowFileAccess
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                style={tw`w-full h-full`}
                {...(Platform.OS === 'android' ? {
                  onPermissionRequest: (event: any) => {
                    try { event?.grant?.(event?.resources ?? []); } catch {}
                  },
                } : {})}
              />
            ) : (
              <View style={tw`bg-[#1f2937] w-full h-full items-center justify-center`}>
                <Text style={tw`text-sm text-gray-400`}>Press Start to begin posture tracking</Text>
              </View>
            )}
            {/* Floating control */}
            <View style={tw`absolute left-0 right-0 bottom-3 px-4`}>
              <TouchableOpacity
                onPress={() => setIsCapturing((v) => !v)}
                style={tw.style(
                  `rounded-full py-3 items-center mx-auto w-60`,
                  isCapturing ? `bg-red-600` : `bg-yellow-200`
                )}
                activeOpacity={0.9}
              >
                <Text style={tw`${isCapturing ? 'text-white' : 'text-black'} font-bold`}>
                  {isCapturing ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={tw`mx-4`}>
        <View style={tw`bg-[#111827] rounded-2xl p-4 border border-[#1f2937]`}>
          <Text style={tw`text-white font-semibold mb-2`}>Real-time Feedback</Text>
          <Text style={tw`text-gray-300 text-sm`}>Maintain head up, neutral spine, and engage core.</Text>
        </View>
      </View>
    </View>
  );
}

