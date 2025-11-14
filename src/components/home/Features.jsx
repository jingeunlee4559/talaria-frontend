import React from 'react';
import { Briefcase, MessageSquare, ListChecks, Shield, Clock, TrendingUp } from 'lucide-react';

// --- 비즈니스 기능 데이터 ---
const featureData = [
    {
        step: '01',
        title: '회의 준비, 완벽을 넘어 자동으로',
        description: '단순한 스케줄링을 넘어, AI가 회의의 목적과 참여자에 맞춰 필요한 모든 데이터를 분석하고 완벽한 준비 상태를 만듭니다.',
        icon: <Briefcase className="h-6 w-6 text-white" />,
        imageUrl: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?q=80&w=1471',
        align: 'left',
        badge: { icon: <Shield className="h-3 w-3" />, text: 'Enterprise Ready' },
    },
    {
        step: '02',
        title: '소통, 언어의 장벽 없이 본질만 남도록',
        description: '실시간 AI 통역이 단순한 단어 변환을 넘어, 대화의 뉘앙스와 핵심 문맥까지 파악하여 가장 자연스러운 소통을 가능하게 합니다.',
        icon: <MessageSquare className="h-6 w-6 text-white" />,
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1470',
        align: 'right',
        badge: { icon: <Clock className="h-3 w-3" />, text: '99.7% 정확도' },
    },
    {
        step: '03',
        title: '실행, 회의 종료와 동시에 다음 단계로',
        description: '회의 종료와 동시에, AI가 생성한 명확한 Action Item과 핵심 요약 리포트를 통해 지체 없이 다음 단계로 나아갈 수 있습니다.',
        icon: <ListChecks className="h-6 w-6 text-white" />,
        imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470',
        align: 'left',
        badge: { icon: <TrendingUp className="h-3 w-3" />, text: '생산성 200% 향상' },
    },
];

// --- 메인 Features 컴포넌트 ---
const Features = () => {
    return (
        <section className="py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
            <div className="container mx-auto px-6 lg:px-8">
                {/* 섹션 헤더 */}
                <div className="mx-auto max-w-4xl text-center" data-aos="fade-up">
                    {/* 신뢰 배지 */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-full border border-slate-200">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-700">Enterprise Solution</span>
                    </div>

                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        워크플로우의 진화, <br />
                        <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">Talalia가 완성합니다</span>
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-slate-600">가장 복잡한 글로벌 협업을 가장 단순하고 우아한 경험으로 바꿔보세요.</p>
                </div>

                {/* 워크플로우 컨테이너 */}
                <div className="relative mt-24 sm:mt-32">
                    {/* 중앙 워크플로우 라인 (데스크탑에서만 보임) - 더 진한 색상 */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-slate-300 via-indigo-300 to-slate-300 hidden lg:block" aria-hidden="true"></div>

                    <div className="space-y-24">
                        {featureData.map((feature, index) => (
                            <FeatureModule key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- 워크플로우 모듈 컴포넌트 ---
const FeatureModule = ({ step, title, description, icon, imageUrl, align, badge }) => {
    const isLeft = align === 'left';
    const contentOrder = isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse';
    const animation = isLeft ? 'fade-right' : 'fade-left';

    return (
        <div className={`relative flex flex-col-reverse lg:items-center ${contentOrder} gap-12 lg:gap-0`} data-aos={animation} data-aos-duration="1000">
            {/* 텍스트 내러티브 */}
            <div className={`w-full lg:w-1/2 p-4 lg:p-8 ${isLeft ? 'lg:pr-16' : 'lg:pl-16'}`}>
                <div className="flex items-center gap-4 mb-4">
                    {/* 더 프로페셔널한 아이콘 배경 */}
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-slate-800 to-indigo-900 rounded-xl shadow-lg">{icon}</div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500">Step {step}</span>
                        {/* 배지 추가 */}
                        <div className="flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                            {badge.icon}
                            <span className="text-xs font-bold text-indigo-700">{badge.text}</span>
                        </div>
                    </div>
                </div>
                <h3 className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">{title}</h3>
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">{description}</p>
            </div>

            {/* 비주얼 쇼케이스 - 더 세련되게 */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-sm sm:max-w-md rounded-3xl p-5 bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                    {/* 내부 프레임 */}
                    <div className="absolute inset-1 rounded-[22px] bg-gradient-to-br from-white to-slate-50"></div>

                    {/* 이미지 */}
                    <img src={imageUrl} alt={title} className="relative w-full h-full object-cover rounded-2xl border-4 border-white shadow-xl transition-transform duration-500 hover:scale-105" />

                    {/* 워크플로우 라인 연결점 - 더 눈에 띄게 */}
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-xl border-3 border-indigo-200 hidden lg:flex items-center justify-center ${
                            isLeft ? 'lg:-left-2.5' : 'lg:-right-2.5'
                        }`}
                    >
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-900 to-indigo-900 animate-pulse"></div>
                    </div>

                    {/* 장식 요소 - 코너 강조 */}
                    <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl"></div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tl from-slate-500/20 to-transparent rounded-full blur-xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Features;
