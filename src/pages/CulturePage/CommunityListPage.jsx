import React, { useState } from 'react';
import { Search, Eye, Heart, MessageCircle } from 'lucide-react';

const CommunityListPage = ({ posts, onPostClick, likedPosts, setLikedPosts, onUpdatePosts }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('전체');

    const categories = ['전체', '밈 공유', '문화 공유', '공지'];

    // 필터링된 게시물
    const filteredPosts = posts.filter((post) => {
        const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.preview.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">커뮤니티</h1>
                            <p className="text-gray-600">밈과 문화에 대해 자유롭게 이야기해보세요</p>
                        </div>
                        <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                            글쓰기
                        </button>
                    </div>

                    {/* 검색바 */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="제목, 내용, 태그로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* 카테고리 탭 */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeCategory === category ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* 게시물 목록 */}
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => onPostClick(post)}
                            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                {/* 아바타 */}
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{post.avatar}</div>

                                {/* 내용 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-md">{post.category}</span>
                                        {post.isHot && <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md">HOT</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-violet-600 transition-colors">{post.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.preview}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">{post.author}</span>
                                        <span>·</span>
                                        <span>{post.date}</span>
                                    </div>
                                </div>

                                {/* 통계 */}
                                <div className="flex flex-col items-end gap-2 text-sm text-gray-500 flex-shrink-0">
                                    <span className="flex items-center gap-1">
                                        <Eye size={16} />
                                        {post.views.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart size={16} />
                                        {post.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle size={16} />
                                        {post.commentCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">검색 결과가 없습니다</h3>
                            <p className="text-gray-500">다른 검색어를 입력해보세요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityListPage;
