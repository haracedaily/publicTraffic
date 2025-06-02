import React, { useState, useEffect, useCallback } from "react";
import { List, Card, Button } from "antd";
import { ReloadOutlined, StarFilled } from "@ant-design/icons";
import axios from "axios";
import MySearch from "../component/MySearch";
import styles from "../css/My.module.css";
import Myloca from "../component/Myloca.jsx";

const My = () => {
    const [favorites, setFavorites] = useState([]);
    const [selectedStop, setSelectedStop] = useState(null);
    const [arrivalInfo, setArrivalInfo] = useState(null);
    const [secondsRemaining, setSecondsRemaining] = useState(15);

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(savedFavorites);
        if (savedFavorites.length > 0) {
            setSelectedStop(savedFavorites[0]);
        }
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
                // console.log("API 응답:", response.data);
                if (response.data.header.success) {
                    const list = [...response.data.body.list];
                    const arrivingSoon = list.filter(item => item.arrState === "도착예정");
                    const otherItems = list.filter(item => item.arrState !== "도착예정");
                    const reorderedList = [...otherItems, ...arrivingSoon];
                    const updatedArrivalInfo = { ...response.data.body, list: reorderedList };
                    setArrivalInfo(updatedArrivalInfo);
                    // console.log("업데이트된 arrivalInfo:", updatedArrivalInfo);
                } else {
                    console.warn("API 응답 성공하지 않음:", response.data.header);
                    setArrivalInfo(null);
                }
            })
            .catch((error) => {
                console.error("도착 정보 조회 실패:", error);
                setArrivalInfo(null);
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
                const newFavorites = prev.filter((fav) => fav.bsId !== stop.bsId);

                if (newFavorites.length > 0) {
                    setSelectedStop(newFavorites[0]);
                } else {
                    setSelectedStop(null);
                    setArrivalInfo(null);
                }
                return newFavorites;
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
        <div className={styles.container}>
            <MySearch onToggleFavorite={handleToggleFavorite} favorites={favorites} />
            <div className={styles.contentWrapper}>
                <div className={styles.favoritesWrapper}>
                    <h3 className={styles.favoritesTitle}>나의 버스 목록</h3>
                    {favorites.length === 0 ? (
                        <p className={styles.noFavorites}>나의 버스 목록이 없습니다.</p>
                    ) : (
                        <List
                            bordered
                            dataSource={favorites}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleSelectStop(item)}
                                    className={styles.listItem}
                                >
                                    <div className={styles.listItemContent}>
                                        <div className={styles.textContent}>
                                            <div className={styles.stopName} title={item.bsNm}>
                                                {item.bsNm}
                                            </div>
                                            <div className={styles.stopId} title={`정류장 ID: ${item.bsId}`}>
                                                정류장 ID: {item.bsId}
                                            </div>
                                            <div
                                                className={styles.routeList}
                                                title={`경유 노선: ${item.routeList}`}
                                            >
                                                경유 노선: {item.routeList}
                                            </div>
                                        </div>
                                        <div className={styles.actions}>
                                            <Myloca stop={item} />
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(item);
                                                }}
                                                className={styles.favoriteIcon}
                                            >
                        <StarFilled style={{ color: "#fadb14" }} />
                      </span>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                            className={styles.favoritesList}
                        />
                    )}
                </div>
                {selectedStop && (
                    <div className={styles.cardWrapper}>
                        <h3
                            className={styles.favoritesTitle2}>버스 도착정보</h3>
                        <Card
                            style={{padding: '0px'}}
                            className={styles.noPadding}
                            title={
                                <div className={styles.cardTitle}>
            <span className={styles.cardTitleText} title={selectedStop.bsNm}>
                {`${selectedStop.bsNm} 도착 정보`}
            </span>
                                    <Button
                                        onClick={handleRefresh}
                                        className={styles.refreshButton}
                                    >
                                        {`${secondsRemaining}초 후`}
                                        <ReloadOutlined style={{ marginLeft: '3px' }} />
                                    </Button>
                                </div>
                            }
                        >
                            {arrivalInfo ? (
                                <List
                                    dataSource={arrivalInfo.list}
                                    renderItem={(item) => (
                                        <List.Item className={styles.arrivalItem}>
                                            <div className={styles.arrivalContent}>
                                                <div className={styles.routeInfo}>
                                                    <div
                                                        className={styles.routeNo}
                                                        title={`${item.routeNo} ${item.routeNote || ""}`}
                                                    >
                                                        🚌 {item.routeNo} {item.routeNote && `(${item.routeNote})`}
                                                    </div>
                                                    <div
                                                        className={styles.arrivalState}
                                                        title={
                                                            item.arrState === "전"
                                                                ? "곧 도착"
                                                                : item.arrState === "전전"
                                                                    ? "곧 도착 예정"
                                                                    : item.arrState === "도착예정"
                                                                        ? "차고지 대기"
                                                                        : item.arrState
                                                                            ? `${item.arrState} 후 도착`
                                                                            : "정보 없음"
                                                        }
                                                    >
                                                        {item.arrState === "전"
                                                            ? "곧 도착"
                                                            : item.arrState === "전전"
                                                                ? "곧 도착 예정"
                                                                : item.arrState === "도착예정"
                                                                    ? "차고지 대기"
                                                                    : item.arrState
                                                                        ? `${item.arrState} 후 도착`
                                                                        : "정보 없음"}
                                                    </div>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                    className={styles.arrivalList}
                                />
                            ) : (
                                <div className={styles.loadingMessage}>
                                    도착 정보를 불러오는 중...
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default My;