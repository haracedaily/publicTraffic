import React from 'react';
import {Card, Input, List, message, Space} from "antd";
import kakaoMap from "../js/kakaoMap.js";

function SearchTotal(props) {
    console.log(props);
    const fetchArrivalInfo = (bsId) => {
        kakaoMap.getArrivalInfo(bsId)
            .then(res => {
                if(res!==404){
                    console.log(res);
                    props.setArrivalInfo(res);
                }
            })
            .catch(error => {
                console.error("도착 정보 조회 실패:", error);
            });
    };
    const convertNGISToKakao = (x, y) => {
        // NGIS 좌표를 카카오맵 좌표로 변환하는 공식
        // 대구시 기준 변환 공식
        const lat = 35.8693 + (y - 363760.41323086) * 0.00001;
        const lng = 128.6062 + (x - 163696.53125238) * 0.00001;
        return { lat, lng };
    };
    const searchTotal = async (value) =>{
        if(value){
            let res = await kakaoMap.getSearchTotal(value);
            if(res===404){
                message.warning("검색결과가 존재하지 않습니다.");
            }else{
                props.setSearchResults(res);

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
                                fetchArrivalInfo(item.bsId);
                                props.setSelectedStop(item);
                                props.setMapCenter(convertNGISToKakao(item.ngisXPos, item.ngisYPos));
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
                                                    item.arrState === "전전" ? "#faad14" : "#1890ff",
                                                fontWeight: "bold"
                                            }}>
                                                {item.arrState === "전" ? "곧 도착" :
                                                    item.arrState === "전전" ? "곧 도착 예정" :
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