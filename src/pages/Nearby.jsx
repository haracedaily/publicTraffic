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
  const [busStops, setBusStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [arrivalData, setArrivalData] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const locationHook = useGeoLocation();
  const errorShownRef = useRef(false);

  const [arrivalMap, setArrivalMap] = useState({});

  // const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth <= 1024);
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

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
    if (!location?.lat || !location?.lng) return;

    const fetchNearbyStops = async () => {
      setLoadingStops(true);
      try {
        const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=l7L9HOYK5mFEJAehYbro5q9qXaJofTBB7nv0fYzNNIqJE%2FYGs2d7Gn6%2FDb6qrv9D1F9v5iEm%2BpXpQ%2FCINV59DA%3D%3D&gpsLati=${location.lat}&gpsLong=${location.lng}&radius=1000&_type=json`;
        const res = await fetch(url);
        const json = await res.json();
        let items = json.response?.body?.items?.item ?? [];

        // nodeid 유효성 체크하고 필터
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
        setLoadingStops(false); // 반드시 여기서 해제
      }
    };

    fetchNearbyStops();
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    if (!selectedStop) return;
    const fetchData = async () => {
      setLoadingArrivals(true);
      const result = await fetchArrivalInfo(selectedStop.bsId);
      setArrivalData(result);
      setLoadingArrivals(false);
    };
    fetchData();
  }, [selectedStop]);

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
          center={{ lat: location.lat, lng: location.lng }}
          markers={busStops}
          selectedStop={selectedStop}
          setSelectedStop={setSelectedStop}
          setArrivalMap={setArrivalMap}
          loadingArrivals={loadingArrivals}
          setLoadingArrivals={setLoadingArrivals}
          onRelocate={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              setLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            });
          }}
        />
      </Card>

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
        <Card
          style={{ flex: 1, overflowY: "auto" }}
          styles={{ body: { padding: 8 } }}
        >
          <Spin spinning={loadingStops} tip="정류장을 불러오는 중...">
            {busStops.map((item, index) => (
              <Card
                key={item.arsId}
                style={{ marginBottom: 8, cursor: "pointer", minHeight: 70 }}
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
                    setArrivalMap((prev) => ({ ...prev, [item.bsId]: result }));
                    setLoadingArrivals(false);
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent:"space-between" }}>
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
          </Spin>
        </Card>
      </div>

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
            styles={{ body: { padding: "0 8px" } }}
          >
            {loadingArrivals ? (
              <Spin tip="도착 정보를 불러오는 중..." fullscreen />
            ) : arrivalData.length > 0 ? (
              <List
                style={{ padding: 0 }}
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
                          <Text strong>🚌 {bus.routeName}</Text>
                          <Text
                            strong
                            style={{ color: getColorByState(bus.arrState) }}
                          >
                            {getStateText(bus.arrState)}
                          </Text>
                        </div>
                        {bus.vhcNo2 && (
                          <>
                            <br />
                            <Text>🆔 차량번호: {bus.vhcNo2}</Text>
                          </>
                        )}
                      </Card>
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
    </div>
  );
}

export default Nearby;
