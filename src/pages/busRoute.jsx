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
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const key = "unique_noti_key";

  const handleSwap = () => {
    // 현재 상태 임시 저장
    const prevOrigin = origin;
    const prevDestination = destination;
    const prevSelectedOrigin = selectedOrigin;
    const prevSelectedDestination = selectedDestination;

    // 상태 한꺼번에 업데이트
    setOrigin(prevDestination);
    setDestination(prevOrigin);
    setSelectedOrigin(prevSelectedDestination);
    setSelectedDestination(prevSelectedOrigin);
  };

  const handleSearch = () => {
    if (!selectedOrigin && !selectedDestination) {
      message.warning({
        content: "출발 정류장과 도착 정류장을 선택해주세요.",
        key,
        duration: 2,
      });
      return;
    }
    if (!selectedOrigin) {
      message.warning({
        content: "출발 정류장을 선택해주세요.",
        key,
        duration: 2,
      });
      return;
    }
    if (!selectedDestination) {
      message.warning({
        content: "도착 정류장을 선택해주세요.",
        key,
        duration: 2,
      });
      return;
    }
    const newEntry = { origin, destination };
    const isDuplicate = searchHistory.some(
      (entry) => entry.origin === origin && entry.destination === destination
    );

    if (!isDuplicate) {
      const updated = [newEntry, ...searchHistory.slice(0, 4)];
      setSearchHistory(updated);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
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

    message.loading({
      content: "이동 경로를 확인하는 중입니다. 조금만 기다려 주세요.",
      key,
      duration: 2,
    });

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

        // console.log("API 응답 전체:", response.data);
        // console.log("응답 header:", header);
        // console.log("경로 body:", body);

        if (header?.success && Array.isArray(body) && body.length > 0) {
          setRouteList(body);
        } else {
          message.error({
            content: "요청하신 경로를 찾지 못했습니다.",
            key,
            duration: 2,
          });
          setRouteList([]);
        }
      })
      .catch((error) => {
        console.error("경로 검색 실패:", error);
        message.error({
          content: "경로를 검색하는 중 문제가 발생했습니다.",
          key,
          duration: 2,
        });
      });

    setIsRouteSearched(true);
  };

  const handleDeleteHistory = (index) => {
    const updated = [...searchHistory];
    updated.splice(index, 1);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
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

  const searchBusRoute = (value, setValue, target = null, callback = null) => {
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

            if (target === "origin") {
              setOrigin(firstStop.bsNm);
              setSelectedOrigin(firstStop);
            } else if (target === "destination") {
              setDestination(firstStop.bsNm);
              setSelectedDestination(firstStop);
            }

            if (callback) {
              callback(firstStop);
            }
          }
        }
      })
      .catch((error) => {
        console.log("정류장 검색에 실패했습니다:", error);
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
            placeholder="출발지를 선택해 주세요."
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setSearchTarget("origin");
            }}
            onSearch={(value) => {
              setSearchTarget("origin");
              searchBusRoute(value, setOrigin);
            }}
            allowClear
          />

          <Input.Search
            id="destinationInput"
            placeholder="도착지를 선택해 주세요."
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setSearchTarget("destination");
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

      <div style={{ padding: "20px" }}>
        <Card title="최근 검색 경로" size="small">
          <List
            dataSource={searchHistory}
            renderItem={(item, index) => (
              <List.Item
                key={index}
                actions={[
                  <Button
                    type=""
                    danger
                    onClick={() => {
                      e.stopPropagation();
                      handleDeleteHistory(index);
                      console.log("최근기록 클릭됨:", item);}
                      }
                  >
                    삭제
                  </Button>,
                ]}
                onClick={() => {
                  setOrigin(item.origin);
                  setDestination(item.destination);
                  setSearchTarget("origin");
                  searchBusRoute(
                    item.origin,
                    setOrigin,
                    "origin",
                    (originStop) => {
                      setSelectedOrigin(originStop);

                      searchBusRoute(
                        item.destination,
                        setDestination,
                        "destination",
                        (destinationStop) => {
                          setSelectedDestination(destinationStop);
                        }
                      );
                      message.info({
                        content: `경로 재선택: ${item.origin} → ${item.destination}`,
                        key,
                        duration: 2,
                      });
                    }
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <span>
                  📍 {item.origin} → {item.destination}
                </span>
              </List.Item>
            )}
          ></List>
        </Card>
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
            variant="borderless"
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
          <Card title="추천 경로" variant="outlined">
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
