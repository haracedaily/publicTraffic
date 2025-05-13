import './App.css'
import {Button, Input, Space, Radio} from "antd";
import {useState} from "react";
import Main from "./layout/Main.jsx";
import SearchTotal from "./pages/SearchTotal.jsx";
import BusRoute from "./pages/busRoute.jsx";
import {useMediaQuery} from "react-responsive";
import {Map, useKakaoLoader} from "react-kakao-maps-sdk";

function App() {
    const [navTab, setNavTab] = useState('stop');
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const handleTabClick = (e) => {
        setNavTab(e.target.value);
    }

  return (
    <>
      <header>
          {isMobile ?<img width={150} src={"/logo_word.svg"} alt={"logo"}/> :<img width={200} src={"/header_logo.svg"} alt={'logo'}/>}
          {isMobile ? <Button>로그인</Button> : <nav>
              <div>나의버스</div>
              <div>주변정류장</div>
              <div>이용안내</div>
          </nav>}
          {isMobile ? <></>:<Button>로그인</Button>}
      </header>
      <main>
        <nav>
            <article id={"nav_header"}>
            <img src="/bus.svg" alt="bus" />
            <h4>버스정보조회</h4>
        </article>


            <Radio.Group onChange={handleTabClick} value={navTab} style={{ width: '100%',display:'grid',gridTemplateColumns:'1fr 1fr' }} >
                <Radio.Button value="search" style={{borderRadius:0,height:"auto"}}>
                    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                        <img src={"/search_i.svg"} width={30} alt={"search_i"}/>
                        <h2 >통합검색</h2>
                    </div>
                </Radio.Button>
                <Radio.Button value="route" style={{borderRadius:0, height:"auto"}}>
                    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                    <img src={"/crossArrow.svg"} width={30} alt={"cross_arrow"}/>
                        <h2 >경로검색</h2>
                    </div>
                </Radio.Button>
            </Radio.Group>
            {navTab === 'search' ? <SearchTotal />:<BusRoute />}
        </nav>
        <article className={'main'}>
            <Main />
        </article>
      </main>
      <footer>

          <img width={200} src="/white_logo.svg" alt="footer_logo" />
      </footer>
    </>
  )
}

export default App
