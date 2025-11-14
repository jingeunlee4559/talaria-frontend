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

    const thumbnailImage = meeting?.cultureThumbRelPath?.trim() || '/img/hermes_logo.jpg';

    // const handleCardClick = () => {
    //     if (!meeting?.meetings_id) return;
    //     navigate(`/culture/live?id=${meeting.meetings_id}`);
    // };

    const viewers = meeting.participants || Math.floor(Math.random() * 50) + 10;

    return (
        <div className="group cursor-pointer hover:scale-[1.02] transition-transform duration-300" onClick={onJoin}>
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-xs font-bold">LIVE</span>
                    </div>
                </div>

                <img
                    src={thumbnailImage}
                    onError={(e) => (e.target.src = '/img/hermes_logo.jpg')}
                    alt={meeting.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-all duration-300" />

                <div className="absolute bottom-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm text-pink-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">{language}</div>
                </div>

                <div className="absolute bottom-4 left-4">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        {viewers}명 시청중
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">{meeting.title}</h3>
                <p className="text-gray-600 text-sm">{meeting.host_name}</p>

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="text-pink-600 text-sm font-medium hover:text-pink-700 cursor-pointer transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
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

                    <button onClick={handleBookmark} className="hover:scale-110 transition-transform">
                        <svg className={`w-5 h-5 ${isBookmarked ? 'fill-pink-600 text-pink-600' : 'fill-none text-gray-400'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveCard;
