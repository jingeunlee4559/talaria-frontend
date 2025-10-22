import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfToday } from 'date-fns';

// ✨ Pass onAddEvent prop
const CalendarHeader = ({ currentDate, onDateChange, view, onViewChange }) => {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-b border-slate-200/80 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 order-last lg:order-none w-full lg:w-auto justify-center">
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => onDateChange(subMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => onDateChange(startOfToday())} className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        오늘
                    </button>
                    <button onClick={() => onDateChange(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 w-32 text-center">{format(currentDate, 'yyyy년 M월')}</h3>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm font-semibold">
                    <button onClick={() => onViewChange('month')} className={`px-3 py-1 rounded-md transition-all ${view === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}>
                        월
                    </button>
                    <button onClick={() => onViewChange('week')} className={`px-3 py-1 rounded-md transition-all ${view === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}>
                        주
                    </button>
                </div>
            </div>
        </header>
    );
};

export default CalendarHeader;
