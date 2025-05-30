import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import KaokaoMain from "../pages/KaokaoMain.jsx";
import My from "../pages/My.jsx";
import Nearby from "../pages/Nearby.jsx";

function Main(props) {
    return (
        <>
                <Routes>
                    <Route path="/" element={<KaokaoMain />} />
                    <Route path="/my" element={<My/>} />
                    <Route path="/nearby" element={<Nearby />} />
                </Routes>
        </>
    );
}

export default Main;