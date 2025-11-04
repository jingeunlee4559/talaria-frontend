import { useDataChannel } from '@livekit/components-react';
import { useEffect, useState } from 'react';

const SubtitleOverlay = () => {
    const [currentSubtitle, setCurrentSubtitle] = useState(null);
    const [fadeOut, setFadeOut] = useState(false);

    // ✅ STT 데이터 수신
    useDataChannel('stt', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            console.log('📺 Subtitle received:', data);

            // Final STT만 자막으로 표시 (Partial은 ConferenceUI에서 별도 표시)
            if (data.final && data.text) {
                setFadeOut(false);
                setCurrentSubtitle({
                    username: data.username || data.identity || 'Unknown',
                    text: data.text,
                    timestamp: Date.now(),
                });

                // 3초 후 페이드아웃 시작
                setTimeout(() => {
                    setFadeOut(true);
                }, 3000);

                // 4초 후 완전히 제거
                setTimeout(() => {
                    setCurrentSubtitle(null);
                }, 4000);
            }
        } catch (error) {
            console.error('❌ Subtitle 파싱 오류:', error);
        }
    });

    // 번역 데이터도 수신 (있는 경우)
    useDataChannel('translation_data', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            if (data.type === 'translation') {
                console.log('🌍 Translation received:', data);

                setFadeOut(false);
                setCurrentSubtitle({
                    username: data.speakerName || data.username || 'Unknown',
                    originalText: data.originalText,
                    translatedText: data.translatedText,
                    langFrom: data.langFrom,
                    langTo: data.langTo,
                    isTranslation: true,
                    timestamp: Date.now(),
                });

                // 5초 후 페이드아웃 (번역은 좀 더 길게)
                setTimeout(() => {
                    setFadeOut(true);
                }, 5000);

                // 6초 후 완전히 제거
                setTimeout(() => {
                    setCurrentSubtitle(null);
                }, 6000);
            }
        } catch (error) {
            console.error('❌ Translation 파싱 오류:', error);
        }
    });

    if (!currentSubtitle) return null;

    // 번역 자막인 경우
    if (currentSubtitle.isTranslation) {
        return (
            <div
                className={`absolute bottom-6 md:bottom-24 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 max-w-5xl transition-all duration-700 ease-out ${
                    fadeOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}
            >
                <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden">
                    {/* 배경 글로우 효과 (번역은 블루 톤) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10"></div>
                    
                    {/* 컨텐츠 */}
                    <div className="relative px-8 py-6 md:px-12 md:py-8">
                        <p className="text-xs md:text-sm font-semibold text-blue-400/70 mb-4 tracking-[0.2em] uppercase">
                            {currentSubtitle.username} <span className="text-slate-600 mx-2">•</span> {currentSubtitle.langFrom} → {currentSubtitle.langTo}
                        </p>
                        
                        <p className="text-lg md:text-2xl font-extralight text-slate-300 mb-4 leading-relaxed opacity-80">
                            {currentSubtitle.originalText}
                        </p>
                        
                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 text-xs text-slate-500 bg-slate-800/50">번역</span>
                            </div>
                        </div>
                        
                        <p className="text-2xl md:text-4xl font-extralight text-white leading-tight tracking-tight">
                            {currentSubtitle.translatedText}
                        </p>
                    </div>

                    {/* 하단 그라데이션 라인 */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                </div>
            </div>
        );
    }

    // 일반 STT 자막인 경우
    return (
        <div
            className={`absolute bottom-6 md:bottom-24 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 max-w-5xl transition-all duration-700 ease-out ${
                fadeOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
            }`}
        >
            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden">
                {/* 배경 글로우 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
                
                {/* 컨텐츠 */}
                <div className="relative px-8 py-6 md:px-12 md:py-8">
                    <p className="text-xs md:text-sm font-semibold text-slate-400 mb-4 tracking-[0.2em] uppercase opacity-80">
                        {currentSubtitle.username}
                    </p>
                    <p className="text-2xl md:text-4xl font-extralight text-white leading-tight tracking-tight">
                        {currentSubtitle.text}
                    </p>
                </div>

                {/* 하단 그라데이션 라인 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
        </div>
    );
};

export default SubtitleOverlay;