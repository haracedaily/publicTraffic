import React, {useState} from 'react';
import {Map, MapMarker, MarkerClusterer, useKakaoLoader} from "react-kakao-maps-sdk";
import Side from "../component/Side.jsx";
import styles from "../css/kakao_main.module.css";
import proj4 from 'proj4';

// EPSG:5182 (TM-동부원점) 좌표계 정의
proj4.defs("EPSG:5182", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// EPSG:4326 (WGS84) 좌표계 정의
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

function KaokaoMain(props) {
    const [searchResults, setSearchResults] = useState([]);
    const [arrivalInfo, setArrivalInfo] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 35.8693, lng: 128.6062 });
    const [selectedStop, setSelectedStop] = useState(null);

    const convertNGISToKakao = (x, y) => {
        const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
        let lat = latitude;
        let lng = longitude;
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
                            image={{
                                src:"/stop_marker.png",
                                size:{
                                    width:50,
                                    height:50
                                },
                                options:{
                                    offset:{
                                        x:25,y:48
                                    }
                                }
                        }}

                        />
                    )}
                </MarkerClusterer>
            </Map>
            </article>
        </>
    );
}

export default KaokaoMain;