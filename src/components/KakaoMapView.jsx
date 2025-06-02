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
  loadingArrivals,
  setLoadingArrivals,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const dragHandleRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleDrag = (clientY) => {
    const newHeight = window.innerHeight - clientY;
    setPanelHeight(
      Math.max(100, Math.min(newHeight, window.innerHeight * 0.9))
    );
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDrag(e.clientY);
      }
    };
    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        handleDrag(e.touches[0].clientY);
      }
    };
    const stopDrag = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [isDragging]);

  useEffect(() => {
    if (selectedStop?.bsId && arrivalMap[selectedStop.bsId]) {
      setArrivalData(arrivalMap[selectedStop.bsId]);
    }
  }, [selectedStop?.bsId, arrivalMap]);

  useEffect(() => {
    if (busStops.length > 0) {
      setSelectedStop(null); // 초기화
    }
  }, [busStops]);

  return (
    <div
      ref={containerRef}
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
          onClick={handleClick}
          style={{
            zIndex: "90",
          }}
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
        {myLocation?.lat && (
          <MapMarker
            position={myLocation}
            image={{
              src: "/location.png",
              size: { width: 50, height: 50 },
            }}
            zIndex={100}
          />
        )}
      </Map>

      {isMobile && (
        <div
          ref={containerRef}
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

          {markers.map((item, index) => {
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
                  const arrivals = await fetchArrivalInfo(item.arsId);
                  console.log("도착 정보 응답 길이:", arrivals.length);
                  setArrivalData(arrivals);
                  setArrivalMap((prev) => ({
                    ...prev,
                    [item.arsId]: arrivals,
                  }));
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
                    ) : arrivalMap[item.arsId]?.length > 0 ? (
                      arrivalMap[item.arsId].map((bus, idx) => (
                        <div key={idx} style={{ marginBottom: 10 }}>
                          <Text strong>🚌 {bus.routeName}</Text>
                          <br />
                          <Text>
                            ⏱{" "}
                            {bus.predictTime1 !== "-"
                              ? `${bus.predictTime1}분`
                              : "정보 없음"}
                          </Text>
                          <br />
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
      )}
    </div>
  );
}
