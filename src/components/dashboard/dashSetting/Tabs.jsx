import React from 'react';
import { NavLink } from 'react-router-dom'; // 1. NavLink를 import 합니다.
import { User, Bell, Shield } from 'lucide-react';

const TABS_CONFIG = [
  { to: "/dashboardhome/settings", name: '프로필', icon: User, end: true },
  { to: "notifications", name: '알림', icon: Bell },
  { to: "security", name: '보안', icon: Shield },
];

export default function Tabs() { // 2. activeTab, setActiveTab props는 이제 필요 없습니다.
  const activeClass = "border-indigo-600 text-indigo-600";
  const inactiveClass = "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700";

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {TABS_CONFIG.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.to}
            end={tab.end} // '프로필' 링크는 정확히 경로가 일치할 때만 활성화되도록 end prop 추가
            // 3. isActive 상태에 따라 클래스를 동적으로 적용합니다.
            className={({ isActive }) => `
              flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold tracking-wide
              transition-colors duration-200
              ${isActive ? activeClass : inactiveClass}
            `}
          >
            <tab.icon className="mr-2 h-5 w-5" />
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}