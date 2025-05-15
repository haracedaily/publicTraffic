import React from 'react';
import {Map, MarkerClusterer, useKakaoLoader} from "react-kakao-maps-sdk";
import Side from "../component/Side.jsx";
import styles from "../css/kakao_main.module.css";
function KaokaoMain(props) {
    useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_API_KEY,
        libraries: ["clusterer", "drawing", "services"],
    });
    return (
        <>
            <Side />
            <article className={styles.main}>
            <Map center={{lat: 35.8596, lng:128.6028}} level={7}
                 style={{width:'100%',height:'100%'}} >
                <MarkerClusterer
                    averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
                    minLevel={10} // 클러스터 할 최소 지도 레벨
                >

                </MarkerClusterer>
            </Map>
            </article>
        </>
    );
}

export default KaokaoMain;