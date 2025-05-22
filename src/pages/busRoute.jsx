import React, {useState} from 'react';
import {Button, Card, Input, List, message, Space} from "antd";
import axios from "axios";
import proj4 from "proj4";

function BusRoute(props) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [arrivalInfo, setArrivalInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState({lat: 35.8693, lng: 128.6062});
  const [selectedStop, setSelectedStop] = useState(null);
  const [searchTarget, setSearchTarget] = useState(null);


  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  }

  const handleSearch = () => {
    if (!origin || !destination) {
      message.warning('출발지와 도착지를 모두 입력해주세요.');
      return;
    }
    message.success(`검색: ${origin} → ${destination}`);
    // console.log('origin', origin);
    // console.log(destination);
  }

  const fetchArrivalInfo = (bsId) => {
    axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${bsId}`)
        .then(response => {
          if (response.data.header.success) {
            setArrivalInfo(response.data.body);
          }
        })
        .catch(error => {
          console.error("도착 정보 조회 실패:", error);
        });
  };

  const handleReset = () => {
    setOrigin('');
    setDestination('');
  }

  const convertNGISToKakao = (x, y) => {
    const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
    let lat = latitude;
    let lng = longitude;
    return {lat, lng};
  }

  const searchBusRoute = (value, setValue) => {
    axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${value}&wincId=`)
        .then(response => {
          if (response.data.header.success) {
            setValue(value);
            setSearchResults(response.data.body);
            setArrivalInfo(null);
            if (response.data.body.length > 0) {
              const firstStop = response.data.body[0];
              setSelectedStop(firstStop);
              setMapCenter(convertNGISToKakao(firstStop.ngisXPos, firstStop.ngisYPos));
              fetchArrivalInfo(firstStop.bsId);
            }
          }
        })
        .catch(error => {
          console.log("정류장 검색 실패했습니다:", error);
        });
  };

  return (
      <div>
        <div style={{padding: "20px"}}>
          <Space direction="vertical" style={{width: '100%'}}>
            <Input.Search placeholder="출발지를 선택하세요."
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          onSearch={(value) => {
                            setSearchTarget('origin');
                            searchBusRoute(value, setOrigin);
                          }}
                          allowClear
            />
            <Input.Search placeholder="도착지를 선택하세요."
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          onSearch={(value) => {
                            setSearchTarget('destination');
                            searchBusRoute(value, setDestination);
                          }}
                          allowClear
            />
          </Space>
        </div>

        <div style={{padding: '20px'}}>
          <Space>
            <Button onClick={handleSwap}>🔄 출발지 ↔ 도착지</Button>
            <Button type="primary" onClick={handleSearch}>경로찾기</Button>
            <Button danger onClick={handleReset}>초기화</Button>
          </Space>
        </div>

        <div style={{padding: '20px'}}>
          <List
              bordered
              dataSource={searchResults}
              renderItem={(item) => (
                  <List.Item
                      onClick={() => {
                        fetchArrivalInfo(item.bsId);
                        setSelectedStop(item);
                        setMapCenter(convertNGISToKakao(item.ngisXPos, item.ngisYPos));

                        if (searchTarget === 'origin') {
                          setOrigin(item.bsNm);
                        } else if (searchTarget === 'destination') {
                          setDestination(item.bsNm);
                        }
                      }}
                      style={{cursor: 'pointer'}}
                  >
                    <div style={{width: "100%"}}>
                      <div style={{fontWeight: "bold", fontSize: "1.1em", marginBottom: "4px"}}>
                        {item.bsNm}
                      </div>
                      <div style={{color: "#666", fontSize: "0.9em", marginBottom: "4px"}}>
                        정류장ID: {item.bsId}
                      </div>
                      <div style={{color: "#1890ff", fontSize: "0.9em"}}>
                        경유노선: {item.routeList}
                      </div>
                    </div>
                  </List.Item>
              )}
          />
        </div>

        {/*<div>*/}
        {/*  {selectedStop && (*/}
        {/*      <Card*/}
        {/*          title={`[ ${selectedStop.bsNm} ] 실시간 도착 정보`}*/}
        {/*          style={{marginTop: '1rem'}}*/}
        {/*      >*/}
        {/*        {arrivalInfo ? (*/}
        {/*            <Card>*/}
        {/*              <List*/}
        {/*                  dataSource={arrivalInfo.list}*/}
        {/*                  renderItem={(item) => (*/}
        {/*                      <List.Item>*/}
        {/*                        <div style={{width: "100%"}}>*/}
        {/*                          <div*/}
        {/*                              style={{*/}
        {/*                                display: "flex",*/}
        {/*                                justifyContent: "space-between",*/}
        {/*                                alignItems: "center",*/}
        {/*                                marginBottom: "4px",*/}
        {/*                              }}*/}
        {/*                          >*/}
        {/*                            <div style={{fontWeight: "bold", fontSize: "1.1em"}}>*/}
        {/*                              {item.routeNo} {item.routeNote && `(${item.routeNote})`}*/}
        {/*                            </div>*/}
        {/*                            <div style={{*/}
        {/*                              color: item.arrState === "전" ? "#FFE31A" :*/}
        {/*                                  item.arrState === "전전" ? "#ABBA7C" : "#3D5300",*/}
        {/*                              fontWeight: "bold"*/}
        {/*                            }}>*/}
        {/*                              {item.arrState === "전" ? "곧 도착" :*/}
        {/*                                  item.arrState === "전전" ? "곧 도착 예정" :*/}
        {/*                                      `${item.arrState} 후 도착`}*/}
        {/*                            </div>*/}
        {/*                          </div>*/}
        {/*                          <div style={{*/}
        {/*                            color: "#666",*/}
        {/*                            fontSize: "0.9em"*/}
        {/*                          }}>*/}
        {/*                            버스번호: {item.vhcNo2}*/}
        {/*                          </div>*/}
        {/*                        </div>*/}
        {/*                      </List.Item>*/}
        {/*                  )}*/}
        {/*              />*/}
        {/*            </Card>*/}
        {/*        ) : (<div>도착 정보 불러오는 중...</div>)}*/}
        {/*      </Card>*/}
        {/*  )}*/}
        {/*</div>*/}


      </div>
  );
}

export default BusRoute;