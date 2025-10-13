import React from 'react';

const CTA = () => {
    return (
        <section className="bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                    지금 바로 시작하세요
                </h2>
                <p className="mt-4 text-lg text-blue-200">
                    5분 만에 설정 완료
                </p>
                <div className="mt-8">
                    <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                        무료 계정 만들기 &gt;
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;