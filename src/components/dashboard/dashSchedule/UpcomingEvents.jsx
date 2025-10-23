import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, Users, Briefcase, Star, Video, Calendar, User, Folder } from 'lucide-react';

const typeInfo = {
    회의: { icon: <Video size={16} />, color: 'text-blue-500', borderColor: 'border-blue-500' },
    프로젝트: { icon: <Briefcase size={16} />, color: 'text-violet-500', borderColor: 'border-violet-500' },
    마감일: { icon: <Star size={16} />, color: 'text-orange-500', borderColor: 'border-orange-500' },
    휴가: { icon: <Users size={16} />, color: 'text-green-500', borderColor: 'border-green-500' },
    '내 일정': { icon: <User size={16} />, color: 'text-pink-500', borderColor: 'border-pink-500' }, // 내 일정
    '기타 일정': { icon: <Folder size={16} />, color: 'text-gray-500', borderColor: 'border-gray-500' }, // 기타 일정
};

const UpcomingEvents = ({ events, onEventClick }) => {
    const upcoming = events.filter((e) => new Date(e.start) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.start) - new Date(b.date));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            // ✨ 1. 변경된 부분: flex-grow와 min-h-0 제거
            // 이제 카드 높이는 내용에 따라 결정됩니다.
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col"
        >
            <h3 className="text-lg font-bold text-slate-800 mb-4 shrink-0">다가오는 일정</h3>

            {/* ✨ 2. 변경된 부분: flex-grow 제거 및 최대 높이(max-h-[450px]) 추가 */}
            {/* 약 5개의 항목이 보일 수 있는 높이로 제한하고, 내용이 넘치면 스크롤이 생깁니다. */}
            <div className="overflow-y-auto custom-scrollbar -mr-2 pr-2 max-h-[450px]">
                {upcoming.length > 0 ? (
                    <div className="space-y-3">
                        {upcoming.map((event, index) => {
                            const info = typeInfo[event.extendedProps.type] || { icon: <Clock size={16} />, color: 'text-slate-500', borderColor: 'border-slate-500' };
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    onClick={() => onEventClick(event)}
                                    className={`flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50/80 cursor-pointer border-l-4 ${info.borderColor}`}
                                >
                                    <div className={`mt-1 p-2 rounded-full bg-slate-100 ${info.color}`}>{info.icon}</div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{event.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {event.start.includes('T') ? `${format(new Date(event.start), 'HH:mm')}${event.end ? ` - ${format(new Date(event.end), 'HH:mm')}` : ''}` : '하루 종일'}
                                        </p>
                                        <p className="text-xs text-slate-500">{format(new Date(event.start), 'M월 d일 (eee)', { locale: ko })}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                        <Calendar size={40} className="mb-2 opacity-50" />
                        <p className="text-sm font-medium">다가오는 일정이 없습니다.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default UpcomingEvents;
