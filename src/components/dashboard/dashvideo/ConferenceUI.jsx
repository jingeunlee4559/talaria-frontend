import { useEffect, useState } from 'react';
import {
    ControlBar,
    RoomAudioRenderer,
    LayoutContextProvider,
    useParticipants,
    useRoomContext,
    useDataChannel, // ✅ STT 수신을 위해 추가
} from '@livekit/components-react';
import Swal from 'sweetalert2';
import TranscriptSidebar from './TranscriptSidebar';
import CustomVideoGrid from './CustomVideoGrid';
import SubtitleOverlay from './SubtitleOverlay';
import { FiCopy } from 'react-icons/fi';

const ConferenceUI = ({ meetingTitle, onLeave }) => {
    // ✅ 컴포넌트 최상위에서 Hook 호출
    const room = useRoomContext();
    const participants = useParticipants();
    const participantCount = participants.length;

    // 사이드바 표시 상태
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // ✅ STT 수신 상태 (Partial & Final 분리)
    const [partials, setPartials] = useState({}); // { identity: "텍스트" }
    const [finals, setFinals] = useState([]); // [{ identity, text, ts }]

    // ✅ STT DataChannel 구독 (useDataChannel Hook 사용)
    useDataChannel('stt', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            console.log('📥 STT 데이터 수신:', data);

            // 발화자 식별 키 (identity 우선, 없으면 track_sid)
            const key = data.identity || data.track_sid || 'unknown';

            if (data.final) {
                // ✅ Final (확정된 텍스트)
                console.log(`✅ [FINAL] ${key}: ${data.text}`);

                setFinals((prev) => [
                    ...prev,
                    {
                        identity: key,
                        text: data.text || '',
                        ts: data.ts ?? Date.now(),
                    },
                ]);

                // Partial에서 제거
                setPartials((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            } else {
                // ✅ Partial (실시간 중간 결과)
                console.log(`🔄 [PARTIAL] ${key}: ${data.text}`);
                setPartials((prev) => ({
                    ...prev,
                    [key]: data.text || '',
                }));
            }
        } catch (e) {
            console.error('❌ STT 파싱 오류:', e);
        }
    });

    // ✅ 회의 링크 복사
    const handleCopyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '복사 완료!',
                    text: '회의 주소가 클립보드에 복사되었습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                    width: '350px',
                    toast: true,
                    position: 'top-end',
                });
            })
            .catch((err) => {
                console.error('주소 복사에 실패했습니다:', err);
                Swal.fire({
                    icon: 'error',
                    title: '복사 실패',
                    text: '주소를 복사하는 데 실패했습니다. 다시 시도해주세요.',
                    confirmButtonColor: '#d33',
                });
            });
    };

    return (
        <LayoutContextProvider>
            <div data-lk-theme="default" className="w-full h-screen flex flex-col md:flex-row bg-slate-800">
                <main className="w-full h-[60vh] md:h-full flex-grow relative flex flex-col">
                    {/* 상단 정보 */}
                    <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-white text-sm">
                        <p className="font-bold">{meetingTitle || '회의'}</p>
                        <p className="text-xs">{participantCount > 0 ? `인원수 ${participantCount}` : 'Connecting...'}</p>
                    </div>

                    {/* 비디오 영역 */}
                    <div className="flex-grow relative overflow-hidden">
                        <CustomVideoGrid />

                        {/* 번역 자막 오버레이 (중앙 하단) */}
                        <SubtitleOverlay />

                        {/* ✅ STT Partial 오버레이 (실시간 음성인식 - 번역 자막 위쪽) */}
                        {Object.keys(partials).length > 0 && (
                            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-black/60 text-white rounded-xl px-4 py-2 z-20">
                                {Object.entries(partials).map(([key, txt]) => (
                                    <div key={key} className="text-center text-base leading-6">
                                        <span className="opacity-70 mr-2">[{key}]</span>
                                        {txt}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ✅ STT Final 패널 (확정된 대화 내역 - 우측 하단) */}
                        {finals.length > 0 && (
                            <div className="absolute bottom-2 right-2 w-[26rem] max-h-64 overflow-auto bg-white/85 backdrop-blur rounded-xl p-3 shadow z-20">
                                <div className="text-xs font-bold text-gray-500 mb-2 pb-2 border-b border-gray-300">실시간 자막 기록</div>
                                {finals.slice(-20).map((it, i) => (
                                    <div key={`${it.ts}-${i}`} className="text-sm text-gray-800 mb-2 pb-2 border-b border-gray-200 last:border-0">
                                        <span className="font-bold text-blue-600 mr-2">{it.identity}</span>
                                        <span className="text-gray-700">{it.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 하단 컨트롤 바 */}
                    <div className="flex flex-wrap items-center justify-center bg-slate-900 px-4 py-2 shadow-md rounded-t-lg gap-2">
                        <ControlBar variation="minimal" />
                        <button onClick={handleCopyLink} title="회의 주소 복사" className="lk-button lk-button-icon">
                            <FiCopy size={20} />
                        </button>
                        <button
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                            aria-pressed={isSidebarVisible}
                            data-lk-active={isSidebarVisible}
                            className="lk-button lk-button-icon"
                            title="Transcript"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 6h16M4 12h16M4 18h12" />
                            </svg>
                        </button>
                    </div>

                    {/* 나가기 버튼 */}
                    <button onClick={onLeave} className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors z-50 text-sm">
                        나가기
                    </button>
                </main>

                {/* 사이드바 */}
                {isSidebarVisible && (
                    <aside className="w-full h-[40vh] md:w-[340px] md:h-full flex-shrink-0 bg-slate-700 transition-all duration-300">
                        <TranscriptSidebar sttFinals={finals} />
                    </aside>
                )}

                <RoomAudioRenderer />
            </div>
        </LayoutContextProvider>
    );
};

export default ConferenceUI;
