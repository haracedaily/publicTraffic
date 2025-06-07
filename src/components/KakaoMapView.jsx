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
  // const containerRef = useRef(null);
  // const dragHandleRef = useRef(null);
  // const [panelHeight, setPanelHeight] = useState(250);
  // const [isDragging, setIsDragging] = useState(false);
  // const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth <= 1024);
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  const handleClick = () => {
    // if (mapRef.current && window.kakao?.maps) {
    //   const kakaoLatLng = new window.kakao.maps.LatLng(center.lat, center.lng);
    //   mapRef.current.setCenter(kakaoLatLng);
    // }
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
                  padding: "4px 8px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
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

      {/* {isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: `${panelHeight}px`,
            background: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            zIndex: 5,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
            overflowY: "auto",
            transition: "height 0.2s ease",
          }}
        >
          <div
            ref={dragHandleRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{
              width: "100%",
              height: "16px",
              cursor: "row-resize",
              background: "#ccc",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />

          {busStops.map((item, index) => {
            const isSelected = selectedStop?.arsId === item.arsId;
            return (
              <div
                key={item.arsId}
                onClick={async () => {
                  if (isSelected) {
                    setSelectedStop(null);
                    return;
                  }
                  setSelectedStop(item);
                  setLoadingArrivals(true);
                  const result = await fetchArrivalInfo(item.bsId);
                  setArrivalData(result);
                  setArrivalMap((prev) => ({ ...prev, [item.bsId]: result }));
                  setLoadingArrivals(false);
                }}
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  background: isSelected ? "#f5faff" : "white",
                }}
              >
                <strong>
                  {index + 1}. {item.name}
                </strong>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>
                  ID: {item.arsId}
                </div>
                <div>{(item.distance / 1000).toFixed(1)} km</div>

                {isSelected && (
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px dashed #ccc",
                    }}
                  >
                    {loadingArrivals ? (
                      <Spin tip="도착 정보를 불러오는 중..." />
                    ) : arrivalMap[item.bsId]?.length > 0 ? (
                      arrivalMap[item.bsId].map((bus, idx) => (
                        <div key={idx} style={{ marginBottom: 10 }}>
                          <Text strong>🚌 {bus.routeName}</Text><br />
                          <Text>
                            ⏱ {bus.predictTime1 !== "-" ? `${bus.predictTime1}분` : "정보 없음"}
                          </Text><br />
                          {bus.locationNo1 !== "-" && (
                            <Text>📍 남은 정류장: {bus.locationNo1}개</Text>
                          )}
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">도착 정보가 없습니다.</Text>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )} */}
    </div>
  );
}
