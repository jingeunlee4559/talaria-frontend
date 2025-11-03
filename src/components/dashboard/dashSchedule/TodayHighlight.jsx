import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';

const TodayHighlight = ({ date, events }) => {
    // ✅ events 배열의 실제 구조(start, end)에 맞게 수정
    const todayEventsCount = events.filter((e) => {
        try {
            // start는 'YYYY-MM-DD' 또는 'YYYY-MM-DDTHH:mm:ss' 형식
            const eventDate = new Date(e.start);
            const todayDate = format(date, 'yyyy-MM-dd');
            const eventDateStr = format(eventDate, 'yyyy-MM-dd');

            return eventDateStr === todayDate;
        } catch (err) {
            console.warn('Invalid event date:', e);
            return false;
        }
    }).length;

    // Framer Motion 애니메이션
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl p-8 shadow-2xl shadow-indigo-900/40 
                 bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900 
                 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-600/50"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 배경 아이콘 */}
            <Calendar size={140} className="absolute -top-6 -right-6 text-white/5" strokeWidth={1.2} />

            <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-lg text-indigo-300 tracking-wider">오늘</h3>
                    <div className="mt-2">
                        <p className="text-7xl font-bold leading-tight" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                            {format(date, 'eeee', { locale: ko })}
                        </p>
                        <p className="mt-1.5 text-xl font-medium text-indigo-200/90">{format(date, 'yyyy년 M월 d일', { locale: ko })}</p>
                    </div>
                </div>

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
