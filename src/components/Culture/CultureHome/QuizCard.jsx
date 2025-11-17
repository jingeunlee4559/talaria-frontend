// src/components/Culture/CultureHome/QuizCard.jsx
import { useState } from 'react';

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case '쉬움':
            return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200';
        case '보통':
            return 'bg-amber-500 text-white border-amber-600 shadow-amber-200';
        case '어려움':
            return 'bg-rose-500 text-white border-rose-600 shadow-rose-200';
        default:
            return 'bg-gray-500 text-white border-gray-600 shadow-gray-200';
    }
};

const getCategoryColor = (category) => {
    const colors = {
        'K-POP': 'bg-pink-500 text-white border-pink-600 shadow-pink-200',
        웹툰: 'bg-indigo-500 text-white border-indigo-600 shadow-indigo-200',
        밈: 'bg-purple-500 text-white border-purple-600 shadow-purple-200',
        예능: 'bg-orange-500 text-white border-orange-600 shadow-orange-200',
        스포츠: 'bg-blue-500 text-white border-blue-600 shadow-blue-200',
        드라마: 'bg-teal-500 text-white border-teal-600 shadow-teal-200',
        영화: 'bg-red-500 text-white border-red-600 shadow-red-200',
    };
    return colors[category] || 'bg-violet-500 text-white border-violet-600 shadow-violet-200';
};

const getCategoryEmoji = (category) => {
    const map = {
        'K-POP': '🎵',
        웹툰: '📚',
        밈: '😂',
        예능: '📺',
        스포츠: '🏅',
        드라마: '🎭',
        영화: '🎬',
    };
    return map[category] || '✨';
};

export default function QuizCard({ quiz, onAnswer, currentIndex, totalQuizzes }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleSelectAnswer = (index) => {
        if (showResult) return;

        setSelectedAnswer(index);
        setShowResult(true);
        setIsAnimating(true);

        setTimeout(() => {
            onAnswer(index === quiz.correctAnswer);
            setIsAnimating(false);
            // 다음 문제로 넘어갈 때 상태 초기화
            setSelectedAnswer(null);
            setShowResult(false);
        }, 2000);
    };

    const progressPercent = ((currentIndex + 1) / totalQuizzes) * 100;

    return (
        <div className="relative max-w-2xl w-full">
            {/* 바깥 글로우 보더 */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 opacity-60 blur-lg rounded-3xl pointer-events-none" />
            <div
                className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 backdrop-blur-sm transform transition-all duration-500 ${
                    isAnimating ? 'animate-scale-in' : 'hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(80,51,255,0.35)]'
                }`}
            >
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-30" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">{getCategoryEmoji(quiz.category)}</div>
                                <div>
                                    <p className="text-xs md:text-sm opacity-90 font-semibold tracking-wide uppercase">Today Meme Quiz</p>
                                    <h3 className="font-black text-xl md:text-2xl tracking-tight">밈 퀴즈 챌린지</h3>
                                    <p className="text-xs md:text-sm opacity-90 mt-1">
                                        문제 {currentIndex + 1} / {totalQuizzes}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="inline-flex items-center gap-2">
                                    <span className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold shadow-lg border-2 ${getDifficultyColor(quiz.difficulty)}`}>
                                        난이도 · {quiz.difficulty}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold shadow-lg border-2 ${getCategoryColor(quiz.category)}`}>#{quiz.category}</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] md:text-xs bg-black/20 px-2 py-1 rounded-full backdrop-blur">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                    <span>선택 후 자동으로 다음 문제로 넘어가요</span>
                                </span>
                            </div>
                        </div>

                        {/* 진행바 */}
                        <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden backdrop-blur-sm shadow-inner">
                            <div className="bg-white h-full rounded-full transition-all duration-500 shadow-lg relative overflow-hidden" style={{ width: `${progressPercent}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 퀴즈 이미지 */}
                <div className="relative aspect-video bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 overflow-hidden group">
                    <img
                        src={quiz.image}
                        alt={`${quiz.category} 관련 퀴즈 이미지`}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80';
                        }}
                    />
                    {/* 상단 오버레이 (카테고리/이모지) */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur">
                            <span className="text-base">{getCategoryEmoji(quiz.category)}</span>
                            <span className="font-semibold">{quiz.category}</span>
                        </div>
                    </div>

                    {/* 빛나는 점 효과 */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="w-3 h-3 bg-white/90 rounded-full animate-ping" />
                        <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                    </div>

                    {/* 하단 그라데이션 오버레이 */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* 질문 & 선택지 */}
                <div className="p-5 md:p-6 bg-gradient-to-b from-white to-gray-50">
                    {/* 질문 */}
                    <div className="bg-gradient-to-br from-white to-violet-50 rounded-2xl p-5 md:p-6 shadow-lg border-2 border-violet-100 mb-6 hover:border-violet-200 transition-all">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-white font-black text-xl">Q</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] text-violet-500 font-semibold mb-1">오늘의 질문</p>
                                <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed">{quiz.question}</h4>
                            </div>
                        </div>
                    </div>

                    {/* 선택지 */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {quiz.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === quiz.correctAnswer;

                            let buttonClass = 'w-full p-4 rounded-2xl text-left font-semibold transition-all duration-300 border-2 relative overflow-hidden text-sm md:text-base ';

                            if (showResult) {
                                if (isCorrect) {
                                    buttonClass += 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-green-500 text-green-700 shadow-xl transform scale-[1.02]';
                                } else if (isSelected && !isCorrect) {
                                    buttonClass += 'bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-red-500 text-red-700 shadow-xl transform scale-[1.02]';
                                } else {
                                    buttonClass += 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                                }
                            } else {
                                buttonClass +=
                                    'bg-white border-gray-200 text-gray-700 hover:border-violet-400 hover:bg-gradient-to-r hover:from-violet-50 hover:via-purple-50 hover:to-pink-50 hover:shadow-lg transform hover:scale-[1.01] cursor-pointer active:scale-95';
                            }

                            return (
                                <button key={index} onClick={() => handleSelectAnswer(index)} disabled={showResult} className={buttonClass}>
                                    {showResult && isCorrect && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/15 via-emerald-400/25 to-green-400/15 animate-pulse pointer-events-none" />
                                    )}
                                    <div className="relative flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-3">
                                            <span
                                                className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl font-black text-sm md:text-base transition-all ${
                                                    showResult && isCorrect
                                                        ? 'bg-green-500 text-white shadow-lg scale-110 animate-bounce-once'
                                                        : showResult && isSelected && !isCorrect
                                                        ? 'bg-red-500 text-white shadow-lg scale-110 animate-shake'
                                                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-[13px] md:text-base font-semibold break-words">{option}</span>
                                        </span>
                                        {showResult && isCorrect && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-7 h-7 md:w-8 md:h-8 text-green-600 animate-bounce-once" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        {showResult && isSelected && !isCorrect && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-7 h-7 md:w-8 md:h-8 text-red-600 animate-shake" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* 설명 */}
                    {showResult && (
                        <div
                            className={`p-5 rounded-2xl border-2 animate-slide-up shadow-lg ${
                                selectedAnswer === quiz.correctAnswer
                                    ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-green-300'
                                    : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-300'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl md:text-5xl animate-bounce-slow">{selectedAnswer === quiz.correctAnswer ? '🎉' : '💡'}</div>
                                <div className="flex-1">
                                    <p className="font-black text-lg md:text-xl text-gray-900 mb-2">{selectedAnswer === quiz.correctAnswer ? '정답입니다! 🎊' : '아쉬워요! 다음엔 꼭! 😅'}</p>
                                    <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed font-medium whitespace-pre-line">{quiz.explanation}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes shimmer {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(100%); }
                    }
                    @keyframes slide-up {
                      from { opacity: 0; transform: translateY(20px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes shake {
                      0%, 100% { transform: translateX(0) rotate(0deg); }
                      25% { transform: translateX(-5px) rotate(-3deg); }
                      50% { transform: translateX(5px) rotate(3deg); }
                      75% { transform: translateX(-3px) rotate(-2deg); }
                    }
                    @keyframes bounce-slow {
                      0%, 100% { transform: translateY(0) scale(1); }
                      50% { transform: translateY(-8px) scale(1.08); }
                    }
                    @keyframes bounce-once {
                      0%, 100% { transform: translateY(0) scale(1); }
                      50% { transform: translateY(-10px) scale(1.15); }
                    }
                    @keyframes scale-in {
                      from { opacity: 0; transform: scale(0.96) translateY(12px); }
                      to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-shimmer {
                      animation: shimmer 2s infinite;
                    }
                    .animate-slide-up {
                      animation: slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .animate-shake {
                      animation: shake 0.45s ease-in-out;
                    }
                    .animate-bounce-slow {
                      animation: bounce-slow 1.6s ease-in-out infinite;
                    }
                    .animate-bounce-once {
                      animation: bounce-once 0.6s ease-out;
                    }
                    .animate-scale-in {
                      animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                `}</style>
            </div>
        </div>
    );
}
