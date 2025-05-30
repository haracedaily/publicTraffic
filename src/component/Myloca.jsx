// component/Myloca.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, message } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import proj4 from "proj4";
import styles from "../css/MySearch.module.css";

// EPSG:5182 (TM-동부원점) 좌표계 정의
proj4.defs("EPSG:5182", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// EPSG:4326 (WGS84) 좌표계 정의
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

const Myloca = ({ stop }) => {
    const key = "myloca_key";
    const [isMapModalVisible, setIsMapModalVisible] = useState(false);
    const [coords, setCoords] = useState(null);
    const mapRef = useRef(null);
    const scriptLoaded = useRef(false); // 스크립트 로드 상태 관리

    // 카카오 지도 API 스크립트 로드
    useEffect(() => {
        if (scriptLoaded.current) return; // 이미 로드된 경우 스킵

        // 기존 스크립트가 있는지 확인
        const existingScript = document.querySelector(
            `script[src^="//dapi.kakao.com/v2/maps/sdk.js"]`
        );
        if (existingScript) {
            scriptLoaded.current = true;
            if (window.kakao) {
                console.log("Kakao Maps API already loaded");
            }
            return;
        }

        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_API_KEY}&libraries=services`
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            console.log("Kakao Maps API loaded");
            scriptLoaded.current = true;
        };
        script.onerror = () => {
            console.error("Failed to load Kakao Maps API");
            message.error({
                content: "카카오 지도를 로드하지 못했습니다.",
                key,
                duration: 2,
            });
        };

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // 지도 초기화
    useEffect(() => {
        if (isMapModalVisible && coords && window.kakao) {
            const container = mapRef.current;
            const options = {
                center: new window.kakao.maps.LatLng(coords.lat, coords.lng),
                level: 4, // 확대 레벨
            };
            const map = new window.kakao.maps.Map(container, options);

            // 마커 추가
            const markerPosition = new window.kakao.maps.LatLng(coords.lat, coords.lng);

            const markerImage = new window.kakao.maps.MarkerImage(
                "/stop_marker.png", // public 폴더의 이미지
                new window.kakao.maps.Size(50, 50), // 이미지 크기
                {
                    offset: new window.kakao.maps.Point(25, 48), // 기준점: 하단 중앙
                }
            );
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                image: markerImage,
                map: map,
            });


            marker.setMap(map);

            // 인포윈도우 추가
            const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:14px;color:#333;background:#fff;border-radius:5px;">${stop.bsNm}</div>`,
            });
            infowindow.open(map, marker);
        }
    }, [isMapModalVisible, coords, stop.bsNm]);

    const handleShowMap = () => {
        if (!stop.ngisXPos || !stop.ngisYPos) {
            message.error({
                content: "위치 정보를 불러올 수 없습니다.",
                key,
                duration: 2,
            });
            return;
        }
        const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [stop.ngisXPos, stop.ngisYPos]);
        setCoords({ lat, lng });
        setIsMapModalVisible(true);
    };

    const handleCloseMap = () => {
        setIsMapModalVisible(false);
        setCoords(null);
    };

    return (
        <>
            <Button
                icon={<EnvironmentOutlined />}
                onClick={(e) => {
                    e.stopPropagation();
                    handleShowMap();
                }}
                className={styles.mapButton}
            >
            </Button>
            <Modal
                title={`${stop.bsNm || "정류장"} 위치`}
                open={isMapModalVisible}
                onCancel={handleCloseMap}
                footer={null}
                width={600}
                // bodyStyle={{ height: "400px" }}
                styles={{ body: { height: "400px" } }}

            >
                {coords && coords.lat && coords.lng ? (
                    <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
                ) : (
                    <div>위치 정보를 불러올 수 없습니다.</div>
                )}
            </Modal>
        </>
    );
};

export default Myloca;