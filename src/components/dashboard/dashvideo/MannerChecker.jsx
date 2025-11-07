import { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

// 🔹 문화적 매너 주의/참고 데이터 (DB 스키마 기반)
const MOCK_ALERTS = [
    {
        id: 1,
        pattern_text: 'OK 사인 (👌)',
        speaker_locale: 'en_US',
        listener_locale: 'pt_BR',
        explanation_tpl: '브라질에서는 이 제스처가 공격적이고 무례한 의미로 해석됩니다.',
        suggestion_tpl: '엄지손가락을 치켜세우는 제스처 (👍)를 사용하세요.',
        severity: 1, // 주의
    },
    {
        id: 2,
        pattern_text: '숫자 4',
        speaker_locale: 'en_US',
        listener_locale: 'zh_CN',
        explanation_tpl: '중국, 일본, 한국 등 동아시아 문화권에서 "4"는 죽음(死)과 발음이 비슷하여 불길하게 여겨집니다.',
        suggestion_tpl: '중요한 숫자나 날짜 선정 시 4를 피하거나, 8과 같은 행운의 숫자를 사용하세요.',
        severity: 2, // 참고
    },
    {
        id: 3,
        pattern_text: '왼손 사용',
        speaker_locale: 'en_US',
        listener_locale: 'ar_SA',
        explanation_tpl: '인도와 중동 지역에서는 왼손이 불결하다고 여겨져 악수, 식사, 물건 전달에 사용하지 않습니다.',
        suggestion_tpl: '항상 오른손을 사용하여 물건을 주고받고, 식사하며, 악수하세요.',
        severity: 3, // 주의
    },
    {
        id: 4,
        pattern_text: '엄지 척 (👍)',
        speaker_locale: 'en_US',
        listener_locale: 'ar_AE',
        explanation_tpl: '중동 및 서아시아 일부 지역에서는 엄지를 세우는 제스처가 모욕적인 의미로 해석될 수 있습니다.',
        suggestion_tpl: '고개를 끄덕이거나 미소로 긍정을 표현하세요.',
        severity: 3, // 주의
    },
    {
        id: 5,
        pattern_text: '신발을 신고 집 안 출입',
        speaker_locale: 'en_US',
        listener_locale: 'ko_KR',
        explanation_tpl: '한국, 일본 등에서는 실내에서 신발을 벗는 것이 기본 예의입니다.',
        suggestion_tpl: '현관에서 신발을 벗고 실내화나 양말만 착용하세요.',
        severity: 2, // 참고
    },
    {
        id: 6,
        pattern_text: '검지로 사람 가리키기',
        speaker_locale: 'en_US',
        listener_locale: 'ph_PH',
        explanation_tpl: '필리핀 등 일부 문화권에서는 검지로 사람을 가리키는 것이 무례하게 여겨집니다.',
        suggestion_tpl: '손바닥 전체나 턱으로 방향을 가리키세요.',
        severity: 1, // 유의
    },
];

// 🔹 로케일별 국기와 국가명 매핑
const LOCALE_INFO = {
    pt_BR: { flag: '🇧🇷', name: '브라질' },
    zh_CN: { flag: '🇨🇳', name: '중국' },
    ar_SA: { flag: '🇸🇦', name: '사우디아라비아' },
    ar_AE: { flag: '🇦🇪', name: '아랍에미리트' },
    ko_KR: { flag: '🇰🇷', name: '한국' },
    ph_PH: { flag: '🇵🇭', name: '필리핀' },
    en_US: { flag: '🇺🇸', name: '미국' },
};

const MannerChecker = () => {
    const [alert, setAlert] = useState(null);
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [progress, setProgress] = useState(100);

    const DURATION = 8000;

    // 🔸 알림 순차 표시
    useEffect(() => {
        if (dismissed) return;

        const showNext = () => {
            setVisible(false);
            setProgress(100);
            setTimeout(() => {
                setAlert(MOCK_ALERTS[index]);
                setIndex((prev) => (prev + 1) % MOCK_ALERTS.length);
                setVisible(true);
            }, 300);
        };

        if (!alert) {
            setAlert(MOCK_ALERTS[0]);
            setVisible(true);
            setIndex(1);
        }

        const timer = setInterval(showNext, DURATION);
        return () => clearInterval(timer);
    }, [index, alert, dismissed]);

    // 🔸 프로그레스바 감소
    useEffect(() => {
        if (!visible || dismissed) return;

        const timer = setInterval(() => {
            setProgress((p) => Math.max(0, p - 100 / (DURATION / 100)));
        }, 100);

        return () => clearInterval(timer);
    }, [visible, dismissed]);

    const close = () => {
        setVisible(false);
        setTimeout(() => {
            setDismissed(true);
            setAlert(null);
        }, 300);
    };

    if (!alert || dismissed) return null;

    // 🔹 severity 레벨별 스타일 정의
    // 1: 유의 (낮음), 2: 참고 (중간), 3: 주의 (높음)
    const severityInfo = {
        3: {
            title: '⚠️ 주의',
            icon: FiAlertTriangle,
            iconClasses: 'text-red-500',
            bgClasses: 'bg-red-50',
            progressClasses: 'bg-red-500',
        },
        2: {
            title: '📌 참고',
            icon: FiAlertCircle,
            iconClasses: 'text-orange-400',
            bgClasses: 'bg-orange-50',
            progressClasses: 'bg-orange-400',
        },
        1: {
            title: 'ℹ️ 유의',
            icon: FiInfo,
            iconClasses: 'text-yellow-400',
            bgClasses: 'bg-yellow-50',
            progressClasses: 'bg-yellow-400',
        },
    };

    const currentSeverity = severityInfo[alert.severity] || severityInfo[2];
    const SeverityIcon = currentSeverity.icon;

    const listenerInfo = LOCALE_INFO[alert.listener_locale] || { flag: '🌍', name: alert.listener_locale };

    // 🔹 UI 렌더링
    return (
        <div
            className={`
        fixed top-5 left-5 right-5 sm:right-auto z-50
        w-auto sm:w-[360px]
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 -translate-y-4 sm:-translate-x-4'}
      `}
            role="alert"
        >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden relative">
                {/* 프로그레스 바 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                    <div className={`h-full transition-all duration-100 ${currentSeverity.progressClasses}`} style={{ width: `${progress}%` }} />
                </div>

                {/* 헤더 */}
                <div className={`flex justify-between items-center p-3 ${currentSeverity.bgClasses} border-b border-gray-200`}>
                    <span className={`text-sm font-bold ${currentSeverity.iconClasses}`}>{currentSeverity.title}</span>
                    <button onClick={close} className={`p-1 ${currentSeverity.iconClasses} opacity-60 hover:opacity-100 hover:bg-black/10 rounded-full transition-all`} aria-label="닫기">
                        <FiX size={18} />
                    </button>
                </div>

                {/* 본문 */}
                <div className="flex gap-3.5 p-3.5">
                    {/* 좌측 아이콘 */}
                    <div className={`w-10 h-10 rounded-full ${currentSeverity.bgClasses} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <SeverityIcon className={`w-5 h-5 ${currentSeverity.iconClasses}`} />
                    </div>

                    {/* 우측 텍스트 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{alert.pattern_text}</h3>
                        <p className="text-sm text-gray-500 mb-3.5">
                            <span className="mr-1.5">{listenerInfo.flag}</span>
                            {listenerInfo.name} 청자에게 주의
                        </p>

                        <div className="space-y-3">
                            {/* 이유 (explanation_tpl) */}
                            <div>
                                <label className={`flex items-center gap-1.5 text-xs font-bold ${currentSeverity.iconClasses} mb-1`}>
                                    <FiAlertCircle className="w-3.5 h-3.5" />
                                    <span>왜 오해가 될 수 있나요?</span>
                                </label>
                                <p className="text-sm text-gray-800 leading-relaxed">{alert.explanation_tpl}</p>
                            </div>

                            {/* 권장 행동 (suggestion_tpl) */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-1">
                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                    <span>대체 표현</span>
                                </label>
                                <p className="text-sm text-gray-800 leading-relaxed">{alert.suggestion_tpl}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 border-t border-gray-200 px-3.5 py-2">
                    <p className="text-xs text-gray-400 text-center">{Math.ceil((progress / 100) * (DURATION / 1000))}초 후 자동 닫힘</p>
                </div>
            </div>
        </div>
    );
};

export default MannerChecker;
