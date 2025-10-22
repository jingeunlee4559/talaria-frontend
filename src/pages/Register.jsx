import React from 'react';
import { Mail, Lock, ChevronDown, User, Briefcase, Globe } from 'lucide-react';
import { GoogleIcon } from '../components/icons/icons';
import { Link } from 'react-router-dom';

// 일반 입력 필드를 위한 컴포넌트
const InputField = ({ label, type = 'text', placeholder, icon: Icon }) => (
    <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                placeholder={placeholder}
                // w-full로 모바일에서 너비 전체를 차지하며, 아이콘을 위해 왼쪽 패딩(pl-11)을 줍니다.
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${Icon ? 'pl-11' : ''}`}
            />
            {Icon && (
                // 아이콘 위치 설정
                <div className="absolute left-0 top-0 mt-3 ml-3 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
        </div>
    </div>
);

// 옵션 선택 필드 (Select)를 위한 컴포넌트
const SelectField = ({ label, placeholder, icon: Icon, options }) => (
    <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {/* appearance-none 클래스로 브라우저 기본 드롭다운 스타일을 제거하고 커스텀 아이콘을 사용합니다. */}
            <select
                // 아이콘이 있을 경우 왼쪽 패딩(pl-11)을 추가하고, 없을 경우 pl-4를 사용합니다.
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out appearance-none bg-white text-gray-700 pr-10 ${
                    Icon ? 'pl-11' : 'pl-4'
                }`}
                defaultValue=""
            >
                {/* Placeholder 역할을 하는 첫 번째 옵션. 선택할 수 없도록 설정합니다. */}
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            {/* 왼쪽 아이콘 (옵션) */}
            {Icon && (
                // 아이콘 위치 설정 (왼쪽)
                <div className="absolute left-0 top-0 mt-3 ml-3 text-gray-400 pointer-events-none">
                    <Icon className="w-5 h-5" />
                </div>
            )}

            {/* 드롭다운 화살표 아이콘 (Select의 오른쪽 끝에 배치) */}
            <div className="absolute right-0 top-0 mt-3 mr-3 text-gray-400 pointer-events-none">
                <ChevronDown className="w-5 h-5" />
            </div>
        </div>
    </div>
);

const Register = () => {
    // 국가 옵션 데이터
    const countryOptions = ['대한민국', '일본', '미국', '중국', '잉글랜드'];
    // 업종 옵션 데이터
    const industryOptions = ['IT 및 소프트웨어', '금융 및 보험', '제조업', '교육 및 연구'];

    return (
        // 전체 컨테이너: 모바일(p-4)부터 데스크톱(sm:p-8)까지 반응형 패딩, 화면 중앙 정렬
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 sm:p-5 font-['Inter']">
            <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
                {/* 헤더 및 로고 */}
                <header className="flex flex-col items-center mb-8">
                    <div className="flex items-center space-x-2 mb-2 text-slate-800">
                        {/* Talaria 로고 (간단한 SVG 아이콘) */}
                        <img
                            src="public/img/hermes_logo.jpg"
                            alt="Hermes Logo"
                            className="w-15 h-15 object-cover rounded-xl shadow-lg border border-gray-100"
                            // 로고가 로드되지 않을 경우 대비
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/96x96/f3f4f6/374151?text=Hermes'; // 대체 플레이스홀더
                            }}
                        />
                        <span className="text-3xl font-extrabold">Talaria</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">회원가입</h1>
                    <p className="text-sm text-gray-500 mt-1 text-center">무료로 계정을 만들고 바로 시작하세요</p>
                </header>

                {/* Google 로그인 버튼 */}
                <button className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold bg-white hover:bg-gray-100 transition duration-150 shadow-sm mb-6">
                    <GoogleIcon />
                    Google
                </button>

                {/* 구분선 */}
                <div className="flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">또는</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* 회원가입 폼 */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('Form Submitted');
                    }}
                >
                    {/* 이름 */}
                    <InputField label="이름" placeholder="홍길동" icon={User} />

                    {/* 아이디 (이전의 이메일 필드를 아이디로 변경) */}
                    <InputField label="아이디" type="text" placeholder="아이디를 입력해주세요" icon={Mail} />

                    {/* 비밀번호 */}
                    <InputField label="비밀번호" type="password" placeholder="최소 8자 이상" icon={Lock} />

                    {/* >>> 새로 추가된 비밀번호 확인 필드 <<< */}
                    <InputField label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력해주세요" icon={Lock} />
                    {/* >>> 비밀번호 확인 필드 끝 <<< */}

                    {/* 국가 (선택) - Placeholder 변경 및 Globe 아이콘 추가 */}
                    <SelectField label="국가 (선택)" placeholder="선택해주세요" icon={Globe} options={countryOptions} />

                    {/* 회사명 (선택) */}
                    <InputField label="회사명 (선택)" placeholder="회사명을 입력하세요" icon={Briefcase} />

                    {/* 업종 (선택) - Placeholder 변경 */}
                    <SelectField label="업종 (선택)" placeholder="선택해주세요" options={industryOptions} />

                    {/* 개인정보 동의 문구 */}
                    <p className="text-xs text-gray-500 mt-4 mb-6 leading-relaxed">
                        회원가입을 진행하면{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                            이용약관
                        </a>
                        과{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                            개인정보처리방침
                        </a>
                        에 동의하는 것으로 간주합니다.
                    </p>

                    {/* 계정 만들기 버튼 */}
                    <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition duration-200 font-bold shadow-md">
                        계정 만들기
                    </button>
                </form>

                {/* 로그인 링크 */}
                <div className="text-center mt-6 text-sm">
                    <span className="text-gray-600">이미 계정이 있으신가요?</span>
                    <Link to="/login" className="text-slate-800 font-semibold hover:text-slate-600 ml-2 transition duration-150">
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
