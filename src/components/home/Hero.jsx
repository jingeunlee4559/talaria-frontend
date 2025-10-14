import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 컴파일 오류를 해결하기 위해 react-icons/fi 대신 이모지(Emoji)로 대체했습니다.
// import { FiMic, FiSend } from 'react-icons/fi'; 

const Hero = () => {
    // 현재 선택된 퀵 프레이즈 (예: '번역할게요') 상태
    const [selectedPhrase, setSelectedPhrase] = useState('');
    // 직접 입력 필드의 내용 상태
    const [inputPhrase, setInputPhrase] = useState(''); 

    // 퀵 프레이즈 버튼 클릭 핸들러
    const handlePhraseClick = (phrase) => {
        setSelectedPhrase(phrase);
        setInputPhrase(''); // 퀵 프레이즈 선택 시 입력 필드 초기화
    };

      const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/Register");
  };

    // 데모를 위한 정적 번역 데이터 (실제 번역 API 호출이 아닌 상태 변화만 시뮬레이션)
    const staticTranslations = {
        '번역할게요': {
            'English': 'I will translate',
            '日本語': '翻訳します',
            '中文': '我会翻译',
            'Français': 'Je vais traduire',
        },
        '감사합니다': {
            'English': 'Thank you',
            '日本語': 'ありがとうございます',
            '中文': '谢谢',
            'Français': 'Merci',
        },
        '회의 시작하였습니다': {
            'English': 'The meeting has started',
            '日本語': '会議が始まりました',
            '中文': '会议已开始',
            'Français': 'La réunion a commencé',
        }
    };
    
    // UI에 표시할 문구와 번역 세트를 결정
    const displayContent = selectedPhrase || inputPhrase;
    // 선택된 퀵 프레이즈가 staticTranslations에 정의되어 있으면 해당 번역 세트를 사용합니다.
    const displayTranslations = selectedPhrase ? staticTranslations[selectedPhrase] : null;

    return (
        // [수정] w-screen과 left-1/2 -translate-x-1/2를 사용하여 부모의 제약을 무시하고 화면 전체 너비를 꽉 채웁니다.
        // [수정] py-12 (패딩)와 이전 배경색(from/to)을 제거했습니다.
        <section className="relative w-screen left-1/2 -translate-x-1/2 min-h-screen bg-white flex items-center justify-center font-['Inter'] overflow-hidden">
            
            {/* [핵심] 배경 동영상 요소: absolute, w-full, h-full, object-cover를 사용해 화면 꽉 채우기 */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline // iOS에서 자동 재생을 위해 필요
                // absolute: 위치 고정 | w-full h-full: 부모 크기 100% | object-cover: 화면 꽉 채우기
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-20"
            >
                {/* 동영상 파일 경로를 확인해주세요. */}
                <source src="/video/back2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* 기존 콘텐츠: z-index를 높여 동영상 위에 표시되도록 함 */}
            {/* 컬럼 간격(gap-16 -> gap-12)을 줄여 전체 콘텐츠를 압축 */}
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10"> {/* z-10 추가 */}
                
                {/* 왼쪽 텍스트 영역 (Hero Text) - 애니메이션 효과 추가 */}
                <div className="text-center md:text-left animate-in fade-in slide-in-from-left duration-1000">
                    <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-snug tracking-tight">
                        언어의 장벽을 넘어, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            세계로 연결합니다
                        </span>
                    </h2>
                    <p className="mt-5 text-xl text-gray-600 max-w-lg md:max-w-none mx-auto">
                        실시간 영상 번역과 AI 회의록으로 글로벌 비즈니스 커뮤니케이션을 혁신하세요.
                    </p>
                    <div className="mt-8 flex justify-center md:justify-start">
                        <button    onClick={handleStartClick} className="bg-purple-600 text-white font-bold text-lg py-3 px-8 rounded-full shadow-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 ease-in-out">
                            무료로 시작하기
                        </button>
                    </div>
                </div>

                {/* 오른쪽 번역 채팅 UI (Interactive Card) - 강조된 디자인 */}
                <div className="bg-white p-7 rounded-3xl shadow-2xl shadow-purple-200 border border-purple-100 max-w-lg mx-auto w-full transform hover:shadow-3xl transition-shadow duration-300 ease-in-out">
                    <p className="font-bold text-purple-700 mb-5 text-xl flex items-center">
                        <span className="mr-2 text-2xl">💬</span> 실시간 번역 체험하기
                    </p>
                    
                    {/* 퀵 프레이즈 버튼 영역 */}
                    <div className="space-y-3 mb-5">
                        <p className="text-sm text-gray-500 font-medium">아래 문구를 선택하거나 입력해보세요</p>
                        <div className="flex space-x-2">
                            {/* 모든 퀵 프레이즈가 클릭 시 번역 결과를 표시하도록 수정 */}
                            {['번역할게요', '감사합니다', '회의 시작하였습니다'].map((phrase) => (
                                <button 
                                    key={phrase}
                                    onClick={() => handlePhraseClick(phrase)}
                                    // 선택된 상태에 따라 배경색과 폰트색을 변경
                                    className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-md 
                                        ${selectedPhrase === phrase 
                                            ? 'bg-purple-600 text-white shadow-purple-400/50 hover:bg-purple-700 transform scale-105' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}
                                >
                                    {phrase}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* 선택/입력된 문구 표시 영역 (선택 시 입력된 것처럼 보임) */}
                    {displayContent && (
                        <div className="mb-5 p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-inner">
                            <p className="font-medium text-lg text-purple-800">{displayContent}</p>
                        </div>
                    )}

                    {/* 번역 결과 영역: displayTranslations가 있을 때만 표시 (즉, 퀵 프레이즈 선택 시) */}
                    {displayTranslations && (
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {/* 정적 번역 데이터를 순회하며 표시 */}
                            {Object.entries(displayTranslations).map(([language, translation]) => (
                                <div key={language} className="relative p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-transform duration-200 hover:scale-[1.02]">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">{language}</p>
                                    <p className="font-bold text-gray-800 text-md">{translation}</p>
                                    {/* 일본어에만 빨간 점을 표시하는 예시 */}
                                    {language === '日本語' && (
                                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 마이크 및 전송 버튼이 포함된 입력창 */}
                    <div className="relative flex items-center mt-6">
                        <input 
                            type="text" 
                            placeholder="직접 입력하세요..." 
                            value={inputPhrase}
                            onChange={(e) => {
                                setInputPhrase(e.target.value);
                                setSelectedPhrase(''); // 사용자가 직접 입력 시 퀵 프레이즈 선택 해제
                            }}
                            className="w-full pl-12 pr-16 py-3 border-2 border-purple-300 rounded-full focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-gray-800 placeholder-gray-400"
                        />
                        {/* FiMic 아이콘 대신 이모지 사용 */}
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 text-xl cursor-pointer hover:scale-110 transition-transform">🎙️</span>
                        
                        {/* FiSend 아이콘 (전송 버튼) 대신 이모지 사용 */}
                        <button 
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 p-3 rounded-full text-white hover:bg-purple-700 transition-colors shadow-lg transform hover:rotate-6 active:scale-90"
                            onClick={() => {
                                // 직접 입력한 문구를 선택된 문구처럼 처리
                                if (inputPhrase.trim()) {
                                    // 실제로는 이 시점에 번역 API를 호출해야 합니다.
                                    setSelectedPhrase(inputPhrase);
                                    setInputPhrase('');
                                }
                            }}
                        >
                            <span className="text-lg">➡️</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
