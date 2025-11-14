import React from 'react';
import { Sparkles, Heart, Zap } from 'lucide-react';

// --- 문화/밈 기능 데이터 ---
const cultureFeatureData = [
    {
        step: '01',
        title: '자유 대화, 언어는 더 이상 장벽이 아니에요',
        description: '친구들과의 일상 대화부터 글로벌 커뮤니티 참여까지, AI가 자연스럽고 친근한 톤으로 실시간 번역하여 진정한 소통을 만들어갑니다.',
        icon: <Sparkles className="h-6 w-6 text-pink-500" />,
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1632',
        align: 'left',
    },
    {
        step: '02',
        title: '문화 이해, 밈과 트렌드까지 완벽하게',
        description: '단순 번역을 넘어, 각 나라의 유행어, 밈, 문화적 뉘앙스까지 정확하게 전달하여 진짜 소통이 가능하도록 도와드립니다.',
        icon: <Heart className="h-6 w-6 text-pink-500" />,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070',
        align: 'right',
    },
    {
        step: '03',
        title: '즉시 연결, 전 세계가 당신의 친구예요',
        description: '언제 어디서나 글로벌 친구들과 즉시 연결되어 실시간으로 대화하고, 새로운 문화를 경험하며 세계를 넓혀가세요.',
        icon: <Zap className="h-6 w-6 text-pink-500" />,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470',
        align: 'left',
    },
];

// --- 메인 CultureFeatures 컴포넌트 ---
const CultureFeatures = () => {
    return (
        <section className="py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-pink-50 via-purple-50 to-white">
            <div className="container mx-auto px-6 lg:px-8">
                {/* 섹션 헤더 */}
                <div className="mx-auto max-w-4xl text-center" data-aos="fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                        <span className="text-sm font-semibold text-pink-600">Culture & Meme</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        세계와 자유롭게 소통하는, <br />
                        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">새로운 경험의 시작</span>
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-slate-600">언어의 벽을 넘어 진짜 친구를 만나고, 문화를 공유하며, 세계를 경험하세요.</p>
                </div>

                {/* 워크플로우 컨테이너 */}
                <div className="relative mt-24 sm:mt-32">
                    {/* 중앙 워크플로우 라인 (데스크탑에서만 보임) */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-pink-200 via-purple-200 to-indigo-200 hidden lg:block" aria-hidden="true"></div>

                    <div className="space-y-24">
                        {cultureFeatureData.map((feature, index) => (
                            <CultureFeatureModule key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- 워크플로우 모듈 컴포넌트 ---
const CultureFeatureModule = ({ step, title, description, icon, imageUrl, align }) => {
    const isLeft = align === 'left';
    const contentOrder = isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse';
    const animation = isLeft ? 'fade-right' : 'fade-left';

    return (
        <div className={`relative flex flex-col-reverse lg:items-center ${contentOrder} gap-12 lg:gap-0`} data-aos={animation} data-aos-duration="1000">
            {/* 텍스트 내러티브 */}
            <div className={`w-full lg:w-1/2 p-4 lg:p-8 ${isLeft ? 'lg:pr-16' : 'lg:pl-16'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-full shadow-md border border-pink-100">{icon}</div>
                    <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Step {step}</span>
                </div>
                <h3 className="mt-6 text-3xl font-bold text-slate-800">{title}</h3>
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">{description}</p>
            </div>

            {/* 비주얼 쇼케이스 */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-sm sm:max-w-md rounded-3xl p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 shadow-2xl">
                    <div className="absolute inset-0.5 rounded-[22px] bg-gradient-to-br from-pink-50/50 to-purple-50/50"></div>
                    <img src={imageUrl} alt={title} className="relative w-full h-full object-cover rounded-2xl border-4 border-white shadow-lg" />

                    {/* 워크플로우 라인 연결점 (데스크탑에서만 보임) */}
                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-pink-200 hidden lg:block ${isLeft ? 'lg:-left-2' : 'lg:-right-2'}`}>
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse"></div>
                    </div>

                    {/* 떠다니는 이모지 장식 */}
                    <div className="absolute -top-4 -right-4 text-4xl animate-bounce">✨</div>
                    <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                        💬
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CultureFeatures;
