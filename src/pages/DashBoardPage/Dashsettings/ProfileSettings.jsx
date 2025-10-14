import React, { useState } from 'react';

const ProfileSettings = () => {
  const [autoDetect, setAutoDetect] = useState(true);
  const [liveCaptions, setLiveCaptions] = useState(true);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 너비를 max-w-6xl로 늘리고 전체적인 여백(py)을 키웠습니다. */}


        <div className="mt-10 space-y-12">
              <section className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
                <div className="p-8 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">기본 정보</h2>
                  <p className="mt-1 text-sm text-slate-500">계정의 기본 정보를 관리합니다.</p>
                </div>
                <div className="p-8">
                  {/* 그리드 레이아웃으로 변경하여 라벨과 인풋을 정렬했습니다. */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="md:col-span-1">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-800">이름</label>
                    </div>
                    <div className="md:col-span-2">
                      <input type="text" id="name" defaultValue="홍길동" className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-800">이메일</label>
                    </div>
                    <div className="md:col-span-2">
                      <input type="email" id="email" defaultValue="john@company.com" className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    
                    <div className="md:col-span-1">
                      <label htmlFor="company" className="block text-sm font-medium text-slate-800">회사명</label>
                    </div>
                    <div className="md:col-span-2">
                      <input type="text" id="company" defaultValue="Tech Corp" className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="industry" className="block text-sm font-medium text-slate-800">업종</label>
                    </div>
                    <div className="md:col-span-2">
                      <input type="text" id="industry" defaultValue="기술/IT" className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                      <p className="mt-2 text-xs text-slate-500">업종 설정은 번역 정확도에 영향을 미칩니다.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end rounded-b-xl">
                  <button type="button" className="inline-flex justify-center rounded-lg border border-transparent bg-slate-800 py-2 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    변경사항 저장
                  </button>
                </div>
              </section>

              {/* 언어 설정 카드 */}
              <section className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
                <div className="p-8 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">언어 및 번역</h2>
                  <p className="mt-1 text-sm text-slate-500">인터페이스 언어 및 실시간 번역 기능을 설정합니다.</p>
                </div>
                <div className="divide-y divide-slate-200">
                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 items-center">
                    <div className="md:col-span-1 mb-2 md:mb-0">
                      <label htmlFor="language" className="text-sm font-medium text-slate-800">인터페이스 언어</label>
                    </div>
                    <div className="md:col-span-2">
                      <select id="language" className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                        <option>한국어</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 items-center">
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <h3 className="text-sm font-medium text-slate-800">자동 언어 감지</h3>
                      <p className="text-sm text-slate-500">회의 중 자동으로 발언 언어를 감지합니다.</p>
                    </div>
                    <div className="md:col-span-1 flex justify-start md:justify-end">
                      <button type="button" onClick={() => setAutoDetect(!autoDetect)} className={`${autoDetect ? 'bg-indigo-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`} role="switch" aria-checked={autoDetect}>
                        <span className={`${autoDetect ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                      </button>
                    </div>
                  </div>
                   <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 items-center">
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <h3 className="text-sm font-medium text-slate-800">실시간 자막</h3>
                      <p className="text-sm text-slate-500">회의 중 실시간 번역 자막을 표시합니다.</p>
                    </div>
                    <div className="md:col-span-1 flex justify-start md:justify-end">
                      <button type="button" onClick={() => setLiveCaptions(!liveCaptions)} className={`${liveCaptions ? 'bg-indigo-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`} role="switch" aria-checked={liveCaptions}>
                        <span className={`${liveCaptions ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
        </div>
    </div>
  );
}

export default ProfileSettings