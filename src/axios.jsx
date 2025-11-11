import axios from 'axios';

// 기본: Spring Boot (8080)
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:8080',
    // withCredentials: true, // 필요 시
    // timeout: 30000,
});

// FastAPI (8000)
export const ai = axios.create({
    baseURL: import.meta.env.VITE_AI_BASE ?? 'http://127.0.0.1:8000',
    headers: { 'Content-Type': 'application/json' },
    // withCredentials: true, // 필요 시
    // timeout: 30000,
});

// 과거 default 사용 코드 호환: 기본은 8080을 default로 유지
export default api;
