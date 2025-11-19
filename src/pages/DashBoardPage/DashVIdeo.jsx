import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Plus, VideoOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';

import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
import InProgressMeetingCard from '../../components/dashboard/dashvideo/InProgressMeetingCard';
import NewMeetingModal from '../../components/dashboard/dashvideo/NewMeetingModal';
import DocumentListModal from '../../components/dashboard/dashvideo/DocumentListModal';

import Pagination from '../../components/Pagination';

import { UserContext } from '../../contexts/UserContext';
import api from '../../axios';
import MeetingSummaryHUD from '../../components/dashboard/dashvideo/Meetingsummaryhud';

const MEETINGS_PER_PAGE = 6;
const FILTERS = ['전체', '진행중', '예정', '종료'];

// 백엔드가 transDocIds를 직접 받는 경우 true
const BACKEND_SUPPORTS_TRANS_DOC_IDS = true;

const DashVideo = () => {
    const { user } = useContext(UserContext);

    const [meetings, setMeetings] = useState([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    // 문서 모달 상태
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [selectedMeetingStatus, setSelectedMeetingStatus] = useState('SCHEDULED');
    const [roomDocuments, setRoomDocuments] = useState([]);

    // 내 문서 (원문/번역 분리)
    const [myDocsOriginals, setMyDocsOriginals] = useState([]);
    const [myDocsTranslations, setMyDocsTranslations] = useState([]);

    // 회의록 요약 상태 관리
    const [summaries, setSummaries] = useState([]);

    const mapStatusToKorean = (status) => {
        switch (status) {
            case 'ONGOING':
                return '진행중';
            case 'SCHEDULED':
                return '예정';
            case 'ENDED':
                return '종료';
            default:
                return '알수없음';
        }
    };

    // 회의 목록 로드
    useEffect(() => {
        if (!user?.userId) return;
        (async () => {
            try {
                const res = await api.get(`/api/users/${user.userId}/meetings/all`, {
                    params: {
                        mode: 'b',
                    },
                });

                if (!Array.isArray(res.data?.items)) {
                    setMeetings([]);
                    return;
                }

                const formatted = await Promise.all(
                    res.data.items.map(async (m) => {
                        let participantCount = 1;
                        try {
                            const countUrl = m.status === 'ONGOING' ? `/livekit/meetings/${m.meetings_id}/participants/count` : `/api/meetings/${m.meetings_id}/participants/count`;
                            const cnt = await api.get(countUrl);
                            participantCount = cnt.data.totalCount ?? cnt.data.count ?? 1;
                        } catch {}

                        const guestParticipants = (m.participants || []).filter((p) => p.role === 'GUEST').map((p) => ({ userId: p.user_id, name: p.user_name, email: p.user_email }));

                        return {
                            id: m.meetings_id,
                            title: m.title,
                            status: mapStatusToKorean(m.status),
                            rawStatus: m.status,
                            date: new Date(m.scheduled_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
                            time: new Date(m.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                            invite_code: m.invite_code,
                            participants: participantCount,
                            invited_ids: guestParticipants,
                            user_role: m.user_role,
                            host_id: m.host_id,
                            allParticipants: m.participants || [], // 전체 참가자 정보 저장
                        };
                    }),
                );

                setMeetings(formatted);
            } catch (e) {
                console.error(e);
                setMeetings([]);
            }
        })();
    }, [user?.userId]);

    // 내 문서 목록 로드 (/with-trans)
    useEffect(() => {
        if (!user?.userId) return;
        (async () => {
            try {
                const res = await api.get(`/api/users/${user.userId}/documents/with-trans`);
                const items = Array.isArray(res.data?.items) ? res.data.items : [];

                const originals = [];
                const translations = [];

                items.forEach((it) => {
                    const isTranslatedLike = !!(it.trans_doc_id || it.translated_rel_path || it.target_language);

                    if (isTranslatedLike) {
                        translations.push({
                            id: it.trans_doc_id, // 반드시 tl_trans_docs.trans_doc_id
                            original_doc_id: it.original_doc_id ?? it.doc_id,
                            title: `${it.original_name} (${(it.target_language || 'trans').toUpperCase()})`,
                            original_name: it.original_name,
                            fromLang: it.original_lang,
                            toLang: it.target_language,
                            translated_at: it.translated_at,
                            size: it.size_bytes ? `${(it.size_bytes / 1024 / 1024).toFixed(2)} MB` : '',
                            rel_path: it.translated_rel_path,
                            filepath: it.translated_rel_path,
                            type: 'translated',
                            provider: it.provider,
                        });
                    } else {
                        originals.push({
                            id: it.doc_id,
                            title: it.original_name,
                            original_name: it.original_name,
                            fromLang: it.original_lang,
                            size: it.doc_size ? `${(it.doc_size / 1024 / 1024).toFixed(2)} MB` : '',
                            author: it.uploader_name,
                            lastModified: it.uploaded_at ? new Date(it.uploaded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                            rel_path: it.filepath,
                            filepath: it.filepath,
                            type: 'original',
                        });
                    }
                });

                setMyDocsOriginals(originals);
                setMyDocsTranslations(translations);
            } catch (e) {
                console.error(e);
                setMyDocsOriginals([]);
                setMyDocsTranslations([]);
            }
        })();
    }, [user?.userId]);

    // 필터링
    const inProgressMeetings = useMemo(() => {
        if (activeFilter !== '전체' && activeFilter !== '진행중') return [];
        return meetings.filter((m) => m.status === '진행중');
    }, [meetings, activeFilter]);

    const upcomingMeetings = useMemo(() => {
        let list;
        if (activeFilter === '전체') list = meetings.filter((m) => m.status !== '진행중');
        else if (activeFilter === '진행중') list = [];
        else list = meetings.filter((m) => m.status === activeFilter);
        return list.sort((a, b) => Number(b.id) - Number(a.id));
    }, [meetings, activeFilter]);

    // 페이지네이션
    const paginatedUpcomingMeetings = useMemo(() => {
        const first = (currentPage - 1) * MEETINGS_PER_PAGE;
        const last = first + MEETINGS_PER_PAGE;
        return upcomingMeetings.slice(first, last);
    }, [currentPage, upcomingMeetings]);

    const totalPages = Math.ceil(upcomingMeetings.length / MEETINGS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // === 회의록 요약 핸들러 ===
    const handleSummarize = async (meeting) => {
        if (!user?.userId || !meeting?.id) return;

        try {
            // 참가자 이름 목록 생성 (HOST 포함)
            const participantNames = [];

            // allParticipants에서 이름 수집
            if (meeting.allParticipants && meeting.allParticipants.length > 0) {
                meeting.allParticipants.forEach((p) => {
                    if (p.user_name) {
                        participantNames.push(p.user_name);
                    }
                });
            }

            // 요약 작업 상태 추가
            const newSummary = {
                meetingId: meeting.id,
                meetingTitle: meeting.title,
                participantCount: participantNames.length,
                status: 'PROCESSING',
                percent: 0,
                error: null,
            };
            setSummaries((prev) => [...prev, newSummary]);
            console.log(newSummary, 'summary info 되니?');

            // 진행률 시뮬레이션 (실제로는 백엔드에서 진행률을 받아야 함)
            const progressInterval = setInterval(() => {
                setSummaries((prev) =>
                    prev.map((s) => {
                        if (s.meetingId === meeting.id && s.status === 'PROCESSING') {
                            const newPercent = Math.min(s.percent + 10, 90);
                            return { ...s, percent: newPercent };
                        }
                        return s;
                    }),
                );
            }, 500);

            // API 호출
            const payload = {
                meetingTitle: meeting.title,
                participants: participantNames,
            };

            console.log(payload, 'summary 12345');

            const response = await api.post(`/api/users/${user.userId}/meetings/${meeting.id}/raw-script`, payload);

            // 성공 처리
            clearInterval(progressInterval);
            setSummaries((prev) =>
                prev.map((s) => {
                    if (s.meetingId === meeting.id) {
                        return { ...s, status: 'COMPLETED', percent: 100 };
                    }
                    return s;
                }),
            );

            // 3초 후 자동으로 알림 제거
            setTimeout(() => {
                setSummaries((prev) => prev.filter((s) => s.meetingId !== meeting.id));
            }, 3000);
        } catch (error) {
            console.error('회의록 요약 실패:', error);

            // 실패 처리
            setSummaries((prev) =>
                prev.map((s) => {
                    if (s.meetingId === meeting.id) {
                        return {
                            ...s,
                            status: 'FAILED',
                            percent: 0,
                            error: error?.response?.data?.error || '회의록 요약 중 오류가 발생했습니다.',
                        };
                    }
                    return s;
                }),
            );
        }
    };

    // 요약 알림 닫기
    const handleCloseSummary = (meetingId) => {
        setSummaries((prev) => prev.filter((s) => s.meetingId !== meetingId));
    };

    // === 회의 문서 보기/첨부 모달 ===
    const handleOpenDocuments = async (meeting) => {
        try {
            setSelectedMeetingId(meeting.id);
            setSelectedMeetingStatus(meeting.rawStatus || 'SCHEDULED');

            const res = await api.get(`/api/users/${user.userId}/meetings/${meeting.id}/documents`);
            const items = Array.isArray(res.data?.items) ? res.data.items : [];

            setRoomDocuments(
                items.map((d) => {
                    // 번역 여부는 trans_doc_id 존재로 판정
                    const isTrans = !!d.trans_doc_id || d.doc_type === 'TRANSLATION';
                    const bytes = Number(isTrans ? d.trans_size_bytes ?? d.size : d.size) || 0;
                    return {
                        id: isTrans ? d.trans_doc_id : d.doc_id,
                        trans_doc_id: d.trans_doc_id ?? null,
                        doc_type: isTrans ? 'TRANSLATION' : 'ORIGINAL',
                        title: d.original_name,
                        original_name: d.original_name,
                        rel_path: d.rel_path || d.filepath,
                        size: bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : '',
                        lastModified: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                        source_lang: d.source_lang,
                        target_language: d.target_language,
                    };
                }),
            );

            setIsDocModalOpen(true);
        } catch (e) {
            console.error(e);
            setRoomDocuments([]);
            setIsDocModalOpen(true);
        }
    };

    // 번역/원문 구분 첨부
    const handleAddDocsToMeeting = async (selectedIds, kind) => {
        if (!selectedMeetingId) return;

        try {
            let payload = { docIds: [], transDocIds: [] };

            if (kind === 'originals') {
                payload.docIds = selectedIds;
            } else if (kind === 'translations') {
                if (BACKEND_SUPPORTS_TRANS_DOC_IDS) {
                    payload.transDocIds = selectedIds; // 반드시 tl_trans_docs.trans_doc_id
                } else {
                    const transIdToOriginalId = new Map((myDocsTranslations || []).map((t) => [t.id, t.original_doc_id]));
                    const originalIds = selectedIds.map((id) => transIdToOriginalId.get(id)).filter(Boolean);
                    payload.docIds = originalIds;
                }
            } else {
                payload.docIds = selectedIds;
            }

            const res = await api.post(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents`, payload);

            const duplicated = res.data?.duplicated || [];
            const notOwned = res.data?.notOwned || [];

            if (duplicated.length + notOwned.length > 0) {
                const msg = [duplicated.length ? `중복: ${duplicated.join(', ')}` : null, notOwned.length ? `소유아님: ${notOwned.join(', ')}` : null].filter(Boolean).join(' / ');
                Swal.fire({ icon: 'info', title: '일부 제외됨', text: msg, timer: 2200, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'success', title: '첨부 완료', timer: 1500, showConfirmButton: false });
            }

            // 첨부 후 회의 문서 새로고침
            const refreshed = await api.get(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents`);
            const items = Array.isArray(refreshed.data?.items) ? refreshed.data.items : [];
            setRoomDocuments(
                items.map((d) => {
                    const isTrans = !!d.trans_doc_id || d.doc_type === 'TRANSLATION';
                    const bytes = Number(isTrans ? d.trans_size_bytes ?? d.size : d.size) || 0;
                    return {
                        id: isTrans ? d.trans_doc_id : d.doc_id,
                        trans_doc_id: d.trans_doc_id ?? null,
                        doc_type: isTrans ? 'TRANSLATION' : 'ORIGINAL',
                        title: d.original_name,
                        original_name: d.original_name,
                        rel_path: d.rel_path || d.filepath,
                        size: bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : '',
                        lastModified: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                        source_lang: d.source_lang,
                        target_language: d.target_language,
                    };
                }),
            );
        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.error || '문서 첨부 중 오류가 발생했습니다.';
            Swal.fire({ icon: 'error', title: '실패', text: msg });
        }
    };

    const handleJoinMeeting = async (meetingId, meetingTitle, inviteCode, rawStatus) => {
        if (rawStatus === 'ENDED') {
            Swal.fire({
                icon: 'info',
                title: '종료된 회의입니다',
                text: '종료된 회의는 참여할 수 없고 첨부 문서만 확인 가능합니다.',
                timer: 1800,
                showConfirmButton: false,
            });
            return;
        }

        try {
            const currentMeeting = meetings.find((m) => m.id === meetingId);
            if (currentMeeting && currentMeeting.user_role === 'GUEST' && currentMeeting.status !== '진행중') {
                Swal.fire({
                    icon: 'warning',
                    title: '참여 불가',
                    text: '게스트는 진행중인 회의만 참여할 수 있습니다.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                return;
            }
            if (currentMeeting && currentMeeting.status === '예정') {
                const updateData = { title: meetingTitle, status: 'ONGOING', inviteCode, scheduledAt: new Date().toISOString() };
                if (currentMeeting.user_role === 'HOST') {
                    await api.patch(`/api/users/${user.userId}/meetings/${meetingId}`, updateData);
                }
            }
            const url = new URL('/business/meeting', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);
            window.open(url.toString(), '_blank', 'noopener,noreferrer');
        } catch {
            const url = new URL('/business/meeting', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);
            window.open(url.toString(), '_blank', 'noopener,noreferrer');
            Swal.fire({
                icon: 'warning',
                title: '상태 업데이트 실패',
                text: '회의 상태 업데이트에 실패했지만, 회의에는 참여할 수 있습니다.',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    // 회의 생성/수정 모달
    const handleOpenNewMeetingModal = () => {
        setEditingMeeting(null);
        setIsModalOpen(true);
    };
    const handleOpenEditMeetingModal = (meeting) => {
        if (meeting.user_role !== 'HOST') {
            Swal.fire({
                icon: 'warning',
                title: '권한 없음',
                text: '호스트만 회의를 수정할 수 있습니다.',
                timer: 2000,
                showConfirmButton: false,
            });
            return;
        }
        setEditingMeeting(meeting);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingMeeting(null), 300);
    };

    const handleConfirmMeeting = async (meetingData) => {
        const isEditing = editingMeeting !== null;

        try {
            const [year, month, day] = meetingData.date
                .replace(/년|월|일/g, '-')
                .split('-')
                .map((s) => s.trim());
            const [period, timeStr] = meetingData.time.split(' ');
            let [hour, minute] = timeStr.split(':').map((h) => parseInt(h, 10));
            if (period === '오후' && hour !== 12) hour += 12;
            else if (period === '오전' && hour === 12) hour = 0;

            const scheduledAt = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

            const requestData = {
                title: meetingData.title,
                scheduled_at: scheduledAt,
                invited_user_ids: meetingData.invited_ids || [],
            };

            let meetingId;
            if (isEditing) {
                await api.patch(`/api/users/${user.userId}/meetings/${meetingData.id}`, requestData);
                meetingId = meetingData.id;
            } else {
                const response = await api.post(`/api/users/${user.userId}/meetings`, requestData);
                meetingId = response.data.meetings_id || response.data.id;
            }

            const res = await api.get(`/api/users/${user.userId}/meetings/all`);
            if (Array.isArray(res.data?.items)) {
                const formatted = await Promise.all(
                    res.data.items.map(async (m) => {
                        let participantCount = 1;
                        try {
                            const countRes = await api.get(`/api/meetings/${m.meetings_id}/participants/count`);
                            participantCount = countRes.data.totalCount ?? countRes.data.count ?? 1;
                        } catch {
                            if (m.meetings_id === meetingId && meetingData.invited_ids) {
                                participantCount = meetingData.invited_ids.length + 1;
                            }
                        }

                        const guestParticipants = (m.participants || []).filter((p) => p.role === 'GUEST').map((p) => ({ userId: p.user_id, name: p.user_name, email: p.user_email }));

                        return {
                            id: m.meetings_id,
                            title: m.title,
                            status: mapStatusToKorean(m.status),
                            rawStatus: m.status,
                            date: new Date(m.scheduled_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
                            time: new Date(m.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                            invite_code: m.invite_code,
                            participants: participantCount,
                            invited_ids: guestParticipants,
                            user_role: m.user_role,
                            host_id: m.host_id,
                            allParticipants: m.participants || [],
                        };
                    }),
                );
                setMeetings(formatted);
            }

            handleCloseModal();
            return meetingId;
        } catch (error) {
            console.error('회의 처리 오류:', error);
            let errorMessage = isEditing ? '회의 수정 중 오류가 발생했습니다.' : '회의 생성 중 오류가 발생했습니다.';
            if (error?.response) errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            else if (error?.request) errorMessage = '서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.';
            Swal.fire({ icon: 'error', title: isEditing ? '수정 실패' : '생성 실패', text: errorMessage });
            throw error;
        }
    };

    const handleDetachDocsFromMeeting = async (selectedIds) => {
        if (!selectedMeetingId || !user?.userId || selectedIds.length === 0) return;

        try {
            await Promise.all(selectedIds.map((docId) => api.delete(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents/${docId}`)));

            const refreshed = await api.get(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents`);
            const items = Array.isArray(refreshed.data.items) ? refreshed.data.items : [];
            setRoomDocuments(
                items.map((d) => {
                    const isTrans = !!d.trans_doc_id || d.doc_type === 'TRANSLATION';
                    const bytes = Number(isTrans ? d.trans_size_bytes ?? d.size : d.size) || 0;
                    return {
                        id: isTrans ? d.trans_doc_id : d.doc_id,
                        trans_doc_id: d.trans_doc_id ?? null,
                        doc_type: isTrans ? 'TRANSLATION' : 'ORIGINAL',
                        title: d.original_name,
                        original_name: d.original_name,
                        rel_path: d.rel_path || d.filepath,
                        size: bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : '',
                        lastModified: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                        source_lang: d.source_lang,
                        target_language: d.target_language,
                    };
                }),
            );

            Swal.fire({
                icon: 'success',
                title: '해제 완료',
                text: `${selectedIds.length}개 문서를 회의에서 해제했습니다.`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', title: '해제 실패', text: '문서 해제 중 오류가 발생했습니다.' });
        }
    };

    // ========= 유틸: 파일명/확장자 처리 =========
    const extractFilenameFromCD = (cd) => {
        if (!cd) return null;
        const utf8 = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        if (utf8) return decodeURIComponent(utf8[1]);
        const quoted = cd.match(/filename\s*=\s*"([^"]+)"/i);
        if (quoted) return quoted[1];
        const plain = cd.match(/filename\s*=\s*([^;]+)/i);
        return plain ? plain[1] : null;
    };

    const getExtFromContentType = (ct) => {
        if (!ct) return null;
        const type = ct.split(';')[0].trim().toLowerCase();
        const map = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-excel': 'xls',
            'text/plain': 'txt',
            'text/markdown': 'md',
            'text/csv': 'csv',
            'image/jpeg': 'jpg',
            'image/png': 'png',
        };
        return map[type] || null;
    };

    const getExtFromNameOrPath = (str) => {
        if (!str) return null;
        const clean = String(str).split('?')[0].split('#')[0];
        const base = clean.split('/').pop();
        const dot = base.lastIndexOf('.');
        if (dot > 0 && dot < base.length - 1) {
            return base.slice(dot + 1).toLowerCase();
        }
        return null;
    };

    const ensureFilenameWithExt = (name, ext) => {
        let base = (name || 'download').trim();
        base = base.replace(/[\\"']/g, '').replace(/\s+$/, '');
        const existingExt = getExtFromNameOrPath(base);
        if (existingExt) return base;
        if (ext) return `${base}.${ext}`;
        return base;
    };

    // ========= 단일 다운로드: 원문/번역 분기 + 확장자 보장 =========
    const downloadOneMeetingDoc = async (userId, meetingId, doc) => {
        const isTranslation = doc.doc_type === 'TRANSLATION' || !!doc.trans_doc_id;
        const endpoint = isTranslation
            ? `/api/users/${userId}/meetings/${meetingId}/documents/translations/${doc.id}/download`
            : `/api/users/${userId}/meetings/${meetingId}/documents/${doc.id}/download`;

        const res = await api.get(endpoint, { responseType: 'blob', withCredentials: true });

        // 1) 파일명
        const cd = res.headers?.['content-disposition'];
        let filename = extractFilenameFromCD(cd);
        if (!filename) {
            filename = doc.original_name || doc.title || String(doc.id);
        }

        // 2) 확장자 추정
        let ext = getExtFromNameOrPath(filename) || getExtFromNameOrPath(doc.rel_path) || getExtFromContentType(res.headers?.['content-type']);
        if (!ext && typeof filename === 'string') {
            const lowered = filename.toLowerCase();
            if (/(pdf|pptx|ppt|docx|doc|xlsx|xls|txt|md|csv|jpg|jpeg|png)$/.test(lowered)) {
                ext = lowered.split('.').pop();
            }
        }
        const finalName = ensureFilenameWithExt(filename, ext);

        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
    };

    // 선택 다운로드 (회의 문서 탭)
    const handleDownloadSelectedDocs = async (selectedDocs) => {
        if (!selectedDocs || selectedDocs.length === 0) {
            Swal.fire({ icon: 'info', title: '선택 없음', text: '다운로드할 문서를 선택해주세요.' });
            return;
        }
        if (!user?.userId || !selectedMeetingId) return;

        try {
            for (const doc of selectedDocs) {
                await downloadOneMeetingDoc(user.userId, selectedMeetingId, doc);
            }
            Swal.fire({
                icon: 'success',
                title: '다운로드 시작',
                text: `${selectedDocs.length}개 파일을 내려받습니다.`,
                timer: 1300,
                showConfirmButton: false,
            });
        } catch (e) {
            console.error('다운로드 실패', e);
            const msg = e?.response?.data?.error || '파일 다운로드 중 오류가 발생했습니다.';
            Swal.fire({ icon: 'error', title: '실패', text: msg });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <div className="max-w-8xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">영상회의</h1>
                    <p className="text-gray-500 mt-1 text-base sm:text-lg">예정된 회의를 확인하고 새로운 회의를 시작하세요.</p>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <FilterTabs filters={FILTERS} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                    <button
                        onClick={handleOpenNewMeetingModal}
                        className="flex flex-grow items-center justify-center gap-2 whitespace-nowrap 
              bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white font-semibold text-base px-6 py-3 rounded-xl 
              shadow-lg shadow-blue-500/40 
              transition-all transform duration-300 ease-in-out
              hover:shadow-xl hover:shadow-blue-400/50 hover:-translate-y-1
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="h-5 w-5" />
                        <span>새 회의 만들기</span>
                    </button>
                </div>

                {inProgressMeetings.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4">진행중인 회의</h2>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {inProgressMeetings.map((meeting) => (
                                    <InProgressMeetingCard key={meeting.id} meeting={meeting} onJoinMeeting={handleJoinMeeting} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                <section>
                    {activeFilter === '전체' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 mb-6">회의 목록</h2>}
                    {activeFilter !== '전체' && activeFilter !== '진행중' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 mb-6">'{activeFilter}' 회의</h2>}

                    <AnimatePresence>
                        {paginatedUpcomingMeetings.length > 0 ? (
                            <motion.main
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            >
                                {paginatedUpcomingMeetings.map((meeting) => (
                                    <motion.div
                                        key={meeting.id}
                                        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.3 }}
                                        layout
                                    >
                                        <MeetingCard
                                            {...meeting}
                                            user_role={meeting.user_role}
                                            onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title, meeting.invite_code, meeting.rawStatus)}
                                            onEdit={() => handleOpenEditMeetingModal(meeting)}
                                            onDelete={() => {
                                                if (meeting.user_role !== 'HOST') {
                                                    Swal.fire({ icon: 'warning', title: '권한 없음', text: '호스트만 회의를 삭제할 수 있습니다.', timer: 2000, showConfirmButton: false });
                                                    return;
                                                }
                                                Swal.fire({
                                                    title: '정말 삭제하시겠습니까?',
                                                    text: `'${meeting.title}' 회의를 삭제하면 되돌릴 수 없습니다.`,
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#e53e3e',
                                                    cancelButtonColor: '#3b82f6',
                                                    confirmButtonText: '삭제',
                                                    cancelButtonText: '취소',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
                                                        Swal.fire('삭제 완료!', '회의가 성공적으로 삭제되었습니다.', 'success');
                                                    }
                                                });
                                            }}
                                            onOpenDocuments={() => handleOpenDocuments(meeting)}
                                            onSummarize={() => handleSummarize(meeting)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.main>
                        ) : (
                            activeFilter !== '진행중' && (
                                <motion.div
                                    key="empty-state"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center 
                    py-24 px-6 bg-white rounded-xl border-2 border-dashed border-gray-300 text-center"
                                >
                                    <VideoOff className="w-16 h-16 text-gray-400" />
                                    <h3 className="mt-6 text-xl font-semibold text-gray-800">회의가 없습니다</h3>
                                    <p className="mt-2 text-gray-500 max-w-sm">
                                        {activeFilter === '전체' ? '"새 회의 만들기" 버튼을 눌러 첫 회의를 예약해보세요.' : `현재 "${activeFilter}" 상태인 회의가 없습니다. 다른 필터를 확인해보세요.`}
                                    </p>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </section>

                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
            </div>

            {/* 모달들 */}
            <NewMeetingModal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmMeeting} meetingToEdit={editingMeeting} />

            <DocumentListModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                myDocumentsByType={{
                    originals: myDocsOriginals,
                    translations: myDocsTranslations,
                }}
                roomDocuments={roomDocuments}
                onAddToMeeting={handleAddDocsToMeeting}
                onDownloadSelected={handleDownloadSelectedDocs}
                onDetachSelected={handleDetachDocsFromMeeting}
                meetingStatus={selectedMeetingStatus}
                initialMode="myDocs"
            />

            {/* 회의록 요약 HUD */}
            <MeetingSummaryHUD summaries={summaries} onClose={handleCloseSummary} />
        </div>
    );
};

export default DashVideo;
