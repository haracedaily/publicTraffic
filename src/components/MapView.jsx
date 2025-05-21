// import { useEffect, useMemo, useState } from "react";
// import { Map, MapMarker } from "react-kakao-maps-sdk";
// // import { LatLng } from "../../types/map";
// import { debounce } from "lodash";
// // import { ReactComponent as IconRefresh } from "../../assets/icons/refresh.svg";
// // import { ReactComponent as IconMyLocation } from "../../assets/icons/my-location.svg";
// import locationIcon from "/location.png"; // 현재 위치 아이콘

// // import { useEffect, useState } from "react";
// // import { Map, MapMarker } from "react-kakao-maps-sdk";

// function MapView() {
//   const [state, setState] = useState({
//     center: {
//       lat: 33.450701,
//       lng: 126.570667,
//     },
//     errMsg: null,
//     isLoading: true,
//   });

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setState((prev) => ({
//             ...prev,
//             center: {
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             },
//             isLoading: false,
//           }));
//         },
//         (err) => {
//           setState((prev) => ({
//             ...prev,
//             errMsg: err.message,
//             isLoading: false,
//           }));
//         }
//       );
//     } else {
//       setState((prev) => ({
//         ...prev,
//         errMsg: "geolocation을 사용할 수 없어요..",
//         isLoading: false,
//       }));
//     }
//   }, []);

//   return (
//     <>
//       <Map
//         center={state.center}
//         level={3}
//         style={{ width: "100%", height: "100vh" }}
//       >
//         {!state.isLoading && (
//           <MapMarker
//           position={state.center}
//           image={{
//             src: "/location.png",
//             size: { width: 40, height: 40 },
//             options: { offset: { x: 20, y: 40 } },
//           }}
//         >
//           <div style={{ color: "#000", background: "#fff", padding: "2px", borderRadius: "4px" }}>
//             여기 계신가요?
//           </div>
//         </MapMarker>
//         )}
//       </Map>
//     </>
//   );
// }

// export default MapView;

import { useEffect, useState } from "react";
import { MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";

function MapView({ position, onClick }) {
  const [heading, setHeading] = useState(0);
  const [deviceType, setDeviceType] = useState("desktop"); // "android" | "ios" | "desktop"

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
    if (
      (deviceType === "android" || deviceType === "ios") &&
      window.DeviceOrientationEvent
    ) {
      const handleOrientation = (event) => {
        if (event.alpha !== null) {
          setHeading(event.alpha); // 0~360도: 북쪽 기준 회전 각도
        }
      };

      // iOS는 권한 요청 필요
      if (
        deviceType === "ios" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              window.addEventListener(
                "deviceorientation",
                handleOrientation,
                true
              );
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }

      return () => {
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    }
  }, [deviceType]);

  if (!position) return null;

  // ✅ 회전 마커 (모바일 전용)
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

  // ✅ 고정 마커 (데스크탑 전용)
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
      <div
        style={{
          color: "#000",
          background: "#fff",
          padding: "2px",
          borderRadius: "4px",
        }}
      >
        여기 계신가요?
      </div>
    </MapMarker>
     {/* 현재 위치 복귀 버튼 */}
      <div
        onClick={onClick}
        style={{
          position: "absolute",
          bottom: "170px",
          right: "20px",
          width: "70px",
          height: "70px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <img
          src="/location_icon.svg"
          alt="현재 위치로 이동"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </>
  );
}

export default MapView;
