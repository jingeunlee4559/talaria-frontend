import React, { useEffect, useMemo, useState } from 'react';
import DocumentModal from '../../components/dashboard/dashDoc/DocumentModal';
import { SearchIcon, FilterIcon, StarIcon, DownloadIcon } from '../../components/icons/icons';
import MeetingMinutesItem from '../../components/dashboard/dashDoc/MeetingMinutesItem';
import DocumentItem from '../../components/dashboard/dashDoc/DocumentItem';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';

// --- 목업 데이터 (변동 없음) ---
const documents = [
    {
        id: 1,
        type: 'document',
        title: '파트너십 계약서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-27',
        size: '2.4 MB',
        author: '김철수',
        originalContent:
            "This Partnership Agreement ('Agreement') is entered into as of September 27, 2025, by and between: Party A: TechCorp International Ltd. Address: 123 Business Street, San Francisco, CA 94105. Party B: Innovation Korea Co., Ltd. Address: 456 Gangnam-daero, Seoul, South Korea. The purpose of this agreement is to establish a cooperative framework for joint development and marketing of future products.",
        translatedContent:
            "본 파트너십 계약('본 계약')은 2025년 9월 27일부로 다음 당사자 간에 체결됩니다: 당사자 A: TechCorp International Ltd. 주소: 123 Business Street, San Francisco, CA 94105. 당사자 B: 이노베이션 코리아 주식회사. 주소: 서울특별시 강남대로 456. 본 계약의 목적은 향후 제품의 공동 개발 및 마케팅을 위한 협력 체계를 구축하는 것입니다.",
    },
    {
        id: 2,
        type: 'document',
        title: '제품 사양서',
        isStarred: false,
        fromLang: '한국어',
        toLang: '영어',
        date: '2025-09-25',
        size: '1.8 MB',
        author: '이영희',
        originalContent: '제품명: 제미니 AI 프로세서. 주요 기능: 초당 100조 회의 연산 능력, 저전력 설계. 개발 팀: AI솔루션팀. 출시 예정일: 2026년 1월.',
        translatedContent:
            'Product Name: Gemini AI Processor. Key Features: 100 trillion operations per second, low power design. Development Team: AI Solution Team. Estimated Release Date: January 2026.',
    },
    {
        id: 3,
        type: 'document',
        title: '마케팅 전략 검토 보고서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-23',
        size: '3.2 MB',
        author: '박민수',
        originalContent:
            'The Q4 marketing campaign will focus primarily on digital channels, specifically targeting Gen Z users through short-form video content. Budget allocation: 60% digital ads, 30% influencer collaborations, 10% traditional media.',
        translatedContent:
            '4분기 마케팅 캠페인은 주로 디지털 채널에 집중하며, 특히 짧은 형식의 비디오 콘텐츠를 통해 Gen Z 사용자를 타겟팅할 것입니다. 예산 할당: 디지털 광고 60%, 인플루언서 협업 30%, 전통 미디어 10%.',
    },
    {
        id: 4,
        type: 'document',
        title: '파트너십 계약서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-27',
        size: '2.4 MB',
        author: '김철수',
        originalContent:
            "This Partnership Agreement ('Agreement') is entered into as of September 27, 2025, by and between: Party A: TechCorp International Ltd. Address: 123 Business Street, San Francisco, CA 94105. Party B: Innovation Korea Co., Ltd. Address: 456 Gangnam-daero, Seoul, South Korea. The purpose of this agreement is to establish a cooperative framework for joint development and marketing of future products.",
        translatedContent:
            "본 파트너십 계약('본 계약')은 2025년 9월 27일부로 다음 당사자 간에 체결됩니다: 당사자 A: TechCorp International Ltd. 주소: 123 Business Street, San Francisco, CA 94105. 당사자 B: 이노베이션 코리아 주식회사. 주소: 서울특별시 강남대로 456. 본 계약의 목적은 향후 제품의 공동 개발 및 마케팅을 위한 협력 체계를 구축하는 것입니다.",
    },
    {
        id: 5,
        type: 'document',
        title: '제품 사양서',
        isStarred: false,
        fromLang: '한국어',
        toLang: '영어',
        date: '2025-09-25',
        size: '1.8 MB',
        author: '이영희',
        originalContent: '제품명: 제미니 AI 프로세서. 주요 기능: 초당 100조 회의 연산 능력, 저전력 설계. 개발 팀: AI솔루션팀. 출시 예정일: 2026년 1월.',
        translatedContent:
            'Product Name: Gemini AI Processor. Key Features: 100 trillion operations per second, low power design. Development Team: AI Solution Team. Estimated Release Date: January 2026.',
    },
    {
        id: 6,
        type: 'document',
        title: '마케팅 전략 검토 보고서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-23',
        size: '3.2 MB',
        author: '박민수',
        originalContent:
            'The Q4 marketing campaign will focus primarily on digital channels, specifically targeting Gen Z users through short-form video content. Budget allocation: 60% digital ads, 30% influencer collaborations, 10% traditional media.',
        translatedContent:
            '4분기 마케팅 캠페인은 주로 디지털 채널에 집중하며, 특히 짧은 형식의 비디오 콘텐츠를 통해 Gen Z 사용자를 타겟팅할 것입니다. 예산 할당: 디지털 광고 60%, 인플루언서 협업 30%, 전통 미디어 10%.',
    },
    {
        id: 7,
        type: 'document',
        title: '파트너십 계약서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-27',
        size: '2.4 MB',
        author: '김철수',
        originalContent:
            "This Partnership Agreement ('Agreement') is entered into as of September 27, 2025, by and between: Party A: TechCorp International Ltd. Address: 123 Business Street, San Francisco, CA 94105. Party B: Innovation Korea Co., Ltd. Address: 456 Gangnam-daero, Seoul, South Korea. The purpose of this agreement is to establish a cooperative framework for joint development and marketing of future products.",
        translatedContent:
            "본 파트너십 계약('본 계약')은 2025년 9월 27일부로 다음 당사자 간에 체결됩니다: 당사자 A: TechCorp International Ltd. 주소: 123 Business Street, San Francisco, CA 94105. 당사자 B: 이노베이션 코리아 주식회사. 주소: 서울특별시 강남대로 456. 본 계약의 목적은 향후 제품의 공동 개발 및 마케팅을 위한 협력 체계를 구축하는 것입니다.",
    },
    {
        id: 8,
        type: 'document',
        title: '제품 사양서',
        isStarred: false,
        fromLang: '한국어',
        toLang: '영어',
        date: '2025-09-25',
        size: '1.8 MB',
        author: '이영희',
        originalContent: '제품명: 제미니 AI 프로세서. 주요 기능: 초당 100조 회의 연산 능력, 저전력 설계. 개발 팀: AI솔루션팀. 출시 예정일: 2026년 1월.',
        translatedContent:
            'Product Name: Gemini AI Processor. Key Features: 100 trillion operations per second, low power design. Development Team: AI Solution Team. Estimated Release Date: January 2026.',
    },
    {
        id: 9,
        type: 'document',
        title: '마케팅 전략 검토 보고서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-23',
        size: '3.2 MB',
        author: '박민수',
        originalContent:
            'The Q4 marketing campaign will focus primarily on digital channels, specifically targeting Gen Z users through short-form video content. Budget allocation: 60% digital ads, 30% influencer collaborations, 10% traditional media.',
        translatedContent:
            '4분기 마케팅 캠페인은 주로 디지털 채널에 집중하며, 특히 짧은 형식의 비디오 콘텐츠를 통해 Gen Z 사용자를 타겟팅할 것입니다. 예산 할당: 디지털 광고 60%, 인플루언서 협업 30%, 전통 미디어 10%.',
    },
    {
        id: 10,
        type: 'document',
        title: '파트너십 계약서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-27',
        size: '2.4 MB',
        author: '김철수',
        originalContent:
            "This Partnership Agreement ('Agreement') is entered into as of September 27, 2025, by and between: Party A: TechCorp International Ltd. Address: 123 Business Street, San Francisco, CA 94105. Party B: Innovation Korea Co., Ltd. Address: 456 Gangnam-daero, Seoul, South Korea. The purpose of this agreement is to establish a cooperative framework for joint development and marketing of future products.",
        translatedContent:
            "본 파트너십 계약('본 계약')은 2025년 9월 27일부로 다음 당사자 간에 체결됩니다: 당사자 A: TechCorp International Ltd. 주소: 123 Business Street, San Francisco, CA 94105. 당사자 B: 이노베이션 코리아 주식회사. 주소: 서울특별시 강남대로 456. 본 계약의 목적은 향후 제품의 공동 개발 및 마케팅을 위한 협력 체계를 구축하는 것입니다.",
    },
    {
        id: 11,
        type: 'document',
        title: '제품 사양서',
        isStarred: false,
        fromLang: '한국어',
        toLang: '영어',
        date: '2025-09-25',
        size: '1.8 MB',
        author: '이영희',
        originalContent: '제품명: 제미니 AI 프로세서. 주요 기능: 초당 100조 회의 연산 능력, 저전력 설계. 개발 팀: AI솔루션팀. 출시 예정일: 2026년 1월.',
        translatedContent:
            'Product Name: Gemini AI Processor. Key Features: 100 trillion operations per second, low power design. Development Team: AI Solution Team. Estimated Release Date: January 2026.',
    },
    {
        id: 12,
        type: 'document',
        title: '마케팅 전략 검토 보고서',
        isStarred: true,
        fromLang: '영어',
        toLang: '한국어',
        date: '2025-09-23',
        size: '3.2 MB',
        author: '박민수',
        originalContent:
            'The Q4 marketing campaign will focus primarily on digital channels, specifically targeting Gen Z users through short-form video content. Budget allocation: 60% digital ads, 30% influencer collaborations, 10% traditional media.',
        translatedContent:
            '4분기 마케팅 캠페인은 주로 디지털 채널에 집중하며, 특히 짧은 형식의 비디오 콘텐츠를 통해 Gen Z 사용자를 타겟팅할 것입니다. 예산 할당: 디지털 광고 60%, 인플루언서 협업 30%, 전통 미디어 10%.',
    },
];

const mockMinutes = [
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
            { speaker: 'J', timestamp: '00:02:45', text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.' },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパートナーシップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
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
            { speaker: 'J', timestamp: '00:02:45', text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.' },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパートナーシップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
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
            { speaker: 'J', timestamp: '00:02:45', text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.' },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパートナーシップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
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
            { speaker: 'J', timestamp: '00:02:45', text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.' },
            { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパートナーシップが不可欠です。3社と交渉中です.' },
            { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
            { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' },
        ],
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
    },
];

// --- 재사용 가능한 컴포넌트 ---
const ITEMS_PER_PAGE = 5;

// 메인 탭 버튼 컴포넌트
const TabButton = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-3 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
    >
        {title}
    </button>
);

// 새로운 하위 탭 버튼 컴포넌트
const SubTabButton = ({ title, isActive, onClick }) => (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>
        {title}
    </button>
);

const DocumentList = ({ documents, onItemClick }) => (
    <div className="space-y-3">
        {documents.map((doc) => (
            <DocumentItem key={doc.id} {...doc} onClick={onItemClick} />
        ))}
    </div>
);
const MeetingMinutesList = ({ minutes, onItemClick }) => (
    <div className="space-y-3">
        {minutes.map((minute) => (
            <MeetingMinutesItem key={minute.id} {...minute} onClick={onItemClick} />
        ))}
    </div>
);

// --- 메인 컴포넌트 ---
const DashDocuments = () => {
    const [activeTab, setActiveTab] = useState('번역 문서');
    const [docSubTab, setDocSubTab] = useState('전체'); // 🎯 새로운 하위 탭 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [docCurrentPage, setDocCurrentPage] = useState(1);
    const [minCurrentPage, setMinCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // 검색어나 탭이 바뀔 때 페이지네이션을 1로 리셋
    useEffect(() => {
        setDocCurrentPage(1);
        setMinCurrentPage(1);
    }, [searchTerm, activeTab, docSubTab]); // 🎯 docSubTab이 바뀔 때도 리셋

    // 1. 검색어 필터링
    const filteredDocumentsBySearch = useMemo(() => documents.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

    // 2. 검색 결과에 하위 탭 필터링 적용
    const filteredDocumentsBySubTab = useMemo(() => {
        if (docSubTab === '전체') return filteredDocumentsBySearch;

        // 원문 (Original) 언어로 필터링
        if (docSubTab === '원문') {
            // 원문: 한국어 문서만 필터링 (toLang이 '영어'인 문서)
            return filteredDocumentsBySearch.filter((doc) => doc.toLang === '영어');
        }

        // 번역 (Translated) 언어로 필터링
        if (docSubTab === '번역') {
            // 번역: 한국어 문서만 필터링 (toLang이 '한국어'인 문서)
            return filteredDocumentsBySearch.filter((doc) => doc.toLang === '한국어');
        }

        return filteredDocumentsBySearch;
    }, [docSubTab, filteredDocumentsBySearch]);

    // 3. 회의록 검색 필터링
    const filteredMinutes = useMemo(() => mockMinutes.filter((minute) => minute.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

    // 문서 페이지네이션 로직
    const totalDocPages = Math.ceil(filteredDocumentsBySubTab.length / ITEMS_PER_PAGE);
    const currentDocuments = useMemo(() => {
        const firstPageIndex = (docCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredDocumentsBySubTab.slice(firstPageIndex, firstPageIndex + ITEMS_PER_PAGE);
    }, [docCurrentPage, filteredDocumentsBySubTab]);

    // 회의록 페이지네이션 로직
    const totalMinPages = Math.ceil(filteredMinutes.length / ITEMS_PER_PAGE);
    const currentMinutes = useMemo(() => {
        const firstPageIndex = (minCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredMinutes.slice(firstPageIndex, firstPageIndex + ITEMS_PER_PAGE);
    }, [minCurrentPage, filteredMinutes]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    // 탭 클릭 핸들러: 메인 탭이 바뀌면 하위 탭도 '전체'로 리셋
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setDocSubTab('전체');
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-8xl mx-auto">
                {/* 헤더 */}
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">문서 & 회의록</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요. (Total: {documents.length + mockMinutes.length}건)</p>
                </header>

                {/* 검색 & 버튼 그룹 */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    {/* 검색창 */}
                    <div className="w-full md:flex-grow">
                        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="제목으로 검색..." />
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="flex w-full md:w-auto gap-2">
                        <button className="flex-1 md:flex-none bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md whitespace-nowrap">
                            새 문서 등록
                        </button>
                    </div>
                </div>

                {/* 메인 탭 */}
                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex gap-4 sm:gap-6">
                        <TabButton title="번역 문서" isActive={activeTab === '번역 문서'} onClick={() => handleTabChange('번역 문서')} />
                        <TabButton title="회의록" isActive={activeTab === '회의록'} onClick={() => handleTabChange('회의록')} />
                    </nav>
                </div>

                <main>
                    {activeTab === '번역 문서' && (
                        <>
                            {/* 🎯 번역 문서 하위 탭 */}
                            <div className="flex gap-2 mb-4">
                                <SubTabButton title="전체" isActive={docSubTab === '전체'} onClick={() => setDocSubTab('전체')} />
                                <SubTabButton title="원문" isActive={docSubTab === '번역'} onClick={() => setDocSubTab('번역')} />
                                <SubTabButton title="번역" isActive={docSubTab === '원문'} onClick={() => setDocSubTab('원문')} />
                            </div>

                            {/* 문서 목록 */}
                            {currentDocuments.length > 0 ? (
                                <>
                                    <DocumentList documents={currentDocuments} onItemClick={handleItemClick} />
                                    <Pagination
                                        currentPage={docCurrentPage}
                                        totalPages={totalDocPages}
                                        onPageChange={(page) => {
                                            setDocCurrentPage(page);
                                            window.scrollTo(0, 0);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <p>{searchTerm || docSubTab !== '전체' ? `조건에 맞는 검색 결과가 없습니다.` : '표시할 문서가 없습니다.'}</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === '회의록' && (
                        <>
                            {/* 회의록 목록 */}
                            {currentMinutes.length > 0 ? (
                                <>
                                    <MeetingMinutesList minutes={currentMinutes} onItemClick={handleItemClick} />
                                    <Pagination
                                        currentPage={minCurrentPage}
                                        totalPages={totalMinPages}
                                        onPageChange={(page) => {
                                            setMinCurrentPage(page);
                                            window.scrollTo(0, 0);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <p>{searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '표시할 회의록이 없습니다.'}</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <DocumentModal isOpen={isModalOpen} onClose={handleCloseModal} itemData={selectedItem} />
        </div>
    );
};

export default DashDocuments;
