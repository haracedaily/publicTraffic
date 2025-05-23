import React, { useState, useEffect, useRef } from "react";
import { List, Card, Typography, Spin, message } from "antd";
import { fetchArrivalInfo } from "../api/busApi";
import KakaoMapView from "../components/KakaoMapView";
import useGeoLocation from "../hooks/GeoLocation";
import { getDistance } from "../utils/distance";

const { Title, Text } = Typography;

const DAEGU_API_KEY = import.meta.env.VITE_DAEGU_ENC_KEY;

function Nearby() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [busStops, setBusStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [arrivalData, setArrivalData] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const locationHook = useGeoLocation();
  const errorShownRef = useRef(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
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
        timeout: 10000,
      }
    );
  }, []);

  useEffect(() => {
    if (!location.lat || !location.lng) return;

    const fetchNearbyStops = async () => {
      setLoadingStops(true);
      const { lat, lng } = location;

      const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=${encodeURIComponent(
        DAEGU_API_KEY
      )}&gpsLati=${lat}&gpsLong=${lng}&_type=json`;

      try {
        const res = await fetch(url);
        const text = await res.text();

        if (text.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")) {
          throw new Error("API 키 오류: 서비스 키가 등록되지 않았습니다.");
        }

        const xml = new DOMParser().parseFromString(text, "text/xml");
        const items = [...xml.querySelectorAll("item")];

        const stops = items
          .map((item) => {
            const stopLat = parseFloat(
              item.querySelector("gpslati")?.textContent ?? "0"
            );
            const stopLng = parseFloat(
              item.querySelector("gpslong")?.textContent ?? "0"
            );
            const name =
              item.querySelector("stationNm")?.textContent ?? "이름없음";
            const arsId = item.querySelector("arsId")?.textContent ?? "";

            return {
              name,
              arsId,
              lat: stopLat,
              lng: stopLng,
              distance: getDistance(
                location.lat,
                location.lng,
                stopLat,
                stopLng
              ),
            };
          })
          .sort((a, b) => a.distance - b.distance);

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
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", height: "100%", justifyContent: "end", alignItems: "center" }}>
          <Card style={{ width: "60%", height: "70%", padding: 0, marginBottom: "24px" }}>
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

        <div style={{ display: "flex", width: "50%", gap: "24px", justifyContent: "start" }}>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ textAlign: "center" }}>
              📍 주변 정류장
            </Title>
            <Card style={{height:"100%"}}>
              {loadingStops ? (
                <Spin tip="정류장을 불러오는 중...">
                  <div style={{ height: 300 }} />
                </Spin>
              ) : (
                <List
                  dataSource={busStops}
                  renderItem={(stop, index) => (
                    <Card
                      style={{
                        marginBottom: "12px",
                        borderRadius: "12px",
                        border: "1px solid #eee",
                        cursor: "pointer",
                      }}
                      bodyStyle={{ padding: "12px 16px" }}
                      onClick={() => setSelectedStop(stop)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Text strong>
                            {index + 1}. {stop.name}
                          </Text>
                        </div>
                        <div>
                          <Text>{(stop.distance / 1000).toFixed(1)} km</Text>
                        </div>
                      </div>
                    </Card>
                  )}
                />
              )}
            </Card>
          </div>

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
