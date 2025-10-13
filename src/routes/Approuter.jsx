import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Board from '../pages/Board';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import DashHome from '../pages/DashBoardPage/DashHome';
import DashVIdeo from '../pages/DashBoardPage/DashVIdeo';
import DashDocuments from '../pages/DashBoardPage/DashDocuments';

const Approuter = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                {/* <Route path="/Board" element={<Board />} /> */}
            </Route>

            <Route element={<DashboardLayout />}>
                <Route path="/dashboardHome" element={<DashHome />} />
                <Route path="/dashboardHome/DashVideo" element={<DashVIdeo />} />
                <Route path="/dashboardhome/DashDocuments" element={<DashDocuments/>}/>
            </Route>
        </Routes>
    );
};

export default Approuter;
