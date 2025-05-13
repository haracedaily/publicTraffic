import './App.css'
import {Button, Input, Space, Radio} from "antd";
import {useState} from "react";
import Main from "./layout/Main.jsx";
import Stop from "./pages/Stop.jsx";
import Bus from "./pages/Bus.jsx";
import Favo from "./pages/Favo.jsx";
import {useMediaQuery} from "react-responsive";

function App() {
    const [navTab, setNavTab] = useState('stop');
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const handleTabClick = (e) => {
        setNavTab(e.target.value);
    }
  return (
    <>
      <header>
          {isMobile ?<img width={70} src={"/logo.svg"} alt={"logo"}/> :<img width={200} src={"/header_logo.svg"} alt={'logo'}/>}
          {isMobile ? <Button>로그인</Button> : <nav>
              <div>대구시 교통정보 열람</div>
              <div>StarBus 소개</div>
          </nav>}
          {isMobile ? <></>:<Button>로그인</Button>}
      </header>
      <main>
        <nav>
            <article id={"nav_header"}>
                <img src="/bus.svg" alt="bus" />
                <h4>버스정보조회</h4>
            </article>
            <Space.Compact style={{ width: '100%', padding: '20px' }}>
                <Input.Search placeholder="버스번호 및 정류소" allowClear />
            </Space.Compact>
            <article id={"nav_result"}>
                <h3>검색결과</h3>
                <img src="/reverse_triangle.svg" alt="triangle" />
            </article>
            <Radio.Group onChange={handleTabClick} value={navTab} style={{ width: '100%',display:'grid',gridTemplateColumns:'1fr 1fr 1fr' }} >
                <Radio.Button value="stop">정류소</Radio.Button>
                <Radio.Button value="bus">버스</Radio.Button>
                <Radio.Button value="favo">즐겨찾기</Radio.Button>
            </Radio.Group>
            {navTab === 'stop' ? <Stop />: navTab === 'bus' ? <Bus /> : <Favo />}
            <Main />
        </nav>
        <article className={'main'}>
        {/*  지도*/}
        </article>
      </main>
      <footer>

          <img width={200} src="/white_logo.svg" alt="footer_logo" />
      </footer>
    </>
  )
}

export default App
