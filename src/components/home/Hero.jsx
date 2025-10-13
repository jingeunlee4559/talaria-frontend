import React from 'react';
import { FiMic, FiSend } from 'react-icons/fi'; // react-icons 라이브러리 설치 필요

const Hero = () => {
    return (
        <section className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center mt-12 md:mt-20">
            {/* 왼쪽 텍스트 영역 */}
            <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
                    언어의 장벽을 넘어, <br />
                    세계로 연결합니다
                </h2>
                <p className="mt-6 text-lg text-gray-600">
                    실시간 영상 번역과 AI 회의록으로 글로벌 비즈니스 커뮤니케이션을 혁신하세요.
                </p>
                <div className="mt-8 flex justify-center md:justify-start space-x-4">
                    <button className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                        무료로 시작하기
                    </button>
                    {/* <button className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        데모 보기
                    </button> */}
                </div>
            </div>

            {/* 오른쪽 번역 채팅 UI */}
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
                <p className="font-semibold text-gray-700 mb-4">💬 실시간 번역 채팅하기</p>
                <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-500">아래 문구를 선택하거나 입력해보세요</p>
                    <div className="flex space-x-2">
                        <button className="flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg text-sm font-semibold">번역할게요</button>
                        <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-sm">감사합니다</button>
                        <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-sm">회의 시작하였습니다</button>
                    </div>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="직접 입력하세요..." 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <FiMic className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </section>
    );
};

export default Hero;