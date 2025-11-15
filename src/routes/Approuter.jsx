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
import MeetingPage from '../components/dashboard/dashvideo/MeetingPage';
import DashSchedule from '../pages/DashBoardPage/DashSchedule';
import CultureLayout from '../layouts/CultureLayout';
import CultureHome from '../pages/CulturePage/CultureHome';
import CultureViedos from '../pages/CulturePage/CultureViedos';
import CultureLiveView from '../components/Culture/CultureVideo/CultureLiveView';
import LiveStartPage from '../pages/CulturePage/LiveStartPage';
import FriendsPage from '../pages/CulturePage/FriendsPage';
import CommunityMain from '../pages/CulturePage/Communitymain';

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
                <Route path="/business/dashboardHome" element={<DashHome />} />
                <Route path="/business/dashboardHome/DashVideo" element={<DashVIdeo />} />
                <Route path="/business/dashboardhome/DashDocuments" element={<DashDocuments />} />
                <Route path="/business/dashboardhome/Schedule" element={<DashSchedule />} />
                <Route path="/business/dashboardhome/settings" element={<SettingsLayout />}>
                    <Route index element={<ProfileSettings />} />
                    <Route path="notifications" element={<NotificationSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                </Route>
            </Route>

            <Route element={<CultureLayout />}>
                <Route path="/Culture/CultureHome" element={<CultureHome />} />
                <Route path="/Culture/Videos" element={<CultureViedos />} />
                <Route path="/Culture/LiveStart" element={<LiveStartPage />} />
                <Route path="/Culture/Friends" element={<FriendsPage />} />
                <Route path="/Culture/Community" element={<CommunityMain />} />
            </Route>

            <Route path="/business/meeting" element={<MeetingPage />} />
            <Route path="/culture/live" element={<CultureLiveView />} />
        </Routes>
    );
};

export default Approuter;
