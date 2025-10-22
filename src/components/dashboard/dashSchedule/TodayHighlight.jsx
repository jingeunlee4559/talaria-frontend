import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';

const TodayHighlight = ({ date, events }) => {
    // 오늘 날짜에 해당하는 이벤트 필터링
    const todayEventsCount = events.filter((e) => format(new Date(e.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length;

    // Framer Motion 애니메이션 설정 (기존과 동일)
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    return (
        <motion.div
            // --- 🎨 DESIGN UPDATE START ---
            // 1. 고급스러운 그라데이션 배경과 그림자 효과 추가
            // 2. 마우스 호버 시 부드럽게 떠오르는 인터랙션
            className="relative overflow-hidden rounded-2xl p-8 shadow-2xl shadow-indigo-900/40 
                       bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900 
                       text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-600/50"
            // --- 🎨 DESIGN UPDATE END ---
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 배경 아이콘: 더 은은하게 만들기 위해 투명도 조정 */}
            <Calendar size={140} className="absolute -top-6 -right-6 text-white/5" strokeWidth={1.2} />

            <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                    {/* '오늘' 텍스트: 색상과 자간으로 포인트 */}
                    <h3 className="font-semibold text-lg text-indigo-300 tracking-wider">오늘</h3>
                    <div className="mt-2">
                        {/* 요일 텍스트: 폰트 크기를 키우고, 텍스트 그림자로 입체감 부여 */}
                        <p className="text-7xl font-bold leading-tight" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                            {format(date, 'eeee', { locale: ko })}
                        </p>
                        {/* 날짜 텍스트: 가독성을 위해 색상 및 투명도 조정 */}
                        <p className="mt-1.5 text-xl font-medium text-indigo-200/90">{format(date, 'yyyy년 M월 d일', { locale: ko })}</p>
                    </div>
                </div>

                {/* 하단 구분선: 더 부드럽게 변경 */}
                <div className="mt-10 border-t border-white/10 pt-5">
                    <p className="text-base font-medium text-indigo-200/90">오늘의 일정</p>
                    <p className="mt-1 text-4xl font-bold">
                        {todayEventsCount}
                        <span className="ml-1.5 text-2xl font-medium text-white/80">개</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default TodayHighlight;
