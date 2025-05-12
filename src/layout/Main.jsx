import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SideMenu from "../pages/SideMenu.jsx";

function Main(props) {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SideMenu />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default Main;