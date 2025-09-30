import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Board from '../pages/Board';
import MainLayout from '../layouts/MainLayout';

const Approuter = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/Board" element={<Board />} />
            </Route>
        </Routes>
    );
};

export default Approuter;
