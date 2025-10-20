import { Calendar, Users, Video, Pencil, Trash2, MoreVertical } from 'lucide-react';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

const statusConfig = {
    진행중: {
        badge: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20',
        button: 'bg-green-600 hover:bg-green-700 focus-visible:outline-green-600',
        text: '지금 참여하기',
        icon: <Video className="w-5 h-5" />,
    },
    예정: {
        badge: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-600/20',
        button: 'bg-sky-600 hover:bg-sky-700 focus-visible:outline-sky-600',
        text: '회의 시작하기',
        icon: <Video className="w-5 h-5" />,
    },
    종료: {
        badge: 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-500/20',
        button: 'bg-slate-300 cursor-not-allowed',
        text: '회의 종료됨',
        icon: null,
    },
};

const MeetingCard = ({ id, title, status, participants, date, time, onJoinMeeting, onEdit, onDelete }) => {
    const currentStatus = statusConfig[status] || statusConfig['종료'];

    const handleButtonClick = () => {
        if (status === '진행중' || status === '예정') {
            onJoinMeeting();
        }
    };

    return (
        <div className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
            {/* 카드 상단 정보 */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${currentStatus.badge}`}>{status}</span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{participants}명</span>
                        </div>

                        {/* ✅ '예정' 상태일 때만 드롭다운 메뉴 노출 */}
                        {status === '예정' && (
                            <Menu as="div" className="relative inline-block text-left">
                                <Menu.Button className="rounded-full p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 transition-opacity duration-300">
                                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <div className="p-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={onEdit}
                                                        className={`${
                                                            active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                                                        } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                                                    >
                                                        <Pencil className="mr-3 h-4 w-4 text-slate-500" />
                                                        수정
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={onDelete}
                                                        className={`${
                                                            active ? 'bg-red-50 text-red-700' : 'text-slate-700'
                                                        } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                                                    >
                                                        <Trash2 className="mr-3 h-4 w-4" />
                                                        삭제
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>

                {/* 카드 본문 */}
                <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                        {date} &middot; {time}
                    </span>
                </div>
            </div>

            {/* 카드 하단 버튼 */}
            <div className="mt-6">
                <button
                    type="button"
                    className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${currentStatus.button}`}
                    disabled={status === '종료'}
                    onClick={handleButtonClick}
                >
                    {currentStatus.icon}
                    <span>{currentStatus.text}</span>
                </button>
            </div>
        </div>
    );
};

export default MeetingCard;
