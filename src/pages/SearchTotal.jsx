import React from 'react';
import {Card, Input, List, message, Space} from "antd";
import kakaoMap from "../js/kakaoMap.js";
import proj4 from 'proj4';

// EPSG:5182 (TM-동부원점) 좌표계 정의
proj4.defs("EPSG:5182", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// EPSG:4326 (WGS84) 좌표계 정의
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
///[^ㄱ-ㅎ가-힣a-zA-Z0-9]/g
function SearchTotal(props) {

    const fetchArrivalInfo = (bsId) => {
        kakaoMap.getArrivalInfo(bsId)
            .then(res => {
                if(res!==404){
                    console.log("도착 예정정보",res.list);
                    props.setArrivalInfo(res);
                }
            })
            .catch(error => {
                console.error("도착 정보 조회 실패:", error);
            });
    };
    const convertNGISToKakao = (x, y) => {
        const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
        let lat = latitude;
        let lng = longitude;
        return { lat, lng };
    };
    const searchTotal = async (value) =>{
        if(value){
            let res = await kakaoMap.getSearchTotal(value);
            if(res===404){
                message.warning("검색결과가 존재하지 않습니다.");
            }else{
                props.setSearchResults(res);
                props.setArrivalInfo(null);
                props.setSelectedStop(null);
            }
        }

    }
    return (
        <div>
            <Space.Compact style={{ width: '100%', padding: '20px' }}>
                <Input.Search placeholder="버스번호 및 정류소" onSearch={searchTotal} allowClear />
            </Space.Compact>
            <div>
                <List
                    bordered
                    dataSource={props.searchResults}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => {
                                props.setMarkerClicked(false);
                                fetchArrivalInfo(item.bsId);
                                let {lat,lng} = convertNGISToKakao(item.ngisXPos, item.ngisYPos);
                                item.lat = lat;
                                item.lng = lng;
                                props.setSelectedStop(item);
                                props.setMapCenter({lat,lng});
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ width: "100%" }}>
                                <div style={{
                                    fontWeight: "bold",
                                    fontSize: "1.1em",
                                    marginBottom: "4px"
                                }}>
                                    {item.bsNm}
                                </div>
                                <div style={{
                                    color: "#666",
                                    fontSize: "0.9em",
                                    marginBottom: "4px"
                                }}>
                                    정류장 ID: {item.bsId}
                                </div>
                                <div style={{
                                    color: "#1890ff",
                                    fontSize: "0.9em"
                                }}>
                                    경유 노선: {item.routeList}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
            {props.selectedStop && (
                <Card
                    title={`${props.selectedStop.bsNm} 실시간 도착 정보`}
                    style={{ marginTop: "1rem" }}
                >
                    {props.arrivalInfo ? (
                        <List
                            dataSource={props.arrivalInfo.list}
                            renderItem={(item) => (
                                <List.Item>
                                    <div style={{ width: "100%" }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "4px"
                                        }}>
                                            <div style={{
                                                fontWeight: "bold",
                                                fontSize: "1.1em"
                                            }}>
                                                {item.routeNo} {item.routeNote && `(${item.routeNote})`}
                                            </div>
                                            <div style={{
                                                color: item.arrState === "전" ? "#52c41a" :
                                                    item.arrState === "전전" ? "#faad14" : item.arrState ==='도착예정' ? "#aaaaaa" :"#1890ff",
                                                fontWeight: "bold"
                                            }}>
                                                {item.arrState === "전" ? "곧 도착" :
                                                    item.arrState === "전전" ? "곧 도착 예정" : item.arrState ==='도착예정' ? "차고지 대기" :
                                                        `${item.arrState} 후 도착`}
                                            </div>
                                        </div>
                                        <div style={{
                                            color: "#666",
                                            fontSize: "0.9em"
                                        }}>
                                            버스 번호: {item.vhcNo2}
                                        </div>
                                    </div>
                                    {props.openedRoute && props?.selectedRoute?.routeId === item.routeId && (
                                        <Card>

                                        </Card>
                                    )}
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div>도착 정보를 불러오는 중...</div>
                    )}
                </Card>
            )}
        </div>
    );
}

export default SearchTotal;