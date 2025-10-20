import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, Users, Plus, Hash, AlertCircle, Pencil } from 'lucide-react';

// Helper Component는 외부로 분리하여 불필요한 재정의를 방지합니다.
const InputField = ({ id, label, icon, error, children }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
        </label>
        <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>
            {children}
        </div>
        {error && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
            </p>
        )}
    </div>
);

// meetingToEdit prop을 받아 수정 모드를 제어합니다.
const NewMeetingModal = ({ isOpen, onClose, onConfirm, meetingToEdit }) => {
    const isEditMode = Boolean(meetingToEdit);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [participants, setParticipants] = useState([]);
    const [participantInput, setParticipantInput] = useState('');
    const [errors, setErrors] = useState({});

    // 수정 모드일 때, 모달이 열리면 기존 데이터를 폼에 채워넣습니다.
    useEffect(() => {
        if (isEditMode && isOpen) {
            setTitle(meetingToEdit.title);
            setParticipants(meetingToEdit.invited_ids || []);

            // "2025년 10월 18일" 같은 문자열을 "2025-10-18" 형식으로 변환합니다.
            const dateStr = meetingToEdit.date.replace(
                /(\d{4}년)\s*(\d{1,2}월)\s*(\d{1,2}일)/,
                (_, y, m, d) => `${y.slice(0, -1)}-${m.slice(0, -1).padStart(2, '0')}-${d.slice(0, -1).padStart(2, '0')}`,
            );
            const formattedDate = new Date(dateStr).toISOString().split('T')[0];
            setDate(formattedDate);

            // "오후 2:00" 같은 문자열을 "14:00" 형식으로 변환합니다.
            const [period, timeStr] = meetingToEdit.time.split(' ');
            let [hour, minute] = timeStr.split(':');
            hour = parseInt(hour, 10);
            if (period === '오후' && hour !== 12) {
                hour += 12;
            } else if (period === '오전' && hour === 12) {
                hour = 0;
            }
            const formattedTime = `${String(hour).padStart(2, '0')}:${minute}`;
            setTime(formattedTime);
        }
    }, [meetingToEdit, isEditMode, isOpen]);

    // 모달이 닫힐 때 모든 상태를 초기화합니다.
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setTitle('');
                setDate('');
                setTime('');
                setParticipants([]);
                setParticipantInput('');
                setErrors({});
            }, 300);
        }
    }, [isOpen]);

    const handleAddParticipant = () => {
        const newParticipant = participantInput.trim();
        if (newParticipant && !participants.includes(newParticipant)) {
            setParticipants([...participants, newParticipant]);
            setParticipantInput('');
            if (errors.participants) {
                const newErrors = { ...errors };
                delete newErrors.participants;
                setErrors(newErrors);
            }
        }
    };

    const handleRemoveParticipant = (participantToRemove) => {
        setParticipants(participants.filter((p) => p !== participantToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!title.trim()) newErrors.title = '회의 제목을 입력해주세요.';
        if (!date) newErrors.date = '날짜를 선택해주세요.';
        if (!time) newErrors.time = '시간을 선택해주세요.';
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        const formattedDate = new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(`${date}T00:00:00`));

        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const period = hourNum >= 12 ? '오후' : '오전';
        const formattedHour = hourNum % 12 || 12;
        const formattedTime = `${period} ${String(formattedHour).padStart(2, '0')}:${minute}`;

        const meetingData = {
            id: isEditMode ? meetingToEdit.id : `meeting-${Date.now()}`,
            title,
            status: '예정', // 수정 시에도 status는 '예정'으로 유지됩니다.
            participants: participants.length + 1,
            invited_ids: participants,
            date: formattedDate,
            time: formattedTime,
        };

        onConfirm(meetingData);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border-t-4 border-violet-500">
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900">
                                                {isEditMode ? '회의 정보 수정' : '새 회의 예약'}
                                            </Dialog.Title>
                                            <p className="mt-1 text-sm text-slate-500">{isEditMode ? '회의 정보를 수정하고 변경사항을 저장하세요.' : '회의 정보를 입력하여 예약을 완료하세요.'}</p>
                                        </div>
                                        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-5 bg-slate-50/50 p-6">
                                        <InputField id="title" label="회의 제목" icon={<Pencil className="h-5 w-5 text-slate-400" />} error={errors.title}>
                                            <input
                                                id="title"
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="예: 4분기 실적 보고 회의"
                                                className="block w-full rounded-lg border-slate-300 pl-10 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                            />
                                        </InputField>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField id="date" label="날짜" icon={<Calendar className="h-5 w-5 text-slate-400" />} error={errors.date}>
                                                <input
                                                    id="date"
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="block w-full rounded-lg border-slate-300 pl-10 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                                />
                                            </InputField>
                                            <InputField id="time" label="시간" icon={<Clock className="h-5 w-5 text-slate-400" />} error={errors.time}>
                                                <input
                                                    id="time"
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => setTime(e.target.value)}
                                                    className="block w-full rounded-lg border-slate-300 pl-10 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                                />
                                            </InputField>
                                        </div>
                                        <InputField id="participants" label="참가자 초대 (ID)" icon={<Users className="h-5 w-5 text-slate-400" />} error={errors.participants}>
                                            <div className="flex gap-2">
                                                <input
                                                    id="participants"
                                                    type="text"
                                                    value={participantInput}
                                                    onChange={(e) => setParticipantInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                                                    placeholder="초대할 팀원의 ID 입력"
                                                    className="block w-full rounded-lg border-slate-300 pl-10 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddParticipant}
                                                    className="flex-shrink-0 rounded-lg bg-violet-100 p-2 text-sm font-semibold text-violet-700 hover:bg-violet-200 transition-transform active:scale-95"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </InputField>
                                        {participants.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {participants.map((p) => (
                                                    <span
                                                        key={p}
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 animate-in fade-in-50"
                                                    >
                                                        <Hash className="h-3 w-3" /> {p}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveParticipant(p)}
                                                            className="rounded-full text-violet-500 hover:bg-violet-200/80 hover:text-violet-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 bg-white p-6 border-t">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 transition-colors"
                                        >
                                            {isEditMode ? '변경사항 저장' : '회의 예약하기'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default NewMeetingModal;
