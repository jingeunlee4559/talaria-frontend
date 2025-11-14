import React from 'react';

export default function KLiveHero() {
    return (
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16 px-8">
            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes float-delayed-2 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-25px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-float-delayed-2 {
          animation: float-delayed-2 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>

            <div className="max-w-7xl mx-auto">
                {/* Top Badge */}
                <div className="flex justify-between mb-12">
                    <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2">
                        <span className="text-pink-500 text-2xl">📈</span>
                        <span className="text-gray-700 font-medium">지금 2,847명이 시청 중이에요!</span>
                        <span className="text-red-500 text-xl">🔥</span>
                    </div>
                </div>

                <div className="grid xl:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Main Heading with Gradient */}
                        <h1 className="text-6xl font-bold leading-tight">
                            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">실시간으로 즐기는</span>
                            <br />
                            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 bg-clip-text text-transparent">K-팝 & 글로벌 라이브</span>
                        </h1>

                        {/* Description */}
                        <div className="space-y-3 text-lg">
                            <p className="text-gray-700 flex items-center gap-2">
                                <span>해외 팀도, 한국 팀도</span>
                                <span className="text-2xl">🌍</span>
                            </p>
                            <p className="text-gray-700 flex items-center gap-2">
                                <span>시청자와 함께 이해하는 따뜻한 라이브 공간이에요</span>
                                <span className="text-2xl">💕</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button className="group relative bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                                <span>지금 인기 라이브 보기</span>
                                <span className="text-xl">✨</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <button className="bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 border-2 border-pink-200 hover:border-pink-300">
                                <span>탐색하기</span>
                                <span className="text-xl">🔍</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Video Preview */}
                    <div className="relative">
                        {/* Main Video Container */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video">
                            {/* LIVE Badge */}
                            <div className="absolute top-6 left-6 z-20">
                                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    LIVE
                                </div>
                            </div>

                            {/* Viewer Count */}
                            <div className="absolute top-6 right-6 z-20">
                                <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">2,847명 시청 중</div>
                            </div>

                            {/* Video Thumbnail - Studio Setup with real colors */}
                            <div className="w-full h-full relative">
                                {/* Background - darker with studio vibe */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

                                {/* Studio monitor screens (green and blue tints) */}
                                <div className="absolute top-8 left-8 w-32 h-24 bg-gradient-to-br from-green-500/40 to-green-600/30 rounded-lg border border-green-400/20"></div>
                                <div className="absolute top-8 right-24 w-32 h-24 bg-gradient-to-br from-blue-500/40 to-purple-600/30 rounded-lg border border-blue-400/20"></div>

                                {/* Keyboard/Desk area at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900 to-transparent"></div>

                                {/* Studio lights effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"></div>
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <button className="w-24 h-24 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 group">
                                    <svg className="w-12 h-12 text-pink-500 ml-1 group-hover:text-pink-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Floating Reaction Emojis with Animation */}
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 space-y-4">
                                <div className="animate-float bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
                                    <span className="text-3xl">😊</span>
                                </div>
                                <div className="animate-float-delayed bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
                                    <span className="text-3xl">🔥</span>
                                </div>
                                <div className="animate-float-delayed-2 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
                                    <span className="text-3xl">💯</span>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements - Soft Glow */}
                        <div className="absolute -z-10 -top-8 -right-8 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
                        <div
                            className="absolute -z-10 -bottom-8 -left-8 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
                            style={{ animationDelay: '1s' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
