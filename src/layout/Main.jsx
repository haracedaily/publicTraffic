import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import KaokaoMain from "../pages/KaokaoMain.jsx";
import My from "../pages/My.jsx";

function Main(props) {
    return (
        <>
                <Routes>
                    <Route path="/" element={<KaokaoMain />} />
                    <Route path="/my" element={<My/>} />
                </Routes>
        </>
    );
}

export default Main;