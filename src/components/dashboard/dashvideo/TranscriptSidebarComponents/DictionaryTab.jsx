// src/components/sidebar/DictionaryTab.jsx
import React from 'react';

const DICTIONARY_DATA = [
    {
        term: '손맛',
        pronunciation: 'Son-mat',
        definition: '레시피만으로는 설명할 수 없는, 요리하는 사람의 정성과 경험이 만들어내는 깊은 맛. "Hand taste".',
    },
    {
        term: '정',
        pronunciation: 'Jeong',
        definition: '단순한 애정이나 동정심을 넘어, 사람들과의 관계 속에서 형성되는 따뜻하고 깊은 유대감.',
    },
    {
        term: '한',
        pronunciation: 'Han',
        definition: '개인적 또는 역사적 고난과 슬픔이 쌓여 응어리진, 한국 문화 특유의 복합적인 정서.',
    },
    {
        term: '눈치',
        pronunciation: 'Nunchi',
        definition: '말로 표현되지 않는 상대방의 기분이나 상황을 빠르고 정확하게 파악하는 능력. "Eye-measure".',
    },
];

const DictionaryTab = () => {
    return (
        <div className="space-y-4">
            {DICTIONARY_DATA.map((item, index) => (
                <div
                    key={index}
                    className="bg-[#3A425A]/80 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                >
                    <div className="flex items-baseline">
                        <h3 className="text-lg font-bold text-white">{item.term}</h3>
                        <span className="ml-2 text-md text-gray-400">({item.pronunciation})</span>
                    </div>
                    <p className="mt-2 text-gray-300 text-sm leading-relaxed">{item.definition}</p>
                </div>
            ))}
        </div>
    );
};

export default DictionaryTab;