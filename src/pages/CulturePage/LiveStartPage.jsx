// src/pages/LiveStartPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../../axios';
import Swal from 'sweetalert2';

const LiveStartPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // ==========================
    // 기본 폼 상태
    // ==========================
    const [formData, setFormData] = useState({
        title: '',
        meeting_mode: 'C',
        default_lang: user?.locale || 'ko',
        culture_desc: '',
        culture_thumb_rel_path: '',
    });

    // 공개 / 비공개 + 비밀번호
    const [isPrivate, setIsPrivate] = useState(false);
    const [privatePassword, setPrivatePassword] = useState('');

    useEffect(() => {
        if (user?.locale) {
            setFormData((prev) => ({
                ...prev,
                default_lang: user.locale,
            }));
        }
    }, [user]);

    // ==========================
    // 태그 관련 상태
    // ==========================
    const [tagOptions, setTagOptions] = useState([]); // [{ id, name, color, order, isActive }, ...]
    const [selectedTagIds, setSelectedTagIds] = useState([]); // [1,2,3]

    // ==========================
    // 썸네일/전송 상태
    // ==========================
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==========================
    // 태그 목록 로딩
    // ==========================
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await api.get('/api/tags');
                const raw = res.data || [];
                const normalized = raw
                    .map((t) => ({
                        id: t.tag_id,
                        name: t.tag_name,
                        color: t.color_code,
                        order: t.display_order,
                        isActive: t.is_active,
                    }))
                    .filter((t) => t.isActive)
                    .sort((a, b) => a.order - b.order);
                setTagOptions(normalized);
            } catch (e) {
                console.error('❌ 태그 목록 조회 실패:', e);
                // 실패해도 라이브 생성은 가능하게 둠
            }
        };
        fetchTags();
    }, []);

    // ==========================
    // 공통 인풋 핸들러
    // ==========================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ==========================
    // 태그 선택 토글
    // ==========================
    const handleTagClick = (tagId) => {
        setSelectedTagIds((prev) => {
            if (prev.includes(tagId)) {
                return prev.filter((id) => id !== tagId);
            }
            return [...prev, tagId];
        });
    };

    // ==========================
    // 파일 선택 (업로드 X, 상태만 저장)
    // ==========================
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnailFile(file);
        setFormData((prev) => ({
            ...prev,
            culture_thumb_rel_path: '',
        }));
    };

    // ==========================
    // 썸네일 업로드 API 호출
    // 응답: { "relPath": "...", "url": "..." }
    // ==========================
    const uploadThumbnail = async () => {
        if (!thumbnailFile) return null;
        const fd = new FormData();
        fd.append('file', thumbnailFile);

        const res = await api.post('/api/assets/api/assets/culture-thumb', fd, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('📁 썸네일 업로드 응답:', res.data);
        return res.data?.relPath || null;
    };

    // ==========================
    // 태그 저장 API 호출
    // PUT /api/users/{userId}/meetings/{meetingId}/tags
    // body: { tagIds: [1,2,3] }
    // ==========================
    const saveMeetingTags = async (meetingId) => {
        if (!user?.userId) return;
        if (!meetingId) return;
        if (!selectedTagIds.length) return;

        try {
            const body = { tagIds: selectedTagIds };
            console.log('🏷️ 태그 저장 요청:', {
                userId: user.userId,
                meetingId,
                body,
            });
            await api.put(`/api/users/${user.userId}/meetings/${meetingId}/tags`, body);
            console.log('✅ 태그 저장 성공');
        } catch (e) {
            console.error('❌ 태그 저장 실패:', e);
            Swal.fire({
                icon: 'warning',
                title: '태그 저장 실패',
                text: '라이브는 생성되었지만 태그 저장에 실패했습니다.',
                confirmButtonText: '확인',
                confirmButtonColor: '#a855f7',
            });
        }
    };

    // ==========================
    // 라이브 생성
    // 1) 썸네일 있으면 업로드 → relPath 확보
    // 2) 미팅 생성 API 호출
    // 3) 태그 저장 API 호출 (PUT)
    // ==========================
    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: '방송 제목을 입력해주세요',
                text: '제목은 필수 입력 항목입니다.',
                confirmButtonText: '확인',
                confirmButtonColor: '#a855f7',
            });
            return;
        }

        if (!user?.userId) {
            Swal.fire({
                icon: 'error',
                title: '로그인이 필요합니다',
                text: '먼저 로그인해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#a855f7',
            });
            return;
        }

        // 비공개방인 경우 비밀번호 필수
        if (isPrivate && !privatePassword.trim()) {
            Swal.fire({
                icon: 'warning',
                title: '비밀번호를 입력해주세요',
                text: '비공개 라이브는 입장 비밀번호가 필요합니다.',
                confirmButtonText: '확인',
                confirmButtonColor: '#a855f7',
            });
            return;
        }

        if (isPrivate && privatePassword.trim().length < 4) {
            Swal.fire({
                icon: 'warning',
                title: '비밀번호가 너무 짧아요',
                text: '비밀번호는 최소 4자리 이상으로 설정해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#a855f7',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1️⃣ 썸네일 업로드 (있는 경우)
            let cultureThumbRelPath = formData.culture_thumb_rel_path;
            if (thumbnailFile) {
                try {
                    const relPath = await uploadThumbnail();
                    cultureThumbRelPath = relPath || '';
                } catch (e) {
                    console.error('❌ 썸네일 업로드 실패:', e);
                    await Swal.fire({
                        icon: 'error',
                        title: '썸네일 업로드 실패',
                        text: '이미지 업로드에 실패했습니다. 다시 시도해주세요.',
                        confirmButtonText: '확인',
                        confirmButtonColor: '#a855f7',
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            // 2️⃣ culture_desc이 비어 있으면, 선택된 태그 이름으로 대체
            const selectedTagNames = tagOptions.filter((t) => selectedTagIds.includes(t.id)).map((t) => t.name);

            const cultureDescFinal = formData.culture_desc && formData.culture_desc.trim().length > 0 ? formData.culture_desc : selectedTagNames.join(', ');

            // 3️⃣ 미팅 생성에 사용할 최종 데이터 (Swagger 예시 구조 반영)
            const submitData = {
                title: formData.title,
                meetingMode: formData.meeting_mode, // C
                defaultLang: formData.default_lang,
                cultureDesc: cultureDescFinal,
                cultureThumbRelPath,
                status: 'ONGOING',
                // 공개/비공개 + 비밀번호
                isPrivate: isPrivate,
                privatePassword: isPrivate ? privatePassword.trim() : null,
                // 필요 시 scheduledAt 추가 가능
                // scheduledAt: new Date().toISOString(),
            };

            console.log('🚀 전송할 데이터:', submitData);

            const response = await api.post(`/api/users/${user.userId}/meetings`, submitData);
            console.log('✅ 라이브 생성 성공:', response.data);

            // 4️⃣ 응답에서 meetingId 추출 (필드명 변형 대응)
            const createdMeeting = response.data || {};
            const meetingId = createdMeeting.meetings_id ?? createdMeeting.meetingId ?? createdMeeting.id ?? null;

            if (!meetingId) {
                console.warn('⚠️ meetingId를 응답에서 찾을 수 없습니다. 태그 저장은 스킵됩니다.');
            } else {
                // 5️⃣ 태그 저장 API 호출
                await saveMeetingTags(meetingId);
            }

            await Swal.fire({
                icon: 'success',
                title: '라이브 시작! 🎉',
                text: isPrivate ? '비공개 라이브가 성공적으로 시작되었습니다!' : '라이브 방송이 성공적으로 시작되었습니다!',
                confirmButtonText: '방송 보러가기',
                confirmButtonColor: '#a855f7',
                timer: 2000,
                timerProgressBar: true,
            });

            navigate('/culture/videos');
        } catch (error) {
            console.error('❌ 라이브 시작 에러:', error);
            Swal.fire({
                icon: 'error',
                title: '라이브 시작 실패',
                text: '라이브 시작에 실패했습니다. 다시 시도해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#a855f7',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==========================
    // 초기화
    // ==========================
    const handleReset = () => {
        setFormData({
            title: '',
            meeting_mode: 'C',
            default_lang: user?.locale || 'ko',
            culture_desc: '',
            culture_thumb_rel_path: '',
        });
        setSelectedTagIds([]);
        setThumbnailFile(null);
        setIsPrivate(false);
        setPrivatePassword('');
    };

    // ==========================
    // JSX
    // ==========================
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 섹션 */}
                <div className="text-center mb-10">
                    <div className="inline-block mb-4">
                        <div className="relative">
                            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 mb-3">Go Live! 🎥</h1>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-full"></div>
                        </div>
                    </div>
                    <p className="text-lg text-gray-600 font-medium">전 세계와 실시간으로 소통하세요 ✨</p>
                </div>

                {/* 메인 카드 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white p-6 md:p-10 mb-6">
                    {/* 방송 제목 */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                            <span className="text-2xl">📺</span>
                            방송 제목
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="예) 실시간 K-밈 리액션 🔥 해외 친구들과 함께하는 밈 파티"
                            className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all"
                        />
                    </div>

                    {/* 방송 설명 */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                            <span className="text-2xl">💬</span>
                            방송 설명
                        </label>
                        <textarea
                            name="culture_desc"
                            value={formData.culture_desc}
                            onChange={handleInputChange}
                            placeholder="해외 친구들과 함께 한국 밈을 리액션하고 설명하는 시간! 실시간 번역으로 언어 장벽 없이 즐겨보세요 🎉"
                            rows={4}
                            className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* 태그 선택 (DB 태그 기반) */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                            <span className="text-2xl">🏷️</span>
                            태그 선택
                        </label>
                        <p className="text-sm text-gray-500 mb-4">관심사를 태그로 표현하세요!</p>
                        <div className="flex flex-wrap gap-2.5">
                            {tagOptions.length === 0 && <p className="text-sm text-gray-400">사용 가능한 태그가 없습니다. (관리자에서 tl_tags를 설정해주세요)</p>}
                            {tagOptions.map((tag) => {
                                const isSelected = selectedTagIds.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagClick(tag.id)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                                            isSelected ? 'text-white shadow-lg shadow-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        style={isSelected ? { background: tag.color } : { borderColor: tag.color, borderWidth: 1 }}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 언어 설정 */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                            <span className="text-2xl">🌍</span>
                            언어 설정
                            <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 mb-4">실시간 자동 번역으로 전 세계와 소통!</p>
                        <select
                            name="default_lang"
                            value={formData.default_lang}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none bg-white cursor-pointer transition-all"
                        >
                            <option value="ko">🇰🇷 한국어 (Korean)</option>
                            <option value="en">🇺🇸 영어 (English)</option>
                            <option value="ja">🇯🇵 일본어 (Japanese)</option>
                            <option value="zh">🇨🇳 중국어 (Chinese)</option>
                            <option value="es">🇪🇸 스페인어 (Spanish)</option>
                        </select>
                    </div>

                    {/* 공개 / 비공개 설정 + 비밀번호 */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                            <span className="text-2xl">🔒</span>
                            공개 범위
                        </label>
                        <p className="text-sm text-gray-500 mb-4">비공개 라이브로 설정하면 비밀번호를 아는 사람만 입장할 수 있어요.</p>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setIsPrivate(false)}
                                className={`px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${
                                    !isPrivate ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                🌈 공개 라이브
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPrivate(true)}
                                className={`px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${
                                    isPrivate ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-sm' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                🔒 비공개 (비밀번호 입장)
                            </button>
                        </div>

                        {isPrivate && (
                            <div className="mt-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    입장 비밀번호 설정
                                    <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={privatePassword}
                                    onChange={(e) => setPrivatePassword(e.target.value)}
                                    placeholder="예) 4자리 이상 영문/숫자 조합"
                                    className="w-full px-4 py-3 text-base border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-2">시청자가 입장할 때 입력해야 하는 비밀번호입니다. 호스트인 본인은 비밀번호 없이 입장 가능합니다.</p>
                            </div>
                        )}
                    </div>

                    {/* 썸네일 업로드 */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                            <span className="text-2xl">🖼️</span>
                            썸네일 업로드
                        </label>
                        <div className="relative group">
                            <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" id="thumbnail-upload" />
                            <label
                                htmlFor="thumbnail-upload"
                                className="block border-3 border-dashed border-purple-300 rounded-2xl p-10 text-center bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 cursor-pointer transition-all group-hover:border-purple-400"
                            >
                                <div className="flex flex-col items-center">
                                    {thumbnailFile ? (
                                        <>
                                            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                                                <span className="text-4xl">✓</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800 mb-1">{thumbnailFile.name}</p>
                                            <p className="text-sm text-gray-500">클릭해서 다른 이미지 선택</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.5}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800 mb-1">이미지를 드래그하거나 클릭하세요</p>
                                            <p className="text-sm text-gray-500">PNG, JPG (최대 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 relative group overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-purple-300 hover:shadow-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    라이브 시작 중...
                                </>
                            ) : (
                                <>🚀 라이브 시작하기</>
                            )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-8 py-5 border-3 border-gray-300 text-gray-700 rounded-2xl font-bold text-xl hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        🔄 초기화
                    </button>
                </div>

                {/* 하단 팁 */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200">
                    <p className="text-center text-gray-700 font-medium">
                        <span className="font-bold text-purple-600">💡 Tip:</span> 매력적인 썸네일과 명확한 제목으로 더 많은 시청자를 만나보세요!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveStartPage;
