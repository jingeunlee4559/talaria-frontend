import React from 'react';

const StatCard = ({ value, label, icon, color }) => {
    // const colorVariants = {
    //     violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
    //     sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
    //     emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    //     amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    // };

    // const selectedColor = colorVariants[color] || colorVariants.violet;

    return (
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>{icon}</div>
                <div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
