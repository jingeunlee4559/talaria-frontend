import { useState } from 'react';

export default function ClipCard({ clip, language, index }) {
    const [likes, setLikes] = useState(Math.floor(Math.random() * 5000) + 1000);
    const [comments] = useState(Math.floor(Math.random() * 1000) + 100);
    const [views] = useState(Math.floor(Math.random() * 10000) + 2000);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // 태그 (실제로는 API에서)
    const tagSets = [
        ['#모음집', '#베스트', '#추천'],
        ['#페스티벌', '#현장', '#음악'],
        ['#제작', '#튜토리얼', '#팁'],
    ];
    const tags = tagSets[index % tagSets.length];

    const handleLike = (e) => {
        e.stopPropagation(); // 🔥 부모 클릭 이벤트 방지
        if (isLiked) {
            setLikes(likes - 1);
        } else {
            setLikes(likes + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleBookmark = (e) => {
        e.stopPropagation(); // 🔥 부모 클릭 이벤트 방지
        setIsBookmarked(!isBookmarked);
    };

    const raw = clip?.cultureThumbRelPath ?? '';
    const thumbnailImage = raw.trim() === '' ? '/img/hermes_logo.jpg' : raw.trim();

    // 재생시간 (임시)
    const duration = `${Math.floor(Math.random() * 10) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

    return (
        <div className="group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
            {/* Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 shadow-md hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <img
                    src={thumbnailImage}
                    onError={(e) => {
                        e.target.src = '/img/hermes_logo.jpg';
                    }}
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-all duration-300"></div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm">
                        <svg className="w-8 h-8 text-pink-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 left-4">
                    <div className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold">{duration}</div>
                </div>

                {/* Language Badge */}
                <div className="absolute bottom-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm text-pink-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">{language}</div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">{clip.title}</h3>

                {/* Channel Name */}
                <p className="text-gray-600 text-sm">{clip.host_name}</p>

                {/* Views */}
                <p className="text-gray-500 text-xs">조회수 {views.toLocaleString()}회</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="text-pink-600 text-sm font-medium hover:text-pink-700 cursor-pointer transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Stats and Bookmark */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                        {/* Likes */}
                        <button onClick={handleLike} className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                            <svg className={`w-5 h-5 ${isLiked ? 'fill-pink-600 text-pink-600' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            {likes.toLocaleString()}
                        </button>

                        {/* Comments */}
                        <div className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            {comments.toLocaleString()}
                        </div>
                    </div>

                    {/* Bookmark */}
                    <button onClick={handleBookmark} className="hover:scale-110 transition-transform">
                        <svg className={`w-5 h-5 ${isBookmarked ? 'fill-pink-600 text-pink-600' : 'fill-none text-gray-400'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
