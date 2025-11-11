// src/translation/TranslationProvider.jsx
import React, { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ai } from '../axios'; // 기존과 동일: 8000 포인트용 axios 인스턴스

const TranslationContext = createContext(null);

// 전역 Job 상태 타입 가이드
// jobKey: `${relPath}::${target}`
/*
job = {
  jobKey, docId, title, relPath, source, target,
  status: 'IDLE'|'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED',
  percent: 0..100,
  error: string|null,
  startedAt: number,
}
*/

export const TranslationProvider = ({ children }) => {
    const [jobs, setJobs] = useState({}); // { jobKey: job }
    const eventSourcesRef = useRef({}); // { jobKey: EventSource }

    // HUD 표시 여부
    const [hudOpen, setHudOpen] = useState(true);

    const base = useMemo(() => {
        const v = (ai && ai.defaults && ai.defaults.baseURL) || (import.meta && import.meta.env && import.meta.env.VITE_AI_BASE) || 'http://127.0.0.1:8000';
        return v.replace(/\/+$/, '');
    }, []);

    const toast = useCallback((title, icon = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
        });
    }, []);

    const closeEventSource = useCallback((jobKey) => {
        const es = eventSourcesRef.current[jobKey];
        if (es) {
            es.close();
            delete eventSourcesRef.current[jobKey];
        }
    }, []);

    const removeJob = useCallback(
        (jobKey) => {
            setJobs((prev) => {
                const copy = { ...prev };
                delete copy[jobKey];
                return copy;
            });
            closeEventSource(jobKey);
        },
        [closeEventSource],
    );

    const upsertJob = useCallback((patch) => {
        setJobs((prev) => {
            const cur = prev[patch.jobKey] || {};
            return {
                ...prev,
                [patch.jobKey]: { ...cur, ...patch },
            };
        });
    }, []);

    const startJob = useCallback(
        ({ relPath, source, target, docId, title }) => {
            if (!relPath) {
                toast('문서 경로(rel_path)가 없습니다', 'error');
                return;
            }
            const jobKey = `${relPath}::${target}`;
            // 중복 실행 방지
            if (eventSourcesRef.current[jobKey]) return;

            // 초기 상태
            upsertJob({
                jobKey,
                docId,
                title,
                relPath,
                source,
                target,
                status: 'PENDING',
                percent: 0,
                error: null,
                startedAt: Date.now(),
            });

            // SSE 열기
            try {
                const url = new URL(`${base}/jobs/translate-doc/stream`);
                url.searchParams.set('rel_path', relPath);
                url.searchParams.set('source', source);
                url.searchParams.set('target', target);

                const es = new EventSource(url.toString()); // 자격증명/쿠키 미사용
                eventSourcesRef.current[jobKey] = es;

                es.onmessage = (ev) => {
                    try {
                        const msg = JSON.parse(ev.data);
                        if (msg.type === 'started') {
                            upsertJob({ jobKey, status: 'PENDING', percent: 0 });
                        } else if (msg.type === 'progress') {
                            const percent = typeof msg.percent === 'number' ? msg.percent : 0;
                            upsertJob({ jobKey, status: 'PROCESSING', percent });
                        } else if (msg.type === 'complete') {
                            upsertJob({ jobKey, status: 'COMPLETED', percent: 100 });
                            toast(`'${title || relPath}' 번역 완료`);
                            // HUD는 5초 뒤 자동 정리(원하면 유지해도 ok)
                            setTimeout(() => removeJob(jobKey), 5000);
                            closeEventSource(jobKey);
                        } else if (msg.type === 'failed') {
                            const errorMsg = msg.error || '번역 실패';
                            upsertJob({ jobKey, status: 'FAILED', error: errorMsg });
                            toast(errorMsg, 'error');
                            closeEventSource(jobKey);
                        }
                    } catch {
                        // 파싱 실패 무시
                    }
                };

                es.onerror = () => {
                    upsertJob({ jobKey, status: 'FAILED', error: 'SSE 연결 끊김' });
                    toast('진행률 스트림 연결이 끊어졌습니다', 'error');
                    closeEventSource(jobKey);
                };
            } catch (e) {
                upsertJob({ jobKey, status: 'FAILED', error: 'SSE 오픈 실패' });
                toast('진행률 스트림을 열 수 없습니다', 'error');
                closeEventSource(jobKey);
            }
        },
        [base, toast, upsertJob, closeEventSource, removeJob],
    );

    const stopJob = useCallback(
        (jobKey) => {
            closeEventSource(jobKey);
            removeJob(jobKey);
        },
        [closeEventSource, removeJob],
    );

    // 페이지 언마운트/새로고침 보호는 필요 시 추가
    useEffect(() => {
        return () => {
            // 앱 종료 시 모든 SSE 종료
            Object.keys(eventSourcesRef.current).forEach((k) => {
                eventSourcesRef.current[k]?.close();
            });
            eventSourcesRef.current = {};
        };
    }, []);

    const value = useMemo(
        () => ({
            jobs,
            startJob,
            stopJob,
            toast,
            hudOpen,
            setHudOpen,
            // 헬퍼
            getJobByDocId: (docId) => Object.values(jobs).find((j) => j.docId === docId),
        }),
        [jobs, startJob, stopJob, toast, hudOpen],
    );

    return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslator = () => {
    const ctx = useContext(TranslationContext);
    if (!ctx) throw new Error('useTranslator must be used within TranslationProvider');
    return ctx;
};
