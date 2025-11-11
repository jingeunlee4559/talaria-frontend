import { useEffect, useState, useRef, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Clock, MapPin, AlignLeft, Video, Briefcase, Star, Plus, ChevronDown, Calendar, User, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { IoIosAirplane } from 'react-icons/io';
import { UserContext } from '../../../contexts/UserContext';
import api from '../../../axios';
import Swal from 'sweetalert2';

const eventTypes = [
    { name: '회의', value: 'meeting', icon: <Video size={16} />, color: 'blue' },
    { name: '프로젝트', value: 'project', icon: <Briefcase size={16} />, color: 'violet' },
    { name: '마감일', value: 'duedate', icon: <Star size={16} />, color: 'orange' },
    { name: '휴가', value: 'vacation', icon: <IoIosAirplane size={16} />, color: 'green' },
    { name: '내 일정', value: 'schedule', icon: <User size={16} />, color: 'pink' },
    { name: '기타 일정', value: 'etc', icon: <Folder size={16} />, color: 'gray' },
];

const EventModal = ({ isOpen, onClose, onSave, onDelete, selectedInfo }) => {
    const [formData, setFormData] = useState({});
    const isEditing = selectedInfo && selectedInfo.event;
    const { user } = useContext(UserContext);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const typeDropdownRef = useRef(null);

    // ✅ 한글 타입을 영어 value로 역변환하는 함수
    const getTypeValue = (typeString) => {
        const found = eventTypes.find((t) => t.name === typeString);
        return found ? found.value : typeString; // 한글이면 영어로, 이미 영어면 그대로
    };

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const endOfDay = '23:59'; // ✅ 종료 시간 기본값

            if (isEditing) {
                const { event } = selectedInfo;
                const startDate = format(new Date(event.start), 'yyyy-MM-dd');
                let endDate = event.end ? new Date(event.end) : new Date(event.start);
                if (!String(event.end).includes('T') && event.start !== event.end) {
                    endDate.setDate(endDate.getDate() - 1);
                }

                // ✅ 한글 타입을 영어 value로 변환
                const eventType = event.extendedProps?.type || 'meeting';
                const typeValue = getTypeValue(eventType);

                setFormData({
                    id: event.id,
                    title: event.title || '',
                    type: typeValue, // 영어 value 사용
                    date: startDate,
                    endDate: format(endDate, 'yyyy-MM-dd'),
                    startTime: String(event.start).includes('T') ? format(new Date(event.start), 'HH:mm') : currentTime,
                    endTime: event.end && String(event.end).includes('T') ? format(new Date(event.end), 'HH:mm') : endOfDay,
                    location: event.extendedProps?.location || '',
                    description: event.extendedProps?.description || '',
                });
            } else {
                const initialDate = selectedInfo?.date ? format(selectedInfo.date, 'yyyy-MM-dd') : '';
                setFormData({
                    title: '',
                    type: 'meeting',
                    date: initialDate,
                    endDate: initialDate,
                    startTime: currentTime,
                    endTime: endOfDay, // ✅ 새 일정 추가 시에도 23:59로 설정
                    location: '',
                    description: '',
                });
            }
        }
    }, [isOpen, selectedInfo, isEditing]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
                setIsTypeDropdownOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, typeDropdownRef]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            if (name === 'date' && (!prev.endDate || prev.endDate < value)) {
                return { ...prev, date: value, endDate: value };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: '로그인 필요',
                text: '로그인 정보가 없습니다.',
                confirmButtonColor: '#6366f1',
            });
            return;
        }

        const effectiveEndDate = !formData.endDate || formData.endDate < formData.date ? formData.date : formData.endDate;

        const eventPayload = {
            title: formData.title,
            type: formData.type,
            startDate: formData.date,
            endDate: effectiveEndDate,
            startTime: formData.startTime ? `${formData.startTime}:00` : null,
            endTime: formData.startTime && formData.endTime ? `${formData.endTime}:00` : null,
            location: formData.location || '',
            description: formData.description || '',
            meetingId: null,
        };

        console.log('서버로 전송하는 데이터:', JSON.stringify(eventPayload, null, 2));

        try {
            const response = formData.id
                ? await api.put(`/api/users/${user.userId}/calendar/events/${formData.id}`, eventPayload)
                : await api.post(`/api/users/${user.userId}/calendar/events`, eventPayload);

            const savedEvent = response.data;
            console.log('서버로부터 받은 저장된 이벤트:', savedEvent);

            // ✅ 서버에서 snake_case로 오는 필드명 사용
            const calendarEvent = {
                id: String(savedEvent.event_id),
                title: savedEvent.title,
                start: savedEvent.start_time ? `${savedEvent.start_date}T${savedEvent.start_time}` : savedEvent.start_date,
                end: (() => {
                    if (savedEvent.start_time && savedEvent.end_time) {
                        const endDateStr = savedEvent.end_date || savedEvent.start_date;
                        return `${endDateStr}T${savedEvent.end_time}`;
                    }
                    if (!savedEvent.start_time && savedEvent.end_date && savedEvent.start_date !== savedEvent.end_date) {
                        const endDateObj = new Date(savedEvent.end_date);
                        endDateObj.setDate(endDateObj.getDate() + 1);
                        return endDateObj.toISOString().split('T')[0];
                    }
                    return null;
                })(),
                allDay: !savedEvent.start_time,
                extendedProps: {
                    type: savedEvent.type,
                    location: savedEvent.location,
                    description: savedEvent.description,
                },
            };

            console.log('FullCalendar에 전달할 이벤트:', calendarEvent);

            // ✅ 성공 알림
            await Swal.fire({
                icon: 'success',
                title: formData.id ? '일정 수정 완료' : '일정 추가 완료',
                text: `"${savedEvent.title}" 일정이 ${formData.id ? '수정' : '저장'}되었습니다.`,
                timer: 1500,
                showConfirmButton: false,
            });

            onSave(calendarEvent);
            onClose();
        } catch (error) {
            console.error('일정 저장 실패:', error);
            if (error.response) {
                console.error('서버 응답 데이터:', error.response.data);
            }

            // ✅ 실패 알림
            Swal.fire({
                icon: 'error',
                title: '일정 저장 실패',
                text: error.response?.data?.error || '일정 저장 중 오류가 발생했습니다.',
                confirmButtonColor: '#6366f1',
            });
        }
    };

    // ✅ 삭제 핸들러
    const handleDelete = async () => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: '로그인 필요',
                text: '로그인 정보가 없습니다.',
                confirmButtonColor: '#6366f1',
            });
            return;
        }
        if (!formData.id) return;

        // ✅ 삭제 확인 다이얼로그
        const result = await Swal.fire({
            title: '일정을 삭제하시겠습니까?',
            text: `"${formData.title}" 일정이 영구적으로 삭제됩니다.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
        });

        if (!result.isConfirmed) return;

        // ✅ 서버 요청은 하지 않고, 부모 컴포넌트에게만 알림
        console.log('🗑️ [EventModal] 삭제 요청을 부모에게 전달:', formData.id);
        onDelete(formData.id);
        onClose();

        // ✅ 삭제 성공 알림 (onClose 후에 표시)
        setTimeout(() => {
            Swal.fire({
                icon: 'success',
                title: '삭제 완료',
                text: '일정이 삭제되었습니다.',
                timer: 1500,
                showConfirmButton: false,
            });
        }, 100);
    };

    const selectedType = eventTypes.find((t) => t.value === formData.type);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleSave}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200/80">
                                <div className="flex items-center gap-3">
                                    <span className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/30">
                                        <Plus size={18} />
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-800">{isEditing ? '일정 수정' : '새 일정 추가'}</h2>
                                </div>
                                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Title Input */}
                                <div className="relative">
                                    <label htmlFor="modal-title" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                        일정 제목 *
                                    </label>
                                    <input
                                        id="modal-title"
                                        type="text"
                                        name="title"
                                        value={formData.title || ''}
                                        onChange={handleChange}
                                        required
                                        placeholder="예: 팀 회의"
                                        className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Custom Dropdown */}
                                <div ref={typeDropdownRef} className="relative">
                                    <label className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1 z-10">유형</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsTypeDropdownOpen((prev) => !prev)}
                                        className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full bg-${selectedType?.color}-500`}></div>
                                            <span className="text-slate-500">{selectedType?.icon}</span>
                                            <span className="text-sm font-semibold text-slate-700">{selectedType?.name}</span>
                                        </div>
                                        <ChevronDown size={18} className={`text-slate-500 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isTypeDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 5 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
                                            >
                                                {eventTypes.map((type) => (
                                                    <div
                                                        key={type.value}
                                                        onClick={() => {
                                                            setFormData({ ...formData, type: type.value });
                                                            setIsTypeDropdownOpen(false);
                                                        }}
                                                        className="flex items-center gap-3 p-3 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                                                    >
                                                        <div className={`w-2.5 h-2.5 rounded-full bg-${type.color}-500`}></div>
                                                        <span className="text-slate-500">{type.icon}</span>
                                                        <span>{type.name}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Date and Time inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label htmlFor="modal-date" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                            시작일 *
                                        </label>
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            id="modal-date"
                                            type="date"
                                            name="date"
                                            value={formData.date || ''}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 pl-10"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="modal-end-date" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                            종료일
                                        </label>
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            id="modal-end-date"
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate || ''}
                                            onChange={handleChange}
                                            min={formData.date}
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 pl-10"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="modal-start-time" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                            시작 시간
                                        </label>
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            id="modal-start-time"
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 pl-10"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor="modal-end-time" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                            종료 시간
                                        </label>
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            id="modal-end-time"
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Location and Description */}
                                <div className="relative">
                                    <label htmlFor="modal-location" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                        장소
                                    </label>
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                                    <input
                                        id="modal-location"
                                        type="text"
                                        name="location"
                                        value={formData.location || ''}
                                        onChange={handleChange}
                                        placeholder="예: 회의실 A, Zoom"
                                        className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="modal-description" className="absolute -top-2 left-3 text-xs text-slate-500 bg-white px-1">
                                        설명
                                    </label>
                                    <AlignLeft className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                    <textarea
                                        id="modal-description"
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        placeholder="일정에 대한 추가 정보를 입력하세요"
                                        rows="3"
                                        className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10 text-sm font-semibold text-slate-700 resize-none placeholder:text-slate-400"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-50/50 flex justify-between items-center rounded-b-2xl border-t border-slate-200/80">
                                {isEditing ? (
                                    <button type="button" onClick={handleDelete} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50">
                                        <Trash2 size={18} />
                                    </button>
                                ) : (
                                    <div className="w-9 h-9"></div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                        {isEditing ? '저장' : '추가'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EventModal;
