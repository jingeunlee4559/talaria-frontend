import React from 'react';
// ⚠️ 주의: AOS를 설치하고 메인 파일(예: App.js)에서 초기화해야 합니다.
// import AOS from 'aos';
// import 'aos/dist/aos.css'; 

const featureData = [
    {
        number: '1',
        title: '회의 예약 및 아젠다 공유',
        description: '간단한 클릭으로 회의를 예약하고 참석자를 초대합니다. AI가 자동으로 이전 회의록을 분석하여 필요한 전문 용어를 준비합니다.',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
        reverse: false, // 왼쪽에서 나타남
    },
    {
        number: '2',
        title: '실시간 AI 통역으로 소통',
        description: '100개 이상의 언어를 실시간으로 번역하며, 전문 분야별 용어를 정확하게 처리합니다. 언어의 장벽 없이 자연스럽게 대화하세요.',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        reverse: true, // 오른쪽에서 나타남
    },
    {
        number: '3',
        title: 'AI 회의록으로 업무 마무리',
        description: '회의가 끝난 후 자동으로 생성된 회의록, 핵심 요약, 액션 아이템을 확인하세요. 중요한 순간을 클립으로 저장하여 팀과 공유할 수 있습니다.',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        reverse: false, // 왼쪽에서 나타남
    }
];

const Features = () => {
    return (
        <section className="container mx-auto px-4 py-16">
            <div 
                className="text-center mb-16"
                data-aos="fade-up" // 제목 부분은 위에서 나타나게 설정 (선택 사항)
            >
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
    
    // reverse: false (1, 3번째 카드)는 왼쪽에서 나타나게 (fade-right)
    // reverse: true (2번째 카드)는 오른쪽에서 나타나게 (fade-left)
    const cardAos = reverse ? 'fade-left' : 'fade-right';

    return (
        // 가장 바깥쪽 div에 AOS 속성을 적용하여 텍스트와 이미지가 함께 움직이게 합니다.
        <div 
            className={`flex flex-col ${direction} items-center gap-10 md:gap-20`}
            data-aos={cardAos} 
            data-aos-duration="1000" // 애니메이션 지속 시간 (선택 사항)
        >
            
            {/* 텍스트 영역 */}
            <div className="md:w-1/2 w-full text-center md:text-left">
                
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
                
            </div>

            {/* 이미지 영역 */}
            <div className="md:w-1/2">
                <img src={imageUrl} alt={title} className="rounded-lg shadow-xl w-full h-auto object-cover" />
            </div>
        </div>
    );
}

export default Features;