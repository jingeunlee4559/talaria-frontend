// src/components/dashboard/dashDoc/MinutesView.jsx
import React, { useState } from 'react';
import { AIIcon, SearchIcon, ParticipantsIcon, DurationIcon, CalendarIcon } from '../../icons/icons';
import { Sparkles, CheckCircle2, ListTodo } from 'lucide-react';
import EventModal from '../dashSchedule/EventModal';

const MinutesView = ({ minutes, aiCoach }) => {
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedActionItem, setSelectedActionItem] = useState(null);
    const [showAllTranscript, setShowAllTranscript] = useState(false); // 🔹 대화기록 더보기 상태

    const decisions = minutes.aiSummary?.decisions || [];
    const actionItems = minutes.aiSummary?.actionItems || [];
    const topics = minutes.topics || [];
    const transcripts = minutes.transcript || [];

    const handleOpenEventModal = (actionItem) => {
        setSelectedActionItem(actionItem);
        setIsEventModalOpen(true);
    };

    const handleCloseEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedActionItem(null);
    };

    // 🔹 실제로 렌더링할 대화 기록 (3개 제한 / 전체)
    const transcriptsToShow = showAllTranscript || transcripts.length <= 3 ? transcripts : transcripts.slice(0, 3);

    return (
        <div className="flex flex-col flex-grow overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100">
            {/* 상단 메타 정보 */}
            <div className="p-4 flex items-center text-sm text-slate-600 border-b border-slate-200 bg-white sticky top-0 z-10">
                <span className="font-medium mr-5 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    {minutes.date}
                </span>
                {/* <span className="font-medium mr-5 flex items-center gap-1.5">
                    <DurationIcon className="w-4 h-4" />
                    {minutes.duration}
                </span> */}
                <span className="font-medium flex items-center gap-1.5">
                    <ParticipantsIcon className="w-4 h-4" />
                    {minutes.participants}명
                </span>
            </div>

            <div className="p-8 grid grid-cols-1 gap-6">
                {/* 🔹 AI 요약 카드 (리디자인) */}
                <div className="rounded-xl p-5 border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="inline-flex h-9 w-9 rounded-full bg-sky-500/10 text-sky-600 items-center justify-center">
                                <AIIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">AI 회의 요약</h3>
                                <p className="text-xs text-slate-500 mt-0.5">결정·Action Item·주요 주제를 한눈에 정리한 자동 요약입니다.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 font-semibold">결정 {decisions.length}개</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Action Item {actionItems.length}개</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">주제 {topics.length}개</span>
                        </div>
                    </div>

                    {/* 한 줄 요약 */}
                    <p className="text-sm text-slate-700 bg-white/60 border border-slate-100 rounded-lg px-3 py-2 mb-4">
                        이번 회의는 <span className="font-semibold text-slate-900">{topics.length > 0 ? `"${topics.join(', ')}"` : '핵심 아젠다'}</span>를 중심으로 진행되었고, 총{' '}
                        <span className="font-semibold text-slate-900">{minutes.participants}명</span>이 참여했습니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 결정 사항 */}
                        <div className="bg-white/70 rounded-xl border border-slate-200/60 p-4 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                            <div className="flex items-center gap-2 mb-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <h4 className="font-semibold text-slate-900 text-sm">결정 사항</h4>
                            </div>
                            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside">
                                {decisions.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                                {decisions.length === 0 && <li className="text-slate-400">등록된 결정 사항이 없습니다.</li>}
                            </ul>
                        </div>

                        {/* Action Items */}
                        <div className="bg-white/70 rounded-xl border border-slate-200/60 p-4 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                            <div className="flex items-center gap-2 mb-2.5">
                                <ListTodo className="w-4 h-4 text-indigo-500" />
                                <h4 className="font-semibold text-slate-900 text-sm">Action Items</h4>
                            </div>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                {actionItems.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="font-medium text-slate-900 flex-shrink-0 w-[80px] truncate">{a.owner}</span>
                                        <span className="flex-grow">{a.task}</span>

                                        {/* 날짜 + 일정추가 버튼 영역 */}
                                        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{a.deadline}</span>

                                            {/* + 버튼 + 툴팁 */}
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEventModal(a)}
                                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 text-slate-500 
                                                               bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-400 
                                                               text-xs font-bold shadow-sm transition"
                                                >
                                                    +
                                                </button>
                                                <div
                                                    className="absolute -top-8 right-0 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] whitespace-nowrap
                                                               opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg"
                                                >
                                                    일정에 추가할 수 있습니다
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {actionItems.length === 0 && <li className="text-slate-400">등록된 Action Item이 없습니다.</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 🔹 AI 회의 코치 카드 (리스크 / 개선 / 다음 액션) */}
                {aiCoach && (
                    <div className="relative rounded-2xl p-5 bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white shadow-lg overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff,_transparent_55%)]" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="inline-flex h-8 w-8 rounded-full bg-white/15 items-center justify-center">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-indigo-100">AI Meeting Coach</p>
                                        <p className="text-sm font-semibold text-white">이번 회의에 대한 코칭 리포트</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 text-[11px] font-medium">
                                        <span className={`h-2 w-2 rounded-full ${aiCoach.riskLevel === '높음' ? 'bg-rose-300' : aiCoach.riskLevel === '보통' ? 'bg-amber-300' : 'bg-emerald-300'}`} />
                                        리스크 레벨: {aiCoach.riskLevel}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold">
                                        회의 점수 <span className="text-yellow-300">{aiCoach.meetingScore}</span> / 100
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-indigo-50/90 mb-4 leading-relaxed">{aiCoach.summary}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                                {/* 리스크 */}
                                <div>
                                    <h4 className="font-semibold mb-1.5 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                                        리스크 포인트
                                    </h4>
                                    <ul className="space-y-1.5 text-indigo-50/95 list-disc list-inside">
                                        {aiCoach.risks.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                                {/* 개선 제안 */}
                                <div>
                                    <h4 className="font-semibold mb-1.5 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                                        개선 제안
                                    </h4>
                                    <ul className="space-y-1.5 text-indigo-50/95 list-disc list-inside">
                                        {aiCoach.improvements.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                                {/* 다음 액션 */}
                                <div>
                                    <h4 className="font-semibold mb-1.5 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                                        다음 액션 제안
                                    </h4>
                                    <ul className="space-y-1.5 text-indigo-50/95 list-disc list-inside">
                                        {aiCoach.nextSteps.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 주요 주제 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">주요 주제</h3>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full cursor-pointer transition-all duration-200 hover:bg-indigo-200 hover:shadow-md transform"
                            >
                                {topic}
                            </span>
                        ))}
                        {topics.length === 0 && <span className="text-sm text-slate-400">등록된 주제가 없습니다.</span>}
                    </div>
                </div>

                {/* 대화 기록 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">대화 기록</h3>
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="text-slate-400 w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="스크립트 내 검색..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm bg-white focus:bg-white"
                        />
                    </div>

                    <div className="border-t border-slate-100">
                        {transcriptsToShow.map((t, i) => (
                            <div key={i} className="group flex items-start p-3 transition-colors hover:bg-slate-100/70 border-b border-slate-100 last:border-b-0">
                                <div
                                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 mt-0.5 
                                        ${t.speaker === '김' ? 'bg-green-500' : t.speaker === 'J' ? 'bg-blue-500' : t.speaker === '田' ? 'bg-red-500' : 'bg-gray-500'}`}
                                >
                                    {t.speaker}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center mb-1">
                                        <span className="font-bold text-slate-800 mr-2">
                                            {t.speaker === 'J' ? 'John Smith' : t.speaker === '田' ? '田中太郎' : t.speaker === '김' ? '김철수' : '기타'}
                                        </span>
                                        <span
                                            className="text-xs text-blue-600 font-medium cursor-pointer hover:underline md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={() => console.log(`Seek to ${t.timestamp}`)}
                                        >
                                            {t.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{t.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 🔹 더보기 / 접기 버튼 */}
                    {transcripts.length > 3 && (
                        <div className="flex justify-center mt-3">
                            <button
                                type="button"
                                onClick={() => setShowAllTranscript((prev) => !prev)}
                                className="px-4 py-1.5 text-sm rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 transition shadow-sm"
                            >
                                {showAllTranscript ? '접기' : `더보기 (${transcripts.length - 3}개 더 보기)`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 일정 추가 모달 */}
            <EventModal isOpen={isEventModalOpen} onClose={handleCloseEventModal} date={selectedActionItem?.deadline} title={selectedActionItem?.task} owner={selectedActionItem?.owner} />
        </div>
    );
};

export default MinutesView;
