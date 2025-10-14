import React from 'react';
import { AlertTriangle } from 'lucide-react';

// --- 페이지 내에서 사용할 재사용 UI 컴포넌트 ---

// 섹션 카드를 위한 컴포넌트
const SettingsCard = ({ title, description, children, danger = false }) => {
  const borderColor = danger ? 'border-red-500/50' : 'border-slate-200/80';
  const bgColor = danger ? 'bg-red-50/50' : 'bg-white';

  return (
    <section className={`${bgColor} border ${borderColor} rounded-xl shadow-sm`}>
      <div className="p-8 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
};

// --- 메인 보안 설정 페이지 컴포넌트 ---

const SecuritySettings = () => {
  return (
    <div className="space-y-12">
      {/* 1. 비밀번호 변경 카드 */}
      <SettingsCard
        title="비밀번호 변경"
        description="계정 보안을 위해 정기적으로 비밀번호를 변경하세요."
      >
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div className="md:col-span-1">
              <label htmlFor="current-password" className="block text-sm font-medium text-slate-800">현재 비밀번호</label>
            </div>
            <div className="md:col-span-2">
              <input type="password" id="current-password" className="block w-full px-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm transition duration-150 ease-in-out focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-800">새 비밀번호</label>
            </div>
            <div className="md:col-span-2">
              <input type="password" id="new-password" className="block w-full px-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm transition duration-150 ease-in-out focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
            </div>
            
            <div className="md:col-span-1">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-800">새 비밀번호 확인</label>
            </div>
            <div className="md:col-span-2">
              <input type="password" id="confirm-password" className="block w-full px-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm transition duration-150 ease-in-out focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end rounded-b-xl">
          <button type="button" className="inline-flex justify-center rounded-lg border border-transparent bg-slate-800 py-2 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2">
            비밀번호 변경
          </button>
        </div>
      </SettingsCard>

      {/* 2. 활성 세션 카드 */}
      <SettingsCard
        title="활성 세션"
        description="다른 기기에서 로그인한 세션을 관리하세요."
      >
        <div className="divide-y divide-slate-200">
          {/* 현재 세션 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">Chrome on Windows</h3>
              <p className="text-sm text-slate-500">서울, 대한민국 • 현재 세션</p>
            </div>
            <span className="text-xs font-medium bg-teal-100 text-teal-700 py-1 px-3 rounded-full">활성</span>
          </div>

          {/* 다른 세션 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">Safari on iPhone</h3>
              <p className="text-sm text-slate-500">서울, 대한민국 • 2시간 전</p>
            </div>
            <button type="button" className="text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors duration-200 self-start sm:self-center">
              로그아웃
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* 3. 위험 영역 카드 */}
      <SettingsCard
        title="위험 영역"
        description="계정 삭제 및 데이터 관리"
        danger={true}
      >
        <div className="p-8 space-y-6">
          <div className="bg-red-100/50 border border-red-400/50 text-red-800 p-4 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-sm">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-600">계정 데이터를 다운로드하거나 계정을 영구적으로 삭제합니다.</p>
            <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
              <button type="button" className="inline-flex justify-center rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                데이터 다운로드
              </button>
              <button type="button" className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

export default SecuritySettings