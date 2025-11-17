import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../../axios';
import Swal from 'sweetalert2';

const LiveStartPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        meeting_mode: 'C',
        default_lang: user?.locale || 'ko',
        culture_desc: '',
        culture_thumb_rel_path: '',
    });

    useEffect(() => {
        if (user?.locale) {
            setFormData((prev) => ({
                ...prev,
                default_lang: user.locale,
            }));
        }
    }, [user]);

    const [selectedTags, setSelectedTags] = useState([]);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tags = ['K-팝', '해외팬', '리액션', '드림설명', '라이브쳇', '일본', '영국', '미국', '교육', '엔터'];

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
    // 태그 선택
    // ==========================
    const handleTagClick = (tag) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) {
                return prev.filter((t) => t !== tag);
            }
            return [...prev, tag];
        });
    };

    // ==========================
    // 파일 선택 (업로드 X, 상태만 저장)
    // ==========================
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setThumbnailFile(file);

        // 실제 저장 경로는 업로드 후 백엔드에서 받은 relPath 사용
        setFormData((prev) => ({
            ...prev,
            culture_thumb_rel_path: '',
        }));
    };

    // ==========================
    // 썸네일 업로드 API 호출
    // POST /api/assets/culture
    // 응답: { "relPath": "...", "url": "..." }
    // ==========================
    const uploadThumbnail = async () => {
        if (!thumbnailFile) return null;

        const fd = new FormData();
        // 백엔드에서 기대하는 필드 이름에 맞춰야 함 (예: "file")
        fd.append('file', thumbnailFile);

        const res = await api.post('/api/assets/api/assets/culture-thumb', fd, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('📁 썸네일 업로드 응답:', res.data);
        // { relPath: "/img/1763358662530_picachu.png", url: "//img/..." }
        return res.data?.relPath || null;
    };

    // ==========================
    // 라이브 생성
    // 1) 썸네일 있으면 업로드 → relPath 확보
    // 2) 미팅 생성 API 호출
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

            // 2️⃣ 미팅 생성에 사용할 최종 데이터
            const submitData = {
                title: formData.title,
                meetingMode: formData.meeting_mode,
                defaultLang: formData.default_lang,
                cultureDesc: formData.culture_desc || selectedTags.join(', '),
                cultureThumbRelPath, // 업로드한 relPath
                status: 'ONGOING',
            };

            console.log('🚀 전송할 데이터:', submitData);

            const response = await api.post(`/api/users/${user.userId}/meetings`, submitData);

            console.log('✅ 라이브 생성 성공:', response.data);

            await Swal.fire({
                icon: 'success',
                title: '라이브 시작! 🎉',
                text: '라이브 방송이 성공적으로 시작되었습니다!',
                confirmButtonText: '방송 보러가기',
                confirmButtonColor: '#a855f7',
                timer: 2000,
                timerProgressBar: true,
            });

            // 라우팅: 실제 라우트에 맞춰 소문자로 이동
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
        setSelectedTags([]);
        setThumbnailFile(null);
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
                            placeholder="예) 실시간 K-팝 리액션 🔥 해외 친구들과 함께하는 밈 파티"
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

                    {/* 태그 선택 */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                            <span className="text-2xl">🏷️</span>
                            태그 선택
                        </label>
                        <p className="text-sm text-gray-500 mb-4">관심사를 태그로 표현하세요!</p>
                        <div className="flex flex-wrap gap-2.5">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                                        selectedTags.includes(tag)
                                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white shadow-lg shadow-purple-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
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
