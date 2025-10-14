import React, { useState } from 'react';

// --- 페이지 내에서 사용할 재사용 UI 컴포넌트 ---

// 토글 스위치 UI 컴포넌트
const ToggleSwitch = ({ isEnabled, onToggle }) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(!isEnabled)}
      className={`${
        isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
      role="switch"
      aria-checked={isEnabled}
    >
      <span
        aria-hidden="true"
        className={`${
          isEnabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

// --- 메인 알림 설정 페이지 컴포넌트 ---
const NotificationSettings = () => {

  // 이메일 알림 상태 관리
  const [emailMeetingAlert, setEmailMeetingAlert] = useState(true);
  const [emailTranslationAlert, setEmailTranslationAlert] = useState(true);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(true);

  // 푸시 알림 상태 관리
  const [pushMeetingAlert, setPushMeetingAlert] = useState(false);
  const [pushNewMessage, setPushNewMessage] = useState(true);

  return (
    <div className="space-y-12">
      {/* 1. 이메일 알림 카드 */}
      <section className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-800">이메일 알림</h2>
          <p className="mt-1 text-sm text-slate-500">이메일로 받을 알림을 설정합니다.</p>
        </div>
        <div className="border-t border-slate-200 divide-y divide-slate-200">
          {/* 회의 알림 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">회의 알림</h3>
              <p className="text-sm text-slate-500">예정된 회의 30분 전 알림</p>
            </div>
            <ToggleSwitch isEnabled={emailMeetingAlert} onToggle={setEmailMeetingAlert} />
          </div>

          {/* 번역 완료 알림 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">번역 완료 알림</h3>
              <p className="text-sm text-slate-500">문서 번역이 완료되면 알림</p>
            </div>
            <ToggleSwitch isEnabled={emailTranslationAlert} onToggle={setEmailTranslationAlert} />
          </div>

          {/* 주간 리포트 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">주간 리포트</h3>
              <p className="text-sm text-slate-500">매주 월요일 사용 통계 리포트</p>
            </div>
            <ToggleSwitch isEnabled={emailWeeklyReport} onToggle={setEmailWeeklyReport} />
          </div>
        </div>
      </section>

      {/* 2. 푸시 알림 카드 */}
      <section className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-800">푸시 알림</h2>
          <p className="mt-1 text-sm text-slate-500">브라우저 푸시 알림 설정</p>
        </div>
        <div className="border-t border-slate-200 divide-y divide-slate-200">
          {/* 회의 알림 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">회의 알림</h3>
              <p className="text-sm text-slate-500">회의 시작 알림</p>
            </div>
            <ToggleSwitch isEnabled={pushMeetingAlert} onToggle={setPushMeetingAlert} />
          </div>

          {/* 새 메시지 */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-sm font-medium text-slate-800">새 메시지</h3>
              <p className="text-sm text-slate-500">채팅 메시지 수신 알림</p>
            </div>
            <ToggleSwitch isEnabled={pushNewMessage} onToggle={setPushNewMessage} />
          </div>
        </div>
      </section>

      {/* 3. 저장 버튼 */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          className="inline-flex justify-center rounded-lg border border-transparent bg-slate-800 py-2 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  );
}

export default NotificationSettings