import React, { useState, useEffect, useRef } from "react";
import { List, Card, Typography, Spin, message } from "antd";
import { fetchArrivalInfo } from "../api/busApi";
import KakaoMapView from "../components/KakaoMapView";
import useGeoLocation from "../hooks/GeoLocation";
import { getDistance } from "../utils/distance";
import { EnvironmentOutlined } from "@ant-design/icons";
import kakaoMap from "../js/kakaoMap";
import proj4 from "proj4";

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

      try {
        const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=l7L9HOYK5mFEJAehYbro5q9qXaJofTBB7nv0fYzNNIqJE%2FYGs2d7Gn6%2FDb6qrv9D1F9v5iEm%2BpXpQ%2FCINV59DA%3D%3D&gpsLati=${lat}&gpsLong=${lng}&radius=1000&_type=json`;
        const res = await fetch(url);
        const json = await res.json();
        let items = json.response.body.items?.item ?? [];

        const searchResults = await kakaoMap.getSearchTotal("");

        const stops = items
          .filter((item) => item.nodeid.includes("DGB"))
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
              arsId: item.nodeid ?? "",
              lat: converted.lat,
              lng: converted.lng,
              distance: getDistance(lat, lng, converted.lat, converted.lng),
            };
          })
          .filter(Boolean); // null 제거

        setBusStops(stops);
      } catch (err) {
        console.error("정류장 불러오기 실패:", err);
        message.error("정류장을 불러오는 데 실패했습니다");
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
      const result = await fetchArrivalInfo(selectedStop.bsId);
      console.log("🧭 selectedStop:", selectedStop);
      console.log("도착 정보:", result);
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
          height: "100vh", // 전체 화면에 맞춤
          alignItems: "stretch",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card style={{ width: "70%" }}>
            {location.lat && location.lng && (
              <KakaoMapView
                center={{ lat: location.lat, lng: location.lng }}
                markers={busStops}
                selectedStop={selectedStop}
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
          <div style={{ flex: 1, justifyContent: "center" }}>
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
                // maxHeight: "100%",
                // overflowY: "auto",
                // paddingRight: "4px",
                // borderRadius: "12px",
                maxHeight: "100%",
                overflowY: "auto",
                borderRadius: "12px",
                paddingRight: "4px",
              }}
            >
              <Spin spinning={loadingStops} tip="정류장을 불러오는 중...">
                {busStops.length === 0 ? (
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
              </Spin>
            </Card>
          </div>
        </div>
        <div>
          <div
          // style={{
          //   display: "grid",
          //   gridTemplateColumns: selectedStop ? "1fr 1fr" : "1fr",
          //   gap: "24px",
          // }}
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
                    style={{
                      width: "100%",
                      maxHeight: "100%",
                      overflowY: "auto",
                      borderRadius: "12px",
                      paddingRight: "4px",
                      placeContent: "center",
                      placeItems: "center",
                    }}
                    bordered
                    dataSource={arrivalData}
                    renderItem={(bus) => {
                      const getColorByState = (state) => {
                        switch (state) {
                          case "전":
                            return "#52c41a"; // 곧 도착
                          case "전전":
                            return "#faad14"; // 곧 도착 예정
                          case "도착예정":
                            return "#aaaaaa"; // 차고지 대기
                          default:
                            return "#1890ff"; // 기타
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
                        <List.Item
                        style={{
                          width: "100%",
                          marginBottom: "12px",
                        }}
                        >
                          <Card
                            style={{
                              width: "100%",
                              borderRadius: "12px",
                              border: "1px solid #eee",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                              }}
                            >
                              <Text strong style={{ fontSize: "1.1em" }}>
                                🚌 {bus.routeName}
                              </Text>
                              <Text
                                strong
                                style={{ color: getColorByState(bus.arrState) }}
                              >
                                {getStateText(bus.arrState)}
                              </Text>
                            </div>
                            <Text>⏱ 예상 도착: {bus.predictTime1}분</Text>
                            <br />
                            <Text>📍 남은 정류장: {bus.locationNo1}개</Text>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Nearby;
