import React, { useRef, useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import MapView from "./MapView";
import { fetchArrivalInfo } from "../api/busApi";
import { Spin, Typography } from "antd";

const { Text } = Typography;

export default function KakaoMapView({
  center,
  mapCenter,
  myLocation,
  onCenterChanged,
  markers = [],
  busStops = [],
  selectedStop,
  setSelectedStop = () => { },
  setArrivalData = () => { },
  setArrivalMap = () => { },
  arrivalMap = {},
  onRelocate,
  loadingArrivals,
  setLoadingArrivals,
  mapViewStyle
}) {
  const mapRef = useRef(null);

  const handleClick = () => {
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
  };

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
      <div
        onClick={handleClick}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "55px",
          height: "55px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          ...mapViewStyle, // KakaoMapView에서 내려온 bottom, right 등 포함됨
        }}
      >
        <img
          src="/location_icon.svg"
          alt="현재 위치로 이동"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <Map
        center={mapCenter || { lat: 35.8714, lng: 128.6014 }}
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
          onClick={handleClick}
          style={mapViewStyle}

        />
        {markers.map((marker, idx) => (
          <MapMarker
            key={idx}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            clickable={true}
            onClick={async () => {
              if (selectedStop?.bsId === marker.bsId) {
                setSelectedStop(null);
                setArrivalData([]);
                return;
              }

              setSelectedStop(marker);
              setLoadingArrivals(true);
              const result = await fetchArrivalInfo(marker.bsId);
              setArrivalMap((prev) => ({ ...prev, [marker.bsId]: result }));
              setLoadingArrivals(false);
            }}
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
                  padding: "3px 8px",
                  // background: "#fff",
                  // border: "1px solid #ccc",
                  // borderRadius: "8px",
                  textAlign: "center",
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
  );
}
