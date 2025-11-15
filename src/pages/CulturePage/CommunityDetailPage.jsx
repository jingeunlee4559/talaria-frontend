import React, { useState, useContext } from 'react';
import { ArrowLeft, Heart, Bookmark, Share2, MessageCircle, Eye, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserContext } from '../../contexts/UserContext';

const CommunityDetailPage = ({ post, onBack, likedPosts, setLikedPosts, bookmarkedPosts, setBookmarkedPosts, comments, setComments, onUpdatePost }) => {
    const { user } = useContext(UserContext);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const postComments = comments[post.id] || [];

    // 현재 시간을 "방금 전", "5분 전" 형식으로 포맷팅
    const getTimeAgo = () => {
        return '방금 전';
    };

    // 좋아요 토글
    const toggleLike = () => {
        setLikedPosts((prev) => ({
            ...prev,
            [post.id]: !prev[post.id],
        }));

        const updatedPost = {
            ...post,
            likes: likedPosts[post.id] ? post.likes - 1 : post.likes + 1,
        };

        onUpdatePost(updatedPost);
    };

    // 북마크 토글
    const toggleBookmark = () => {
        setBookmarkedPosts((prev) => ({
            ...prev,
            [post.id]: !prev[post.id],
        }));

        Swal.fire({
            icon: 'success',
            title: bookmarkedPosts[post.id] ? '북마크 해제' : '북마크 추가',
            timer: 1000,
            showConfirmButton: false,
        });
    };

    // 공유하기
    const handleShare = () => {
        Swal.fire({
            icon: 'success',
            title: '링크가 복사되었습니다',
            timer: 1500,
            showConfirmButton: false,
        });
    };

    // 댓글 추가
    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = {
            id: Date.now(),
            author: user?.name || '익명',
            avatar: '👤',
            text: newComment,
            time: getTimeAgo(),
            likes: 0,
            replies: [],
        };

        setComments((prev) => ({
            ...prev,
            [post.id]: [...(prev[post.id] || []), comment],
        }));

        const updatedPost = {
            ...post,
            commentCount: post.commentCount + 1,
        };

        onUpdatePost(updatedPost);
        setNewComment('');
    };

    // 대댓글 추가
    const handleAddReply = (commentId) => {
        if (!replyText.trim()) return;

        setComments((prev) => {
            const postComments = prev[post.id] || [];
            const updatedComments = postComments.map((comment) => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            {
                                id: Date.now(),
                                author: user?.name || '익명',
                                avatar: '👤',
                                text: replyText,
                                time: getTimeAgo(),
                                likes: 0,
                            },
                        ],
                    };
                }
                return comment;
            });

            return {
                ...prev,
                [post.id]: updatedComments,
            };
        });

        const updatedPost = {
            ...post,
            commentCount: post.commentCount + 1,
        };

        onUpdatePost(updatedPost);
        setReplyText('');
        setReplyingTo(null);
    };

    // 댓글 좋아요 (프론트엔드 전용)
    const handleCommentLike = (commentId) => {
        setComments((prev) => {
            const postComments = prev[post.id] || [];
            const updatedComments = postComments.map((comment) => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        likes: comment.likes + 1,
                    };
                }
                return comment;
            });

            return {
                ...prev,
                [post.id]: updatedComments,
            };
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-4 py-4">
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
                            <ArrowLeft size={20} />
                            목록으로
                        </button>
                    </div>
                </div>

                {/* 게시물 내용 */}
                <div className="bg-white mt-6 mx-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* 카테고리 */}
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-sm font-semibold rounded-lg">{post.category}</span>
                        </div>

                        {/* 제목 */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

                        {/* 작성자 정보 */}
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full flex items-center justify-center text-2xl">{post.avatar}</div>
                                <div>
                                    <p className="font-bold text-gray-900">{post.author}</p>
                                    <p className="text-sm text-gray-500">{post.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
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

                        {/* 본문 */}
                        <div className="prose max-w-none mb-8">
                            <div className="text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</div>
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-violet-50 text-violet-600 text-sm font-medium rounded-lg">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <button
                                onClick={toggleLike}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                    likedPosts[post.id] ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <Heart size={18} className={likedPosts[post.id] ? 'fill-red-600' : ''} />
                                좋아요 {post.likes}
                            </button>
                            <button
                                onClick={toggleBookmark}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                    bookmarkedPosts[post.id] ? 'bg-violet-50 text-violet-600 border-2 border-violet-200' : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <Bookmark size={18} className={bookmarkedPosts[post.id] ? 'fill-violet-600' : ''} />
                                북마크
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                공유
                            </button>
                        </div>
                    </div>
                </div>

                {/* 댓글 섹션 */}
                <div className="bg-white mt-4 mx-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">댓글 {post.commentCount}</h3>

                        {/* 댓글 입력 */}
                        <div className="mb-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                rows="3"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleAddComment}
                                    className="px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2"
                                >
                                    <Send size={16} />
                                    댓글 작성
                                </button>
                            </div>
                        </div>

                        {/* 댓글 목록 */}
                        <div className="space-y-4">
                            {postComments.map((comment) => (
                                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                                            {comment.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{comment.author}</span>
                                                <span className="text-xs text-gray-500">{comment.time}</span>
                                            </div>
                                            <p className="text-gray-800 mb-2">{comment.text}</p>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleCommentLike(comment.id)} className="text-sm text-gray-500 hover:text-violet-600 flex items-center gap-1">
                                                    <Heart size={14} />
                                                    {comment.likes > 0 && comment.likes}
                                                </button>
                                                <button onClick={() => setReplyingTo(comment.id)} className="text-sm text-gray-500 hover:text-violet-600">
                                                    답글
                                                </button>
                                            </div>

                                            {/* 대댓글 입력 */}
                                            {replyingTo === comment.id && (
                                                <div className="mt-3">
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="답글을 입력하세요..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
                                                        rows="2"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800">
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddReply(comment.id)}
                                                            className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
                                                        >
                                                            등록
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 대댓글 목록 */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-4 space-y-3 ml-8 border-l-2 border-gray-200 pl-4">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="flex items-start gap-3">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                                                                {reply.avatar}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-gray-900 text-sm">{reply.author}</span>
                                                                    <span className="text-xs text-gray-500">{reply.time}</span>
                                                                </div>
                                                                <p className="text-gray-800 text-sm">{reply.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {postComments.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle size={48} className="mx-auto mb-2 opacity-30" />
                                    <p>첫 댓글을 작성해보세요!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetailPage;
