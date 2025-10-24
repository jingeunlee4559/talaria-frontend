import React, { useState } from 'react';
import { EyeIcon, GoogleIcon } from '../components/icons/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios';

// --- 메인 로그인 페이지 컴포넌트 ---
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // form 기본 새로고침 방지
        setError(''); // 이전 에러 초기화

        try {
            const response = await axios.post('/api/users/login', {
                email: email,
                password: password, // ✅ 비밀번호도 함께 보냄 (서버에서 비교용)
            });

            if (response.status === 200) {
                console.log('로그인 성공:', response.data);

                // ✅ 사용자 정보 저장 (JWT 없이 단순 저장)
                sessionStorage.setItem('loggedInUser', JSON.stringify(response.data));

                // ✅ 로그인 성공 후 대시보드 이동
                navigate('/Dashboardhome');
            }
        } catch (err) {
            console.error('로그인 실패:', err);

            if (err.response && err.response.status === 401) {
                setError('아이디 또는 비밀번호가 잘못되었습니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    };

    // **요청하신 버튼을 컴포넌트 내부에서 함수로 정의 (useNavigate 대신 onClick 사용)**
    const NavLinkButton = ({ to, children }) => {
        const handleClick = (e) => {
            e.preventDefault();
            console.log(`Navigating to ${to}`);
            // 현재 환경에서 라우팅 역할을 하는 window.location.href 사용 (실제 React Router 사용 시 useNavigate(to)로 대체)
            // window.location.href = to;
            // alert(`${to} 페이지로 이동을 시도합니다. (실제 이동은 React Router 설정 필요)`); // alert 사용 금지
            console.log(`${to} 페이지로 이동을 시도합니다. (실제 이동은 React Router 설정 필요)`);
        };

        return (
            // button 대신 a 태그를 사용하여 클릭 가능하게 하고, 스타일은 유지
            <a href={to} onClick={handleClick} className="text-gray-600 hover:text-purple-600 font-medium transition">
                {children}
            </a>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* 로그인 폼 컨테이너 */}
            <div className="w-full max-w-sm md:max-w-2xl bg-white p-8 rounded-xl shadow-2xl transition-all duration-300 sm:p-10">
                {/* 헤더/로고 영역 */}
                <div className="flex flex-col items-center mb-10">
                    <img
                        src="public/img/hermes_logo.jpg"
                        alt="Hermes Logo"
                        className="w-24 h-24 object-cover rounded-xl shadow-lg border border-gray-100"
                        // 로고가 로드되지 않을 경우 대비
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/96x96/f3f4f6/374151?text=Hermes'; // 대체 플레이스홀더
                        }}
                    />
                    <h1 className="text-2xl font-bold text-gray-800 mt-4 tracking-tight">Talaria</h1>
                </div>

                {/* 제목 */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800">로그인</h2>
                    <p className="text-sm text-gray-600 mt-1">계정에 로그인하여 서비스를 이용하세요</p>
                </div>

                {/* --- Google 로그인 버튼 --- */}
                <button className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition mb-6">
                    <GoogleIcon />
                    Google 로그인
                </button>

                {/* --- 또는 구분선 --- */}
                <div className="flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">또는</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* --- 이메일/비밀번호 폼 --- */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* 이메일 입력 */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            아이디
                        </label>
                        <input
                            type="text"
                            id="text"
                            placeholder="아이디를 입력해주세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                        />
                    </div>

                    {/* 비밀번호 입력 */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                비밀번호
                            </label>
                            {/* **수정된 부분: useNavigate 역할을 하는 NavLinkButton 사용** */}
                            <NavLinkButton to="/forgot-password">비밀번호를 잊으셨나요?</NavLinkButton>
                        </div>
                        <div className="relative">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                placeholder="비밀번호를 입력해주세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition pr-10"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <EyeIcon isPasswordVisible={isPasswordVisible} onClick={() => setIsPasswordVisible(!isPasswordVisible)} />
                            </div>
                        </div>
                    </div>

                    {/* 로그인 버튼 */}
                    <button type="submit" className="w-full bg-slate-800 text-white p-3 rounded-lg font-semibold hover:bg-slate-900 transition duration-150 shadow-md">
                        로그인
                    </button>
                </form>

                {/* --- 회원가입 링크 --- */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        계정이 없으신가요?
                        {/* **수정된 부분: useNavigate 역할을 하는 NavLinkButton 사용** */}
                        <Link to="/Register" className="ml-1">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
