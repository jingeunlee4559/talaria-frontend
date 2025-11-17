// src/components/Culture/CultureHome/QuizCard.jsx
import { useState, useRef, useEffect } from 'react';

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case '쉬움':
            return 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white';
        case '보통':
            return 'bg-gradient-to-r from-amber-400 to-orange-400 text-white';
        case '어려움':
            return 'bg-gradient-to-r from-rose-400 to-pink-500 text-white';
        default:
            return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
};

const getCategoryColor = (category) => {
    const colors = {
        'K-POP': 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
        웹툰: 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white',
        밈: 'bg-gradient-to-r from-purple-400 to-fuchsia-400 text-white',
        예능: 'bg-gradient-to-r from-orange-400 to-red-400 text-white',
        스포츠: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white',
        드라마: 'bg-gradient-to-r from-teal-400 to-green-400 text-white',
        영화: 'bg-gradient-to-r from-red-400 to-rose-400 text-white',
    };
    return colors[category] || 'bg-gradient-to-r from-violet-400 to-purple-400 text-white';
};

const getCategoryEmoji = (category) => {
    const map = {
        'K-POP': '🎵',
        웹툰: '📚',
        밈: '😂',
        예능: '📺',
        스포츠: '⚽',
        드라마: '🎭',
        영화: '🎬',
    };
    return map[category] || '✨';
};

export default function QuizCard({ quiz, onAnswer, currentIndex, totalQuizzes }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const explanationRef = useRef(null);

    // 해설이 표시될 때 자동 스크롤
    useEffect(() => {
        if (showResult && explanationRef.current) {
            setTimeout(() => {
                explanationRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 300); // 애니메이션 후 스크롤
        }
    }, [showResult]);

    const handleSelectAnswer = (index) => {
        if (showResult) return;

        setSelectedAnswer(index);
        setShowResult(true);
        setIsAnimating(true);

        setTimeout(() => {
            onAnswer(index === quiz.correctAnswer);
            setIsAnimating(false);
            setSelectedAnswer(null);
            setShowResult(false);
        }, 2000);
    };

    const progressPercent = ((currentIndex + 1) / totalQuizzes) * 100;

    return (
        <div className="w-full">
            <div className={`bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transition-all duration-500 ${isAnimating ? 'scale-[1.02] shadow-2xl' : 'hover:shadow-2xl'}`}>
                {/* 헤더 */}
                <div className="relative bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 p-6">
                    {/* 배경 패턴 */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>

                    <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                                    <div className="relative w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-2xl">
                                        {getCategoryEmoji(quiz.category)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white/90 text-xs font-bold mb-1 uppercase tracking-wider">Quiz Challenge</p>
                                    <h3 className="text-white text-2xl font-black tracking-tight">밈 퀴즈</h3>
                                    <p className="text-white/90 text-sm font-semibold mt-1">
                                        {currentIndex + 1} / {totalQuizzes}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <span className={`px-4 py-2 rounded-xl text-xs font-bold ${getDifficultyColor(quiz.difficulty)} shadow-lg transform hover:scale-105 transition-transform`}>
                                    {quiz.difficulty}
                                </span>
                                <span className={`px-4 py-2 rounded-xl text-xs font-bold ${getCategoryColor(quiz.category)} shadow-lg transform hover:scale-105 transition-transform`}>
                                    #{quiz.category}
                                </span>
                            </div>
                        </div>

                        {/* 진행 바 */}
                        <div className="relative">
                            <div className="flex items-center justify-between text-xs text-white/80 mb-2 font-medium">
                                <span>진행도</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className="h-full bg-white rounded-full transition-all duration-500 shadow-lg relative overflow-hidden" style={{ width: `${progressPercent}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 이미지 */}
                <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                    <img
                        src={quiz.image}
                        alt={quiz.category}
                        className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* 플로팅 카테고리 */}
                    <div className="absolute bottom-6 left-6">
                        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-2xl border border-white/50">
                            <span className="text-3xl">{getCategoryEmoji(quiz.category)}</span>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">카테고리</p>
                                <p className="text-sm font-bold text-gray-900">{quiz.category}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 질문 & 선택지 */}
                <div className="p-8">
                    {/* 질문 */}
                    <div className="relative mb-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 rounded-3xl blur-sm opacity-50" />
                        <div className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-3xl p-6 border-2 border-white shadow-lg">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform">
                                        <span className="text-white font-black text-2xl">Q</span>
                                    </div>
                                </div>
                                <div className="flex-1 self-center">
                                    <p className="text-purple-600 text-xs font-bold mb-2 uppercase tracking-wider">Today's Question</p>
                                    <p className="text-gray-900 text-xl font-bold leading-relaxed">{quiz.question}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 선택지 */}
                    <div className="space-y-4 mb-8">
                        {quiz.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === quiz.correctAnswer;
                            const letter = String.fromCharCode(65 + index);

                            let buttonClass = 'relative w-full group ';
                            let contentClass = 'relative p-5 rounded-2xl border-2 transition-all duration-300 ';

                            if (showResult) {
                                if (isCorrect) {
                                    buttonClass += 'scale-105 ';
                                    contentClass += 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-2xl';
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += 'scale-105 ';
                                    contentClass += 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-400 shadow-2xl';
                                } else {
                                    contentClass += 'bg-gray-50 border-gray-200 opacity-40';
                                }
                            } else {
                                buttonClass += 'cursor-pointer hover:scale-[1.02] active:scale-100 ';
                                contentClass += 'bg-white border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-xl';
                            }

                            return (
                                <button key={index} onClick={() => handleSelectAnswer(index)} disabled={showResult} className={buttonClass}>
                                    {/* 글로우 효과 */}
                                    {showResult && isCorrect && <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-md opacity-60 animate-pulse" />}
                                    {showResult && isSelected && !isCorrect && (
                                        <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl blur-md opacity-60 animate-pulse" />
                                    )}

                                    <div className={contentClass}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div
                                                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
                                                        showResult && isCorrect
                                                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white scale-110 shadow-xl'
                                                            : showResult && isSelected && !isCorrect
                                                            ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white scale-110 shadow-xl animate-shake'
                                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:text-purple-700'
                                                    }`}
                                                >
                                                    {letter}
                                                </div>
                                                <span
                                                    className={`font-bold text-base flex-1 text-left ${
                                                        showResult && isCorrect ? 'text-emerald-900' : showResult && isSelected && !isCorrect ? 'text-rose-900' : 'text-gray-800'
                                                    }`}
                                                >
                                                    {option}
                                                </span>
                                            </div>

                                            {showResult && isCorrect && (
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center animate-bounce-in shadow-xl">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                            {showResult && isSelected && !isCorrect && (
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center animate-bounce-in shadow-xl">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* 설명 */}
                    {showResult && (
                        <div ref={explanationRef} className="relative animate-slide-up">
                            <div
                                className={`absolute -inset-1 rounded-3xl blur-sm opacity-50 ${
                                    selectedAnswer === quiz.correctAnswer ? 'bg-gradient-to-r from-emerald-300 to-teal-300' : 'bg-gradient-to-r from-blue-300 to-cyan-300'
                                }`}
                            />
                            <div
                                className={`relative rounded-3xl p-6 border-2 shadow-xl ${
                                    selectedAnswer === quiz.correctAnswer
                                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                                        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'
                                }`}
                            >
                                <div className="flex items-start gap-5">
                                    <div className="text-5xl animate-bounce-gentle">{selectedAnswer === quiz.correctAnswer ? '🎉' : '💡'}</div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 text-2xl font-black mb-3">{selectedAnswer === quiz.correctAnswer ? '정답이에요! 🎊' : '아쉬워요! 😅'}</p>
                                        <p className="text-gray-700 text-base leading-relaxed font-medium">{quiz.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0) rotate(0); }
                    25% { transform: translateX(-6px) rotate(-3deg); }
                    75% { transform: translateX(6px) rotate(3deg); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .animate-slide-up {
                    animation: slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 2s ease-in-out infinite;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
