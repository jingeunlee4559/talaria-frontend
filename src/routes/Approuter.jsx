import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Board from '../pages/Board';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import DashHome from '../pages/DashBoardPage/DashHome';
import DashVIdeo from '../pages/DashBoardPage/DashVIdeo';
import DashDocuments from '../pages/DashBoardPage/DashDocuments';
import LoginPage from '../pages/LoginPage';
import Register from '../pages/Register';
import ProfileSettings from '../pages/DashBoardPage/Dashsettings/ProfileSettings';
import NotificationSettings from '../pages/DashBoardPage/Dashsettings/NotificationSettings';
import SecuritySettings from '../pages/DashBoardPage/Dashsettings/SecuritySettings';
import SettingsLayout from '../pages/DashBoardPage/Dashsettings/SettingsLayout';

const Approuter = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<LoginPage />} />
                <Route path="/Register" element={<Register />} />
                {/* <Route path="/Board" element={<Board />} /> */}
            </Route>

            <Route element={<DashboardLayout />}>
                <Route path="/dashboardHome" element={<DashHome />} />
                <Route path="/dashboardHome/DashVideo" element={<DashVIdeo />} />
                <Route path="/dashboardhome/DashDocuments" element={<DashDocuments/>}/>
               <Route path="/dashboardhome/settings" element={<SettingsLayout />}>
                    <Route index element={<ProfileSettings />} /> 
                    <Route path="notifications" element={<NotificationSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default Approuter;
