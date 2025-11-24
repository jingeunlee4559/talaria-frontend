// src/components/Culture/CultureVideo/CultureSubtitleOverlay.jsx
import { useDataChannel } from '@livekit/components-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Globe, Sparkles } from 'lucide-react';

const getThemeColors = (themeId) => {
    const colors = {
        kpdh_huntrix: { primary: '#a855f7', secondary: '#ec4899', gradient: 'from-pink-500 via-purple-500 to-blue-500', avatarGradient: 'from-pink-500 to-purple-600' },
        kpdh_demon: { primary: '#7c3aed', secondary: '#c026d3', gradient: 'from-purple-800 via-fuchsia-600 to-purple-900', avatarGradient: 'from-purple-800 to-fuchsia-600' },
        kpdh_derpy: { primary: '#06b6d4', secondary: '#22d3ee', gradient: 'from-cyan-500 via-blue-400 to-cyan-600', avatarGradient: 'from-cyan-500 to-blue-500' },
        kpdh_concert: { primary: '#9333ea', secondary: '#ec4899', gradient: 'from-purple-600 via-pink-500 to-orange-500', avatarGradient: 'from-purple-600 to-pink-500' },
        kpdh_golden: { primary: '#fbbf24', secondary: '#f59e0b', gradient: 'from-yellow-400 via-amber-500 to-orange-500', avatarGradient: 'from-yellow-400 to-orange-500' },
        default: { primary: '#ec4899', secondary: '#a855f7', gradient: 'from-pink-500 via-purple-500 to-blue-500', avatarGradient: 'from-pink-500 to-purple-600' },
    };
    return colors[themeId] || colors.default;
};

const CultureSubtitleOverlay = ({ userLocale = 'ko-KR', currentTheme = 'default' }) => {
    const [currentSubtitle, setCurrentSubtitle] = useState(null);
    const [fadeOut, setFadeOut] = useState(false);
    const timerRef = useRef(null);
    const fadeTimerRef = useRef(null);
    const themeColors = useMemo(() => getThemeColors(currentTheme), [currentTheme]);

    const clearTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };

    const normalizeLocale = (locale) => {
        if (!locale) return 'ko-KR';
        const l = String(locale).toLowerCase();
        if (l.includes('-')) return locale;
        return { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' }[l] || locale;
    };

    useDataChannel('stt', (msg) => {
        try {
            const data = JSON.parse(new TextDecoder().decode(msg.payload));
            if (data.final && data.text && data.text.trim()) {
                clearTimers();
                const myLocale = normalizeLocale(userLocale);
                const sourceLocale = normalizeLocale(data.locale || 'ko-KR');
                let translatedText = null;
                if (data.translations && typeof data.translations === 'object') {
                    translatedText = data.translations[myLocale];
                    if (!translatedText && myLocale.includes('-')) {
                        translatedText = data.translations[myLocale.split('-')[0]];
                    }
                }
                setFadeOut(false);
                setCurrentSubtitle({
                    username: data.username || data.identity || 'Unknown',
                    identity: data.identity,
                    text: data.text,
                    sourceLocale,
                    translated: translatedText,
                    timestamp: Date.now(),
                });
                fadeTimerRef.current = setTimeout(() => setFadeOut(true), translatedText ? 5000 : 3000);
                timerRef.current = setTimeout(() => {
                    setCurrentSubtitle(null);
                    setFadeOut(false);
                }, translatedText ? 6000 : 4000);
            }
        } catch (error) {
            console.error('⚠️ Culture Subtitle 파싱 오류:', error);
        }
    });

    useEffect(() => () => clearTimers(), []);

    if (!currentSubtitle) return null;

    const showTranslation = currentSubtitle.translated && currentSubtitle.sourceLocale !== normalizeLocale(userLocale);

    if (showTranslation) {
        return (
            <div className={`w-[92%] md:w-[85%] max-w-4xl mx-auto transition-all duration-500 ${fadeOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100'}`}>
                <div className="relative group">
                    <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        <div className="absolute inset-0 opacity-50" style={{ background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10)` }} />
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColors.gradient}`} />
                        <div className="relative px-6 md:px-8 py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${themeColors.avatarGradient} flex items-center justify-center shadow-lg`}>
                                        <span className="text-white font-bold text-sm">{currentSubtitle.username.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">{currentSubtitle.username}</p>
                                        <p className="text-xs text-gray-500">실시간 번역 중</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${themeColors.avatarGradient} rounded-full shadow-lg`}>
                                    <span className="text-xs font-bold text-white uppercase">{currentSubtitle.sourceLocale.split('-')[0]}</span>
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-xs font-bold text-white uppercase">{normalizeLocale(userLocale).split('-')[0]}</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative px-6 md:px-8 py-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">원문</p>
                                    <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">{currentSubtitle.text}</p>
                                </div>
                            </div>
                            <div className="relative h-px">
                                <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${themeColors.primary}40, transparent)` }} />
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${themeColors.avatarGradient} flex items-center justify-center shadow-lg`}>
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        번역
                                    </p>
                                    <p className="text-lg md:text-xl text-gray-900 leading-relaxed font-bold">{currentSubtitle.translated}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColors.gradient}`} style={{ transform: 'scaleX(-1)' }} />
                    </div>
                    <div className={`absolute -inset-1 bg-gradient-to-r ${themeColors.gradient} rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity`} style={{ animation: 'kpdh-glow 3s ease-in-out infinite' }} />
                </div>
            </div>
        );
    }

    return (
        <div className={`w-[92%] md:w-[85%] max-w-4xl mx-auto transition-all duration-500 ${fadeOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100'}`}>
            <div className="relative group">
                <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    <div className="absolute inset-0 opacity-50" style={{ background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10)` }} />
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColors.gradient}`} />
                    <div className="relative px-6 md:px-8 py-3 border-b border-gray-100/50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${themeColors.avatarGradient} flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-bold text-sm">{currentSubtitle.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <p className="font-bold text-gray-900">{currentSubtitle.username}</p>
                        </div>
                    </div>
                    <div className="relative px-6 md:px-8 py-6">
                        <p className="text-xl md:text-2xl text-gray-900 leading-relaxed font-bold text-center">{currentSubtitle.text}</p>
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColors.gradient}`} style={{ transform: 'scaleX(-1)' }} />
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-r ${themeColors.gradient} rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity`} style={{ animation: 'kpdh-glow 3s ease-in-out infinite' }} />
            </div>
            {currentTheme.startsWith('kpdh_') && <style>{`@keyframes kpdh-glow{0%,100%{opacity:.2}50%{opacity:.4}}`}</style>}
        </div>
    );
};

export default CultureSubtitleOverlay;