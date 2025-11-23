// src/pages/dashboard/mockDocuments.js

// // 🔹 샘플 번역 문서 목록 (대시보드 목록용 더미 데이터)
// export const documents = [
//     {
//         id: 1,
//         type: 'document',
//         title: '파트너십 계약서',
//         isStarred: true,
//         fromLang: '영어',
//         toLang: '한국어',
//         date: '2025-09-27',
//         size: '2.4 MB',
//         author: '김철수',
//         originalContent:
//             "This Partnership Agreement ('Agreement') is entered into as of September 27, 2025, by and between: Party A: TechCorp International Ltd. Address: 123 Business Street, San Francisco, CA 94105. Party B: Innovation Korea Co., Ltd. Address: 456 Gangnam-daero, Seoul, South Korea. The purpose of this agreement is to establish a cooperative framework for joint development and marketing of future products.",
//         translatedContent:
//             "본 파트너십 계약('본 계약')은 2025년 9월 27일부로 다음 당사자 간에 체결됩니다: 당사자 A: TechCorp International Ltd. 주소: 123 Business Street, San Francisco, CA 94105. 당사자 B: 이노베이션 코리아 주식회사. 주소: 서울특별시 강남대로 456. 본 계약의 목적은 향후 제품의 공동 개발 및 마케팅을 위한 협력 체계를 구축하는 것입니다.",
//     },
//     {
//         id: 2,
//         type: 'document',
//         title: '제품 사양서',
//         isStarred: false,
//         fromLang: '한국어',
//         toLang: '영어',
//         date: '2025-09-25',
//         size: '1.8 MB',
//         author: '이영희',
//         originalContent: '제품명: 제미니 AI 프로세서. 주요 기능: 초당 100조 회의 연산 능력, 저전력 설계. 개발 팀: AI솔루션팀. 출시 예정일: 2026년 1월.',
//         translatedContent:
//             'Product Name: Gemini AI Processor. Key Features: 100 trillion operations per second, low power design. Development Team: AI Solution Team. Estimated Release Date: January 2026.',
//     },
//     {
//         id: 3,
//         type: 'document',
//         title: '마케팅 전략 검토 보고서',
//         isStarred: true,
//         fromLang: '영어',
//         toLang: '한국어',
//         date: '2025-09-23',
//         size: '3.2 MB',
//         author: '박민수',
//         originalContent:
//             'The Q4 marketing campaign will focus primarily on digital channels, specifically targeting Gen Z users through short-form video content. Budget allocation: 60% digital ads, 30% influencer collaborations, 10% traditional media.',
//         translatedContent:
//             '4분기 마케팅 캠페인은 주로 디지털 채널에 집중하며, 특히 짧은 형식의 비디오 콘텐츠를 통해 Gen Z 사용자를 타겟팅할 것입니다. 예산 할당: 디지털 광고 60%, 인플루언서 협업 30%, 전통 미디어 10%.',
//     },
//     // 필요하면 4~12까지 복제해서 페이징 테스트용으로 사용 가능
// ];

// 🔹 AI 코치용 템플릿 (Q3 사업 계획 회의)
const q3Coach = {
    summary: 'Q3 실적 리뷰를 기반으로 Q4 아시아 시장 진출, 신제품 출시, 인력 확충까지 한 번에 의사결정을 정리한 전략 회의입니다.',
    meetingScore: 82,
    riskLevel: '보통', // '높음' | '보통' | '낮음'
    risks: ['아시아 시장 진출, 신제품 출시, 인력 채용을 한 회의에서 모두 다루어 후속 관리가 분산될 수 있습니다.', 'Action Item은 많지만, 중간 점검 일정이 정의되지 않아 실행 지연 가능성이 있습니다.'],
    improvements: [
        '시장 진출, 제품 출시, 인력 채용을 각각 별도 트랙으로 분리하고 담당 리더를 지정해 주세요.',
        'Action Item에 주간·격주 단위 체크포인트를 추가해 진행 상황을 정기적으로 검토하는 것이 좋습니다.',
    ],
    nextSteps: [
        'Q4 아시아 진출 태스크포스(TF)를 소규모로 구성해 첫 2주간은 실행 계획 수립에만 집중하세요.',
        '신제품 출시 전, 마케팅/영업/CS가 함께 참여하는 사전 점검 미팅을 별도로 잡는 것을 추천합니다.',
        '다음 회의에서는 “예산 사용 계획”과 “채용 일정”만 좁혀서 리뷰하는 짧은 스탠드업 회의를 진행해 보세요.',
    ],
};

// 🔹 AI 코치용 템플릿 (글로벌 마케팅 전략 회의)
const globalCoach = {
    summary: '유럽 시장, 특히 독일 베를린을 중심으로 파일럿 캠페인과 제품 현지화 방향을 정리한 글로벌 마케팅 초기 전략 회의입니다.',
    meetingScore: 78,
    riskLevel: '보통',
    risks: [
        '파일럿 캠페인 일정은 정해졌지만, 성과 측정 지표(KPI)가 구체적으로 정의되지 않았습니다.',
        '현지화 범위(언어, 디자인, 기능 등)에 대한 우선순위가 불분명해 개발 리소스가 분산될 위험이 있습니다.',
    ],
    improvements: [
        '베를린 파일럿의 핵심 KPI(예: 신규 리드 수, 가입 전환율, 사용 시간)를 2~3개로 압축해 우선 합의해 두세요.',
        '유럽 전체를 한 번에 가기보다는 1~2개 언어에서 UI/카피 현지화를 집중 검증하고 패턴을 만든 뒤 확장하는 것이 좋습니다.',
    ],
    nextSteps: [
        '파일럿 캠페인 종료 직후 회고 미팅 일정을 지금 미리 캘린더에 잡아 두세요.',
        '현지 파트너·에이전시와의 커뮤니케이션 채널을 Slack/메일 등 한 채널로 통합해 실행 속도를 높이세요.',
        '다음 회의는 “베를린 캠페인 준비 현황”만 단독 아젠다로 다루는 15~20분 스탠드업 미팅을 추천합니다.',
    ],
};

// 🔹 회의록 + AI 코치 데이터
export const mockMinutes = [
    {
        id: 14,
        type: 'minutes',
        title: '2025 Q3 사업 계획 회의',
        isStarred: true,
        date: '2025-09-26',
        duration: '1시간 15분',
        participants: 4,
        aiSummary: {
            decisions: ['Q4 아시아 시장 진출을 위한 예산 300만 달러 승인', '신제품 출시일을 2025년 12월 15일로 확정', '마케팅팀 3명 추가 채용 결정'],
            actionItems: [
                { owner: '김철수', task: '시장 조사 보고서 작성', deadline: '마감: 10월 5일' },
                { owner: 'John Smith', task: '파트너십 계약서 초안 준비', deadline: '마감: 10월 10일' },
                { owner: '田中太郎', task: '일본 시장 진출 전략 발표', deadline: '마감: 10월 8일' },
            ],
        },
        topics: ['예산', '마케팅', '인력 채용', '시장 진출'],
        transcript: [
            { speaker: '김', timestamp: '00:00:12', text: '오늘 회의를 시작하겠습니다. 먼저 Q3 실적을 검토하고 Q4 계획을 논의하겠습니다.' },
            {
                speaker: 'J',
                timestamp: '00:02:45',
                text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.',
            },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパート너シップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
        aiCoach: q3Coach,
    },
    {
        id: 15,
        type: 'minutes',
        title: '글로벌 마케팅 전략 회의',
        isStarred: false,
        date: '2025-09-24',
        duration: '45분',
        participants: 3,
        aiSummary: {
            decisions: ['10월 중 독일 베를린에서 파일럿 캠페인 시작', '제품 현지화를 위해 유럽어권 인터페이스 개발'],
            actionItems: [
                { owner: '이영희', task: '베를린 캠페인 장소 최종 확정', deadline: '마감: 9월 30일' },
                { owner: '박민수', task: '현지화 디자인팀 구성 및 Kick-off', deadline: '마감: 10월 5일' },
            ],
        },
        topics: ['유럽 시장', '캠페인', '현지화'],
        transcript: [
            { speaker: '이', timestamp: '00:01:05', text: '유럽 시장 진출을 위한 초기 전략을 논의하겠습니다.' },
            { speaker: 'P', timestamp: '00:03:10', text: '독일 시장이 가장 매력적으로 보입니다. 초기에는 베를린에 집중하는 것이 어떻습니까?' },
            { speaker: 'J', timestamp: '00:06:55', text: 'Localization of the app interface is critical for user adoption in European countries.' },
        ],
        aiCoach: globalCoach,
    },
    {
        id: 16,
        type: 'minutes',
        title: '2025 Q3 사업 계획 회의',
        isStarred: true,
        date: '2025-09-26',
        duration: '1시간 15분',
        participants: 4,
        aiSummary: {
            decisions: ['Q4 아시아 시장 진출을 위한 예산 300만 달러 승인', '신제품 출시일을 2025년 12월 15일로 확정', '마케팅팀 3명 추가 채용 결정'],
            actionItems: [
                { owner: '김철수', task: '시장 조사 보고서 작성', deadline: '마감: 10월 5일' },
                { owner: 'John Smith', task: '파트너십 계약서 초안 준비', deadline: '마감: 10월 10일' },
                { owner: '田中太郎', task: '일본 시장 진출 전략 발표', deadline: '마감: 10월 8일' },
            ],
        },
        topics: ['예산', '마케팅', '인력 채용', '시장 진출'],
        transcript: [
            { speaker: '김', timestamp: '00:00:12', text: '오늘 회의를 시작하겠습니다. 먼저 Q3 실적을 검토하고 Q4 계획을 논의하겠습니다.' },
            {
                speaker: 'J',
                timestamp: '00:02:45',
                text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.',
            },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパート너シップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
        aiCoach: q3Coach,
    },
    {
        id: 17,
        type: 'minutes',
        title: '글로벌 마케팅 전략 회의',
        isStarred: false,
        date: '2025-09-24',
        duration: '45분',
        participants: 3,
        aiSummary: {
            decisions: ['10월 중 독일 베를린에서 파일럿 캠페인 시작', '제품 현지화를 위해 유럽어권 인터페이스 개발'],
            actionItems: [
                { owner: '이영희', task: '베를린 캠페인 장소 최종 확정', deadline: '마감: 9월 30일' },
                { owner: '박민수', task: '현지화 디자인팀 구성 및 Kick-off', deadline: '마감: 10월 5일' },
            ],
        },
        topics: ['유럽 시장', '캠페인', '현지화'],
        transcript: [
            { speaker: '이', timestamp: '00:01:05', text: '유럽 시장 진출을 위한 초기 전략을 논의하겠습니다.' },
            { speaker: 'P', timestamp: '00:03:10', text: '독일 시장이 가장 매력적으로 보입니다. 초기에는 베를린에 집중하는 것이 어떻습니까?' },
            { speaker: 'J', timestamp: '00:06:55', text: 'Localization of the app interface is critical for user adoption in European countries.' },
        ],
        aiCoach: globalCoach,
    },
    {
        id: 18,
        type: 'minutes',
        title: '2025 Q3 사업 계획 회의',
        isStarred: true,
        date: '2025-09-26',
        duration: '1시간 15분',
        participants: 4,
        aiSummary: {
            decisions: ['Q4 아시아 시장 진출을 위한 예산 300만 달러 승인', '신제품 출시일을 2025년 12월 15일로 확정', '마케팅팀 3명 추가 채용 결정'],
            actionItems: [
                { owner: '김철수', task: '시장 조사 보고서 작성', deadline: '마감: 10월 5일' },
                { owner: 'John Smith', task: '파트너십 계약서 초안 준비', deadline: '마감: 10월 10일' },
                { owner: '田中太郎', task: '일본 시장 진출 전략 발표', deadline: '마감: 10월 8일' },
            ],
        },
        topics: ['예산', '마케팅', '인력 채용', '시장 진출'],
        transcript: [
            { speaker: '김', timestamp: '00:00:12', text: '오늘 회의를 시작하겠습니다. 먼저 Q3 실적을 검토하고 Q4 계획을 논의하겠습니다.' },
            {
                speaker: 'J',
                timestamp: '00:02:45',
                text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.',
            },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパート너シップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
        aiCoach: q3Coach,
    },
    {
        id: 19,
        type: 'minutes',
        title: '글로벌 마케팅 전략 회의',
        isStarred: false,
        date: '2025-09-24',
        duration: '45분',
        participants: 3,
        aiSummary: {
            decisions: ['10월 중 독일 베를린에서 파일럿 캠페인 시작', '제품 현지화를 위해 유럽어권 인터페이스 개발'],
            actionItems: [
                { owner: '이영희', task: '베를린 캠페인 장소 최종 확정', deadline: '마감: 9월 30일' },
                { owner: '박민수', task: '현지화 디자인팀 구성 및 Kick-off', deadline: '마감: 10월 5일' },
            ],
        },
        topics: ['유럽 시장', '캠페인', '현지화'],
        transcript: [
            { speaker: '이', timestamp: '00:01:05', text: '유럽 시장 진출을 위한 초기 전략을 논의하겠습니다.' },
            { speaker: 'P', timestamp: '00:03:10', text: '독일 시장이 가장 매력적으로 보입니다. 초기에는 베를린에 집중하는 것이 어떻습니까?' },
            { speaker: 'J', timestamp: '00:06:55', text: 'Localization of the app interface is critical for user adoption in European countries.' },
        ],
        aiCoach: globalCoach,
    },
    {
        id: 20,
        type: 'minutes',
        title: '2025 Q3 사업 계획 회의',
        isStarred: true,
        date: '2025-09-26',
        duration: '1시간 15분',
        participants: 4,
        aiSummary: {
            decisions: ['Q4 아시아 시장 진출을 위한 예산 300만 달러 승인', '신제품 출시일을 2025년 12월 15일로 확정', '마케팅팀 3명 추가 채용 결정'],
            actionItems: [
                { owner: '김철수', task: '시장 조사 보고서 작성', deadline: '마감: 10월 5일' },
                { owner: 'John Smith', task: '파트너십 계약서 초안 준비', deadline: '마감: 10월 10일' },
                { owner: '田中太郎', task: '일본 시장 진출 전략 발표', deadline: '마감: 10월 8일' },
            ],
        },
        topics: ['예산', '마케팅', '인력 채용', '시장 진출'],
        transcript: [
            { speaker: '김', timestamp: '00:00:12', text: '오늘 회의를 시작하겠습니다. 먼저 Q3 실적을 검토하고 Q4 계획을 논의하겠습니다.' },
            {
                speaker: 'J',
                timestamp: '00:02:45',
                text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.',
            },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパート너シップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
        aiCoach: q3Coach,
    },
    {
        id: 21,
        type: 'minutes',
        title: '글로벌 마케팅 전략 회의',
        isStarred: false,
        date: '2025-09-24',
        duration: '45분',
        participants: 3,
        aiSummary: {
            decisions: ['10월 중 독일 베를린에서 파일럿 캠페인 시작', '제품 현지화를 위해 유럽어권 인터페이스 개발'],
            actionItems: [
                { owner: '이영희', task: '베를린 캠페인 장소 최종 확정', deadline: '마감: 9월 30일' },
                { owner: '박민수', task: '현지화 디자인팀 구성 및 Kick-off', deadline: '마감: 10월 5일' },
            ],
        },
        topics: ['유럽 시장', '캠페인', '현지화'],
        transcript: [
            { speaker: '이', timestamp: '00:01:05', text: '유럽 시장 진출을 위한 초기 전략을 논의하겠습니다.' },
            { speaker: 'P', timestamp: '00:03:10', text: '독일 시장이 가장 매력적으로 보입니다. 초기에는 베를린에 집중하는 것이 어떻습니까?' },
            { speaker: 'J', timestamp: '00:06:55', text: 'Localization of the app interface is critical for user adoption in European countries.' },
        ],
        aiCoach: globalCoach,
    },
];
