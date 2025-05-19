import React, {useState} from 'react';
import {Map, MapMarker, MarkerClusterer, useKakaoLoader} from "react-kakao-maps-sdk";
import Side from "../component/Side.jsx";
import styles from "../css/kakao_main.module.css";
function KaokaoMain(props) {
    const [searchResults, setSearchResults] = useState([]);
    const [arrivalInfo, setArrivalInfo] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 35.8596, lng: 128.6028 });
    const [selectedStop, setSelectedStop] = useState(null);
    const convertNGISToKakao = (x, y) => {
        // NGIS 좌표를 카카오맵 좌표로 변환하는 공식
        // 대구시 기준 변환 공식
        const lat = 35.8693 + (y - 363760.41323086) * 0.00001;
        const lng = 128.6062 + (x - 163696.53125238) * 0.00001;
        return { lat, lng };
    };
    useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_API_KEY,
        libraries: ["clusterer", "drawing", "services"],
    });
    return (
        <>
            <Side
                setMapCenter={setMapCenter}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                selectedStop={selectedStop}
                setSelectedStop={setSelectedStop}
                arrivalInfo={arrivalInfo}
                setArrivalInfo={setArrivalInfo} />
            <article className={styles.main}>
            <Map center={mapCenter} level={3}
                 style={{width:'100%',height:'100%'}} >
                <MarkerClusterer
                    averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
                    minLevel={10} // 클러스터 할 최소 지도 레벨
                >
                    {selectedStop && (
                        <MapMarker
                            position={convertNGISToKakao(selectedStop.ngisXPos, selectedStop.ngisYPos)}
                        />
                    )}
                </MarkerClusterer>
            </Map>
            </article>
        </>
    );
}

export default KaokaoMain;