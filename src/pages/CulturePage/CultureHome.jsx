import React from 'react';
import KLiveHero from '../../components/Culture/CultureHome/KLiveHero';
import HotLiveSection from '../../components/Culture/CultureHome/HotLiveSection';
import TodayQuizSection from '../../components/Culture/CultureHome/TodayQuizSection';

const CultureHome = () => {
    return (
        <div className="space-y-0">
            <KLiveHero />
            <HotLiveSection />
            <TodayQuizSection />
        </div>
    );
};

export default CultureHome;
