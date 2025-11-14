import { useState } from 'react';

export default function VideoCard({ meeting, viewerCount, languageBadge, index }) {
    const [likes, setLikes] = useState(Math.floor(Math.random() * 5000) + 500);
    const [comments] = useState(Math.floor(Math.random() * 1000) + 50);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const channels = ['밀마스터', '글로벌팀', '밀여행자', '밀컬렉터'];
    const channelName = channels[index % channels.length];

    const tagSets = [
        ['#K-팝', '#리액션', '#라이브'],
        ['#해외팀', '#실명', '#영국'],
        ['#일본', '#문화', '#여행'],
        ['#모음집', '#베스트', '#추간'],
    ];
    const tags = tagSets[index % tagSets.length];

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
        } else {
            setLikes(likes + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    return (
        <div className="group cursor-pointer">
            {/* Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 shadow-md hover:shadow-xl transition-shadow">
                {/* Image */}
                <img src={meeting.cultureThumbRelPath || 'https://via.placeholder.com/400x225'} alt={meeting.title} className="w-full h-full object-cover" />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                {/* LIVE Badge */}
                <div className="absolute top-3 left-3">
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                </div>

                {/* Viewer Count */}
                <div className="absolute top-3 right-3">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {viewerCount.toLocaleString()}
                    </div>
                </div>

                {/* Language Badge */}
                <div className="absolute bottom-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm text-orange-600 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">{languageBadge}</div>
                </div>

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7 text-pink-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2.5">
                {/* Title */}
                <h3 className="font-bold text-base text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors leading-snug">{meeting.title}</h3>

                {/* Channel Name */}
                <p className="text-gray-600 text-sm">{channelName}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="text-pink-600 text-xs font-medium hover:text-pink-700 cursor-pointer">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Stats and Bookmark */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                        {/* Likes */}
                        <button onClick={handleLike} className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                            <svg className={`w-4 h-4 ${isLiked ? 'fill-pink-600 text-pink-600' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span className="text-xs">{likes.toLocaleString()}</span>
                        </button>

                        {/* Comments */}
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <span className="text-xs">{comments}</span>
                        </div>
                    </div>

                    {/* Bookmark */}
                    <button onClick={handleBookmark} className="hover:scale-110 transition-transform">
                        <svg className={`w-4 h-4 ${isBookmarked ? 'fill-pink-600 text-pink-600' : 'fill-none text-gray-400'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
