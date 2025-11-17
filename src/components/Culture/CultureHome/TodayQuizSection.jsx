// src/components/Culture/CultureHome/TodayQuizSection.jsx
import React, { useState, useEffect } from 'react';
import QuizCard from './QuizCard';
import { cultureQuizData } from '../../../data/cultureQuizData'; // ✅ 새 파일 import

// 세트/랜덤 관련 상수
const QUESTIONS_PER_SET = 10;
const MAX_SETS = 4;

// 점수에 따라 뱃지/색 정하는 함수 (기존 코드 그대로 사용하면 됨)
function getGrade(score, total) {
    const percentage = (score / total) * 100;

    if (percentage >= 90) {
        return {
            title: '✨ 밈 마스터 ✨',
            message: '요즘 트렌드는 이미 당신 머릿속에 다 있어요!',
            emoji: '👑',
            gradient: 'from-yellow-400 via-orange-500 to-pink-500',
            bgGradient: 'from-yellow-100 via-orange-100 to-pink-100',
        };
    }
    if (percentage >= 70) {
        return {
            title: '🔥 트렌드 리더',
            message: '웬만한 밈은 다 아는 핵인싸 감각!',
            emoji: '🔥',
            gradient: 'from-orange-400 via-pink-500 to-purple-500',
            bgGradient: 'from-orange-100 via-pink-100 to-purple-100',
        };
    }
    if (percentage >= 50) {
        return {
            title: '🌈 밈 중급자',
            message: '감 좋네요! 조금만 더 보면 밈 마스터 가능!',
            emoji: '🌈',
            gradient: 'from-purple-400 via-indigo-500 to-blue-500',
            bgGradient: 'from-purple-100 via-indigo-100 to-blue-100',
        };
    }
    return {
        title: '🌱 밈 초보자',
        message: '천천히 가도 괜찮아요! 같이 밈 공부해요 😎',
        emoji: '🌱',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
        bgGradient: 'from-emerald-100 via-teal-100 to-cyan-100',
    };
}

// ✅ 주어진 문제 풀에서, 아직 안 쓴 id 기준으로 랜덤 세트 뽑기
function getRandomSet(allQuestions, usedIds, count) {
    const available = allQuestions.filter((q) => !usedIds.includes(q.id));

    if (available.length === 0) return [];

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ===================== ResultCard =====================
const ResultCard = ({ score, total, onRestart, onNext, setNumber, isLastSet }) => {
    const percentage = (score / total) * 100;
    const grade = getGrade(score, total);

    return (
        <div className="w-full animate-fade-in">
            <div className="relative">
                <div className={`absolute -inset-2 bg-gradient-to-r ${grade.gradient} rounded-3xl blur-xl opacity-20`} />
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    {/* 헤더 */}
                    <div className={`bg-gradient-to-r ${grade.bgGradient} p-8 border-b border-gray-100`}>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-3xl shadow-xl mb-6">
                                <span className="text-7xl animate-bounce-gentle">{grade.emoji}</span>
                            </div>
                            <h2 className={`text-4xl font-black mb-3 bg-gradient-to-r ${grade.gradient} bg-clip-text text-transparent`}>{grade.title}</h2>
                            <p className="text-lg text-gray-700 font-medium">{grade.message}</p>
                        </div>
                    </div>

                    {/* 점수 */}
                    <div className="p-8">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wide">정답 수</p>
                                <div className={`text-6xl font-black bg-gradient-to-r ${grade.gradient} bg-clip-text text-transparent`}>
                                    {score}/{total}
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wide">정확도</p>
                                <div className={`text-6xl font-black bg-gradient-to-r ${grade.gradient} bg-clip-text text-transparent`}>{Number.isNaN(percentage) ? 0 : percentage.toFixed(0)}%</div>
                            </div>
                        </div>

                        {/* 프로그레스 바 */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-semibold">
                                <span>퀴즈 완료</span>
                                <span>{Number.isNaN(percentage) ? 0 : percentage.toFixed(0)}%</span>
                            </div>
                            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${grade.gradient} rounded-full transition-all duration-1000 relative overflow-hidden`}
                                    style={{ width: `${Number.isNaN(percentage) ? 0 : percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                                </div>
                            </div>
                        </div>

                        {/* 통계 */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center border-2 border-emerald-100">
                                <p className="text-xs text-gray-600 mb-2 font-bold uppercase">정답</p>
                                <p className="text-3xl font-black text-emerald-600">{score}</p>
                            </div>
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 text-center border-2 border-rose-100">
                                <p className="text-xs text-gray-600 mb-2 font-bold uppercase">오답</p>
                                <p className="text-3xl font-black text-rose-600">{total - score}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 text-center border-2 border-purple-100">
                                <p className="text-xs text-gray-600 mb-2 font-bold uppercase">세트</p>
                                <p className="text-3xl font-black text-purple-600">{setNumber}</p>
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={onRestart} className="relative group overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-r ${grade.gradient} rounded-2xl`} />
                                <div className="relative bg-gradient-to-r from-white/20 to-transparent text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all">
                                    <span className="relative z-10">🔄 이 세트 다시 도전하기</span>
                                </div>
                            </button>

                            {!isLastSet && (
                                <button
                                    onClick={onNext}
                                    className="bg-white text-gray-700 font-bold py-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all"
                                >
                                    ➡️ 다음 퀴즈 세트
                                </button>
                            )}
                        </div>

                        {isLastSet && <p className="mt-4 text-center text-sm text-gray-500 font-medium">🎉 4세트 모두 완료했어요! 처음부터 다시 도전해볼까요?</p>}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-12px) scale(1.05); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .animate-bounce-gentle {
                    animation: bounce-gentle 2.5s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

// ===================== TodayQuizSection 본체 =====================
export default function TodayQuizSection() {
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [answeredQuizzes, setAnsweredQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [quizSet, setQuizSet] = useState(0); // 0~3 (표시는 +1)
    const [usedIds, setUsedIds] = useState([]); // ✅ 이미 출제된 문제 id
    const [currentSetQuestions, setCurrentSetQuestions] = useState([]); // ✅ 현재 세트 10문제

    // 최초 로딩
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    // ✅ 세트 변경 시마다 새로운 10문제 구성 (이미 나온 문제 제외)
    useEffect(() => {
        if (loading) return;

        const newSet = getRandomSet(cultureQuizData, usedIds, QUESTIONS_PER_SET);

        setCurrentSetQuestions(newSet);
        setCurrentQuizIndex(0);
        setScore(0);
        setIsFinished(false);
        setAnsweredQuizzes([]);

        // 이미 사용한 문제 id 업데이트
        setUsedIds((prev) => [...prev, ...newSet.map((q) => q.id)]);
    }, [loading, quizSet]); // quizSet 바뀔 때마다 새 세트

    const totalInSet = currentSetQuestions.length || QUESTIONS_PER_SET;

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore((prev) => prev + 1);
        setAnsweredQuizzes((prev) => [...prev, currentQuizIndex]);

        setTimeout(() => {
            if (currentQuizIndex < totalInSet - 1) {
                setCurrentQuizIndex((prev) => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 2500);
    };

    // ✅ 같은 세트 다시 풀기 (문제 구성 그대로)
    const handleRestart = () => {
        setCurrentQuizIndex(0);
        setScore(0);
        setIsFinished(false);
        setAnsweredQuizzes([]);
    };

    // ✅ 다음 세트 (최대 4세트, 문제 중복 없음)
    const handleNext = () => {
        const currentSetNumber = quizSet + 1;

        // 이미 4세트 끝이거나, 문제를 다 쓴 경우 더 이상 진행 안 함
        if (currentSetNumber >= MAX_SETS || usedIds.length >= cultureQuizData.length) {
            return;
        }

        setQuizSet((prev) => prev + 1);
    };

    if (loading || currentSetQuestions.length === 0) {
        return (
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                        <div className="relative w-20 h-20 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                    <p className="mt-6 text-gray-600 font-semibold">퀴즈를 불러오는 중...</p>
                </div>
            </section>
        );
    }

    const progressPercent = Math.round(((currentQuizIndex + 1) / totalInSet) * 100);
    const currentSetNumber = quizSet + 1;
    const isLastSet = currentSetNumber >= MAX_SETS || usedIds.length >= cultureQuizData.length;

    return (
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border-2 border-purple-200 shadow-lg mb-8">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 animate-pulse" />
                        <span className="text-sm font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide">
                            Meme Quiz Challenge · Set {currentSetNumber}
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">오늘의 밈 퀴즈</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                        K-POP, 웹툰, 예능, 영화까지 <span className="text-purple-600 font-bold">요즘 트렌드</span>를 얼마나 알고 있나요? 🎯
                    </p>

                    {/* 전체 프로그레스 (세트 내 진행도) */}
                    <div className="max-w-2xl mx-auto mt-10">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3 font-semibold">
                                <span>이번 세트 진행도</span>
                                <span className="text-purple-600">
                                    {currentQuizIndex + 1} / {totalInSet}
                                </span>
                            </div>
                            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 rounded-full transition-all duration-500 relative overflow-hidden"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                </div>
                            </div>
                            <p className="text-center mt-3 text-lg font-bold text-purple-600">{progressPercent}%</p>
                        </div>
                    </div>
                </div>

                {/* 메인 레이아웃 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* 사이드바 */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-8 space-y-6">
                            {/* 현재 상태 */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl blur-md opacity-50" />
                                        <div className="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl">🎯</div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900 text-lg">{isFinished ? '세트 완료!' : '진행 중'}</p>
                                        <p className="text-sm text-gray-500 font-medium">{isFinished ? `Set ${currentSetNumber} 결과를 확인하세요` : `문제 ${currentQuizIndex + 1} / ${totalInSet}`}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 text-center border-2 border-purple-100">
                                        <p className="text-xs text-gray-600 mb-1 font-bold uppercase">점수</p>
                                        <p className="text-3xl font-black text-purple-600">{score}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 text-center border-2 border-pink-100">
                                        <p className="text-xs text-gray-600 mb-1 font-bold uppercase">세트</p>
                                        <p className="text-3xl font-black text-pink-600">
                                            {currentSetNumber} / {MAX_SETS}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 카테고리 */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">📂</span>
                                    <p className="font-black text-gray-900">카테고리</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['K-POP', '웹툰', '밈', '예능', '스포츠', '드라마', '영화'].map((cat) => (
                                        <span
                                            key={cat}
                                            className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl text-xs text-purple-700 font-bold border border-purple-200 hover:scale-105 transition-transform cursor-default"
                                        >
                                            #{cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 참여자 (더미 데이터) */}
                            <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-3xl p-6 shadow-xl border-2 border-purple-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-2 font-bold uppercase">참여자</p>
                                        <p className="text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">2,847</p>
                                        <p className="text-xs text-gray-500 mt-1 font-medium">명이 도전했어요</p>
                                    </div>
                                    <div className="text-5xl">👥</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 퀴즈 / 결과 영역 */}
                    <div className="lg:col-span-9">
                        {!isFinished ? (
                            <QuizCard quiz={currentSetQuestions[currentQuizIndex]} onAnswer={handleAnswer} currentIndex={currentQuizIndex} totalQuizzes={totalInSet} />
                        ) : (
                            <ResultCard score={score} total={totalInSet} onRestart={handleRestart} onNext={handleNext} setNumber={currentSetNumber} isLastSet={isLastSet} />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
