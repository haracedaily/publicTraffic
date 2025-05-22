import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import KaokaoMain from "../pages/KaokaoMain.jsx";
import Nearby from '../pages/Nearby.jsx';
import InstallButton from '../components/InstallButton.jsx';

function Main(props) {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<KaokaoMain />} />
                    <Route path="/nearby" element={<Nearby/>}/>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default Main;