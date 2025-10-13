import React from 'react';

const ActionCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors duration-300 text-center flex flex-col items-center justify-center cursor-pointer group">
      <div className="mb-4 bg-indigo-50 p-4 rounded-full group-hover:bg-indigo-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  );
};

export default ActionCard;