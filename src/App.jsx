import './App.css'
import {Button, Input, Space, Radio} from "antd";
import {useState} from "react";
import Main from "./layout/Main.jsx";
import SearchTotal from "./pages/SearchTotal.jsx";
import BusRoute from "./pages/busRoute.jsx";
import {useMediaQuery} from "react-responsive";
import {Map, useKakaoLoader} from "react-kakao-maps-sdk";
import {BrowserRouter, useNavigate} from "react-router-dom";

function App() {

    const isMobile = useMediaQuery({maxWidth: 768});
    const navigator = useNavigate();

    return (
        <>
            <header>
                {isMobile ? <img width={150} src={"/logo_word.svg"} alt={"logo"} onClick={()=>{navigator("/")}} style={{cursor:"pointer"}} /> :
                    <img width={200} src={"/header_logo.svg"} alt={'logo'} onClick={()=>{navigator("/")}} style={{cursor:"pointer"}} />}
                {isMobile ? <Button>로그인</Button> : <nav>
                    <div onClick={()=>{navigator("/my")}}>나의버스</div>
                    <div>주변정류장</div>
                    <div>이용안내</div>
                </nav>}
                {isMobile ? <></> : <Button>로그인</Button>}
            </header>
            <main>
                <Main/>
            </main>
            <footer>

                <img width={200} src="/white_logo.svg" alt="footer_logo"/>
            </footer>
        </>

    )
}

export default App
