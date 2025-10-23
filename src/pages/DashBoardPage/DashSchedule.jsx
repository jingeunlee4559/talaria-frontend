import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import CalendarLegend from '../../components/dashboard/dashSchedule/CalendarLegend';
import TodayHighlight from '../../components/dashboard/dashSchedule/TodayHighlight';
import UpcomingEvents from '../../components/dashboard/dashSchedule/UpcomingEvents';
import EventModal from '../../components/dashboard/dashSchedule/EventModal';
import { Plus } from 'lucide-react';

// --- Data & Types (Assume eventTypes definition is here or imported) ---
const eventTypes = {
    회의: { color: '#3b82f6' },
    프로젝트: { color: '#a855f7' },
    마감일: { color: '#f97316' },
    휴가: { color: '#22c55e' },
    '내 일정': { color: '#ec4899' },
    '기타 일정': { color: '#9ca3af' },
};
const initialEvents = [
    { id: '1', title: '오전 글로벌 마케팅', start: '2025-10-22T10:00:00', end: '2025-10-22T11:30:00', extendedProps: { type: '회의', participants: ['J', 'E', 'M'] } },
    { id: '2', title: '프로젝트 Helios 제안서 마감', start: '2025-10-23', extendedProps: { type: '마감일' } },
    { id: '3', title: '오후 3분기 실적 리뷰', start: '2025-10-22T14:30:00', end: '2025-10-22T16:00:00', extendedProps: { type: '휴가', participants: ['S'] } },
    { id: '4', title: '월간 전체 회의', start: '2025-10-25T15:00:00', end: '2025-10-25T17:00:00', extendedProps: { type: '휴가' } },
    { id: '5', title: '신규 프로젝트 킥오프', start: '2025-11-04T11:00:00', extendedProps: { type: '프로젝트', participants: ['D', 'W'] } },
];

const DashSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date('2025-10-22'));
    const [events, setEvents] = useState(
        initialEvents.map((e) => ({ ...e, backgroundColor: eventTypes[e.extendedProps.type]?.color || '#6b7280', borderColor: eventTypes[e.extendedProps.type]?.color || '#6b7280' })),
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const calendarRef = useRef(null);

    // --- Handlers (No changes) ---
    const handleOpenModal = (info) => {
        setSelectedInfo(info);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);
    const handleSaveEvent = (eventData) => {
        const color = eventTypes[eventData.type]?.color || '#6b7280';
        if (eventData.id) {
            setEvents(
                events.map((e) =>
                    e.id === eventData.id
                        ? {
                              ...e,
                              title: eventData.title,
                              start: eventData.start,
                              end: eventData.end,
                              backgroundColor: color,
                              borderColor: color,
                              extendedProps: { ...e.extendedProps, ...eventData.extendedProps, type: eventData.type },
                          }
                        : e,
                ),
            );
        } else {
            const newEvent = {
                id: Date.now().toString(),
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                backgroundColor: color,
                borderColor: color,
                extendedProps: { ...eventData.extendedProps, type: eventData.type },
            };
            setEvents([...events, newEvent].sort((a, b) => new Date(a.start) - new Date(b.date)));
        }
        handleCloseModal();
    };
    const handleDeleteEvent = (eventId) => {
        setEvents(events.filter((e) => e.id !== eventId));
        handleCloseModal();
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
                {/* --- Page Header --- */}
                <header className="mb-6 mt-6 sm:mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 max-w-screen-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">일정 관리</h1>
                            <p className="text-slate-500 mt-1 text-sm sm:text-base">일정을 한눈에 확인하고 원하는 정보를 탐색하세요.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleOpenModal({ date: new Date() })}
                                className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 
               text-white font-semibold text-base sm:text-lg px-6 py-3 
               rounded-xl shadow-lg hover:from-indigo-600 hover:to-violet-700 
               hover:shadow-2xl transition-all transform hover:-translate-y-1 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus size={20} />
                                <span>새 일정</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Main Content --- */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-3xl mx-auto">
                        <main className="lg:col-span-8 xl:col-span-9 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/80 min-h-[85vh]">
                            <div className="flex-1 overflow-hidden p-2 sm:p-4 calendar-container relative">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    locale={koLocale}
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
                                    buttonText={{ today: '오늘', month: '월', week: '주' }}
                                    events={events}
                                    height="100%"
                                    dateClick={(arg) => handleOpenModal({ date: arg.date })}
                                    eventClick={(info) => handleOpenModal({ event: info.event })}
                                    dayMaxEvents={true}
                                    eventDisplay="block"
                                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: false }}
                                    dayHeaderFormat={{ weekday: 'short' }}
                                />
                            </div>
                            <CalendarLegend />
                        </main>

                        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                            <TodayHighlight date={currentDate} events={events} />
                            <UpcomingEvents events={events} onEventClick={(event) => handleOpenModal({ event })} />
                        </aside>

                        <EventModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveEvent} onDelete={handleDeleteEvent} selectedInfo={selectedInfo} />
                    </div>
                </div>
            </div>

            {/* --- FullCalendar 커스텀 스타일 --- */}
            <style>{`
        /* --- ✨ 1. 변경된 부분 --- */
        /* 날짜 칸의 전체 구조(frame)에 직접 패딩을 줍니다. */
        .fc-daygrid-day-frame {
            position: relative; /* 자식 요소의 absolute 위치 기준점 */
            min-height: 110px;
            padding: 2.25rem 4px 4px 4px; /* 상단에 36px의 충분한 공간 확보 */
        }
        /* 날짜 숫자를 frame의 좌측 상단에 절대 위치로 고정합니다. */
        .fc-daygrid-day-top {
            position: absolute;
            top: 8px;
            left: 8px;
        }
        /* 이벤트 목록의 불필요한 상단 여백을 제거합니다. */
        .fc-daygrid-day-events {
            margin-top: 0;
        }

        /* --- ✨ 2. 오늘 날짜 하이라이트 스타일 --- */
        .fc-day-today .fc-daygrid-day-number {
            background-color: #6366f1; color: white;
            display: flex; align-items: center; justify-content: center;
            padding: 0;
        }

        /* --- 기존 스타일 --- */
        .fc .fc-button { 
            background: white !important; border: 1px solid #cbd5e1 !important; color: #475569 !important;
            text-transform: none !important; padding: 0.5rem 0.8rem !important; border-radius: 0.5rem !important;
            font-weight: 600 !important; font-size: 0.875rem !important; box-shadow: none !important; transition: all 0.2s; 
        }
        .fc .fc-button:hover { background-color: #f8fafc !important; }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
             background: #eff6ff !important; border-color: #3b82f6 !important; color: #3b82f6 !important; box-shadow: none !important;
        }
         .fc .fc-today-button {
             background-color: #eef2ff !important; border-color: #e0e7ff !important; color: #4f46e5 !important;
         }
         .fc .fc-today-button:hover { background-color: #e0e7ff !important; }
        .fc .fc-toolbar-title { font-size: 1.125rem !important; font-weight: 700 !important; color: #1e293b; }
        .fc-toolbar.fc-header-toolbar { margin-bottom: 1.5rem !important; padding: 0 0.5rem; }

        .calendar-container { --fc-border-color: #f1f5f9; --fc-today-bg-color: transparent; min-height: 600px; }
        .fc-col-header-cell { border-width: 0 0 1px 0 !important; font-size: 0.75rem; color: #94a3b8; font-weight: 500; text-transform: none; padding: 0.75rem 0; }
        .fc .fc-view-harness { flex-grow: 1; height: 100%; }
        .fc-daygrid-day-number { font-size: 0.875rem; font-weight: 600; color: #475569; }
        .fc-daygrid-day:hover { background-color: #f8fafc; }
        .fc-event { padding: 3px 6px; border: none !important; border-radius: 6px; font-weight: 600; font-size: 0.75rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; line-height: 1.4; margin-bottom: 3px; }
        .fc-event:hover { transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .fc-daygrid-event-dot { display: none; }
        .fc-event .fc-event-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white; }
        .fc-daygrid-more-link { font-weight: 600; font-size: 0.75rem; color: #4f46e5; margin-top: 2px; display: block; padding: 2px 4px;}
        .fc .fc-scrollgrid, .fc table { border: none; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
      `}</style>
        </>
    );
};

export default DashSchedule;
