import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, Users, Plus, Hash, AlertCircle, Pencil, Search } from 'lucide-react';
import axios from '../../../axios';

// Helper Component
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

const NewMeetingModal = ({ isOpen, onClose, onConfirm, meetingToEdit }) => {
    const isEditMode = Boolean(meetingToEdit);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [participants, setParticipants] = useState([]);
    const [participantInput, setParticipantInput] = useState('');
    const [errors, setErrors] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // 수정 모드일 때 기존 데이터 로드
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

    // 모달 닫힐 때 초기화
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
                setShowSearchResults(false);
            }, 300);
        }
    }, [isOpen]);

    // 사용자 검색 API 호출 (디바운싱)
    useEffect(() => {
        const searchUsers = async () => {
            const trimmedInput = participantInput.trim();

            // ✅ 3글자 미만이면 API를 호출하지 않음
            if (trimmedInput.length < 3) {
                setSearchResults([]);
                setShowSearchResults(false);
                return;
            }

            setIsSearching(true);
            try {
                // ✅ 변경점 1: API 주소 변경
                // ✅ 변경점 2: 파라미터 이름을 'keyword'로 변경
                const response = await axios.get(`/api/users/search`, {
                    params: { keyword: trimmedInput },
                });

                console.log('검색 결과:', response.data);

                // ✅ 변경점 3: 백엔드가 이제 배열을 바로 반환하므로 .items가 필요 없음
                const foundUsers = response.data || [];

                // 이미 추가된 참가자는 검색 결과에서 제외
                const filteredResults = foundUsers.filter(
                    (user) => !participants.some((p) => p.userId === user.userId), // 백엔드 DTO 필드명은 userId
                );

                // 프론트엔드에서 사용하는 키(user_id)에 맞게 매핑
                const mappedResults = filteredResults.map((user) => ({
                    user_id: user.userId,
                    email: user.email,
                    name: user.name,
                    username: user.name,
                }));

                setSearchResults(mappedResults);
                setShowSearchResults(true); // 입력값이 있으면 항상 검색창을 보여줌
            } catch (error) {
                console.error('사용자 검색 오류:', error);
                setSearchResults([]);
                // 검색 실패 시에도 입력창이 있으면 빈 결과창을 보여주는 것이 좋음
                setShowSearchResults(participantInput.trim().length > 0);
            } finally {
                setIsSearching(false);
            }
        };

        // 디바운싱: 300ms 후에 검색 실행
        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [participantInput, participants]);

    // 검색 결과에서 사용자 선택
    const handleSelectUser = (user) => {
        const newParticipant = {
            userId: user.user_id,
            name: user.name || user.username,
            email: user.email,
        };

        if (!participants.some((p) => p.userId === user.user_id)) {
            setParticipants([...participants, newParticipant]);
            setParticipantInput('');
            setSearchResults([]);
            setShowSearchResults(false);

            if (errors.participants) {
                const newErrors = { ...errors };
                delete newErrors.participants;
                setErrors(newErrors);
            }
        }
    };

    // 직접 ID 입력으로 추가 (기존 방식 유지)
    const handleAddParticipant = () => {
        const newParticipant = participantInput.trim();
        if (newParticipant && !participants.some((p) => p.userId === newParticipant || p === newParticipant)) {
            setParticipants([...participants, newParticipant]);
            setParticipantInput('');
            setSearchResults([]);
            setShowSearchResults(false);
            if (errors.participants) {
                const newErrors = { ...errors };
                delete newErrors.participants;
                setErrors(newErrors);
            }
        }
    };

    const handleRemoveParticipant = (participantToRemove) => {
        setParticipants(
            participants.filter((p) => {
                if (typeof p === 'string') {
                    return p !== participantToRemove;
                }
                return p.userId !== participantToRemove.userId;
            }),
        );
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

        // 참가자 ID 배열 생성
        const invitedUserIds = participants.map((p) => (typeof p === 'string' ? p : p.userId));

        const meetingData = {
            id: isEditMode ? meetingToEdit.id : `meeting-${Date.now()}`,
            title,
            status: '예정',
            participants: participants.length + 1,
            invited_ids: invitedUserIds,
            date: formattedDate,
            time: formattedTime,
        };

        onConfirm(meetingData);
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

                                        <InputField id="participants" label="참가자 초대 (이름 또는 ID)" icon={<Users className="h-5 w-5 text-slate-400" />} error={errors.participants}>
                                            <div className="relative">
                                                <div className="flex gap-2">
                                                    <input
                                                        id="participants"
                                                        type="text"
                                                        value={participantInput}
                                                        onChange={(e) => setParticipantInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (searchResults.length > 0) {
                                                                    handleSelectUser(searchResults[0]);
                                                                } else {
                                                                    handleAddParticipant();
                                                                }
                                                            }
                                                        }}
                                                        placeholder="사용자 이름 또는 ID로 검색"
                                                        className="block w-full rounded-lg border-slate-300 pl-10 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                                        autoComplete="off"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddParticipant}
                                                        className="flex-shrink-0 rounded-lg bg-violet-100 p-2 text-sm font-semibold text-violet-700 hover:bg-violet-200 transition-transform active:scale-95"
                                                        title="직접 추가"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                {/* 검색 결과 드롭다운 */}
                                                {showSearchResults && (
                                                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                        {isSearching ? (
                                                            <div className="p-3 text-center text-sm text-slate-500">검색 중...</div>
                                                        ) : (
                                                            searchResults.map((user) => (
                                                                <button
                                                                    key={user.user_id}
                                                                    type="button"
                                                                    onClick={() => handleSelectUser(user)}
                                                                    className="w-full px-4 py-2 text-left hover:bg-violet-50 transition-colors flex items-center gap-3"
                                                                >
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                                                                        {(user.name || user.username || 'U')[0].toUpperCase()}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.username}</p>
                                                                        <p className="text-xs text-slate-500 truncate">{user.email || user.user_id}</p>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </InputField>

                                        {participants.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {participants.map((p) => {
                                                    const displayName = typeof p === 'string' ? p : p.name || p.email;
                                                    const key = typeof p === 'string' ? p : p.userId;

                                                    return (
                                                        <span
                                                            key={key}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 animate-in fade-in-50"
                                                        >
                                                            <Hash className="h-3 w-3" /> {displayName}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveParticipant(p)}
                                                                className="rounded-full text-violet-500 hover:bg-violet-200/80 hover:text-violet-700"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </span>
                                                    );
                                                })}
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
