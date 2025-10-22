import { Video, FileText, Briefcase, Star, Users } from 'lucide-react';

const legendItems = [
    { type: '회의', color: 'blue' },
    { type: '리뷰', color: 'cyan' },
    { type: '프로젝트', color: 'violet' },
    { type: '마감일', color: 'orange' },
    { type: '전체 회의', color: 'green' },
    { type: '내 일정', color: 'pink' },
    { type: '기타 일정', color: 'gray' },
];

const CalendarLegend = () => {
    return (
        <div className="p-4 sm:px-6 border-t border-slate-200/80 shrink-0">
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-600 mr-2">일정 유형</h4>
                {legendItems.map((item) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500`}></div>
                        <span className="text-xs font-semibold text-slate-500">{item.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default CalendarLegend;
