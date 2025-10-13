import React from 'react';

const featureData = [
    {
        number: '1',
        title: '회의 예약 및 아젠다 공유',
        description: '간단한 클릭으로 회의를 예약하고 참석자를 초대합니다. AI가 자동으로 이전 회의록을 분석하여 필요한 전문 용어를 준비합니다.',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
        reverse: false,
    },
    {
        number: '2',
        title: '실시간 AI 통역으로 소통',
        // 이미지와 가장 유사한 텍스트로 수정했습니다. 
        description: '100개 이상의 언어를 실시간으로 번역하며, 전문 분야별 용어를 정확하게 처리합니다. 언어의 장벽 없이 자연스럽게 대화하세요.',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        reverse: true,
    },
    {
        number: '3',
        title: 'AI 회의록으로 업무 마무리',
        description: '회의가 끝난 후 자동으로 생성된 회의록, 핵심 요약, 액션 아이템을 확인하세요. 중요한 순간을 클립으로 저장하여 팀과 공유할 수 있습니다.',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        reverse: false,
    }
];

const Features = () => {
    return (
        <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
                    3단계로 시작하는 글로벌 협업
                </h3>
                <p className="mt-4 text-lg text-gray-600">
                    복잡한 설정 없이 바로 시작할 수 있습니다
                </p>
            </div>

            <div className="space-y-20">
                {featureData.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </section>
    );
};


const FeatureCard = ({ number, title, description, imageUrl, reverse }) => {
    const direction = reverse ? 'md:flex-row-reverse' : 'md:flex-row';

    return (
        <div className={`flex flex-col ${direction} items-center gap-10 md:gap-20`}>
            {/* 텍스트 영역 */}
            <div className="md:w-1/2 w-full text-center md:text-left">
                
                {/* 👇 이 부분이 변경되었습니다 👇 */}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                    {/* 번호 동그라미 */}
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gray-800 text-white rounded-full font-bold text-2xl">
                        {number}
                    </div>
                    {/* 제목 */}
                    <h4 className="text-3xl font-bold text-gray-800 tracking-tight">{title}</h4>
                </div>

                {/* 설명 */}
                <p className="text-gray-500 md:text-lg leading-relaxed mb-8">{description}</p>
                
                {/* 링크 */}
                <a href="#" className="group font-semibold text-purple-600 hover:text-purple-800 transition-colors duration-300 text-lg">
                    자세히 보기
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none ml-2">→</span>
                </a>
            </div>

            {/* 이미지 영역 */}
            <div className="md:w-1/2">
                <img src={imageUrl} alt={title} className="rounded-lg shadow-xl w-full h-auto object-cover" />
            </div>
        </div>
    );
}

export default Features;