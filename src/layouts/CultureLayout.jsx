import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import CultureNavs from '../components/Culture/CultureNavs';

const CultureLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <CultureNavs />
            <main className="flex-grow container mx-auto px-4">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default CultureLayout;
