import React, { useRef, useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import MapView from "./MapView";
import { fetchArrivalInfo } from "../api/busApi";
import { Spin, Typography } from "antd";

const { Text } = Typography;

export default function KakaoMapView({
  // center,
  mapCenter, //지도 중심
  myLocation, //내 위치
  onCenterChanged,
  markers = [],
  busStops = [],
  selectedStop,
  setSelectedStop = () => {},
  setArrivalData = () => {},
  setArrivalMap = () => {},
  arrivalMap = {},
  onRelocate,
  isMobile,
  mapViewStyle
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!selectedStop?.bsId || !arrivalMap[selectedStop.bsId]) return;
    setArrivalData(arrivalMap[selectedStop.bsId]);
  }, [selectedStop?.bsId, arrivalMap]);

  // 📌 busStops 바뀌었을 때 selectedStop 유지 (있는 경우만)
  useEffect(() => {
  if (!selectedStop) return;

  const found = busStops.find((b) =>
    (b.bsId && selectedStop.bsId && b.bsId === selectedStop.bsId) ||
    (b.arsId && selectedStop.arsId && b.arsId === selectedStop.arsId)
  );

  if (!found) {
    console.log("🛑 selectedStop 값 유지됨: busStops에서 못 찾음");
    // ❌ 절대 selectedStop을 날리지 않음
    // → 유지하도록 함
  }
}, [busStops]);

  return (
    <div
      // ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Map
        center={
          mapCenter?.lat && mapCenter?.lng
            ? mapCenter
            : { lat: 35.8714, lng: 128.6014 }
        } // fallback 위치 추가
        // center={mapCenter}
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        level={4}
        onDragEnd={(map) => {
          const latlng = map.getCenter();
          onCenterChanged({ lat: latlng.getLat(), lng: latlng.getLng() });
        }}
      >
        <MapView
          position={myLocation}
          onClick={() => {
            if (
              mapRef.current &&
              window.kakao?.maps &&
              myLocation?.lat &&
              myLocation?.lng
            ) {
              const kakaoLatLng = new window.kakao.maps.LatLng(
                myLocation.lat,
                myLocation.lng
              );
              mapRef.current.setCenter(kakaoLatLng);
              onCenterChanged(myLocation);
            }
            onRelocate?.();
          }}
          style={mapViewStyle}
        />
        {markers.map((marker, idx) => (
          <MapMarker
            key={idx}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            clickable={true}
            image={{
              src: "/stop_marker.png",
              size: { width: 40, height: 45 },
              // options: { offset: { x: 25, y: 50 } },
            }}
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
        {/* {myLocation?.lat && (
          <MapMarker
            position={myLocation}
            image={{
              src: "/location.png",
              size: { width: 50, height: 50 },
            }}
            zIndex={100}
          />
        )} */}
      </Map>
    </div>
  );
}
