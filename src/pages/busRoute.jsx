import React, { useState } from "react";
import { Button, Card, Input, List, message, Space, Tag } from "antd";
import axios from "axios";
import proj4 from "proj4";

function BusRoute(props) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [arrivalInfo, setArrivalInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.8693, lng: 128.6062 });
  const [selectedStop, setSelectedStop] = useState(null);
  const [searchTarget, setSearchTarget] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeList, setRouteList] = useState([]);
  const [isRouteSearched, setIsRouteSearched] = useState(false);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = () => {
    if (!selectedOrigin || !selectedDestination) {
      message.warning("출발지와 도착지를 정류장에서 선택해주세요.");
      return;
    }

    // 출발지 및 도착지 좌표와 ID 추출
    const {
      ngisXPos: srcXPos,
      ngisYPos: srcYPos,
      bsId: srcBsID,
    } = selectedOrigin;
    const {
      ngisXPos: dstXPos,
      ngisYPos: dstYPos,
      bsId: dstBsID,
    } = selectedDestination;

    message.success("경로를 찾는 중....");

    axios
      .get("https://businfo.daegu.go.kr:8095/dbms_web_api/srcdstroute_new", {
        params: {
          srcXPos,
          srcYPos,
          dstXPos,
          dstYPos,
          srcBsID,
          dstBsID,
        },
      })
      .then((response) => {
        const { header, body } = response.data;

        // console.log("📦 API 응답 전체:", response.data);
        // console.log("📍 응답 header:", header);
        // console.log("🧭 경로 body:", body);

        if (header?.success && Array.isArray(body) && body.length > 0) {
          setRouteList(body);
        } else {
          message.error("경로를 찾을 수 없습니다.");
          setRouteList([]);
        }
      })
      .catch((error) => {
        console.error("경로 검색 실패:", error);
        message.error("경로 검색 중 오류가 발생했습니다.");
      });

    setIsRouteSearched(true);
  };

  const fetchArrivalInfo = (bsId) => {
    axios
      .get(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${bsId}`)
      .then((response) => {
        if (response.data.header.success) {
          setArrivalInfo(response.data.body);
        }
      })
      .catch((error) => {
        console.error("도착 정보 조회 실패:", error);
      });
  };

  const handleStartNewSearch = () => {
    setSearchResults([]);
    setIsRouteSearched(false);
  };

  const handleReset = () => {
    setOrigin("");
    setDestination("");
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setRouteList([]);
    handleStartNewSearch();
  };

  const convertNGISToKakao = (x, y) => {
    const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
    let lat = latitude;
    let lng = longitude;
    return { lat, lng };
  };

  const searchBusRoute = (value, setValue) => {
    if (!value || value.trim() === "") return;

    axios
      .get(
        `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${value}&wincId=`
      )
      .then((response) => {
        if (response.data.header.success) {
          setValue(value);
          setSearchResults(response.data.body);
          setArrivalInfo(null);
          setIsRouteSearched(false);
          if (response.data.body.length > 0) {
            const firstStop = response.data.body[0];
            setSelectedStop(firstStop);
            setMapCenter(
              convertNGISToKakao(firstStop.ngisXPos, firstStop.ngisYPos)
            );
            fetchArrivalInfo(firstStop.bsId);
          }
        }
      })
      .catch((error) => {
        console.log("정류장 검색 실패했습니다:", error);
      });
  };

  // 지하철 포함된 경로 안 나오도록
  const filteredRouteList = routeList.filter(
    (route) => !route.list.some((step) => step.routeNo.includes("지하철"))
  );

  return (
    <div>
      <div style={{ padding: "20px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input.Search
            id="originInput"
            placeholder="출발지를 선택하세요."
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setSearchTarget("origin");
              searchBusRoute(val, setOrigin);
            }}
            onSearch={(value) => {
              setSearchTarget("origin");
              searchBusRoute(value, setOrigin);
            }}
            allowClear
          />
          
          <Input.Search
            id="destinationInput"
            placeholder="도착지를 선택하세요."
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setSearchTarget("destination");
              searchBusRoute(val, setDestination);
            }}
            onSearch={(value) => {
              setSearchTarget("destination");
              searchBusRoute(value, setDestination);
            }}
            allowClear
          />
        </Space>
      </div>

      <div style={{ padding: "20px" }}>
        <Space>
          <Button onClick={handleSwap}>🔄 출발지 ↔ 도착지</Button>
          <Button type="primary" onClick={handleSearch}>
            경로찾기
          </Button>
          <Button danger onClick={handleReset}>
            초기화
          </Button>
        </Space>
      </div>

      <Card
        style={{ marginBottom: 16, borderRadius: 12, background: "#fafafa" }}
      >
        <p>
          <strong>출발지:</strong>{" "}
          {selectedOrigin?.bsNm || <span style={{ color: "red" }}>없음</span>}
        </p>
        <p>
          <strong>도착지:</strong>{" "}
          {selectedDestination?.bsNm || (
            <span style={{ color: "red" }}>없음</span>
          )}
        </p>
      </Card>

      {!isRouteSearched && searchResults.length > 0 && (
        <div style={{ padding: "20px" }}>
          <List
            bordered
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                onClick={() => {
                  const latlng = convertNGISToKakao(
                    item.ngisXPos,
                    item.ngisYPos
                  );
                  fetchArrivalInfo(item.bsId);
                  setSelectedStop(item);

                  if (searchTarget === "origin") {
                    setOrigin(item.bsNm);
                    setSelectedOrigin(item);
                  } else if (searchTarget === "destination") {
                    setDestination(item.bsNm);
                    setSelectedDestination(item);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1em",
                      marginBottom: "4px",
                    }}
                  >
                    {item.bsNm}
                  </div>
                  <div
                    style={{
                      color: "#666",
                      fontSize: "0.9em",
                      marginBottom: "4px",
                    }}
                  >
                    정류장ID: {item.bsId}
                  </div>
                  <div style={{ color: "#1890ff", fontSize: "0.9em" }}>
                    경유노선: {item.routeList}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      )}

      {Array.isArray(routeList) && routeList.length > 0 && (
        <div style={{ padding: "20px" }}>
          <Card title="추천 경로" bordered={false}>
            <List
              dataSource={filteredRouteList}
              renderItem={(route, idx) => (
                <List.Item
                  key={idx}
                  style={{ flexDirection: "column", alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: "100%",
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>{idx + 1}번 경로</strong>
                    <Tag color={route.transCd === "T" ? "blue" : "green"}>
                      {route.trans}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 8, fontSize: 14, color: "#555" }}>
                    총 소요 시간: <strong>{route.totalTime}</strong> / 총 거리:{" "}
                    <strong>{route.totalDist}</strong>
                  </div>
                  <List
                    dataSource={route.list}
                    renderItem={(step, sIdx) => (
                      <List.Item
                        key={sIdx}
                        style={{
                          paddingLeft: 12,
                          borderLeft: "2px solid #1890ff",
                          marginBottom: 8,
                          flexDirection: "column",
                          alignItems: "flex-start",
                          backgroundColor: sIdx % 2 === 0 ? "#f0f5ff" : "white",
                          borderRadius: 4,
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          🚌 {step.routeNo} ({step.routeType})
                        </div>
                        <div style={{ fontSize: 14, color: "#444" }}>
                          출발: {step.stBsNm} → 도착: {step.edBsNm}
                        </div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          소요 시간: {step.time} / 거리: {step.dist} / 정류장
                          수: {step.gap}
                        </div>
                      </List.Item>
                    )}
                    pagination={false}
                  />
                </List.Item>
              )}
              pagination={false}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

export default BusRoute;
