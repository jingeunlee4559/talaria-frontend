// Navs.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink, scroller } from 'react-scroll';

const Navs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (target) => {
    if (location.pathname !== '/') {
      navigate('/');
      // 약간의 지연 후 스크롤 (라우팅 완료 후 작동)
      setTimeout(() => {
        scroller.scrollTo(target, {
          smooth: true,
          duration: 600,
          offset: -80,
        });
      }, 300);
    } else {
      scroller.scrollTo(target, {
        smooth: true,
        duration: 600,
        offset: -80,
      });
    }
  };
  
    const handleStartClick = () => {
      navigate("/Register");
    };
  

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* 로고 */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
            Talaria
          </Link>
          <span className="text-sm text-gray-500 hidden md:block">
            AI 기반 실시간 번역 서비스
          </span>
        </div>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center space-x-8">
          <span
            onClick={() => handleScroll('features')}
            className="text-gray-600 hover:text-purple-600 cursor-pointer"
          >
            기능
          </span>
          <span
            onClick={() => handleScroll('corefeatures')}
            className="text-gray-600 hover:text-purple-600 cursor-pointer"
          >
            사용방법
          </span>
        </nav>

        {/* 로그인 및 시작 */}
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors">
            로그인
          </Link>
          <button onClick={handleStartClick} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
            무료로 시작하기
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navs;
