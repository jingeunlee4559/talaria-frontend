// src/components/Culture/CultureHome/TodayQuizSection.jsx
import React, { useState, useEffect } from 'react';
import QuizCard from './QuizCard';

// ✅ 실제 이미지와 정확한 정보로 업데이트된 퀴즈 데이터
const quizData = [
    {
        id: 1,
        question: '2024년 K-POP 씬을 뒤흔든 술게임 콘셉트 노래의 제목은?',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
        options: ['APT.', 'Supernova', 'Magnetic', 'Love wins all'],
        correctAnswer: 0,
        explanation: "로제와 브루노 마스의 'APT.'는 술게임 감성과 중독적인 후렴으로 전 세계 밈과 챌린지를 만들어냈어요.",
        difficulty: '쉬움',
        category: 'K-POP',
    },
    {
        id: 2,
        question: "'나 혼자만 레벨업' 초반부에서 성진우가 붙었던 별명은?",
        image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=1200&q=80',
        options: ['인류 최약병기', '그림자 군주', '헌터의 왕', '블랙 헌터'],
        correctAnswer: 0,
        explanation: '성진우는 E급 헌터 시절 실력 부족으로 인해 "인류 최약병기"라는 불명예스러운 별명으로 불렸어요.',
        difficulty: '보통',
        category: '웹툰',
    },
    {
        id: 3,
        question: '2024년 강아지 짤과 함께 특히 많이 쓰인 감정 표현 밈은?',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80',
        options: ['광광', '삐끼삐끼', '~노?', '물어봐요'],
        correctAnswer: 0,
        explanation: '강아지가 울먹이는 듯한 표정 짤과 함께 "광광"이라는 의성어가 2024년 SNS에서 크게 유행했어요.',
        difficulty: '쉬움',
        category: '밈',
    },
    {
        id: 4,
        question: "넷플릭스 예능 '흑백요리사'에서 백수저 팀을 이끈 셰프는?",
        image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&q=80',
        options: ['안성재', '백종원', '최현석', '에드워드 리'],
        correctAnswer: 0,
        explanation: '미슐랭 3스타 셰프 안성재가 백수저 팀 리더로 등장해 화제가 되었어요.',
        difficulty: '보통',
        category: '예능',
    },
    {
        id: 5,
        question: '2024 파리 올림픽에서 대한민국 첫 금메달이 나온 종목은?',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
        options: ['사격', '양궁', '펜싱', '유도'],
        correctAnswer: 0,
        explanation: '사격 종목에서 공기소총 10m 혼성 단체전 금메달이 나오며 대한민국의 첫 금메달을 장식했어요.',
        difficulty: '어려움',
        category: '스포츠',
    },
    {
        id: 6,
        question: '2024년 전 세계 스트리밍 플랫폼에서 큰 인기를 얻은 한국 드라마는?',
        image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&q=80',
        options: ['눈물의 여왕', '선재 업고 튀어', '이태원 클라쓰', '더 글로리'],
        correctAnswer: 0,
        explanation: '김수현·김지원 주연의 "눈물의 여왕"은 고급스러운 영상미와 서사로 글로벌 팬들의 호평을 받았어요.',
        difficulty: '보통',
        category: '드라마',
    },
    {
        id: 7,
        question: 'aespa의 2024년 활동 곡 중 강렬한 사운드와 후렴으로 큰 인기를 얻은 곡은?',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
        options: ['Supernova', 'Armageddon', 'Drama', 'Spicy'],
        correctAnswer: 0,
        explanation: '"Supernova"는 강렬한 비트와 중독적인 훅으로 많은 챌린지와 밈을 만들어낸 곡이에요.',
        difficulty: '쉬움',
        category: 'K-POP',
    },
    {
        id: 8,
        question: '공포·미스터리 영화 "파묘"의 연출을 맡은 감독은?',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
        options: ['장재현', '봉준호', '박찬욱', '나홍진'],
        correctAnswer: 0,
        explanation: '"파묘"는 "검은 사제들", "사바하"로 잘 알려진 장재현 감독의 작품이에요.',
        difficulty: '어려움',
        category: '영화',
    },
];

// ✅ 결과 카드 (좀 더 컴팩트하고 정리된 스타일)
const ResultCard = ({ score, total, onRestart, onNext }) => {
    const percentage = (score / total) * 100;

    const getGrade = () => {
        if (percentage === 100)
            return {
                emoji: '🏆',
                title: '완벽해요!',
                message: '밈 마스터 등극! 당신은 진정한 트렌드 세터!',
                gradient: 'from-amber-400 via-yellow-400 to-orange-500',
                textColor: 'text-amber-600',
            };
        if (percentage >= 75)
            return {
                emoji: '🎉',
                title: '대단해요!',
                message: '밈 고수 인정! 요즘 것들 감각이 가득하네요.',
                gradient: 'from-emerald-400 via-green-400 to-teal-500',
                textColor: 'text-emerald-600',
            };
        if (percentage >= 50)
            return {
                emoji: '👍',
                title: '잘했어요!',
                message: '꽤 괜찮은데요? 조금만 더 파면 진짜 밈 장인이 될 수 있어요.',
                gradient: 'from-sky-400 via-blue-400 to-indigo-500',
                textColor: 'text-sky-600',
            };
        return {
            emoji: '💪',
            title: '아쉬워요!',
            message: '오늘은 워밍업! 다음 세트에서 진짜 실력 보여주세요.',
            gradient: 'from-purple-400 via-fuchsia-400 to-rose-500',
            textColor: 'text-purple-600',
        };
    };

    const grade = getGrade();

    return (
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-[0_18px_45px_rgba(15,23,42,0.16)] p-6 md:p-7 animate-scale-in">
            {/* 상단: 점수/퍼센트 */}
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 mb-3">
                    <span className="text-4xl md:text-5xl">{grade.emoji}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">{grade.title}</h2>
                <p className="text-sm md:text-[15px] text-slate-600 max-w-sm">{grade.message}</p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-500 font-medium mb-1">정답 개수</p>
                    <p className={`text-2xl md:text-3xl font-black ${grade.textColor}`}>
                        {score}/{total}
                    </p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-500 font-medium mb-1">정확도</p>
                    <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{percentage.toFixed(0)}%</p>
                </div>
            </div>

            {/* 진행 바 */}
            <div className="mb-6">
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${grade.gradient} relative overflow-hidden transition-all duration-700`} style={{ width: `${Math.max(8, percentage)}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                </div>
            </div>

            {/* 통계 3개 */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-center text-xs md:text-[11px]">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-2 py-3">
                    <p className="text-slate-500 mb-1">정답</p>
                    <p className="text-lg font-extrabold text-emerald-600">{score}개</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-2 py-3">
                    <p className="text-slate-500 mb-1">오답</p>
                    <p className="text-lg font-extrabold text-rose-600">{total - score}개</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-2 py-3">
                    <p className="text-slate-500 mb-1">세트 번호</p>
                    <p className="text-lg font-extrabold text-violet-600">1</p>
                </div>
            </div>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onRestart}
                    className={`flex-1 bg-gradient-to-r ${grade.gradient} text-white text-sm md:text-[15px] font-semibold py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-[2px] active:translate-y-0 transition-all`}
                >
                    다시 도전하기
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 border border-violet-500/70 text-violet-700 text-sm md:text-[15px] font-semibold py-3 rounded-xl bg-white hover:bg-violet-50 hover:-translate-y-[2px] active:translate-y-0 transition-all"
                >
                    다음 퀴즈 세트
                </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 text-center">* 점수는 이 페이지 안에서만 사용됩니다.</p>
        </div>
    );
};

export default function TodayQuizSection() {
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [answeredQuizzes, setAnsweredQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quizSet, setQuizSet] = useState(0); // 퀴즈 세트 추적

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleAnswer = (isCorrect) => {
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
        setAnsweredQuizzes((prev) => [...prev, currentQuizIndex]);

        setTimeout(() => {
            if (currentQuizIndex < quizData.length - 1) {
                setCurrentQuizIndex((prev) => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 2500);
    };

    const handleRestart = () => {
        setCurrentQuizIndex(0);
        setScore(0);
        setIsFinished(false);
        setAnsweredQuizzes([]);
    };

    const handleNext = () => {
        setQuizSet((prev) => prev + 1);
        handleRestart();
    };

    if (loading) {
        return (
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-pink-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto flex justify-center items-center py-16">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-violet-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full opacity-30 animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const progressPercent = Math.round(((currentQuizIndex + 1) / quizData.length) * 100);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50/40 to-pink-50 py-14 md:py-18 px-4 sm:px-6 lg:px-8">
            {/* 배경 라이트 */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* 상단 헤더 + 전체 진행도 */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-violet-100 text-[11px] text-violet-700 font-semibold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>오늘의 밈 감도 체크 · 세트 {quizSet + 1}</span>
                    </div>

                    <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-violet-700 to-pink-600 bg-clip-text text-transparent">오늘의 밈 퀴즈</h2>
                            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
                                K-POP, 웹툰, 예능, 스포츠, 드라마, 영화까지
                                <span className="font-semibold text-violet-700"> 요즘 밈 감각</span>이 어느 정도인지 가볍게 점검해 보세요.
                            </p>
                        </div>
                        <div className="md:w-64">
                            <p className="text-[11px] text-slate-500 mb-1">
                                전체 진행도 · {currentQuizIndex + 1}/{quizData.length}
                            </p>
                            <div className="w-full h-2 rounded-full bg-white/70 border border-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메인 레이아웃: 좌측 정보, 우측 퀴즈/결과 */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* 좌측: 설명/통계 패널 */}
                    <div className="lg:col-span-2">
                        <div className="h-full bg-white/85 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-[0_14px_40px_rgba(15,23,42,0.12)] p-5 md:p-6 flex flex-col gap-5">
                            {/* 현재 상태 */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-1">현재 상태</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-violet-100 flex items-center justify-center text-lg">🎯</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{isFinished ? '세트 완료!' : '퀴즈 진행 중'}</p>
                                        <p className="text-xs text-slate-500">
                                            {isFinished ? '결과를 확인하고, 원하면 다음 세트로 바로 이어갈 수 있어요.' : `문제 ${currentQuizIndex + 1} / ${quizData.length} 을(를) 풀고 있어요.`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 점수/진행 요약 */}
                            <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-2 py-3">
                                    <p className="text-slate-500 mb-1">점수</p>
                                    <p className="text-xl font-extrabold text-violet-700">{score}점</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-3">
                                    <p className="text-slate-500 mb-1">진행률</p>
                                    <p className="text-xl font-extrabold text-slate-800">{progressPercent}%</p>
                                </div>
                                <div className="rounded-2xl border border-pink-100 bg-pink-50/70 px-2 py-3">
                                    <p className="text-slate-500 mb-1">참여자</p>
                                    <p className="text-xl font-extrabold text-pink-600">2,847명</p>
                                </div>
                            </div>

                            {/* 카테고리 리스트 */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">오늘 포함된 카테고리</p>
                                <div className="flex flex-wrap gap-2 text-[11px]">
                                    {['K-POP', '웹툰', '밈', '예능', '스포츠', '드라마', '영화'].map((cat) => (
                                        <span key={cat} className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                                            #{cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 안내 텍스트 */}
                            <div className="mt-auto pt-2 border-t border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    보기 중 하나를 선택하면 정답 여부가 표시되고,
                                    <br />
                                    <span className="font-semibold text-violet-600">약간의 연출 후 자동으로 다음 문제</span>로 넘어갑니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 퀴즈 카드 / 결과 카드 */}
                    <div className="lg:col-span-3 flex justify-center">
                        {!isFinished ? (
                            <QuizCard quiz={quizData[currentQuizIndex]} onAnswer={handleAnswer} currentIndex={currentQuizIndex} totalQuizzes={quizData.length} />
                        ) : (
                            <ResultCard score={score} total={quizData.length} onRestart={handleRestart} onNext={handleNext} />
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.96) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </section>
    );
}
