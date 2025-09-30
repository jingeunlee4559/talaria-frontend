import React from 'react';
import { Outlet } from 'react-router-dom';
import Navs from '../components/Navs';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <div>
            <Navs />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
