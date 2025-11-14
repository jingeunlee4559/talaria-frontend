import React from 'react';
import KLiveHero from '../../components/Culture/CultureHome/KLiveHero';
import HotLiveSection from '../../components/Culture/CultureHome/HotLiveSection';
import TodayClipSection from '../../components/Culture/CultureHome/TodayClipSection';

const CultureHome = () => {
    return (
        <div className="space-y-0">
            <KLiveHero />
            <HotLiveSection />
            <TodayClipSection />
        </div>
    );
};

export default CultureHome;
