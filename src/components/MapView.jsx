import { useEffect, useRef, useState } from "react";
import { MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";

function MapView({ position, onClick, style }) {
  const [heading, setHeading] = useState(0);
  const [deviceType, setDeviceType] = useState("desktop"); // "android" | "ios" | "desktop"
  const prevHeadingRef = useRef(null);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/android/i.test(userAgent)) {
      setDeviceType("android");
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      setDeviceType("ios");
    } else {
      setDeviceType("desktop");
    }
  }, []);

  useEffect(() => {
    if (deviceType === "android" || deviceType === "ios") {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const headingValue = pos.coords.heading;
          if (headingValue !== null && headingValue !== prevHeadingRef.current) {
            setHeading(headingValue);
            prevHeadingRef.current = headingValue;
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [deviceType]);

  if (!position) return null;

  // 회전 마커 (모바일 전용)
  if (deviceType === "android" || deviceType === "ios") {
    return (
      <CustomOverlayMap position={position}>
        <div
          style={{
            transform: `rotate(${heading}deg)`,
            transition: "transform 0.2s linear",
            width: "50px",
            height: "50px",
          }}
        >
          <img
            src="/location.png"
            alt="방향 마커"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </CustomOverlayMap>
    );
  }

  // 고정 마커 (데스크탑 전용)
  return (
    <>
      <MapMarker
        position={position}
        image={{
          src: "/location.png",
          size: { width: 50, height: 50 },
          options: { offset: { x: 25, y: 50 } },
        }}
      >
      </MapMarker>
      {/* 현재 위치 복귀 버튼 */}
      {/* <div
        onClick={onClick}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "55px",
          height: "55px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          ...style, // KakaoMapView에서 내려온 bottom, right 등 포함됨
        }}
      >
        <img
          src="/location_icon.svg"
          alt="현재 위치로 이동"
          style={{ width: "100%", height: "100%" }}
        />
      </div> */}
    </>
  );
}

export default MapView;
