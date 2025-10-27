import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

// 시간 포맷을 위한 간단한 헬퍼 함수
const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    // 'Invalid Date'가 아닐 경우에만 시간 포맷팅
    if (!isNaN(date)) {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    }
    return null; // 시간이 없는 종일 일정의 경우 null 반환
};

const MoreEventsPopover = ({ isOpen, top, left, date, events, onClose, onEventClick }) => {
    const popoverVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15, ease: 'easeIn' } },
    };

    const formatDateHeader = (date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        }).format(new Date(date));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close popover when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    <motion.div
                        style={{ position: 'absolute', top, left }}
                        className="z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200/80"
                        variants={popoverVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700">{formatDateHeader(date)}</h3>
                            <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Events List */}
                        <ul className="p-2 max-h-60 overflow-y-auto">
                            {events.map((event) => {
                                const startTime = formatTime(event.start);
                                return (
                                    <li key={event.id}>
                                        <button onClick={() => onEventClick(event)} className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: event.backgroundColor }} />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-800 leading-tight">{event.title}</p>
                                                {startTime && (
                                                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                                        <Clock size={12} className="mr-1" />
                                                        {startTime}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MoreEventsPopover;
