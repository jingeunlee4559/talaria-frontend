import { useState, useRef, useEffect, useContext } from 'react';
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
import MoreEventsPopover from '../../components/dashboard/dashSchedule/MoreEventsPopover';
import axios from '../../axios';
import { UserContext } from '../../contexts/UserContext';

const eventTypes = {
    회의: { color: '#3b82f6' },
    프로젝트: { color: '#a855f7' },
    마감일: { color: '#f97316' },
    휴가: { color: '#22c55e' },
    '내 일정': { color: '#ec4899' },
    '기타 일정': { color: '#9ca3af' },
};

// ✅ 영어 타입을 한글로 변환하는 맵
const typeMap = {
    meeting: '회의',
    project: '프로젝트',
    duedate: '마감일',
    vacation: '휴가',
    schedule: '내 일정',
    etc: '기타 일정',
};

const DashSchedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const calendarRef = useRef(null);
    const { user, loading } = useContext(UserContext);

    const [popoverState, setPopoverState] = useState({
        isOpen: false,
        top: 0,
        left: 0,
        date: null,
        events: [],
    });

    // ✅ 서버에서 일정 데이터 가져오기
    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return;

            try {
                const response = await axios.get(`/api/users/${user.userId}/calendar/events`);

                const fetchedEvents = response.data.items.map((e) => {
                    const typeInKorean = typeMap[e.type] || '기타 일정';
                    const color = eventTypes[typeInKorean]?.color || '#6b7280';

                    // ✅ 서버에서 snake_case로 오는 필드명 사용
                    const start = e.start_time ? `${e.start_date}T${e.start_time}` : e.start_date;

                    // ✅ endTime이 있으면 시간 포함, 종일 이벤트면 +1일
                    let end = null;
                    if (e.start_time && e.end_time) {
                        const endDateStr = e.end_date || e.start_date;
                        end = `${endDateStr}T${e.end_time}`;
                    } else if (!e.start_time && e.end_date && e.start_date !== e.end_date) {
                        const endDateObj = new Date(e.end_date);
                        endDateObj.setDate(endDateObj.getDate() + 1);
                        end = endDateObj.toISOString().split('T')[0];
                    }

                    return {
                        id: String(e.event_id),
                        title: e.title,
                        start,
                        end,
                        allDay: !e.start_time,
                        backgroundColor: color,
                        borderColor: color,
                        extendedProps: {
                            type: typeInKorean,
                            location: e.location,
                            description: e.description,
                        },
                    };
                });

                setEvents(fetchedEvents);
            } catch (error) {
                console.error('📛 일정 데이터를 불러오는 중 오류 발생:', error);
                alert('일정 데이터를 불러오는 데 실패했습니다.');
            }
        };

        fetchEvents();
    }, [user]);

    const handleOpenModal = (info) => {
        setSelectedInfo(info);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    // ✅ 일정 저장 핸들러 개선 - EventModal에서 받은 calendarEvent를 그대로 사용
    const handleSaveEvent = (calendarEvent) => {
        console.log('📌 handleSaveEvent 호출됨:', calendarEvent);

        const typeInKorean = typeMap[calendarEvent.extendedProps.type] || calendarEvent.extendedProps.type;
        const color = eventTypes[typeInKorean]?.color || '#6b7280';

        const eventToAdd = {
            ...calendarEvent,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
                ...calendarEvent.extendedProps,
                type: typeInKorean,
            },
        };

        if (calendarEvent.id && events.find((e) => e.id === calendarEvent.id)) {
            // 기존 이벤트 수정
            setEvents(events.map((e) => (e.id === calendarEvent.id ? eventToAdd : e)));
        } else {
            // 새 이벤트 추가
            setEvents((prevEvents) => [...prevEvents, eventToAdd].sort((a, b) => new Date(a.start) - new Date(b.start)));
        }

        handleCloseModal();
    };

    // ✅ 일정 삭제 핸들러
    const handleDeleteEvent = async (eventId) => {
        if (!user) return;

        try {
            await axios.delete(`/api/users/${user.userId}/calendar/events/${eventId}`);
            setEvents(events.filter((e) => e.id !== eventId));
            handleCloseModal();
        } catch (error) {
            console.error('일정 삭제 실패:', error);
            alert('일정 삭제에 실패했습니다.');
        }
    };

    const handleMoreLinkClick = (info) => {
        info.jsEvent.preventDefault();
        const rect = info.jsEvent.currentTarget.getBoundingClientRect();

        setPopoverState({
            isOpen: true,
            top: rect.top + window.scrollY + rect.height,
            left: rect.left + window.scrollX,
            date: info.date,
            events: info.allSegs.map((seg) => seg.event),
        });

        return 'none';
    };

    const handleClosePopover = () => {
        setPopoverState((prev) => ({ ...prev, isOpen: false }));
    };

    const handlePopoverEventClick = (event) => {
        handleClosePopover();
        handleOpenModal({ event });
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
                {/* Page Header */}
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

                {/* Main Content */}
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
                                    moreLinkClick={handleMoreLinkClick}
                                />
                            </div>
                            <CalendarLegend />
                        </main>

                        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                            <TodayHighlight date={currentDate} events={events} />
                            <UpcomingEvents events={events} onEventClick={(event) => handleOpenModal({ event })} />
                        </aside>

                        <MoreEventsPopover
                            isOpen={popoverState.isOpen}
                            top={popoverState.top}
                            left={popoverState.left}
                            date={popoverState.date}
                            events={popoverState.events}
                            onClose={handleClosePopover}
                            onEventClick={handlePopoverEventClick}
                        />
                        <EventModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveEvent} onDelete={handleDeleteEvent} selectedInfo={selectedInfo} />
                    </div>
                </div>
            </div>

            {/* FullCalendar 커스텀 스타일 */}
            <style>{`
                .fc-daygrid-day-frame {
                    position: relative;
                    min-height: 110px;
                    padding: 2.25rem 4px 4px 4px;
                }
                .fc-daygrid-day-top {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                }
                .fc-daygrid-day-events {
                    margin-top: 0;
                }

                .fc-day-today .fc-daygrid-day-number {
                    background-color: #6366f1; color: white !important;
                    width: 28px; height: 28px;
                    border-radius: 9999px;
                    display: flex; align-items: center; justify-content: center;
                    padding: 0;
                }

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
                
                .fc-daygrid-more-link { 
                    font-weight: 600; font-size: 0.75rem; color: #4f46e5; 
                    margin-top: 2px; display: block; padding: 2px 4px;
                    border-radius: 4px;
                }
                .fc-daygrid-more-link:hover {
                    background-color: #eef2ff;
                    color: #4338ca;
                }
                
                .fc .fc-scrollgrid, .fc table { border: none; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
            `}</style>
        </>
    );
};

export default DashSchedule;
