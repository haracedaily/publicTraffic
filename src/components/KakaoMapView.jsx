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
  arrivalData,
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
            position: "absolute",
            bottom: isMobile ? panelHeight + 16 : 16, // ← 핵심!
            right: 16,
            transition: "bottom 0.3s ease",
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
            marginTop: "50px",
            bottom: 0,
            left: 0,
            width: "100%",
            height: `${panelHeight}px`,
            background: "rgba(255,255,255,0.95)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            zIndex: 5,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
            overflowY: "auto",
            transition: "height 0.2s ease",
          }}
        >
          <div
            ref={dragHandleRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{
              // width: "100%",
              height: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "row-resize",
              // background: "#ccc",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "5px",
                background: "#ccc",
                borderRadius: "3px",
                marginTop: "4px",
              }}
            />
          </div>

          {markers.map((item, index) => {
            const isSelected = selectedStop?.arsId === item.arsId
            return (
              <div
                key={item.arsId}
                onClick={async () => {
                  const isNowSelected = selectedStop?.arsId === item.arsId;
                  if (isNowSelected) {
                    setSelectedStop(null);
                    return;
                  }
                  setSelectedStop(item);
                  setLoadingArrivals(true);

                  const arrivals = await fetchArrivalInfo(item.arsId);
                  const list = arrivals?.body?.list ?? [];

                  console.log("도착 정보:", list);
                  setArrivalData(list);
                  setArrivalMap((prev) => ({
                    ...prev,
                    [item.arsId]: list,
                  }));
                  setLoadingArrivals(false);
                }}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  background: isSelected ? "#f0f9ff" : "white",
                }}
              >
                <strong style={{ fontSize: "1rem", fontWeight: "bold" }}>
                  {index + 1}. {item.name}
                </strong>
                <div
                  style={{ fontSize: "0.75rem", color: "#999", marginTop: 4 }}
                >
                  ID: {item.arsId}
                </div>
                <div>거리: {(item.distance / 1000).toFixed(1)} km</div>

                {isSelected && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: "1px dashed #ccc",
                    }}
                  >
                    {loadingArrivals ? (
                      <Spin tip="도착 정보를 불러오는 중..." fullscreen />
                    ) : Array.isArray(arrivalData) && arrivalData.length > 0 ? (
                      <List
                        dataSource={arrivalData}
                        renderItem={(bus) => {
                          const getColorByState = (state) => {
                            switch (state) {
                              case "전":
                                return "#52c41a";
                              case "전전":
                                return "#faad14";
                              case "도착예정":
                                return "#aaaaaa";
                              default:
                                return "#1890ff";
                            }
                          };
                          const getStateText = (state) => {
                            switch (state) {
                              case "전":
                                return "곧 도착";
                              case "전전":
                                return "곧 도착 예정";
                              case "도착예정":
                                return "차고지 대기";
                              default:
                                return `${state} 후 도착`;
                            }
                          };
                          return (
                            <List.Item>
                              <Card
                                style={{
                                  width: "100%",
                                  minHeight: 100,
                                  fontSize: "0.9rem",
                                }}
                                styles={{ body: { padding: "12px" } }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                  }}
                                >
                                  <Text strong>🚌 {bus.routeNo}</Text>
                                  <Text
                                    strong
                                    style={{
                                      color: getColorByState(bus.arrState),
                                    }}
                                  >
                                    {getStateText(bus.arrState)}
                                  </Text>
                                </div>
                                {/* {bus.vhcNo2 && (
                                  <>
                                    <br />
                                    <Text>🆔 차량번호: {bus.vhcNo2}</Text>
                                  </>
                                )} */}
                              </Card>
                            </List.Item>
                          );
                        }}
                      />
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
