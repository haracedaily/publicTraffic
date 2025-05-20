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

import { MapMarker } from "react-kakao-maps-sdk";

function MapView({ position }) {
  if (!position) return null; // 위치 없으면 마커 표시 안 함

  return (
    <MapMarker
      position={position}
      image={{
        src: "/location.png",
        size: { width: 40, height: 40 },
        options: {
          offset: { x: 20, y: 40 }, // 마커 하단이 좌표 중심에 오도록 설정
        },
      }}
      onClick={() => alert("📍 여기에 계신가요?!")}
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
  );
}

export default MapView;
