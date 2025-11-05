import { Fragment, useState, useEffect, useContext } from 'react';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import { X, Calendar, Clock, Users, AlertCircle, Pencil } from 'lucide-react';
import axios from '../../../axios';
import Swal from 'sweetalert2';
import { UserContext } from '../../../contexts/UserContext';

// InputField Helper Component
const InputField = ({ id, label, icon, error, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
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

const NewMeetingModal = ({ isOpen, onClose, onConfirm, meetingToEdit }) => {
    const isEditMode = Boolean(meetingToEdit);
    const { user } = useContext(UserContext);

    // --- State (기존과 동일) ---
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [participants, setParticipants] = useState([]);
    const [participantInput, setParticipantInput] = useState('');
    const [errors, setErrors] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- useEffects (기존과 동일) ---
    useEffect(() => {
        if (isEditMode && isOpen) {
            setTitle(meetingToEdit.title);
            setParticipants(meetingToEdit.invited_ids || []);

            const dateStr = meetingToEdit.date.replace(
                /(\d{4}년)\s*(\d{1,2}월)\s*(\d{1,2}일)/,
                (_, y, m, d) => `${y.slice(0, -1)}-${m.slice(0, -1).padStart(2, '0')}-${d.slice(0, -1).padStart(2, '0')}`,
            );
            const formattedDate = new Date(dateStr).toISOString().split('T')[0];
            setDate(formattedDate);

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

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setTitle('');
                setDate('');
                setTime('');
                setParticipants([]);
                setParticipantInput('');
                setErrors({});
                setSearchResults([]);
                setIsSaving(false);
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        const searchUsers = async () => {
            const trimmedInput = participantInput.trim();
            if (trimmedInput.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await axios.get(`/api/users/search`, {
                    params: { keyword: trimmedInput },
                });
                const foundUsers = response.data || [];
                const filteredResults = foundUsers.filter((user) => !participants.some((p) => p.userId === user.userId));

                const mappedResults = filteredResults.map((user) => ({
                    user_id: user.userId,
                    email: user.email,
                    name: user.name,
                    username: user.name,
                }));

                setSearchResults(mappedResults);
            } catch (error) {
                console.error('사용자 검색 오류:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [participantInput, participants]);

    // --- Handlers (기존과 동일) ---
    const handleSelectUser = (selectedUser) => {
        if (!selectedUser || !selectedUser.user_id) return;
        const newParticipant = {
            userId: selectedUser.user_id,
            name: selectedUser.name || selectedUser.username,
            email: selectedUser.email,
        };
        if (!participants.some((p) => p.userId === newParticipant.userId)) {
            setParticipants([...participants, newParticipant]);
        }
        setParticipantInput('');
        setSearchResults([]);
    };

    const handleRemoveParticipant = (participantToRemove) => {
        setParticipants(participants.filter((p) => p.userId !== participantToRemove.userId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!title.trim()) newErrors.title = '회의 제목을 입력해주세요.';
        if (!date) newErrors.date = '날짜를 선택해주세요.';
        if (!time) newErrors.time = '시간을 선택해주세요.';
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setIsSaving(true);

        try {
            const formattedDate = new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(new Date(`${date}T00:00:00`));

            const [hourStr, minuteStr] = time.split(':');
            const hourNum = parseInt(hourStr, 10);
            const period = hourNum >= 12 ? '오후' : '오전';
            const formattedHour = hourNum % 12 || 12;
            const formattedTime = `${period} ${String(formattedHour).padStart(2, '0')}:${minuteStr}`;

            const meetingData = {
                id: isEditMode ? meetingToEdit.id : null,
                title,
                date: formattedDate,
                time: formattedTime,
            };

            const savedMeetingId = await onConfirm(meetingData);

            if (!savedMeetingId) {
                throw new Error('회의 ID를 받아오지 못했습니다.');
            }

            const invitedUserIds = participants.map((p) => p.userId);
            if (invitedUserIds.length > 0) {
                try {
                    const invitePromises = invitedUserIds.map((userId) =>
                        axios.post(`/api/meetings/${savedMeetingId}/participants/invite`, {
                            userId: userId,
                            role: 'GUEST',
                        }),
                    );
                    await Promise.all(invitePromises);
                } catch (inviteError) {
                    console.error('참가자 초대 실패:', inviteError);
                    Swal.fire({
                        icon: 'warning',
                        title: '일부 작업 실패',
                        text: `회의는 생성되었지만 일부 참가자 초대에 실패했습니다.\n${inviteError.response?.data?.message || ''}`,
                        confirmButtonColor: '#10B981', // emerald-500
                    });
                }
            }

            if (user?.userId) {
                try {
                    const [calHour, calMinute] = time.split(':').map(Number);
                    const endHour = Math.min(calHour + 1, 23);

                    const eventPayload = {
                        title: title,
                        type: 'meeting',
                        startDate: date,
                        endDate: date,
                        startTime: `${time}:00`,
                        endTime: `${String(endHour).padStart(2, '0')}:${String(calMinute).padStart(2, '0')}:00`,
                        location: '',
                        description: '',
                        meetingId: savedMeetingId,
                    };

                    await axios.post(`/api/users/${user.userId}/calendar/events`, eventPayload);
                } catch (calendarError) {
                    console.error('캘린더 일정 추가 실패:', calendarError);
                    Swal.fire({
                        icon: 'warning',
                        title: '회의는 생성되었습니다.',
                        text: '하지만 캘린더에 일정을 등록하는 데 실패했습니다. 캘린더에서 직접 추가해주세요.',
                        confirmButtonColor: '#10B981', // emerald-500
                    });
                }
            }

            setIsSaving(false);
            Swal.fire({
                icon: 'success',
                title: isEditMode ? '회의가 수정되었습니다' : '회의가 예약되었습니다',
                timer: 1500,
                showConfirmButton: false,
            });
            onClose();
        } catch (error) {
            setIsSaving(false);
            console.error('회의 저장 실패:', error);
            Swal.fire({
                icon: 'error',
                title: '저장 실패',
                text: error.response?.data?.message || error.message || '처리 중 오류가 발생했습니다.',
                confirmButtonColor: '#10B981', // emerald-500
            });
        }
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
                            <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white text-left align-middle shadow-2xl transition-all shadow-gray-500/20">
                                {/* 🚀 --- 디자인 수정: 헤더에 아이콘 및 배경색 추가 --- 🚀 */}
                                <div className="relative bg-emerald-50 p-6 rounded-t-2xl">
                                    {/* 닫기 버튼 */}
                                    <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 text-emerald-700/60 hover:bg-emerald-100 hover:text-emerald-700/80 transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>

                                    {/* 헤더 아이콘 */}
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                        {isEditMode ? <Pencil className="h-6 w-6 text-emerald-600" /> : <Calendar className="h-6 w-6 text-emerald-600" />}
                                    </div>

                                    {/* 텍스트 (중앙 정렬) */}
                                    <Dialog.Title as="h3" className="mt-3 text-center text-lg font-semibold leading-6 text-gray-900">
                                        {isEditMode ? '회의 정보 수정' : '새 회의 예약'}
                                    </Dialog.Title>
                                    <p className="mt-2 text-center text-sm text-gray-500">{isEditMode ? '회의 정보를 수정하고 변경사항을 저장하세요.' : '회의 정보를 입력하여 예약을 완료하세요.'}</p>
                                </div>

                                {/* --- 모달 폼 --- */}
                                <form onSubmit={handleSubmit}>
                                    {/* 🚀 --- 디자인 수정: 폼 배경을 'bg-white'로 변경 --- 🚀 */}
                                    <div className="space-y-6 bg-white p-6">
                                        <InputField id="title" label="회의 제목" icon={<Pencil className="h-5 w-5 text-gray-400" />} error={errors.title}>
                                            <input
                                                id="title"
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="예: 4분기 실적 보고 회의"
                                                className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors"
                                            />
                                        </InputField>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField id="date" label="날짜" icon={<Calendar className="h-5 w-5 text-gray-400" />} error={errors.date}>
                                                <input
                                                    id="date"
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors"
                                                />
                                            </InputField>
                                            <InputField id="time" label="시간" icon={<Clock className="h-5 w-5 text-gray-400" />} error={errors.time}>
                                                <input
                                                    id="time"
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => setTime(e.target.value)}
                                                    className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors"
                                                />
                                            </InputField>
                                        </div>

                                        {/* --- 참가자 검색 (Combobox) --- */}
                                        <div>
                                            <label htmlFor="participants-input" className="block text-sm font-medium text-gray-700">
                                                참가자 초대 (이메일로 검색)
                                            </label>
                                            <Combobox value={null} onChange={handleSelectUser}>
                                                <div className="relative mt-1.5">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <Users className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <Combobox.Input
                                                        id="participants-input"
                                                        className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors"
                                                        placeholder="사용자 이메일/이름 (3자 이상)"
                                                        autoComplete="off"
                                                        value={participantInput}
                                                        onChange={(e) => setParticipantInput(e.target.value)}
                                                    />

                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto focus:outline-none p-1.5">
                                                            {isSearching ? (
                                                                <div className="p-3 text-center text-sm text-gray-500">검색 중...</div>
                                                            ) : searchResults.length === 0 && participantInput.trim().length > 2 ? (
                                                                <div className="p-3 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
                                                            ) : (
                                                                searchResults.map((user) => (
                                                                    <Combobox.Option
                                                                        key={user.user_id}
                                                                        value={user}
                                                                        className={({ active }) =>
                                                                            `relative w-full px-3 py-2 text-left cursor-pointer transition-colors flex items-center gap-3 rounded-md ${
                                                                                active ? 'bg-emerald-50' : 'text-gray-800'
                                                                            }`
                                                                        }
                                                                    >
                                                                        {({ active }) => (
                                                                            <>
                                                                                <div
                                                                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                                                                        active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
                                                                                    }`}
                                                                                >
                                                                                    {(user.name || 'U')[0].toUpperCase()}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className={`text-sm font-medium truncate ${active ? 'text-emerald-900' : 'text-gray-900'}`}>{user.name}</p>
                                                                                    <p className={`text-xs truncate ${active ? 'text-emerald-700' : 'text-gray-500'}`}>{user.email}</p>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </Combobox.Option>
                                                                ))
                                                            )}
                                                        </Combobox.Options>
                                                    </Transition>
                                                </div>
                                            </Combobox>
                                            {errors.participants && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    {errors.participants}
                                                </p>
                                            )}
                                        </div>

                                        {/* --- 초대된 참가자 목록 --- */}
                                        {participants.length > 0 && (
                                            <div className="pt-1">
                                                <label className="mb-2 block text-xs font-medium text-gray-600">초대된 참가자</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {participants.map((p) => (
                                                        <span
                                                            key={p.userId}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 border border-emerald-200 animate-in fade-in-50"
                                                        >
                                                            {p.name || p.email}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveParticipant(p)}
                                                                className="rounded-full text-emerald-500 hover:bg-emerald-200/80 hover:text-emerald-700"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* --- 모달 푸터 --- */}
                                    {/* 🚀 --- 디자인 수정: 'bg-gray-50' 및 'rounded-b-2xl' 적용 --- 🚀 */}
                                    <div className="flex justify-end gap-3 bg-gray-50 p-6 border-t border-gray-200 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? '저장 중...' : isEditMode ? '변경사항 저장' : '회의 예약하기'}
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
