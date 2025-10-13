import React from 'react';

const ProgressBar = ({ label, value, max, displayValue, gradient }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-sm text-slate-500 font-medium">{displayValue}</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${gradient}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const UsageCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-6">이번 달 사용량</h2>
      <div className="space-y-6">
        <ProgressBar label="회의 시간" value={48} max={100} displayValue="48 / 무제한 시간" gradient="bg-gradient-to-r from-sky-500 to-indigo-500" />
        <ProgressBar label="문서 번역" value={156} max={200} displayValue="156 / 200 개" gradient="bg-gradient-to-r from-blue-500 to-cyan-400" />
        <ProgressBar label="저장 공간" value={45} max={100} displayValue="45 / 100 GB" gradient="bg-gradient-to-r from-violet-500 to-fuchsia-500" />
      </div>
    </div>
  );
};

export default UsageCard;