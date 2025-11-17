// src/components/Culture/CultureHome/LiveCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveCard = ({ meeting, language, index, onJoin }) => {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(Math.floor(Math.random() * 2000) + 500);
    const [comments] = useState(Math.floor(Math.random() * 500) + 50);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const tags = index === 0 ? ['#K-팝', '#리액션', '#라이브'] : index === 1 ? ['#해외팀', '#실시간', '#영국'] : ['#일본', '#문화', '#여행'];

    const handleLike = (e) => {
        e.stopPropagation();
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
        setIsLiked((prev) => !prev);
    };

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked((prev) => !prev);
    };

    const thumbnailImage = meeting?.cultureThumbRelPath?.trim() || '/img/content1.webp';

    const viewers = meeting.participants || Math.floor(Math.random() * 2) + 1;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-violet-300 group cursor-pointer"
            onClick={onJoin}
        >
            {/* 썸네일 영역 */}
            <div className="relative aspect-video overflow-hidden">
                {/* LIVE 배지 */}
                <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold">LIVE</span>
                    </div>
                </div>

                {/* 썸네일 이미지 */}
                <img
                    src={thumbnailImage}
                    onError={(e) => (e.target.src = '/img/content1.webp')}
                    alt={meeting.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300" />

                {/* 언어 배지 */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm text-violet-600 px-3 py-1 rounded-lg text-xs font-bold shadow-md">{language}</div>
                </div>

                {/* 시청자 수 */}
                <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        {viewers}명
                    </div>
                </div>
            </div>

            {/* 카드 정보 영역 */}
            <div className="p-4">
                {/* 제목 */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors min-h-[56px]">{meeting.title}</h3>

                {/* 호스트 이름 */}
                <p className="text-gray-600 text-sm mb-3">{meeting.host_name}</p>

                {/* 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-violet-50 text-violet-600 text-xs font-semibold rounded-lg hover:bg-violet-100 transition-colors cursor-pointer">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* 하단 액션 버튼 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                        {/* 좋아요 */}
                        <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-pink-600 transition-colors ${isLiked ? 'text-pink-600' : ''}`}>
                            <svg className={`w-5 h-5 ${isLiked ? 'fill-pink-600' : 'fill-none'}`} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span className="font-medium">{likes.toLocaleString()}</span>
                        </button>

                        {/* 댓글 */}
                        <div className="flex items-center gap-1.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <span className="font-medium">{comments.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* 북마크 */}
                    <button onClick={handleBookmark} className="hover:scale-110 transition-transform">
                        <svg
                            className={`w-5 h-5 ${isBookmarked ? 'fill-violet-600 text-violet-600' : 'fill-none text-gray-400 hover:text-violet-600'}`}
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveCard;
