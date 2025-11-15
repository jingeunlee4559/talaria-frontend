// src/components/Culture/LiveView/CultureSubtitleOverlay.jsx
import { useDataChannel } from '@livekit/components-react';
import { useEffect, useState, useRef } from 'react';
import { Globe, Sparkles } from 'lucide-react';

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
            console.error('⚠️ Culture Subtitle 파싱 오류:', error);
        }
    });

    useEffect(() => {
        return () => clearTimers();
    }, []);

    if (!currentSubtitle) return null;

    const myLocale = normalizeLocale(userLocale);
    const showTranslation = currentSubtitle.translated && currentSubtitle.sourceLocale !== myLocale;

    // 🎨 번역된 자막 스타일 (더 트렌디하게)
    if (showTranslation) {
        return (
            <div className={`w-[92%] md:w-[85%] max-w-4xl mx-auto transition-all duration-500 ease-out ${fadeOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                <div className="relative group">
                    {/* 🎯 메인 컨테이너 - 네오모피즘 + 글래스모피즘 */}
                    <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        {/* 배경 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 opacity-50" />

                        {/* 탑 글로우 라인 */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

                        {/* 헤더 영역 */}
                        <div className="relative px-6 md:px-8 py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-transparent">
                            <div className="flex items-center justify-between">
                                {/* 사용자 정보 */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-sm">{currentSubtitle.username.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">{currentSubtitle.username}</p>
                                        <p className="text-xs text-gray-500">실시간 번역 중</p>
                                    </div>
                                </div>

                                {/* 언어 표시 */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg">
                                    <span className="text-xs font-bold text-white uppercase">{currentSubtitle.sourceLocale.split('-')[0]}</span>
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-xs font-bold text-white uppercase">{myLocale.split('-')[0]}</span>
                                </div>
                            </div>
                        </div>

                        {/* 메시지 영역 */}
                        <div className="relative px-6 md:px-8 py-6 space-y-4">
                            {/* 원문 */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">원문</p>
                                    <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">{currentSubtitle.text}</p>
                                </div>
                            </div>

                            {/* 구분선 */}
                            <div className="relative h-px">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                            </div>

                            {/* 번역문 */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2 uppercase tracking-wider">번역</p>
                                    <p className="text-lg md:text-xl text-gray-900 leading-relaxed font-bold">{currentSubtitle.translated}</p>
                                </div>
                            </div>
                        </div>

                        {/* 바텀 글로우 라인 */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    </div>

                    {/* 외부 글로우 효과 */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                </div>
            </div>
        );
    }

    // 🎨 단일 언어 자막 스타일 (심플하고 세련되게)
    return (
        <div className={`w-[92%] md:w-[85%] max-w-4xl mx-auto transition-all duration-500 ease-out ${fadeOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
            <div className="relative group">
                {/* 메인 컨테이너 */}
                <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    {/* 배경 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50" />

                    {/* 탑 라인 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

                    {/* 헤더 */}
                    <div className="relative px-6 md:px-8 py-3 border-b border-gray-100/50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">{currentSubtitle.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <p className="font-bold text-gray-900">{currentSubtitle.username}</p>
                        </div>
                    </div>

                    {/* 메시지 */}
                    <div className="relative px-6 md:px-8 py-6">
                        <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-bold text-center">{currentSubtitle.text}</p>
                    </div>

                    {/* 바텀 라인 */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
                </div>

                {/* 외부 글로우 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
            </div>
        </div>
    );
};

export default CultureSubtitleOverlay;
