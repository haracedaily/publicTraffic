import "./App.css";
import { Button, Input, Space, Radio } from "antd";
import { useEffect, useState } from "react";
import Main from "./layout/Main.jsx";
import SearchTotal from "./pages/SearchTotal.jsx";
import BusRoute from "./pages/busRoute.jsx";
import { useMediaQuery } from "react-responsive";
import useGeoLocation from "./hooks/GeoLocation.jsx";
import { getNearbyStations, getArrivalInfo } from "./api/busApi.js";
import {Map, useKakaoLoader} from "react-kakao-maps-sdk";
import InstallButton from "./components/InstallButton.jsx";


function App() {
  const location = useGeoLocation();
  const [stations, setStations] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    if (!location) return;
    getNearbyStations(location.lat, location.lng).then(setStations);
  }, [location]);
  return (
    <>
      <header>
        {isMobile ? (
          <img width={150} src={"/logo_word.svg"} alt={"logo"} />
        ) : (
          <img width={200} src={"/header_logo.svg"} alt={"logo"} />
        )}
        {isMobile ? (
          <InstallButton/>
        ) : (
          <nav>
            <div>나의버스</div>
            <div>주변정류장</div>
            <div>이용안내</div>
          </nav>
        )}
        
        {isMobile ? <></> : <InstallButton/>}
      </header>
      <main>
        <Main />
      </main>
      <footer>
        <img width={200} src="/white_logo.svg" alt="footer_logo" />
      </footer>
    </>
  );
}

export default App;
