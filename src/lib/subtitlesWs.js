export function connectSubtitles({ sid, token, onOpen, onMessage, onClose, onError }) {
  // 백엔드가 인터셉터 적용되어 있으면 token 필수
  const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8080';
  const url = `${WS_BASE}/ws/subtitles?sid=${encodeURIComponent(sid)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

  const ws = new WebSocket(url);

  ws.onopen = () => onOpen && onOpen();
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      onMessage && onMessage(msg);
    } catch (e) {
      console.error('WS message parse error:', e);
    }
  };
  ws.onclose = () => onClose && onClose();
  ws.onerror = (e) => onError && onError(e);

  return ws;
}

// 예: 송신 헬퍼
export function sendSubtitle(ws, { type = 'final', text, ts = Date.now() }) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, text, ts }));
  }
}
