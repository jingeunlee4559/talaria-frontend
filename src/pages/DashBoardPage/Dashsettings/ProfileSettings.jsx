import React, { useContext, useEffect, useState } from 'react';
import api from '../../../axios';
import Swal from 'sweetalert2';
import { UserContext } from '../../../contexts/UserContext';

const LANG_OPTIONS = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: '영어' },
    { code: 'ja', label: '일본어' },
    { code: 'zh', label: '중국어' },
];

const INDUSTRY_OPTIONS = ['기술/IT', '법률', '금융/보험'];
const DEFAULT_COMPANY = 'Talaria Labs';

const ProfileSettings = () => {
    // ✅ setUser 추가
    const { user, setUser } = useContext(UserContext);

    const [autoDetect, setAutoDetect] = useState(true);
    const [liveCaptions, setLiveCaptions] = useState(true);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [company, setCompany] = useState(DEFAULT_COMPANY);
    const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
    const [locale, setLocale] = useState(['ko', 'en', 'ja', 'zh'].includes(user?.locale) ? user?.locale : 'ko');
    console.log(locale, 'dsfsdfsdflocale');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!user?.userId) return;
                const { data } = await api.get(`/api/users/${user.userId}`);
                if (data) {
                    setName(data.name ?? name);
                    setEmail(data.email ?? email);
                    const serverLocale = data.locale;
                    const normalized = ['ko', 'en', 'ja', 'zh'].includes(serverLocale) ? serverLocale : locale;
                    setLocale(normalized);
                }
            } catch (err) {
                console.warn('GET /api/users/{id} 실패: ', err);
            }
        };
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId]);

    const handleSave = async () => {
        try {
            if (!user?.userId) {
                Swal.fire({
                    icon: 'error',
                    title: '사용자 정보 없음',
                    text: '로그인이 필요합니다.',
                });
                return;
            }

            const payload = {
                email,
                name,
                locale,
                company,
                industry,
                settings: {
                    autoDetect,
                    liveCaptions,
                },
            };

            await api.patch(`/api/users/${user.userId}`, payload);

            // ✅ UserContext + localStorage 동기화
            const updatedUser = {
                ...user,
                name,
                email,
                locale,
            };
            setUser(updatedUser);
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

            Swal.fire({
                icon: 'success',
                title: '변경사항 저장 완료',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error('PUT /api/users/{id} 실패: ', err);
            Swal.fire({
                icon: 'error',
                title: '저장 실패',
                text: '네트워크 또는 서버 오류가 발생했습니다.',
            });
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto py-10 px-4">
                <div className="mt-2 space-y-12">
                    {/* 기본 정보 */}
                    <section className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
                        <div className="p-8 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">기본 정보</h2>
                            <p className="mt-1 text-sm text-slate-500">계정의 기본 정보를 관리합니다.</p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                <div className="md:col-span-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-800">
                                        이름
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-800">
                                        이메일
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label htmlFor="company" className="block text-sm font-medium text-slate-800">
                                        회사명
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        id="company"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label htmlFor="industry" className="block text-sm font-medium text-slate-800">
                                        업종
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <select
                                        id="industry"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    >
                                        {INDUSTRY_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-2 text-xs text-slate-500">업종 설정은 번역 정확도에 영향을 줄 수 있습니다.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end rounded-b-xl">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex justify-center rounded-lg border border-transparent bg-slate-800 py-2 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                변경사항 저장
                            </button>
                        </div>
                    </section>

                    {/* 언어 및 번역 */}
                    <section className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
                        <div className="p-8 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">언어 및 번역</h2>
                            <p className="mt-1 text-sm text-slate-500">인터페이스 언어 및 실시간 번역 기능을 설정합니다.</p>
                        </div>

                        <div className="divide-y divide-slate-200">
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 items-center">
                                <div className="md:col-span-1 mb-2 md:mb-0">
                                    <label htmlFor="language" className="text-sm font-medium text-slate-800">
                                        인터페이스 언어
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <select
                                        id="language"
                                        value={locale}
                                        onChange={(e) => setLocale(e.target.value)}
                                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    >
                                        {LANG_OPTIONS.map((opt) => (
                                            <option key={opt.code} value={opt.code}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 items-center">
                                <div className="md:col-span-2 mb-2 md:mb-0">
                                    <h3 className="text-sm font-medium text-slate-800">자동 언어 감지</h3>
                                    <p className="text-sm text-slate-500">회의 중 자동으로 발언 언어를 감지합니다.</p>
                                </div>
                                <div className="md:col-span-1 flex justify-start md:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setAutoDetect(!autoDetect)}
                                        className={`${
                                            autoDetect ? 'bg-indigo-600' : 'bg-slate-300'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        role="switch"
                                        aria-checked={autoDetect}
                                    >
                                        <span
                                            className={`${
                                                autoDetect ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 items-center">
                                <div className="md:col-span-2 mb-2 md:mb-0">
                                    <h3 className="text-sm font-medium text-slate-800">실시간 자막</h3>
                                    <p className="text-sm text-slate-500">회의 중 실시간 번역 자막을 표시합니다.</p>
                                </div>
                                <div className="md:col-span-1 flex justify-start md:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setLiveCaptions(!liveCaptions)}
                                        className={`${
                                            liveCaptions ? 'bg-indigo-600' : 'bg-slate-300'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        role="switch"
                                        aria-checked={liveCaptions}
                                    >
                                        <span
                                            className={`${
                                                liveCaptions ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 사용 중인 locale 코드 보기(디버그용, 필요 없으면 제거) */}
                    {/* <pre className="text-xs text-slate-500">{JSON.stringify({ locale, email, name, company, industry, autoDetect, liveCaptions }, null, 2)}</pre> */}
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
