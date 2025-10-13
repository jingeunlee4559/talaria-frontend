import React from 'react';

const StatCard = ({ icon, title, value, change, color }) => {
  const colorVariants = {
    violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };

  const selectedColor = colorVariants[color] || colorVariants.violet;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
          <p className="text-sm text-emerald-500 font-medium mt-2">{change} 지난 달 대비</p>
        </div>
        <div className={`p-3 rounded-full ${selectedColor.bg} ${selectedColor.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;