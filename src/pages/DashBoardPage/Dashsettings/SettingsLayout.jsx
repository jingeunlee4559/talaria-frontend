import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. Outlet을 import 합니다.
import Tabs from '../../../components/dashboard/dashSetting/Tabs';

// 역할이 레이아웃이므로 이름 변경을 권장합니다: SettingsLayout.jsx

const SettingsLayout = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">설정</h1>
          <p className="mt-2 text-base text-slate-600">계정 및 서비스 설정을 관리하여 최적의 환경을 만드세요.</p>
        </header>
        <Tabs />
        <div className="mt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout