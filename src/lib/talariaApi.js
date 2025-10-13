import api from '../axios';

// 세션 생성 (10분 TTL: 서버 기본값)
export async function createSession() {
  const { data } = await api.post('/sessions'); 
  // 기대 응답: { session_id, token, ws_url, expires_at }
  return data;
}

export async function endSession(sid) {
  await api.post(`/sessions/${sid}/end`);
}

export async function updateSettings(sid, settings) {
  const { data } = await api.post(`/sessions/${sid}/settings`, settings);
  return data;
}

// --- AI 프록시 (백엔드가 FastAPI로 proxy) ---
export async function stt(body) {
  const { data } = await api.post('/ai/stt', body);
  return data;
}

export async function translate(body) {
  const { data } = await api.post('/ai/translate', body);
  return data;
}

export async function tts(body) {
  const { data } = await api.post('/ai/tts', body);
  return data; // { audio_url } 예상
}

export async function advice(body) {
  const { data } = await api.post('/ai/advice', body);
  return data; // { tips: [...] }
}
