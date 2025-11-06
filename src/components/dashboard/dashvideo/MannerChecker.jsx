import { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// 🔹 문화적 매너 주의/참고 데이터
const MOCK_ALERTS = [
    {
        id: 1,
        phrase: 'OK 사인',
        emoji: '👌',
        country: '브라질',
        flag: '🇧🇷',
        context: '브라질에서는 공격적이고 무례한 제스처로 해석됩니다.',
        tip: '엄지손가락을 치켜세우는 제스처를 사용하세요.',
        level: 'high',
    },
    {
        id: 2,
        phrase: '숫자 4',
        emoji: '4️⃣',
        country: '중국, 일본, 한국',
        flag: '🇨🇳',
        context: '동아시아 문화권에서 "4"는 죽음을 연상시켜 불길하게 여겨집니다.',
        tip: '중요한 숫자나 날짜 선정 시 4를 피하는 것이 좋습니다.',
        level: 'medium',
    },
    {
        id: 3,
        phrase: '왼손 사용',
        emoji: '🤚',
        country: '인도, 중동',
        flag: '🇮🇳',
        context: '왼손은 불결하다고 여겨져 악수, 식사, 물건 전달에 사용하지 않습니다.',
        tip: '항상 오른손을 사용하여 물건을 주고받으세요.',
        level: 'high',
    },
    {
        id: 4,
        phrase: '엄지 척',
        emoji: '👍',
        country: '중동, 서아시아',
        flag: '🇸🇦',
        context: '중동 지역에서는 모욕적인 의미로 해석될 수 있습니다.',
        tip: '고개를 끄덕이거나 미소로 긍정을 표현하세요.',
        level: 'high',
    },
];

const MannerChecker = () => {
    const [alert, setAlert] = useState(null);
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [progress, setProgress] = useState(100);

    const DURATION = 7000;

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

    // 🔹 레벨별 스타일 정의
    const levelInfo = {
        high: {
            title: '문화적 주의',
            icon: FiAlertTriangle,
            iconClasses: 'text-red-500',
            bgClasses: 'bg-red-50',
            progressClasses: 'bg-red-500',
        },
        medium: {
            title: '문화적 참고',
            icon: FiAlertCircle,
            iconClasses: 'text-orange-400',
            bgClasses: 'bg-orange-50',
            progressClasses: 'bg-orange-400',
        },
    };

    const currentLevel = levelInfo[alert.level] || levelInfo.medium;
    const LevelIcon = currentLevel.icon;

    // 🔹 UI 렌더링
    return (
        <div
            className={`
        fixed top-5 left-5 right-5 sm:right-auto z-50
        w-auto sm:w-[320px]
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 -translate-y-4 sm:-translate-x-4'}
      `}
            role="alert"
        >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden relative">
                {/* 프로그레스 바 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                    <div className={`h-full transition-all duration-100 ${currentLevel.progressClasses}`} style={{ width: `${progress}%` }} />
                </div>

                {/* 헤더 */}
                <div className={`flex justify-between items-center p-3 ${currentLevel.bgClasses} border-b border-gray-200`}>
                    <span className={`text-sm font-bold ${currentLevel.iconClasses}`}>{currentLevel.title}</span>
                    <button onClick={close} className={`p-1 ${currentLevel.iconClasses} opacity-60 hover:opacity-100 hover:bg-black/10 rounded-full transition-all`} aria-label="닫기">
                        <FiX size={18} />
                    </button>
                </div>

                {/* 본문 */}
                <div className="flex gap-3.5 p-3.5">
                    {/* 좌측 아이콘 */}
                    <div className={`w-10 h-10 rounded-full ${currentLevel.bgClasses} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <LevelIcon className={`w-5 h-5 ${currentLevel.iconClasses}`} />
                    </div>

                    {/* 우측 텍스트 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            <span className="mr-2 text-xl">{alert.emoji}</span>
                            {alert.phrase}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3.5">
                            <span className="mr-1.5">{alert.flag}</span>
                            {alert.country}
                        </p>

                        <div className="space-y-3">
                            {/* 이유 */}
                            <div>
                                <label className={`flex items-center gap-1.5 text-xs font-bold ${currentLevel.iconClasses} mb-1`}>
                                    <FiAlertCircle className="w-3.5 h-3.5" />
                                    <span>이유</span>
                                </label>
                                <p className="text-sm text-gray-800 leading-relaxed">{alert.context}</p>
                            </div>

                            {/* 권장 행동 */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-1">
                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                    <span>권장</span>
                                </label>
                                <p className="text-sm text-gray-800 leading-relaxed">{alert.tip}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 border-t border-gray-200 px-3.5 py-2">
                    <p className="text-xs text-gray-400 text-center">{Math.ceil((progress / 100) * (DURATION / 1000))}초 후 닫힘</p>
                </div>
            </div>
        </div>
    );
};

export default MannerChecker;
