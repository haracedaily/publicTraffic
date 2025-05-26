import React, { useRef } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import MapView from "./MapView";

export default function KakaoMapView({ center, markers = [], selectedStop, onRelocate }) {
  useKakaoLoader({ appkey: import.meta.env.VITE_KAKAO_API_KEY });
  const mapRef = useRef(null);

  const handleClick = () => {
    if (mapRef.current && window.kakao?.maps) {
      const kakaoLatLng = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapRef.current.setCenter(kakaoLatLng); // ✅ 직접 중심 이동
    }
    onRelocate?.(); // 위치 갱신까지 같이 수행
  };

  return (
    <>
      <div>
        <Map
          center={center}
          ref={mapRef}
          style={{ width: "100%", height: "38vh", borderRadius: "15px" }}
          level={4}
        >
          {/* 현재 위치 마커 */}
          <MapView position={center} onClick={handleClick} />
          {markers.map((marker, idx) => (
            <MapMarker
              key={idx}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.name}
            />
          ))}
          {/* 정류장 마커 */}
          {markers.map((marker, idx) => (
            <MapMarker
              key={idx}
              position={{ lat: marker.lat, lng: marker.lng }}
              clickable={true}
            >
              {selectedStop?.bsId === marker.bsId && (
                <div
                  style={{
                    margin: "0 auto",
                    padding: "4px 8px",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {marker.name}
                </div>
              )}
            </MapMarker>
          ))}
        </Map>
      </div>
    </>
  );
}
