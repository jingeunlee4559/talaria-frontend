// src/components/Culture/LiveView/CultureSubtitleOverlay.jsx
import { useDataChannel } from '@livekit/components-react';
import { useEffect, useState, useRef } from 'react';

const CultureSubtitleOverlay = ({ userLocale = 'ko-KR' }) => {
    const [currentSubtitle, setCurrentSubtitle] = useState(null);
    const [fadeOut, setFadeOut] = useState(false);
    const timerRef = useRef(null);
    const fadeTimerRef = useRef(null);

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

    const normalizeLocale = (locale) => {
        if (!locale) return 'ko-KR';
        const l = String(locale).toLowerCase();
        if (l.includes('-')) return locale;
        const map = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
        return map[l] || locale;
    };

    useDataChannel('stt', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            if (data.final && data.text && data.text.trim()) {
                clearTimers();

                const myLocale = normalizeLocale(userLocale);
                const sourceLocale = normalizeLocale(data.locale || 'ko-KR');

                let translatedText = null;
                if (data.translations && typeof data.translations === 'object') {
                    translatedText = data.translations[myLocale];
                    if (!translatedText && myLocale.includes('-')) {
                        const langCode = myLocale.split('-')[0];
                        translatedText = data.translations[langCode];
                    }
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

                const fadeDelay = translatedText ? 5000 : 3000;
                const removeDelay = translatedText ? 6000 : 4000;

                fadeTimerRef.current = setTimeout(() => setFadeOut(true), fadeDelay);
                timerRef.current = setTimeout(() => {
                    setCurrentSubtitle(null);
                    setFadeOut(false);
                }, removeDelay);
            }
        } catch (error) {
            console.error('❌ Culture Subtitle 파싱 오류:', error);
        }
    });

    useEffect(() => {
        return () => clearTimers();
    }, []);

    if (!currentSubtitle) return null;

    const myLocale = normalizeLocale(userLocale);
    const showTranslation = currentSubtitle.translated && currentSubtitle.sourceLocale !== myLocale;

    if (showTranslation) {
        return (
            <div className={`w-[90%] md:w-[80%] max-w-3xl transition-all duration-500 ease-out ${fadeOut ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'} mx-auto`}>
                <div className="relative bg-gradient-to-br from-pink-900/96 via-purple-900/96 to-pink-900/96 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(236,72,153,0.3)] border border-pink-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.05] via-transparent to-purple-500/[0.05]"></div>
                    <div className="relative flex items-center justify-between px-5 md:px-7 py-2.5 bg-gradient-to-r from-pink-600/[0.15] via-purple-600/[0.12] to-pink-600/[0.15] border-b border-pink-500/[0.12]">
                        <span className="text-xs md:text-sm font-semibold text-pink-200/90 tracking-wide">{currentSubtitle.username}</span>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-pink-300/90">
                            <span className="uppercase">{currentSubtitle.sourceLocale}</span>
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="uppercase">{myLocale}</span>
                        </div>
                    </div>
                    <div className="relative px-5 md:px-7 py-4 md:py-5 space-y-2.5">
                        <p className="text-base md:text-lg text-pink-100/90 leading-relaxed font-light">{currentSubtitle.text}</p>
                        <div className="flex items-center gap-2.5 py-0.5">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-pink-500/40"></div>
                            <span className="text-[10px] md:text-xs text-pink-400/80 font-medium px-2">번역</span>
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-500/40 to-pink-500/40"></div>
                        </div>
                        <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentSubtitle.translated}</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-pink-400/40 to-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-[90%] md:w-[80%] max-w-3xl transition-all duration-500 ease-out ${fadeOut ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'} mx-auto`}>
            <div className="relative bg-gradient-to-br from-pink-900/96 via-purple-900/96 to-pink-900/96 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(236,72,153,0.3)] border border-pink-500/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.05] via-transparent to-purple-500/[0.05]"></div>
                <div className="relative px-5 md:px-7 py-2.5 bg-gradient-to-r from-pink-800/40 via-purple-800/30 to-pink-800/40 border-b border-pink-500/[0.12]">
                    <span className="text-xs md:text-sm font-semibold text-pink-200/90 tracking-wide">{currentSubtitle.username}</span>
                </div>
                <div className="relative px-5 md:px-7 py-4 md:py-5">
                    <p className="text-lg md:text-xl text-white leading-relaxed font-medium">{currentSubtitle.text}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-pink-400/30 to-transparent"></div>
            </div>
        </div>
    );
};

export default CultureSubtitleOverlay;
