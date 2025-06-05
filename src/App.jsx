import './App.css'
import {useEffect, useState} from "react";
import Main from "./layout/Main.jsx";
import {useMediaQuery} from "react-responsive";
import {useNavigate} from "react-router-dom";
import InstallButton from './components/InstallButton.jsx';
import IosPwaGuide from "./components/IosPwaGuide.jsx";

function App() {

    const isMobile = useMediaQuery({maxWidth: 900});
    const isCommonMobile = useMediaQuery({maxWidth: 580});
    const navigator = useNavigate();
    const [navTab, setNavTab] = useState(false);
    useEffect(() => {
        setNavTab(false);
    },[isMobile])
    return (
        <>
            <IosPwaGuide/>
            <div className={`common_mobile_header_nav ${navTab?"common_mobile_header_nav_open":"common_mobile_header_nav_close"}`}>
                <div onClick={()=>{navigator("/"); setNavTab(false);}} style={{cursor: "pointer"}}>HOME</div>
                <div onClick={()=>{navigator("/my"); setNavTab(false);}} style={{cursor: "pointer"}}>나의버스</div>
                <div onClick={()=>{navigator("/nearby"); setNavTab(false);}} style={{cursor: "pointer"}}>주변정류장</div>
                <span style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem",paddingInlineEnd:"10vw",paddingBlockStart:"20vh", paddingBlockEnd:"5vh"}}>
                <img  width={150} src={"/logo.svg"} alt="logo"/>
                <img width={120} src={"/logo_word.svg"} alt="logo_word"/>
                <h2 style={navTab?{}:{display:"none"}}>대구광역시 버스정보시스템</h2>
                </span>
            </div>
            <header>
                {isMobile ? <img width={150} src={"/logo_word.svg"} alt={"logo"} onClick={()=>{navigator("/")}} style={{cursor:"pointer",zIndex:9999999}} /> :
                    <img width={200} src={"/header_logo.svg"} alt={'logo'} onClick={()=>{navigator("/")}} style={{cursor:"pointer"}} />}
                {isMobile ? <div className={"hamburger_menu"} onClick={()=>setNavTab(!navTab)}>
                    <div className={`hamburger_bar ${navTab?"hamburger_rotate_top":""}`}></div>
                    <div className={`${navTab?"none":"hamburger_bar"} light_green`}></div>
                    <div className={`hamburger_bar ${navTab?"hamburger_rotate_bottom":""}`}></div>
                </div> : <nav>
                    <div onClick={()=>{navigator("/my")}}>나의버스</div>
                    <div onClick={()=>{navigator("/nearby")}}>주변정류장</div>
                    <div>이용안내</div>
                    {/* <Button>로그인</Button> */}
                    <InstallButton/>
                </nav>}
            </header>
            <main className={isCommonMobile?"common_mobile_main":""}>
                <Main isCommonMobile={isCommonMobile}/>
            </main>
            <footer className={`${isCommonMobile?"none":""} jh_app_footer`}>
                <div>

                <div>
                    <h4>회사명 : StarBus</h4>
                    <h4>주소 : 대구 중구 중앙대로 394 제일빌딩 5F</h4>
                    <h4>대표 : 스타버스</h4>
                </div>
                <div>
                    <h4>이메일 : starbus@naver.com</h4>
                    <h4>문의전화 : 000-0000-0000</h4>
                </div>
                <div>
                    <h4>Copyright(c) All Rights Reserved.</h4>
                </div>
                </div>

            </footer>
        </>

    )
}

export default App
