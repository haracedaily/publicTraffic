import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import KaokaoMain from "../pages/KaokaoMain.jsx";
import My from "../pages/My.jsx";
import Nearby from "../pages/Nearby.jsx";
import HowTo from "../pages/HowTo.jsx";

function Main({isCommonMobile}) {
    return (
        <>
                <Routes>
                    <Route path="/" element={<KaokaoMain isCommonMobile={isCommonMobile} />} />
                    <Route path="/my" element={<My isCommonMobile={isCommonMobile} />} />
                    <Route path="/nearby" element={<Nearby isCommonMobile={isCommonMobile} />} />
                    <Route path="/howto" element={<HowTo isCommonMobile={isCommonMobile} />} />

                </Routes>
        </>
    );
}

export default Main;