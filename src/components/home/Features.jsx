import React from 'react';
import { Briefcase, MessageSquare, ListChecks } from 'lucide-react';

// --- 기능 데이터 (이미지 URL 업데이트) ---
const featureData = [
    {
        step: '01',
        title: '회의 준비, 완벽을 넘어 자동으로',
        description: '단순한 스케줄링을 넘어, AI가 회의의 목적과 참여자에 맞춰 필요한 모든 데이터를 분석하고 완벽한 준비 상태를 만듭니다.',
        icon: <Briefcase className="h-6 w-6 text-indigo-600" />,
        // 'AI가 데이터를 분석하고 준비하는' 이미지로 변경
        imageUrl: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?q=80&w=1471',
        align: 'left',
    },
    {
        step: '02',
        title: '소통, 언어의 장벽 없이 본질만 남도록',
        description: '실시간 AI 통역이 단순한 단어 변환을 넘어, 대화의 뉘앙스와 핵심 문맥까지 파악하여 가장 자연스러운 소통을 가능하게 합니다.',
        icon: <MessageSquare className="h-6 w-6 text-indigo-600" />,
        // '다양한 국적의 사람들이 원활하게 소통하는' 이미지로 변경
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1470',
        align: 'right',
    },
    {
        step: '03',
        title: '실행, 회의 종료와 동시에 다음 단계로',
        description: '회의 종료와 동시에, AI가 생성한 명확한 Action Item과 핵심 요약 리포트를 통해 지체 없이 다음 단계로 나아갈 수 있습니다.',
        icon: <ListChecks className="h-6 w-6 text-indigo-600" />,
        // '회의 결과를 바탕으로 팀이 협업하고 실행하는' 이미지로 변경
        imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470',
        align: 'left',
    },
];

// --- 메인 Features 컴포넌트 ---
const Features = () => {
    return (
        <section className="py-24 sm:py-32 overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8">
                {/* 섹션 헤더 */}
                <div className="mx-auto max-w-4xl text-center" data-aos="fade-up">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        워크플로우의 진화, <br />
                        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Talalia가 완성합니다</span>
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-slate-600">가장 복잡한 글로벌 협업을 가장 단순하고 우아한 경험으로 바꿔보세요.</p>
                </div>

                {/* 워크플로우 컨테이너 */}
                <div className="relative mt-24 sm:mt-32">
                    {/* 중앙 워크플로우 라인 (데스크탑에서만 보임) */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-slate-200 hidden lg:block" aria-hidden="true"></div>

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

// --- 워크플로우 모듈 컴포넌트 (반응형 수정) ---
const FeatureModule = ({ step, title, description, icon, imageUrl, align }) => {
    const isLeft = align === 'left';
    // 데스크탑(lg) 화면에서는 flex-row 또는 flex-row-reverse, 모바일에서는 flex-col-reverse로 변경
    const contentOrder = isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse';
    const animation = isLeft ? 'fade-right' : 'fade-left';

    return (
        // flex-col-reverse: 모바일에서 이미지가 위로, 텍스트가 아래로 오도록 설정
        <div className={`relative flex flex-col-reverse lg:items-center ${contentOrder} gap-12 lg:gap-0`} data-aos={animation} data-aos-duration="1000">
            {/* 텍스트 내러티브 */}
            {/* 모바일에서는 padding-right/left를 제거하고, 데스크탑에서만 적용 */}
            <div className={`w-full lg:w-1/2 p-4 lg:p-8 ${isLeft ? 'lg:pr-16' : 'lg:pl-16'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">{icon}</div>
                    <span className="text-xl font-bold text-indigo-500">Step {step}</span>
                </div>
                <h3 className="mt-6 text-3xl font-bold text-slate-800">{title}</h3>
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">{description}</p>
            </div>

            {/* 비주얼 쇼케이스 */}
            {/* 모바일에서 중앙 정렬 및 너비 조정 */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
                {/* 모바일에서는 max-w-sm, 데스크탑에서는 max-w-md로 조정 */}
                <div className="relative w-full aspect-square max-w-sm sm:max-w-md rounded-3xl p-4 bg-gradient-to-br from-slate-50 to-slate-200 shadow-2xl">
                    <div className="absolute inset-0.5 rounded-[22px] bg-[#F7F8FC]"></div>
                    <img src={imageUrl} alt={title} className="relative w-full h-full object-cover rounded-2xl border-4 border-white shadow-lg" />

                    {/* 워크플로우 라인 연결점 (데스크탑에서만 보임) */}
                    {/* 모바일에서는 중앙 라인이 없으므로 연결점도 숨김 */}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-200 hidden lg:block ${isLeft ? 'lg:-left-2' : 'lg:-right-2'}`}>
                        <div className="w-full h-full rounded-full bg-indigo-500 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
