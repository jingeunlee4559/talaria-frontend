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
                className={`absolute bottom-4 md:bottom-20 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 max-w-4xl bg-black/70 text-white p-3 md:p-4 rounded-lg text-center backdrop-blur-sm transition-all duration-500 ${
                    fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
            >
                <p className="font-bold text-sm md:text-base text-yellow-300">
                    {currentSubtitle.username} ({currentSubtitle.langFrom} → {currentSubtitle.langTo})
                </p>
                <p className="text-base md:text-lg my-1">{currentSubtitle.originalText}</p>
                <p className="text-base md:text-lg text-sky-300">{currentSubtitle.translatedText}</p>
            </div>
        );
    }

    // 일반 STT 자막인 경우
    return (
        <div
            className={`absolute bottom-4 md:bottom-20 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 max-w-4xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white p-3 md:p-4 rounded-xl text-center backdrop-blur-md shadow-2xl transition-all duration-500 border border-white/20 ${
                fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
        >
            <p className="font-bold text-sm md:text-base text-yellow-300 mb-1">🎤 {currentSubtitle.username}</p>
            <p className="text-lg md:text-xl font-medium leading-relaxed">{currentSubtitle.text}</p>
        </div>
    );
};

export default SubtitleOverlay;
