import { useEffect, useMemo, useState } from "react";
import { Map as KakaoMap, MapMarker } from "react-kakao-maps-sdk";
// import { LatLng } from "../../types/map";
import { debounce } from "lodash";
// import { ReactComponent as IconRefresh } from "../../assets/icons/refresh.svg";
// import { ReactComponent as IconMyLocation } from "../../assets/icons/my-location.svg";
import locationIcon from "/location.png"; // 현재 위치 아이콘

function MapView() {
  // 지도의 중심좌표
  const [center, setCenter] = useState(
    // lat: 33.450701,
    // lng: 126.570667,
    null
  );

  // 현재 위치
  const [position, setPosition] = useState(
    // lat: 33.450701,
    // lng: 126.570667,
    null
  );

  // 현재 위치로 중심좌표 재설정
  const setCenterToMyPosition = () => {
    setCenter(position);
  };

  // 지도 이동 시 중심좌표 업데이트 (디바운스)
  const updateCenterWhenMapMoved = useMemo(
    () =>
      debounce((map) => {
        const latlng = map.getCenter();
        console.log("지도 이동 → 중심좌표:", latlng);
        setCenter({
          lat: latlng.getLat(),
          lng: latlng.getLng(),
        });
      }, 500),
    []
  );

  // 컴포넌트 초기화 시 위치 정보 설정
  useEffect(() => {
    // 최초 중심좌표 = 현재 위치
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        //   const { latitude, longitude } = pos.coords;
        //   setCenter({ lat: latitude, lng: longitude });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("내 위치 좌표:", lat, lng);
        setPosition({ lat, lng });
        setCenter({ lat, lng });
      },
      (err) => {
        console.error("위치 못 가져옴:", err);
      },
      []
    );

    // 현재 위치 지속 감지
    navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition({ lat: latitude, lng: longitude });
    });

    // new window.kakao.maps.Marker({
    //   position: new window.kakao.maps.LatLng(location.lat, location.lng),
    //   map,
    //   title: "내 위치",
    // });
  }, []);

  if (!center || !position) {
    return <div>위치 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div>
      <KakaoMap
        // className="w-full h-full"
        center={center}
        level={4}
        onCenterChanged={updateCenterWhenMapMoved}
      >
        {/* 현재 위치 마커 */}
        <MapMarker
          position={position}
          onClick={() => alert("여기 내 위치야!")}
          image={{
            src: locationIcon,
            size: { width: 30, height: 30 },
          }}
        />
        {/* <MapMarker position={position} onClick={() => alert("여기 내 위치야!")} /> */}
      </KakaoMap>

      {/* 내 위치로 이동 버튼 */}
      {/* <button
        className="absolute bottom-4 right-4 bg-white shadow p-2 rounded-full"
        onClick={setCenterToMyPosition}
      >
        <IconMyLocation width={24} height={24} />
      </button> */}

      {/* 새로고침 버튼 (필요 시 기능 추가 가능) */}
      {/* <button
        className="absolute bottom-4 right-16 bg-white shadow p-2 rounded-full"
        onClick={() => window.location.reload()}
      >
        <IconRefresh width={24} height={24} />
      </button> */}
    </div>
  );
}

export default MapView;

// import { useEffect, useState } from "react";
// import { Map as KakaoMap, MapMarker } from "react-kakao-maps-sdk";

// function MapView() {
//   const [center, setCenter] = useState(null);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const coords = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         };
//         console.log("📍 내 위치 좌표:", coords);
//         setCenter(coords);
//       },
//       (err) => {
//         console.error("❗ 위치 못 가져옴:", err);
//       }
//     );
//   }, []);

//   if (!center) return <div>위치 불러오는 중...</div>;

//   return (
//     <div className="w-full h-screen">
//       <KakaoMap
//         center={center}
//         style={{ width: "100%", height: "100%" }}
//         level={4}
//       >
//         <MapMarker
//           position={center}
//           onClick={() => alert("📍 여기가 현재 위치야!")}
//         />
//       </KakaoMap>
//     </div>
//   );
// }

// export default MapView;
