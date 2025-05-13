import React from 'react';
import {Map, useKakaoLoader} from "react-kakao-maps-sdk";

function KaokaoMain(props) {
    useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_API_KEY,
        libraries: ["clusterer", "drawing", "services"],
    });
    return (
        <>
            <Map center={{lat: 35.8596, lng:128.6028}} level={7}
                 style={{width:'100%',height:'100%'}}>

            </Map>
        </>
    );
}

export default KaokaoMain;