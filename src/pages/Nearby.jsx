import React, { useState, useEffect, useRef } from "react";
import { List, Card, Typography, Spin, message } from "antd";
import { fetchArrivalInfo } from "../api/busApi";
import KakaoMapView from "../components/KakaoMapView";
import useGeoLocation from "../hooks/GeoLocation";
import { getDistance } from "../utils/distance";
import { EnvironmentOutlined } from "@ant-design/icons";

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

  console.log("busStops에 저장된 데이터:", busStops);
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
    if (
      typeof location.lat !== "number" ||
      typeof location.lng !== "number" ||
      isNaN(location.lat) ||
      isNaN(location.lng)
    )
      return;

    const fetchNearbyStops = async () => {
      setLoadingStops(true);
      const { lat, lng } = location;

      const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=l7L9HOYK5mFEJAehYbro5q9qXaJofTBB7nv0fYzNNIqJE%2FYGs2d7Gn6%2FDb6qrv9D1F9v5iEm%2BpXpQ%2FCINV59DA%3D%3D&gpsLati=${lat}&gpsLong=${lng}&radius=500&_type=json`;

      try {
        const res = await fetch(url);
        const json = await res.json();
        console.log("응답 원본", json);

        // if (json.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
        //   throw new Error("API 키 오류: 서비스 키가 등록되지 않았습니다.");
        // }

        // const xml = new DOMParser().parseFromString(text, "text/xml");
        const items = json.response.body.items?.item ?? [];
        console.log("item 수:", items.length);

        const stops = items.map((item) => {
          // const stopLat = parseFloat(item.querySelector("gpslati")?.textContent ?? "0");
          // const stopLng = parseFloat(item.querySelector("gpslong")?.textContent ?? "0");
          // const name = item.querySelector("nodenm")?.textContent ?? "이름없음";
          // const arsId = item.querySelector("nodeid")?.textContent ?? "";
          const stopLat = parseFloat(item.gpslati ?? "0");
          const stopLng = parseFloat(item.gpslong ?? "0");
          const name = item.nodenm ?? "이름없음";
          const arsId = item.nodeid ?? "";

          return {
            name,
            arsId,
            lat: stopLat,
            lng: stopLng,
            distance: getDistance(location.lat, location.lng, stopLat, stopLng),
          };
        });
        // .sort((a, b) => a.distance - b.distance);

        console.log("파싱된 stops:", stops);
        setBusStops(stops);
      } catch (err) {
        if (!errorShownRef.current) {
          message.error(
            "주변 정류장을 불러오는 데 실패했습니다: " + err.message
          );
          errorShownRef.current = true;
        }
        console.error("정류장 불러오기 실패:", err);
      } finally {
        setLoadingStops(false);
      }
    };

    fetchNearbyStops();
    console.log("API 호출 좌표", location.lat, location.lng);
  }, [location]);

  useEffect(() => {
    if (!selectedStop) return;

    const fetchData = async () => {
      setLoadingArrivals(true);
      const result = await fetchArrivalInfo(selectedStop.arsId);
      setArrivalData(result);
      setLoadingArrivals(false);
    };

    fetchData();
  }, [selectedStop]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedStop ? "1fr 1fr 1fr" : "1fr 1fr",
          gap: "24px",
          width: "100%",
          height: "100%",
          justifycontent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Card style={{ width: "70%", marginBottom: "50%" }}>
            {location.lat && location.lng && (
              <KakaoMapView
                center={{ lat: location.lat, lng: location.lng }}
                markers={busStops}
                onRelocate={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setLocation({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    });
                  });
                }}
              />
            )}
          </Card>
        </div>

        <div
          style={{
            display: "flex",
            width: "70%",
            height: "85%",
            gap: "24px",
            // justifyContent: "start",
            // alignItems: "center",
            // flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 , justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EnvironmentOutlined
                style={{
                  fontSize: "30px",
                  color: "#2d6ae0",
                  marginRight: "10px",
                  marginBottom: "10px",
                }}
              />
              {/* <Title style={{ fontSize:"20px",textAlign: "center" }}> */}
              <h1>주변 정류장</h1>
              {/* </Title> */}
            </div>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              현재 위치 근처의 버스 정류장 목록입니다.
            </Text>
            <Card
              style={{
                maxHeight: "50%",
                overflowY: "auto",
                paddingRight: "4px",
                borderRadius: "12px",
              }}
            >
              {loadingStops ? (
                <Spin tip="정류장을 불러오는 중...">
                  <div style={{ height: 300 }} />
                </Spin>
              ) : busStops.length === 0 ? (
                <Text type="secondary">주변에 정류장이 없습니다.</Text>
              ) : (
                <List
                  dataSource={busStops}
                  loading={loadingStops}
                  renderItem={(item, index) => (
                    <Card
                      key={item.arsId}
                      style={{
                        marginBottom: "12px",
                        borderRadius: "12px",
                        border: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      bodyStyle={{ padding: "12px 16px" }}
                      onClick={() => setSelectedStop(item)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Text strong>
                            {index + 1}. {item.name}
                          </Text>
                          <div style={{ marginTop: 4, color: "#888" }}>
                            정류장 ID: {item.arsId}
                          </div>
                        </div>
                        <div>
                          <Text>{(item.distance / 1000).toFixed(1)} km</Text>
                        </div>
                      </div>
                    </Card>
                  )}
                />
              )}
            </Card>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selectedStop ? "1fr 1fr" : "1fr",
              gap: "24px",
            }}
          >
            {selectedStop && (
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ textAlign: "center" }}>
                  🚌 {selectedStop.name} 도착 정보
                </Title>
                {loadingArrivals ? (
                  <Spin tip="도착 정보를 불러오는 중..." />
                ) : arrivalData.length > 0 ? (
                  <List
                    bordered
                    dataSource={arrivalData}
                    renderItem={(bus) => (
                      <List.Item>
                        <Card style={{ width: "100%" }}>
                          <Text>
                            🚌 버스번호: <strong>{bus.routeName}</strong>
                          </Text>
                          <br />
                          <Text>⏱ 예상 도착: {bus.predictTime1}분</Text>
                          <br />
                          <Text>📍 남은 정류장: {bus.locationNo1}개</Text>
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">도착 정보가 없습니다.</Text>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Nearby;
