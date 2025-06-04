import React, { useState, useEffect, useRef } from "react";
import { List, Card, Typography, Spin, message } from "antd";
import { fetchArrivalInfo } from "../api/busApi";
import KakaoMapView from "../components/KakaoMapView";
import useGeoLocation from "../hooks/GeoLocation";
import { getDistance } from "../utils/distance";
import { EnvironmentOutlined } from "@ant-design/icons";
import kakaoMap from "../js/kakaoMap";
import proj4 from "proj4";
import "../css/nearby.css";
import styles from "../css/nearby.module.css";

proj4.defs(
  "EPSG:5182",
  "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs"
);
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

function convertNGISToKakao(x, y) {
  const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
  return { lat: latitude, lng: longitude };
}

const { Title, Text } = Typography;

function Nearby() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [mapCenter, setMapCenter] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [arrivalData, setArrivalData] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const locationHook = useGeoLocation();
  const errorShownRef = useRef(false);
  const [arrivalMap, setArrivalMap] = useState({});

  const containerRef = useRef(null);
  const dragHandleRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newHeight = window.innerHeight - e.clientY;
        setPanelHeight(
          Math.max(100, Math.min(newHeight, window.innerHeight * 0.9))
        );
      }
    };
    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const newHeight = window.innerHeight - e.touches[0].clientY;
        setPanelHeight(
          Math.max(100, Math.min(newHeight, window.innerHeight * 0.9))
        );
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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const handleMapCenterChanged = (newCenter) => {
    setMapCenter(newCenter);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        message.error("위치를 가져오지 못했습니다.");
        setLoadingStops(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLocation({ lat, lng });
      setMapCenter({ lat, lng });
    });
  }, []);

  useEffect(() => {
    if (!mapCenter?.lat || !mapCenter?.lng) return;

    const fetchNearbyStops = async () => {
      setLoadingStops(true);
      try {
        const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=l7L9HOYK5mFEJAehYbro5q9qXaJofTBB7nv0fYzNNIqJE%2FYGs2d7Gn6%2FDb6qrv9D1F9v5iEm%2BpXpQ%2FCINV59DA%3D%3D&gpsLati=${mapCenter.lat}&gpsLong=${mapCenter.lng}&radius=1000&_type=json`;
        const res = await fetch(url);
        const json = await res.json();
        let items = json.response?.body?.items?.item ?? [];

        items = items.filter((item) => item?.nodeid?.includes("DGB"));

        let searchResults = [];
        try {
          searchResults = await kakaoMap.getSearchTotal("");
        } catch (searchErr) {
          console.error("카카오맵 검색 실패:", searchErr);
        }

        const stops = items
          .map((item) => {
            const matched = searchResults.find((sr) => sr.bsNm === item.nodenm);
            if (!matched) return null;
            const converted = convertNGISToKakao(
              matched.ngisXPos,
              matched.ngisYPos
            );
            return {
              name: item.nodenm,
              bsId: matched.bsId,
              arsId: item.nodeid,
              lat: converted.lat,
              lng: converted.lng,
              distance: getDistance(
                location.lat,
                location.lng,
                converted.lat,
                converted.lng
              ),
            };
          })
          .filter(Boolean);

        setBusStops(stops);
      } catch (err) {
        console.error("정류장 불러오기 실패:", err);
        message.error("정류장을 불러오는 데 실패했습니다");
      } finally {
        setLoadingStops(false);
      }
    };

    fetchNearbyStops();
  }, [mapCenter?.lat, mapCenter?.lng]);

  useEffect(() => {
    if (!selectedStop?.bsId) return;

    if (!arrivalMap[selectedStop.bsId]) {
      const fetchData = async () => {
        setLoadingArrivals(true);
        const result = await fetchArrivalInfo(selectedStop.bsId);
        setArrivalMap((prev) => ({
          ...prev,
          [selectedStop.bsId]: result,
        }));
        setArrivalData(result);
        setLoadingArrivals(false);
      };
      fetchData();
    } else {
      setArrivalData(arrivalMap[selectedStop.bsId]);
    }
  }, [selectedStop]);

  useEffect(() => {
    if (selectedStop?.bsId && arrivalMap[selectedStop.bsId]) {
      setArrivalData(arrivalMap[selectedStop.bsId]);
    }
  }, [isMobile, selectedStop, arrivalMap]);

  const maxButtonBottom = typeof window !== "undefined"
    ? window.innerHeight * 0.7
    : 300;

  const mapViewStyle = {
    zIndex: "90",
    position: "absolute",
    bottom: isMobile ? Math.min(panelHeight + 12, maxButtonBottom) : 12,
    right: 16,
    transition: "bottom 0.3s ease",
  };

  return (
    <div
      className={`nearby-container ${
        selectedStop ? "three-columns" : "two-columns"
      }`}
    >
      <Card
        className={"map-column card-fixed"}
        styles={{ body: { height: "100%" } }}
      >
        <KakaoMapView
          mapCenter={mapCenter}
          myLocation={location}
          markers={busStops}
          selectedStop={selectedStop}
          setSelectedStop={setSelectedStop}
          setArrivalMap={setArrivalMap}
          loadingArrivals={loadingArrivals}
          setLoadingArrivals={setLoadingArrivals}
          onCenterChanged={handleMapCenterChanged}
          isMobile={isMobile}
          mapViewStyle={mapViewStyle}
          onRelocate={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              setLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            });
          }}
        />
        <div style={mapViewStyle}></div>
      </Card>

      {!isMobile && (
        <div className="stops-column card-fixed">
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <EnvironmentOutlined
              style={{ fontSize: 24, color: "#2d6ae0", marginRight: 8 }}
            />
            <Title level={4} style={{ display: "inline-block", margin: 0 }}>
              주변 정류장
            </Title>
            <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              현재 위치 근처의 버스 정류장 목록입니다.
            </Text>
          </div>
          <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            <Card
              style={{ height: "100%", overflowY: "auto" }}
              styles={{ body: { padding: 8 } }}
            >
              {loadingStops && (
                <div
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                    textAlign: "center",
                  }}
                >
                  <Spin />
                  <div style={{ marginTop: 8, color: "#666" }}>
                    정류장을 불러오는 중...
                  </div>
                </div>
              )}
              <div style={{ opacity: loadingStops ? 0.2 : 1 }}>
                {busStops.map((item, index) => (
                  <Card
                    key={item.arsId}
                    style={{
                      margin: "4px 0",
                      marginBottom: 8,
                      cursor: "pointer",
                      minHeight: 70,
                    }}
                    styles={{ body: { padding: "8px 12px" } }}
                    onClick={async () => {
                      if (selectedStop?.bsId === item.bsId) {
                        setSelectedStop(null);
                        return;
                      }

                      setSelectedStop(item);

                      if (!arrivalMap[item.bsId]) {
                        setLoadingArrivals(true);
                        const result = await fetchArrivalInfo(item.bsId);
                        setArrivalMap((prev) => ({
                          ...prev,
                          [item.bsId]: result,
                        }));
                        setLoadingArrivals(false);
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>
                        {index + 1}. {item.name}
                      </Text>
                      <div>
                        <Text>{(item.distance / 1000).toFixed(1)} km</Text>
                      </div>
                    </div>
                    <div style={{ color: "#888", fontSize: "0.8rem" }}>
                      정류장 ID: {item.arsId}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {selectedStop && (
        <div className="arrival-column card-fixed">
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <Title level={4} style={{ display: "inline-block", margin: 0 }}>
              🚌 {selectedStop.name} 도착 정보
            </Title>
            <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              현재 버스 도착 정보입니다.
            </Text>
          </div>
          <Card
            style={{ flex: 1, overflowY: "auto" }}
            styles={{ body: { padding: "6px 8px" } }}
          >
            {loadingArrivals ? (
              <Spin tip="도착 정보를 불러오는 중..." fullscreen />
            ) : arrivalData.length > 0 ? (
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
                        return "전";
                      case "전전":
                        return "전전";
                      case "도착예정":
                        return "차고지 대기";
                      default:
                        return `${state} 후 도착`;
                    }
                  };
                  return (
                    <List.Item>
                      {/* <Card
                        style={{
                          width: "100%",
                          minHeight: 100,
                          fontSize: "0.9rem",
                        }}
                        styles={{ body: { padding: "12px" } }}
                      > */}
                      {/* <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          margin: "10px auto"
                          // marginBottom: 4,
                        }}
                      > */}
                      <Text strong>🚌 {bus.routeName}</Text>
                      <Text
                        strong
                        style={{ color: getColorByState(bus.arrState) }}
                      >
                        {getStateText(bus.arrState)}
                      </Text>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Text type="secondary">도착 정보가 없습니다.</Text>
            )}
          </Card>
        </div>
      )}

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

          {busStops.map((item, index) => {
            const isSelected = selectedStop?.arsId
              ? selectedStop.arsId === item.arsId
              : selectedStop?.bsId === item.bsId;
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
                              {/* <Card
                                style={{
                                  width: "100%",
                                  minHeight: 100,
                                  fontSize: "0.9rem",
                                }}
                                styles={{ body: { padding: "12px" } }}
                              > */}
                                {/* <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                  }}
                                > */}
                                  <Text strong>🚌 {bus.routeName}</Text>
                                  <Text
                                    strong
                                    style={{
                                      color: getColorByState(bus.arrState),
                                    }}
                                  >
                                    {getStateText(bus.arrState)}
                                  </Text>
                                {/* </div> */}
                              {/* </Card> */}
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

export default Nearby;
