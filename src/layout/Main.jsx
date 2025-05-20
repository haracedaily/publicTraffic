import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import KaokaoMain from "../pages/KaokaoMain.jsx";
import MapView from '../components/MapView.jsx';

function Main(props) {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<KaokaoMain />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default Main;