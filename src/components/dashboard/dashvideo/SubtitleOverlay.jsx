import { useDataChannel } from '@livekit/components-react';
import { useEffect, useState, useRef } from 'react';

const SubtitleOverlay = ({ userLocale = 'ko-KR' }) => {
    const [currentSubtitle, setCurrentSubtitle] = useState(null);
    const [fadeOut, setFadeOut] = useState(false);
    const timerRef = useRef(null);
    const fadeTimerRef = useRef(null);

    console.log('🌍 SubtitleOverlay userLocale:', userLocale);

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

    // 🔥 locale 정규화 함수 (ko, ko-KR 등을 통일)
    const normalizeLocale = (locale) => {
        if (!locale) return 'ko-KR';
        const l = String(locale).toLowerCase();
        
        // 이미 BCP47 형식이면 그대로 반환
        if (l.includes('-')) return locale;
        
        // 언어 코드만 있으면 확장
        const map = {
            'ko': 'ko-KR',
            'en': 'en-US',
            'ja': 'ja-JP',
            'zh': 'zh-CN',
        };
        return map[l] || locale;
    };

    // 🔥 STT 데이터 수신 (다국어 번역 처리)
    useDataChannel('stt', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            console.log('📺 Subtitle received:', {
                final: data.final,
                username: data.username,
                locale: data.locale,
                text: data.text?.substring(0, 30) + '...',
                translations: data.translations,
                translationKeys: data.translations ? Object.keys(data.translations) : [],
            });

            // Final STT만 자막으로 표시
            if (data.final && data.text && data.text.trim()) {
                clearTimers();

                const myLocale = normalizeLocale(userLocale);
                const sourceLocale = normalizeLocale(data.locale || 'ko-KR');

                console.log('🔍 Locale comparison:', {
                    myLocale,
                    sourceLocale,
                    isSameLocale: myLocale === sourceLocale,
                });

                // 🔥 내 locale에 맞는 번역 찾기
                let translatedText = null;
                if (data.translations && typeof data.translations === 'object') {
                    // 정확히 일치하는 locale 찾기
                    translatedText = data.translations[myLocale];
                    
                    // 없으면 언어 코드만으로 찾기 (ko-KR -> ko)
                    if (!translatedText && myLocale.includes('-')) {
                        const langCode = myLocale.split('-')[0];
                        translatedText = data.translations[langCode];
                    }
                    
                    console.log('🔍 Translation search:', {
                        myLocale,
                        found: !!translatedText,
                        translatedText: translatedText?.substring(0, 30) + '...',
                    });
                }

                setFadeOut(false);
                setCurrentSubtitle({
                    username: data.username || data.identity || 'Unknown',
                    identity: data.identity,
                    text: data.text,
                    sourceLocale: sourceLocale,
                    translated: translatedText,
                    timestamp: Date.now(),
                });

                // 번역문이 있으면 5초, 없으면 3초 후 페이드아웃
                const fadeDelay = translatedText ? 5000 : 3000;
                const removeDelay = translatedText ? 6000 : 4000;

                fadeTimerRef.current = setTimeout(() => {
                    setFadeOut(true);
                }, fadeDelay);

                timerRef.current = setTimeout(() => {
                    setCurrentSubtitle(null);
                    setFadeOut(false);
                }, removeDelay);
            }
        } catch (error) {
            console.error('❌ Subtitle 파싱 오류:', error);
        }
    });

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    if (!currentSubtitle) return null;

    const myLocale = normalizeLocale(userLocale);
    const showTranslation = currentSubtitle.translated && currentSubtitle.sourceLocale !== myLocale;

    // 번역이 있는 경우
    if (showTranslation) {
        return (
            <div
                className={`w-[90%] md:w-[80%] max-w-3xl transition-all duration-500 ease-out ${
                    fadeOut ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                } mx-auto`}
            >
                <div className="relative bg-gradient-to-br from-slate-900/96 via-slate-800/96 to-slate-900/96 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-cyan-500/[0.03]"></div>

                    {/* 상단 정보 바 */}
                    <div className="relative flex items-center justify-between px-5 md:px-7 py-2.5 bg-gradient-to-r from-blue-500/[0.07] via-cyan-500/[0.06] to-blue-500/[0.07] border-b border-white/[0.06]">
                        <span className="text-xs md:text-sm font-semibold text-slate-300/90 tracking-wide">
                            {currentSubtitle.username}
                        </span>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-blue-300/90">
                            <span className="uppercase">{currentSubtitle.sourceLocale}</span>
                            <svg
                                className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400/80"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="uppercase">{myLocale}</span>
                        </div>
                    </div>

                    {/* 컨텐츠 영역 */}
                    <div className="relative px-5 md:px-7 py-4 md:py-5 space-y-2.5">
                        {/* 원문 */}
                        <p className="text-base md:text-lg text-slate-300/90 leading-relaxed font-light">{currentSubtitle.text}</p>

                        {/* 구분선 */}
                        <div className="flex items-center gap-2.5 py-0.5">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-slate-600/60"></div>
                            <span className="text-[10px] md:text-xs text-slate-500/80 font-medium px-2">번역</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-600/60 to-slate-600/60"></div>
                        </div>

                        {/* 번역문 */}
                        <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentSubtitle.translated}</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-400/35 to-transparent"></div>
                </div>
            </div>
        );
    }

    // 번역이 없는 일반 STT 자막
    return (
        <div
            className={`w-[90%] md:w-[80%] max-w-3xl transition-all duration-500 ease-out ${
                fadeOut ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            } mx-auto`}
        >
            <div className="relative bg-gradient-to-br from-slate-900/96 via-slate-800/96 to-slate-900/96 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] via-transparent to-pink-500/[0.03]"></div>

                {/* 상단 사용자 바 */}
                <div className="relative px-5 md:px-7 py-2.5 bg-gradient-to-r from-slate-800/35 via-slate-800/25 to-slate-800/35 border-b border-white/[0.06]">
                    <span className="text-xs md:text-sm font-semibold text-slate-300/90 tracking-wide">{currentSubtitle.username}</span>
                </div>

                {/* 자막 텍스트 */}
                <div className="relative px-5 md:px-7 py-4 md:py-5">
                    <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentSubtitle.text}</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>
            </div>
        </div>
    );
};

export default SubtitleOverlay;