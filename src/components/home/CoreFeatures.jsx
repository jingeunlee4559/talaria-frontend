import React from 'react';
// 아이콘 라이브러리 (이전에 설치)
import { FiVideo, FiFileText, FiMessageSquare, FiClipboard } from 'react-icons/fi';

// 각 기능 카드에 대한 데이터
const featuresData = [
    {
        icon: <FiVideo className="w-8 h-8 text-green-500" />,
        title: '실시간 영상 번역',
        description: '화상 회의 중 실시간으로 자막과 음성 번역을 제공하여 언어 장벽 없는 소통을 실현합니다.',
    },
    {
        icon: <FiFileText className="w-8 h-8 text-purple-500" />,
        title: 'AI 회의록 생성',
        description: '회의 내용을 자동으로 정리하고 핵심 요약, 액션 아이템까지 추출하여 업무 효율을 극대화합니다.',
    },
    {
        icon: <FiMessageSquare className="w-8 h-8 text-sky-500" />,
        title: '전문 용어 사전',
        description: '법률, 의료, IT 등 분야별 전문 용어를 정확하게 번역하여 비즈니스 커뮤니케이션의 품질을 보장합니다.',
    },
    {
        icon: <FiClipboard className="w-8 h-8 text-orange-500" />,
        title: '문서 번역 및 관리',
        description: '계약서, 제안서 등 중요 문서를 안전하게 번역하고 체계적으로 관리할 수 있습니다.',
    }
];

// ✨ 아이콘과 제목을 옆으로 배치하도록 수정된 컴포넌트 ✨
const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        
        {/* 👇 이 부분이 변경되었습니다 👇 */}
        <div className="flex items-center gap-4 mb-4">
            {/* 아이콘 */}
            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                {icon}
            </div>
            {/* 제목 */}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>

        {/* 설명 */}
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);


const CoreFeatures = () => {
    return (
        <section className="bg-slate-50 py-20">
            <div className="container mx-auto px-4">
                {/* 섹션 제목 */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        강력한 기능
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        AI 기술로 완벽한 글로벌 커뮤니케이션을 경험하세요
                    </p>
                </div>

                {/* 기능 카드 그리드 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {featuresData.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoreFeatures;