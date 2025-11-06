import { useDataChannel } from '@livekit/components-react';
import { useEffect, useState, useRef } from 'react';

const SubtitleOverlay = () => {
    const [currentSubtitle, setCurrentSubtitle] = useState(null);
    const [fadeOut, setFadeOut] = useState(false);
    const timerRef = useRef(null);
    const fadeTimerRef = useRef(null);

    // 타이머 정리 함수
    const clearTimers = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (fadeTimerRef.current) {
            clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = null;
        }
    };

    // ✅ STT 데이터 수신 (개선된 버전)
    useDataChannel('stt', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            console.log('📺 Subtitle received:', {
                final: data.final,
                username: data.username,
                identity: data.identity,
                text: data.text?.substring(0, 30) + '...',
            });

            // Final STT만 자막으로 표시 (Partial은 ConferenceUI에서 별도 표시)
            if (data.final && data.text && data.text.trim()) {
                // 기존 타이머 정리
                clearTimers();

                setFadeOut(false);
                setCurrentSubtitle({
                    username: data.username || data.identity || 'Unknown',
                    identity: data.identity,
                    text: data.text,
                    timestamp: Date.now(),
                });

                // 3초 후 페이드아웃 시작
                fadeTimerRef.current = setTimeout(() => {
                    setFadeOut(true);
                }, 3000);

                // 4초 후 완전히 제거
                timerRef.current = setTimeout(() => {
                    setCurrentSubtitle(null);
                    setFadeOut(false);
                }, 4000);
            }
        } catch (error) {
            console.error('❌ Subtitle 파싱 오류:', error);
        }
    });

    // ✅ 번역 데이터 수신 (개선된 버전)
    useDataChannel('translation_data', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            if (data.type === 'translation' && data.translatedText && data.translatedText.trim()) {
                console.log('🌍 Translation received:', {
                    username: data.speakerName || data.username,
                    langFrom: data.langFrom,
                    langTo: data.langTo,
                    originalText: data.originalText?.substring(0, 30) + '...',
                    translatedText: data.translatedText?.substring(0, 30) + '...',
                });

                // 기존 타이머 정리
                clearTimers();

                setFadeOut(false);
                setCurrentSubtitle({
                    username: data.speakerName || data.username || 'Unknown',
                    originalText: data.originalText,
                    translatedText: data.translatedText,
                    langFrom: data.langFrom || 'KO',
                    langTo: data.langTo || 'EN',
                    isTranslation: true,
                    timestamp: Date.now(),
                });

                // 5초 후 페이드아웃 (번역은 좀 더 길게)
                fadeTimerRef.current = setTimeout(() => {
                    setFadeOut(true);
                }, 5000);

                // 6초 후 완전히 제거
                timerRef.current = setTimeout(() => {
                    setCurrentSubtitle(null);
                    setFadeOut(false);
                }, 6000);
            }
        } catch (error) {
            console.error('❌ Translation 파싱 오류:', error);
        }
    });

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    if (!currentSubtitle) return null;

    // 번역 자막인 경우
    if (currentSubtitle.isTranslation) {
        return (
            <div
                className={`fixed bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-3xl z-50 transition-all duration-500 ease-out ${
                    fadeOut ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                }`}
            >
                <div className="relative bg-gradient-to-br from-slate-900/96 via-slate-800/96 to-slate-900/96 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                    {/* 미묘한 배경 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-cyan-500/[0.03]"></div>

                    {/* 상단 정보 바 */}
                    <div className="relative flex items-center justify-between px-5 md:px-7 py-2.5 bg-gradient-to-r from-blue-500/[0.07] via-cyan-500/[0.06] to-blue-500/[0.07] border-b border-white/[0.06]">
                        <span className="text-xs md:text-sm font-semibold text-slate-300/90 tracking-wide">{currentSubtitle.username}</span>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-blue-300/90">
                            <span className="uppercase">{currentSubtitle.langFrom}</span>
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="uppercase">{currentSubtitle.langTo}</span>
                        </div>
                    </div>

                    {/* 컨텐츠 영역 */}
                    <div className="relative px-5 md:px-7 py-4 md:py-5 space-y-2.5">
                        {/* 원문 */}
                        <p className="text-base md:text-lg text-slate-300/90 leading-relaxed font-light">{currentSubtitle.originalText}</p>

                        {/* 구분선 */}
                        <div className="flex items-center gap-2.5 py-0.5">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-slate-600/60"></div>
                            <span className="text-[10px] md:text-xs text-slate-500/80 font-medium px-2">번역</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600/60 to-slate-600/60"></div>
                        </div>

                        {/* 번역문 */}
                        <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentSubtitle.translatedText}</p>
                    </div>

                    {/* 하단 글로우 라인 */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-400/35 to-transparent"></div>
                </div>
            </div>
        );
    }

    // 일반 STT 자막인 경우
    return (
        <div
            className={`fixed bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-3xl z-50 transition-all duration-500 ease-out ${
                fadeOut ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
        >
            <div className="relative bg-gradient-to-br from-slate-900/96 via-slate-800/96 to-slate-900/96 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                {/* 미묘한 배경 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] via-transparent to-pink-500/[0.03]"></div>

                {/* 상단 사용자 바 */}
                <div className="relative px-5 md:px-7 py-2.5 bg-gradient-to-r from-slate-800/35 via-slate-800/25 to-slate-800/35 border-b border-white/[0.06]">
                    <span className="text-xs md:text-sm font-semibold text-slate-300/90 tracking-wide">{currentSubtitle.username}</span>
                </div>

                {/* 자막 텍스트 */}
                <div className="relative px-5 md:px-7 py-4 md:py-5">
                    <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentSubtitle.text}</p>
                </div>

                {/* 하단 글로우 라인 */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>
            </div>
        </div>
    );
};

export default SubtitleOverlay;
