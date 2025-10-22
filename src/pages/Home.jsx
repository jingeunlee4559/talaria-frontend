import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import CoreFeatures from '../components/home/CoreFeatures';
import CTA from '../components/home/CTA';
import { Element } from 'react-scroll';

const Home = () => {
    return (
        <div className="space-y-24 md:space-y-32">
            <Hero />
            <Element name="features">
                <Features />
            </Element>
            <Element name="corefeatures">
                <CoreFeatures />
            </Element>
            <CTA />
        </div>
    );
};

export default Home;
