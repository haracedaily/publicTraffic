import './App.css'
import {Button} from "antd";

function App() {
  return (
    <>
      <header>
        <img width={200} src={"/header_logo.svg"} alt={'logo'}/>
          <nav>
              <div>대구시 교통정보 열람</div>
              <div>StarBus 소개</div>
          </nav>
          <Button>로그인</Button>
      </header>
      <main>
        <nav>
            <article id={"nav_header"}>
                <img src="/bus.svg" alt="bus" />
                <h4>버스정보조회</h4>
            </article>
        </nav>
        <article>
        {/*  지도*/}
        </article>
      </main>
      <footer>

      </footer>
    </>
  )
}

export default App
