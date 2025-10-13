import React from 'react';

const Navs = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* 로고 및 서비스명 */}
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-purple-600">Talaria</h1>
                    <span className="text-sm text-gray-500 hidden md:block">AI 기반 실시간 번역 서비스</span>
                </div>

                {/* 네비게이션 링크 (데스크탑) */}
                <nav className="hidden md:flex items-center space-x-8">
                    <a href="#" className="text-gray-600 hover:text-purple-600">기능</a>
                    <a href="#" className="text-gray-600 hover:text-purple-600">사용방법</a>
                </nav>

                {/* 로그인 및 시작 버튼 */}
                <div className="flex items-center space-x-4">
                    <button className="text-gray-600 hover:text-purple-600">로그인</button>
                    <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                        무료로 시작하기
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navs;