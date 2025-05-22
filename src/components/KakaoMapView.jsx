import React from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function KakaoMapView({ center, markers = [] }) {
  useKakaoLoader({ appkey: import.meta.env.VITE_KAKAO_API_KEY });

  return (
    <Map
      center={center}
      style={{ width: "100%", height: "300px", borderRadius: "15px" }}
      level={4}
    >
      {/* 현재 위치 마커 */}
      <MapMarker position={center} />

      {/* 정류장 마커 */}
      {markers.map((marker, idx) => (
        <MapMarker
          key={idx}
          position={{ lat: marker.lat, lng: marker.lng }}
          title={marker.name}
        />
      ))}
    </Map>
  );
}
