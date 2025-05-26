<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MarkerClusterer,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import Side from "../component/Side.jsx";
import styles from "../css/kakao_main.module.css";
import proj4 from "proj4";
import MapView from "../components/MapView.jsx";
=======
import React, {useEffect, useRef, useState} from 'react';
import {CustomOverlayMap, Map, MapMarker, MarkerClusterer, Polyline, useKakaoLoader} from "react-kakao-maps-sdk";
import Side from "../component/Side.jsx";
import styles from "../css/kakao_main.module.css";
import proj4 from 'proj4';
import kakaoMap from "../js/kakaoMap.js";
>>>>>>> main

// EPSG:5182 (TM-동부원점) 좌표계 정의
proj4.defs(
  "EPSG:5182",
  "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs"
);

// EPSG:4326 (WGS84) 좌표계 정의
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

function KaokaoMain(props) {
<<<<<<< HEAD
  const [searchResults, setSearchResults] = useState([]);
  const [arrivalInfo, setArrivalInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.8693, lng: 128.6062 });
  const [mapLevel, setMapLevel] = useState(4);
  const [selectedStop, setSelectedStop] = useState(null);
  const [hoveredStop, setHoveredStop] = useState(null);

  const [myPosition, setMyPosition] = useState(null);

  const mapRef = useRef(null);

  const convertNGISToKakao = (x, y) => {
    const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
    let lat = latitude;
    let lng = longitude;
    return { lat, lng };
  };

  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_API_KEY,
    libraries: ["clusterer", "drawing", "services"],
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyPosition({ lat: latitude, lng: longitude });
        // console.log("위도:", pos.coords.latitude);
        // console.log("경도:", pos.coords.longitude);
        setMapCenter({ lat: latitude, lng: longitude });
        setMapLevel(4);
      },
      (err) => {
        console.error("위치 오류:", err);
        setMyPosition(null);
        setMapCenter({ lat: 35.8714, lng: 128.6014 });
        setMapLevel(7);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
=======
    const [searchResults, setSearchResults] = useState([]);
    const [arrivalInfo, setArrivalInfo] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 35.8693, lng: 128.6062 });
    const [selectedStop, setSelectedStop] = useState(null);
    const [hoveredStop, setHoveredStop] = useState(null);
    const [markerClicked,setMarkerClicked] = useState(false);
    const [selectedRoute,setSelectedRoute] = useState(null);
    const [selectedRouteList,setSelectedRouteList] = useState(null);
    const [selectedRoutePosition,setSelectedRoutePosition] = useState(null);
    const [openedRoute,setOpenedRoute] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const sideRef = useRef(null);
    const [selectedPathLine,setSelectedPathLine]=useState(null);
    useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_API_KEY,
        libraries: ["clusterer", "drawing", "services"],
    });

    const searchRoute = (item) => {
        // console.log("검색 조건",item);
        setSelectedRoute(item);
        kakaoMap.getRouteInfo(item.routeId).then(res=>{
            // console.log("노선정류장 : ",res);
        //     if(res?.data?.body?.items?.length>0)
            console.log("확인 : ",res.data.body.items);
        setSelectedRouteList(res.data.body.items);
        setSelectedPathLine(res.data.body.items.map(el=>{
            return {
            lat: el.yPos,
            lng: el.xPos
            }
        }));
        });
        kakaoMap.getRouteLocation(item.routeId).then(res=>{
            // console.log("노선위치 : ",res);
        // console.log("위치 확인 : ",res.data.body.items);
        setSelectedRoutePosition(res.data.body.items);
        });
    }
    return (
        <>
            <Side
                setMapCenter={setMapCenter}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                selectedStop={selectedStop}
                setSelectedStop={setSelectedStop}
                arrivalInfo={arrivalInfo}
                setArrivalInfo={setArrivalInfo}
                setMarkerClicked={setMarkerClicked}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                openedRoute={openedRoute}
                setOpenedRoute={setOpenedRoute}
                selectedRouteList={selectedRouteList}
                selectedRoutePosition={selectedRoutePosition}
                sideRef={sideRef}
            />
            <article className={styles.main}>
            <Map center={mapCenter} level={3}
                 style={{width:'100%',height:'100%'}}

                 onZoomChanged={(data)=>{
                     if(data.getLevel()>5)setIsVisible(false);
                     else setIsVisible(true);
                 }}
            >
                {openedRoute && selectedRoute && selectedRouteList && selectedPathLine && (
                    <Polyline
                        path={selectedPathLine}
                        strokeWeight={5}
                        strokeColor="#FFAE00"
                        strokeOpacity={0.7}
                        strokeStyle="solid"
                    />
                )}
                <MarkerClusterer
                    averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
                    minLevel={10} // 클러스터 할 최소 지도 레벨
                >
                    {selectedStop && isVisible && (
                        <MapMarker
                            position={{lat:selectedStop.lat, lng:selectedStop.lng}}
                            image={{
                                src:"/stop_marker.png",
                                size:{
                                    width:50,
                                    height:50
                                },
                                options:{
                                    offset:{
                                        x:25,y:48
                                    }
                                }
                        }}

                            onClick={()=>{
                                setMarkerClicked(!markerClicked);
                                setHoveredStop(selectedStop);
                            }}
                        />
                    )}
                    {markerClicked && hoveredStop && (
                        <CustomOverlayMap
                            position={{ lat: hoveredStop.lat, lng: hoveredStop.lng }}
                            xAnchor={-0.1}
                            yAnchor={0.3}
                        >
                            <div
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "4px",
                                    fontSize: "1rem",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    width: "220px",
                                }}
                            >
                                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",borderBottom:"2px solid black" }} >
                                <h3 style={{padding:"0.5em 0"}}>{hoveredStop.bsNm}</h3>
                                    {/*<h4 style={{color:"#aaa",alignSelf:"flex-end"}}>도착 예정 정보</h4>*/}
                                </div>
                                {arrivalInfo?.list?.length>0?arrivalInfo.list.map(item=>(

                                        <div
                                            style={{
                                            borderBottom: "1px solid #eee",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "4px"
                                            }}
                                            key={item.routeId}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: "bold",
                                                    fontSize: "1.1em",
                                                    cursor:"pointer"
                                                    }}
                                                 onClick={()=>{
                                                     setOpenedRoute(true);
                                                     searchRoute(item);
                                                    }}
                                            >
                                                {item.routeNo}
                                            </div>
                                            <div style={{
                                                color: item.arrState === "전" ? "#52c41a" :
                                                    item.arrState === "전전" ? "#faad14" : item.arrState ==='도착예정' ? "#aaaaaa" : "#1890ff",
                                                fontWeight: "bold"
                                            }}>
                                                {item.arrState.includes("전") ? "곧 도착" :
                                                    item.arrState === "전전" ? "곧 도착 예정" : item.arrState ==='도착예정' ? "차고지 대기" :
                                                        `${item.arrState} 후 도착`}
                                            </div>
                                        </div>

                                )):<div>예정정보가 없습니다.</div>}
                            </div>
                        </CustomOverlayMap>
                    )}
                </MarkerClusterer>
            </Map>
            </article>
        </>
>>>>>>> main
    );
  }, []);

  return (
    <>
      <Side
        setMapCenter={setMapCenter}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        selectedStop={selectedStop}
        setSelectedStop={setSelectedStop}
        arrivalInfo={arrivalInfo}
        setArrivalInfo={setArrivalInfo}
      />
      <article className={styles.main}>
        <Map
          center={mapCenter}
          level={mapLevel}
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
        >
          <MarkerClusterer
            averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
            minLevel={10} // 클러스터 할 최소 지도 레벨
          >
            {selectedStop && (
              <MapMarker
                position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
                image={{
                  src: "/stop_marker.png",
                  size: {
                    width: 50,
                    height: 50,
                  },
                  options: {
                    offset: {
                      x: 25,
                      y: 48,
                    },
                  },
                }}
                onMouseOut={() => {
                  setHoveredStop(null);
                }}
                onMouseOver={() => {
                  setHoveredStop(selectedStop);
                  console.log(selectedStop);
                }}
              />
            )}
            {hoveredStop && (
              <CustomOverlayMap
                position={{
                  lat: hoveredStop.lat + 0.0005,
                  lng: hoveredStop.lng + 0.002,
                }}
              >
                <div
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    whiteSpace: "nowrap",
                    width: "300px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "2px solid black",
                    }}
                  >
                    <h3 style={{ padding: "0.5em 0" }}>{hoveredStop.bsNm}</h3>
                    <h4 style={{ color: "#aaa" }}>도착 예정 정보</h4>
                  </div>
                  {arrivalInfo.list?.length > 0 ? (
                    arrivalInfo.list.map((item) => (
                      <>
                        <div
                          style={{
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "1.1em",
                            }}
                          >
                            {item.routeNo}{" "}
                            {item.routeNote && `(${item.routeNote})`}
                          </div>
                          <div
                            style={{
                              color:
                                item.arrState === "전"
                                  ? "#52c41a"
                                  : item.arrState === "전전"
                                  ? "#faad14"
                                  : "#1890ff",
                              fontWeight: "bold",
                            }}
                          >
                            {item.arrState === "전"
                              ? "곧 도착"
                              : item.arrState === "전전"
                              ? "곧 도착 예정"
                              : item.arrState === "도착예정"
                              ? "차고지 대기"
                              : `${item.arrState} 후 도착`}
                          </div>
                        </div>
                      </>
                    ))
                  ) : (
                    <div>예정정보가 없습니다.</div>
                  )}
                </div>
              </CustomOverlayMap>
            )}
          </MarkerClusterer>
            {myPosition && (
              <MapView
                position={myPosition}
                onClick={() => {
                  console.log("내 위치 클릭");
                  if (mapRef.current && window.kakao?.maps) {
                    const kakaoLatLng = new window.kakao.maps.LatLng(
                      myPosition.lat,
                      myPosition.lng
                    );
                    mapRef.current.setCenter(kakaoLatLng);
                  }
                }}
              />
            )}
        </Map>
      </article>
    </>
  );
}

export default KaokaoMain;
