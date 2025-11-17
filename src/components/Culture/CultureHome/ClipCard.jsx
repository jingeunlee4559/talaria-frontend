import { useState } from 'react';

export default function ClipCard({ clip, language, index }) {
    const [likes, setLikes] = useState(Math.floor(Math.random() * 5000) + 1000);
    const [comments] = useState(Math.floor(Math.random() * 1000) + 100);
    const [views] = useState(Math.floor(Math.random() * 10000) + 2000);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const tagSets = [
        ['#K-밈', '#해외밈', '#음악'],
        ['#게임', '#먹방', '#여행'],
        ['#브이로그', '#토크', '#공부'],
    ];
    const tags = tagSets[index % tagSets.length];

    const handleLike = (e) => {
        e.stopPropagation();
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
        setIsLiked((prev) => !prev);
    };

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked((prev) => !prev);
    };

    const raw = clip?.cultureThumbRelPath ?? '';
    const thumbnailImage = raw.trim() === '' ? '/img/content1.webp' : raw.trim();

    // 재생시간
    const duration = `${Math.floor(Math.random() * 10) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-violet-300 group cursor-pointer">
            {/* 썸네일 영역 */}
            <div className="relative aspect-video overflow-hidden">
                {/* 썸네일 이미지 */}
                <img
                    src={thumbnailImage}
                    onError={(e) => (e.target.src = '/img/content1.webp')}
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300" />

                {/* 재생 버튼 오버레이 - ClipCard 전용 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl">
                        <svg className="w-8 h-8 text-violet-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* 재생시간 배지 - ClipCard 전용 */}
                <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold">{duration}</div>
                </div>

                {/* 언어 배지 */}
                <div className="absolute bottom-3 right-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm text-violet-600 px-3 py-1 rounded-lg text-xs font-bold shadow-md">{language}</div>
                </div>
            </div>

            {/* 카드 정보 영역 */}
            <div className="p-4">
                {/* 제목 */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors min-h-[56px]">{clip.title}</h3>

                {/* 호스트 이름 */}
                <p className="text-gray-600 text-sm mb-2">{clip.host_name}</p>

                {/* 조회수 - ClipCard 전용 */}
                <p className="text-gray-500 text-xs mb-3">조회수 {views.toLocaleString()}회</p>

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
}
