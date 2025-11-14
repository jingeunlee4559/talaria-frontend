import React from 'react';
import { Globe, MessageCircle, Users, Building2, Sparkles, BarChart3, Zap, ArrowUpRight } from 'lucide-react';

const CoreFeatures = () => {
    const useCases = [
        {
            id: 'business',
            category: 'BUSINESS',
            title: '비즈니스',
            subtitle: '글로벌 비즈니스를 위한 프로페셔널 통역 솔루션',
            image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop',
            features: [
                { icon: <Globe className="w-5 h-5" />, title: '전문 통역', desc: '비즈니스 맥락을 이해하는 정확한 실시간 번역' },
                { icon: <Users className="w-5 h-5" />, title: '다자간 회의', desc: '최대 100명까지 각자 언어로 참여 가능' },
                { icon: <BarChart3 className="w-5 h-5" />, title: '보안 강화', desc: '엔터프라이즈급 암호화 및 데이터 보호' },
            ],
            theme: 'dark',
        },
        {
            id: 'culture',
            category: 'CULTURE',
            title: '문화/밈',
            subtitle: '전 세계와 자유롭게 소통하는 스마트 번역 경험',
            image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
            features: [
                { icon: <Sparkles className="w-5 h-5" />, title: '자유 대화', desc: '친구들과 실시간으로 자연스럽게 대화하고 소통' },
                { icon: <MessageCircle className="w-5 h-5" />, title: '문화 이해', desc: '밈, 속어, 트렌드까지 완벽하게 번역하고 설명' },
                { icon: <Zap className="w-5 h-5" />, title: '즉시 연결', desc: '글로벌 친구들과 언어 장벽 없이 빠르게 소통' },
            ],
            theme: 'colorful',
        },
    ];

    return (
        <section className="relative py-32 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
            {/* 배경 장식 요소 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* 섹션 헤더 */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full border border-purple-100">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-600">Use Cases</span>
                    </div>
                    <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
                        당신의 모든 순간을 위한
                        <br />
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">완벽한 번역 솔루션</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">비즈니스의 전문성과 일상의 자유로움, 모두를 위한 맞춤형 경험을 제공합니다</p>
                </div>

                {/* 유스케이스 카드 그리드 */}
                <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
                    {useCases.map((useCase, index) => (
                        <UseCaseCard key={useCase.id} useCase={useCase} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const UseCaseCard = ({ useCase, index }) => {
    const { category, title, subtitle, image, features, theme } = useCase;
    const isColorful = theme === 'colorful';

    return (
        <div
            className="group relative rounded-[2rem] overflow-hidden bg-white transition-all duration-700 hover:scale-[1.02]"
            style={{
                animationDelay: `${index * 150}ms`,
                boxShadow: isColorful ? '0 20px 60px -15px rgba(236, 72, 153, 0.3), 0 0 0 1px rgba(236, 72, 153, 0.1)' : '0 20px 60px -15px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1)',
            }}
        >
            {/* 상단 이미지 섹션 */}
            <div className="relative h-64 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                {/* 이미지 위 그라데이션 오버레이 */}
                {isColorful ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/80 via-purple-600/80 to-indigo-600/80"></div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/80 to-slate-900/80"></div>
                )}

                {/* 이미지 위 카테고리 뱃지 */}
                <div className="absolute top-6 left-6">
                    <span
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider rounded-full backdrop-blur-xl border ${
                            isColorful ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 text-blue-200 border-white/20'
                        }`}
                    >
                        {isColorful ? <Sparkles className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {category}
                    </span>
                </div>

                {/* 이미지 위 타이틀 */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">{title}</h3>
                </div>

                {/* 장식 빛 효과 */}
                <div
                    className={`absolute top-0 right-0 w-64 h-64 ${
                        isColorful ? 'bg-yellow-300' : 'bg-blue-400'
                    } opacity-20 blur-[100px] rounded-full transition-transform duration-1000 group-hover:scale-150`}
                ></div>

                {/* 우측 상단 화살표 아이콘 */}
                <div
                    className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 ${
                        isColorful ? 'bg-white/20 border-white/30 text-white group-hover:bg-white/30' : 'bg-white/10 border-white/20 text-blue-200 group-hover:bg-white/20'
                    }`}
                >
                    <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
            </div>

            {/* 하단 콘텐츠 섹션 */}
            <div className="p-8 sm:p-10">
                {/* 서브타이틀 */}
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">{subtitle}</p>

                {/* 기능 리스트 */}
                <div className="space-y-4 mb-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group/item flex items-start gap-4 p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 hover:translate-x-2">
                            {/* 아이콘 */}
                            <div
                                className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 ${
                                    isColorful ? 'bg-gradient-to-br from-yellow-400 via-pink-400 to-pink-500 text-white' : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 text-white'
                                }`}
                            >
                                {feature.icon}
                            </div>

                            {/* 텍스트 */}
                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-slate-900 mb-1.5">{feature.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA 버튼 */}
                <button
                    className={`group/btn w-full flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl ${
                        isColorful
                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:shadow-pink-500/50'
                            : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white hover:shadow-indigo-500/50'
                    }`}
                >
                    <span>시작하기</span>
                    <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </button>
            </div>

            {/* 카드 테두리 빛 효과 */}
            <div
                className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    isColorful ? 'shadow-[0_0_80px_rgba(236,72,153,0.6)]' : 'shadow-[0_0_80px_rgba(99,102,241,0.6)]'
                }`}
            ></div>
        </div>
    );
};

export default CoreFeatures;
