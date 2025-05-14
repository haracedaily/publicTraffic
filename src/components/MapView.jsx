import { useEffect } from "react";

export default function MapView({ location, stations, onMarkerClick }) {
    useEffect(() => {
        if (!window.kakao || !location) return;

        const map = new window.kakao.maps.Map(document.getElementById("map"), {
            center: new window.kakao.maps.LatLng(location.lat, location.lng),
            level: 4,
        });

        stations.forEach((station) => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(station.lat, station.lng),
                map,
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
                onMarkerClick(station);
            });
        });
    }, [location, stations]);

    return <div id="map" style={{ width: "100%", height: "400px" }} />;
}


// function MapView({ location, stations }) {
//   useEffect(() => {
//     if (!window.kakao || !location) return;

//     const map = new window.kakao.maps.Map(document.getElementById("map"), {
//       center: new window.kakao.maps.LatLng(location.lat, location.lng),
//       level: 4,
//     });

//     // 내 위치 마커
//     new window.kakao.maps.Marker({
//       position: new window.kakao.maps.LatLng(location.lat, location.lng),
//       map,
//       title: "내 위치",
//     });

//     // 주변 정류장 마커
//     stations.forEach((s) => {
//       const marker = new window.kakao.maps.Marker({
//         position: new window.kakao.maps.LatLng(s.gpslati, s.gpslong),
//         map,
//         title: s.nodeNm,
//       });

//       window.kakao.maps.event.addListener(marker, "click", () => {
//         alert(`정류장: ${s.nodeNm}`);
//       });
//     });
//   }, [location, stations]);

//   return <div id="map" style={{ width: "100%", height: "500px" }} />;
// }
