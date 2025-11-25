// src/components/dashboard/dashDoc/DocumentModal.jsx
import React, { useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import MinutesView from './MinutesView';
import api from '../../../axios';
import Swal from 'sweetalert2';
import { UserContext } from '../../../contexts/UserContext';

// ✅ 안전 JSON 파서
const safeJsonParse = (value, fallback) => {
    if (value == null) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed ?? fallback;
        } catch {
            return fallback;
        }
    }
    return fallback;
};

const DocumentModal = ({ isOpen, onClose, itemData }) => {
    const [loading, setLoading] = useState(false);
    const [minutesPayload, setMinutesPayload] = useState(null); // { minutes, aiCoach }
    console.log(itemData, 'adsfasfdasfasgjhnasl;fgdjakl;fsdjl;');
    const isMinutes = itemData?.itemType === 'minutes';
    const { user, setUser } = useContext(UserContext);

    // ===== 회의록 상세 요약 호출 =====
    useEffect(() => {
        if (!isOpen || !isMinutes || !itemData?.userId || !itemData?.meetingId) {
            setMinutesPayload(null);
            return;
        }

        const fetchMinutesDetail = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/users/${itemData.userId}/meetings/${itemData.meetingId}/summary`, { params: { lang: user.locale || 'ko' } });

                const raw = res.data;

                const topics = safeJsonParse(raw.topics, []);
                const decisions = safeJsonParse(raw.decisions, []);
                const actionItems = safeJsonParse(raw.actionItems, []);
                const risks = safeJsonParse(raw.risks, []);
                const improvements = safeJsonParse(raw.improvements, []);
                const nextSteps = safeJsonParse(raw.nextSteps, []);

                const minutes = {
                    id: raw.summaryId,
                    date: raw.meetingDate,
                    title: raw.meetingTitle,
                    participants: raw.participantCount ?? 0,
                    topics,
                    aiSummary: {
                        decisions,
                        actionItems,
                    },
                    // utterances → transcript
                    transcript: (raw.utterances || []).map((u, idx) => ({
                        id: idx,
                        speakerName: u.speaker_id,
                        text: u.text,
                        timestamp: '', // 필요 시 나중에 확장
                    })),
                };

                const aiCoach = {
                    summary: raw.summary,
                    meetingScore: raw.meetingScore,
                    riskLevel: raw.riskLevel,
                    risks,
                    improvements,
                    nextSteps,
                };

                setMinutesPayload({ minutes, aiCoach });
            } catch (err) {
                console.error('회의 요약 상세 조회 오류:', err);
                Swal.fire({
                    icon: 'error',
                    title: '회의록 불러오기 실패',
                    text: '회의 요약 상세 정보를 불러오는 중 오류가 발생했습니다.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMinutesDetail();
    }, [isOpen, isMinutes, itemData]);

    if (!isOpen || !itemData) return null;

    const headerTitle = isMinutes ? minutesPayload?.minutes?.title || itemData.title : itemData.title;
    const headerSub = isMinutes ? '회의록 요약' : itemData.type === 'translated' ? '번역 문서' : '원문 문서';

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="min-w-0">
                        <p className="text-xs text-slate-400 uppercase tracking-[0.16em]">{headerSub}</p>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{headerTitle}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="flex-1 overflow-y-auto bg-slate-100">
                    {isMinutes ? (
                        loading || !minutesPayload ? (
                            <div className="flex items-center justify-center h-64 text-slate-500">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mr-3" />
                                회의록을 불러오는 중입니다...
                            </div>
                        ) : (
                            <MinutesView minutes={minutesPayload.minutes} aiCoach={minutesPayload.aiCoach} />
                        )
                    ) : (
                        // ✅ 문서 모드 (간단 메타 + 다운로드 버튼)
                        <div className="p-6 space-y-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">파일 정보</h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600">
                                    <div>
                                        <dt className="font-medium text-slate-500">제목</dt>
                                        <dd className="truncate">{itemData.title}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-slate-500">업로드 / 수정일</dt>
                                        <dd>{itemData.lastModified}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-slate-500">파일 크기</dt>
                                        <dd>{itemData.size}</dd>
                                    </div>
                                    {itemData.fromLang && (
                                        <div>
                                            <dt className="font-medium text-slate-500">원문 언어</dt>
                                            <dd>{itemData.fromLang}</dd>
                                        </div>
                                    )}
                                    {itemData.target_language && (
                                        <div>
                                            <dt className="font-medium text-slate-500">번역 언어</dt>
                                            <dd>{itemData.target_language}</dd>
                                        </div>
                                    )}
                                    {itemData.provider && (
                                        <div>
                                            <dt className="font-medium text-slate-500">번역 엔진</dt>
                                            <dd>{itemData.provider}</dd>
                                        </div>
                                    )}
                                    {itemData.author && (
                                        <div>
                                            <dt className="font-medium text-slate-500">작성자</dt>
                                            <dd>{itemData.author}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                                <p className="text-sm text-slate-600">원본 파일을 내려받아 열람하거나, 다른 도구에서 편집할 수 있습니다.</p>
                                {itemData.downloadUrl && (
                                    <a
                                        href={itemData.downloadUrl}
                                        className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                                    >
                                        파일 다운로드
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentModal;
