import React, { useState, useEffect } from "react";
import { List, Card, Typography, Spin, message } from "antd";
import { fetchArrivalInfo } from "../api/busApi";
// import MapView from "../components/MapView";
import KakaoMapView from "../components/KakaoMapView";
import useGeoLocation from "../hooks/GeoLocation";

const { Title, Text } = Typography;

const DAEGU_API_KEY = import.meta.env.VITE_DAEGU_DEC_KEY;

function Nearby() {
  const [location, setLocation] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [arrivalData, setArrivalData] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const locationHook = useGeoLocation();

  const [stops, setStops] = useState([]); // 초기 선언

  useEffect(() => {
    if (userLat && userLng) {
      fetchNearbyStops(userLat, userLng); // 예시 API 호출
    }
  }, [userLat, userLng]);

  const fetchNearbyStops = async (lat, lng) => {
    try {
      const response = await getNearbyBusStops(lat, lng); // API 호출 함수
      setStops(response);
    } catch (err) {
      console.error("정류장 목록 불러오기 실패", err);
    }
  };

  // 1. 현재 위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("위치 추적 실패:", err);
        message.error("위치를 가져오지 못했습니다.");
        setLoadingStops(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  // 2. 위치 기반 정류장 불러오기
  useEffect(() => {
    if (!location) return;

    const fetchNearbyStops = async () => {
      setLoadingStops(true);
      const { lat, lng } = location;
      const url = `https://businfo.daegu.go.kr/openapi/service/BusRouteInfoService/getStationByPos?tmX=${lng}&tmY=${lat}&radius=500&serviceKey=${DAEGU_API_KEY}`;

      try {
        const res = await fetch(url);
        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const items = [...xml.querySelectorAll("item")];

        const stops = items.map((item) => ({
          name: item.querySelector("stationNm")?.textContent ?? "이름없음",
          arsId: item.querySelector("arsId")?.textContent ?? "",
        }));

        setBusStops(stops);
        if (stops.length > 0) setSelectedStop(stops[0]);
      } catch (err) {
        console.error("정류장 불러오기 실패:", err);
        message.error("주변 정류장을 불러오는 데 실패했습니다.");
      } finally {
        setLoadingStops(false);
      }
    };

    fetchNearbyStops();
  }, [location]);

  // 3. 정류장 도착 정보 불러오기
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
      {locationHook && (
        <KakaoMapView
          center={{ lat: location.lat, lng: location.lng }}
          markers={stops}
        />
      )}
      <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
        {/* 왼쪽: 정류장 리스트 */}
        <div style={{ flex: 1 }}>
          <Title level={3}>📍 주변 정류장</Title>
          {loadingStops ? (
            <Spin tip="정류장을 불러오는 중...">
              <div style={{ height: 300 }} />
            </Spin>
          ) : (
            <List
              bordered
              dataSource={busStops}
              renderItem={(stop) => (
                <List.Item
                  onClick={() => setSelectedStop(stop)}
                  style={{ cursor: "pointer" }}
                >
                  <Text strong>{stop.name}</Text> <br />
                  <Text type="secondary">ID: {stop.arsId}</Text>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* 오른쪽: 도착 정보 */}
        <div style={{ flex: 1 }}>
          <Title level={4}>🚌 {selectedStop?.name} 도착 정보</Title>
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
      </div>
    </>
  );
}

export default Nearby;
