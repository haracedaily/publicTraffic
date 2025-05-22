import React, { useState, useEffect, useCallback } from "react";
import { List, Card, Button } from "antd";
import { ReloadOutlined, StarFilled } from "@ant-design/icons";
import axios from "axios";
import MySearch from "../component/MySearch";

const My = () => {
    const [favorites, setFavorites] = useState([]);
    const [selectedStop, setSelectedStop] = useState(null);
    const [arrivalInfo, setArrivalInfo] = useState(null);
    const [secondsRemaining, setSecondsRemaining] = useState(15);

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(savedFavorites);
    }, []);

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const fetchArrivalInfo = useCallback(() => {
        if (!selectedStop) return;
        axios
            .get(
                `https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${selectedStop.bsId}`
            )
            .then((response) => {
                if (response.data.header.success) {
                    let data = [...response.data.body.list].filter(item=>item.arrState==="도착예정");
                    response.data.body.list.splice(response.data.body.list.findIndex(item=>item.arrState==="도착예정"),1);
                    response.data.body.list.push(...data);
                    setArrivalInfo(response.data.body);
                }
            })
            .catch((error) => {
                console.error("도착 정보 조회 실패:", error);
            });
    }, [selectedStop]);

    useEffect(() => {
        if (!selectedStop) return;

        fetchArrivalInfo();

        const interval = setInterval(() => {
            fetchArrivalInfo();
        }, 15000);

        const timer = setInterval(() => {
            setSecondsRemaining((prev) => {
                const next = prev - 1;
                return next < 0 ? 15 : next;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [selectedStop, fetchArrivalInfo]);

    const handleToggleFavorite = (stop) => {
        setFavorites((prev) => {
            const isFavorite = prev.some((fav) => fav.bsId === stop.bsId);
            if (isFavorite) {
                return prev.filter((fav) => fav.bsId !== stop.bsId);
            } else {
                return [...prev, stop];
            }
        });
    };

    const handleSelectStop = (stop) => {
        setSelectedStop(stop);
        setSecondsRemaining(15);
    };

    const handleRefresh = () => {
        fetchArrivalInfo();
        setSecondsRemaining(15);
    };

    return (
        <div style={{ padding: "1rem" }}>
            <MySearch
                onSelectStop={handleSelectStop}
                onToggleFavorite={handleToggleFavorite}
                favorites={favorites}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "1rem",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                }}
                className="container"
            >
                <div style={{ flex: "1", minWidth: "300px" }}>
                    <h3>즐겨찾기 목록</h3>
                    {favorites.length === 0 ? (
                        <p>즐겨찾기가 없습니다.</p>
                    ) : (
                        <List
                            bordered
                            dataSource={favorites}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(item);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                      <StarFilled style={{ color: "#fadb14" }} />
                    </span>,
                                    ]}
                                    onClick={() => handleSelectStop(item)}
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
                                            정류장 ID: {item.bsId}
                                        </div>
                                        <div style={{ color: "#1890ff", fontSize: "0.9em" }}>
                                            경유 노선: {item.routeList}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                            style={{ maxHeight: "400px", overflowY: "auto" }}
                        />
                    )}
                </div>
                {selectedStop && (
                    <div style={{ flex: "1", minWidth: "300px" }}>
                        <Card
                            title={
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span>{`${selectedStop.bsNm} 실시간 도착 정보`}</span>
                                    <span style={{ marginLeft: "1rem", color: "#1890ff" }}>
                    {`${secondsRemaining}초 후 갱신`}
                  </span>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                        style={{ marginLeft: "1rem" }}
                                    >
                                    </Button>
                                </div>
                            }
                        >
                            {arrivalInfo ? (
                                <List
                                    dataSource={arrivalInfo.list}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div style={{ width: "100%" }}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
                                                        {item.routeNo} {item.routeNote && `(${item.routeNote})`}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color:
                                                                item.arrState === "전"
                                                                    ? "#52c41a"
                                                                    : item.arrState === "전전"
                                                                        ? "#faad14"
                                                                        :item.arrState ==='도착예정' ? "#aaaaaa" : "#1890ff",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {item.arrState === "전"
                                                            ? "곧 도착"
                                                            : item.arrState === "전전"
                                                                ? "곧 도착 예정"
                                                                : item.arrState ==='도착예정' ? "차고지 대기" : `${item.arrState} 후 도착`}
                                                    </div>
                                                </div>
                                                <div style={{ color: "#666", fontSize: "0.9em" }}>
                                                    버스 번호: {item.vhcNo2}
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                    style={{ maxHeight: "400px", overflowY: "auto" }}
                                />
                            ) : (
                                <div>도착 정보를 불러오는 중...</div>
                            )}
                        </Card>
                    </div>
                )}
            </div>

        </div>
    );
};

export default My;