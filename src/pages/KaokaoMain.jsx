import React, {useEffect, useRef, useState} from 'react';
import {CustomOverlayMap, Map, MapMarker, MarkerClusterer, Polyline, useKakaoLoader} from "react-kakao-maps-sdk";
import Side from "../component/Side.jsx";
import styles from "../css/kakao_main.module.css";
import proj4 from 'proj4';
import kakaoMap from "../js/kakaoMap.js";
import MapView from "../components/MapView.jsx";

// EPSG:5182 (TM-동부원점) 좌표계 정의
proj4.defs("EPSG:5182", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// EPSG:4326 (WGS84) 좌표계 정의
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

function KaokaoMain({isCommonMobile}) {
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
    const [linkGeoJson,setLinkGeoJson] = useState(null);
    const [variableLink,setVairableLink] = useState(null);

    const [mapLevel, setMapLevel] = useState(4);
    const [myPosition, setMyPosition] = useState(null);
    const mapRef = useRef(null);

  /*** 버스 경로 ***/
  const [openFind, setOpenFind] = useState(false);
  const [originRoute, setOriginRoute] = useState(null);
  const [destyRoute, setDestyRoute] = useState(null);
  const [customPathLink, setCustomPathLink] = useState(null); // 경로 상태
  const [linkData, setLinkData] = useState(null); // link_20250224.json 데이터를 저장

    useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_API_KEY,
        libraries: ["clusterer", "drawing", "services"],
    });
    useEffect(() => {
        fetch("/link_20250224.json").then(res => res.json()).then(res => {setLinkGeoJson(res);});
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
        );
    },[]);

  const handleRouteClick = async (route) => {
    if (
        !linkGeoJson ||
        !route.list ||
        !route.list[0] ||
        !originRoute ||
        !destyRoute
    ) {
      console.error("필요한 데이터가 없습니다:", {
        linkGeoJson,
        route,
        originRoute,
        destyRoute,
      });
      alert("출발지, 도착지 또는 경로 데이터가 없습니다.");
      setCustomPathLink(null);
      return;
    }

    try {
      console.log("추천 경로 입력:", {
        routeNo: route.list[0].routeNo,
        routeId: route.list[0].routeId,
        origin: originRoute,
        desty: destyRoute,
      });

      // 1. API 호출로 링크 데이터 가져오기
      const step = route.list[0];
      const res = await kakaoMap.getRouteLink(step.routeId).catch((error) => {
        console.error(`Route ${step.routeNo} API 호출 실패:`, error);
        return { data: { body: { items: [] } } };
      });
      console.log("노선번호 경로 찾기 값 : ", res);
      if (!res.data?.body?.items) {
        console.warn(
            `Route ${step.routeNo} API 응답이 유효하지 않습니다:`,
            res
        );
      }
      const links = res.data?.body?.items || [];
      // console.log(`Route ${step.routeNo} API 응답 (links):`, links);

      // 2. linkGeoJson에서 링크 필터링
      let validLinks = linkGeoJson.features
          .filter((link) =>
              links.some(
                  (item) => String(item.linkId) === String(link.properties.link_id)
              )
          )
          .map((link) => {
            const matchedItem = links.find(
                (item) => String(item.linkId) === String(link.properties.link_id)
            );
            return {
              link,
              routeNo: step.routeNo,
              linkId: link.properties.link_id,
              moveDir: matchedItem ? matchedItem.moveDir : 0,
            };
          });
      console.log(
          "API 기반 validLinks (필터링 전):",
          validLinks.map((item) => ({
            linkId: item.linkId,
            routeNo: item.routeNo,
            moveDir: item.moveDir,
          }))
      );

      // 3. 출발지와 도착지 사이의 경로 구성 (수정됨)
      const threshold = 0.02; // 0.02도 (약 2km 이내)
      let bestPath = null;

      if (links && links.length > 0) {
        // links 순서를 기준으로 링크 연결
        const orderedLinks = links
            .map((linkItem) => {
              const link = linkGeoJson.features.find(
                  (feature) =>
                      String(feature.properties.link_id) === String(linkItem.linkId)
              );
              return link
                  ? {
                    link,
                    routeNo: step.routeNo,
                    linkId: link.properties.link_id,
                    moveDir: linkItem.moveDir,
                  }
                  : null;
            })
            .filter(Boolean); // null 제거

        if (orderedLinks.length > 0) {
          // 출발지와 도착지에 가까운 링크 찾기
          let startLink = null;
          let endLink = null;
          let minStartDist = Infinity;
          let minEndDist = Infinity;

          orderedLinks.forEach((linkObj, linkIdx) => {
            const coords = linkObj.link.geometry.coordinates;
            coords.forEach(([x, y], idx) => {
              const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
              const startDist =
                  Math.abs(lat - originRoute.lat) +
                  Math.abs(lng - originRoute.lng);
              const endDist =
                  Math.abs(lat - destyRoute.lat) + Math.abs(lng - destyRoute.lng);

              if (startDist < minStartDist) {
                minStartDist = startDist;
                startLink = { linkObj, idx, linkIdx };
              }
              if (endDist < minEndDist) {
                minEndDist = endDist;
                endLink = { linkObj, idx, linkIdx };
              }
            });
          });

          if (startLink && endLink) {
            // 출발지에서 도착지까지 링크를 순서대로 연결
            const allPaths = [];
            let startLinkIdx = startLink.linkIdx;
            let endLinkIdx = endLink.linkIdx;

            // 시작 링크에서 자르기
            let path = startLink.linkObj.link.geometry.coordinates
                .slice(startLink.idx)
                .map(([x, y]) => {
                  const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
                  return {
                    lat,
                    lng,
                    dir: startLink.linkObj.moveDir,
                    routeNo: step.routeNo,
                    linkId: startLink.linkObj.linkId,
                  };
                });
            allPaths.push(path);

            // 중간 링크 연결
            for (let i = startLinkIdx + 1; i < endLinkIdx; i++) {
              const linkObj = orderedLinks[i];
              const path = linkObj.link.geometry.coordinates.map(([x, y]) => {
                const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
                return {
                  lat,
                  lng,
                  dir: linkObj.moveDir,
                  routeNo: step.routeNo,
                  linkId: linkObj.linkId,
                };
              });
              allPaths.push(path);
            }

            // 도착지 링크에서 자르기
            path = endLink.linkObj.link.geometry.coordinates
                .slice(0, endLink.idx + 1)
                .map(([x, y]) => {
                  const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
                  return {
                    lat,
                    lng,
                    dir: endLink.linkObj.moveDir,
                    routeNo: step.routeNo,
                    linkId: endLink.linkObj.linkId,
                  };
                });
            allPaths.push(path);

            // 경로에 출발지와 도착지 추가
            bestPath = [
              {
                lat: originRoute.lat,
                lng: originRoute.lng,
                dir: 0,
                routeNo: step.routeNo,
                linkId: startLink.linkObj.linkId,
              },
              ...allPaths.flat(),
              {
                lat: destyRoute.lat,
                lng: destyRoute.lng,
                dir: 0,
                routeNo: step.routeNo,
                linkId: endLink.linkObj.linkId,
              },
            ].filter(
                (point, index, self) =>
                    index === 0 ||
                    index === self.length - 1 ||
                    !self
                        .slice(0, index)
                        .some((p) => p.lat === point.lat && p.lng === point.lng)
            ); // 중복 제거
          }
        }
      }

      // 4. 대체 경로 탐색 (수정됨)
      if (!bestPath) {
        console.warn(
            "출발지-도착지 간 유효한 경로를 찾지 못했습니다. 대체 경로 탐색 시도."
        );
        const candidates = linkGeoJson.features
            .filter((link) => {
              // API 링크와 일치하는 링크만 고려
              return links.some(
                  (item) => String(item.linkId) === String(link.properties.link_id)
              );
            })
            .map((link) => {
              const coords = link.geometry.coordinates;
              let startIdx = 0,
                  endIdx = coords.length - 1;
              let minStartDist = Infinity,
                  minEndDist = Infinity;
              coords.forEach(([x, y], idx) => {
                const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
                const startDist =
                    Math.abs(lat - originRoute.lat) +
                    Math.abs(lng - originRoute.lng);
                const endDist =
                    Math.abs(lat - destyRoute.lat) + Math.abs(lng - destyRoute.lng);
                if (startDist < minStartDist) {
                  minStartDist = startDist;
                  startIdx = idx;
                }
                if (endDist < minEndDist) {
                  minEndDist = endDist;
                  endIdx = idx;
                }
              });
              return { link, startIdx, endIdx, minStartDist, minEndDist };
            })
            .filter(
                (item) =>
                    item.minStartDist < threshold && item.minEndDist < threshold
            )
            .sort(
                (a, b) =>
                    a.minStartDist + a.minEndDist - (b.minStartDist + b.minEndDist)
            );

        if (candidates.length > 0) {
          // 대체 경로도 API 링크 순서를 고려하여 구성
          const allPaths = [];
          for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const path = candidate.link.geometry.coordinates
                .slice(candidate.startIdx, candidate.endIdx + 1)
                .map(([x, y]) => {
                  const [lng, lat] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
                  const matchedItem = links.find(
                      (item) =>
                          String(item.linkId) ===
                          String(candidate.link.properties.link_id)
                  );
                  return {
                    lat,
                    lng,
                    dir: matchedItem ? matchedItem.moveDir : 0,
                    routeNo: step.routeNo,
                    linkId: candidate.link.properties.link_id,
                  };
                });
            allPaths.push(path);
          }

          bestPath = [
            {
              lat: originRoute.lat,
              lng: originRoute.lng,
              dir: 0,
              routeNo: step.routeNo,
            },
            ...allPaths.flat(),
            {
              lat: destyRoute.lat,
              lng: destyRoute.lng,
              dir: 0,
              routeNo: step.routeNo,
            },
          ].filter(
              (point, index, self) =>
                  index === 0 ||
                  index === self.length - 1 ||
                  !self
                      .slice(0, index)
                      .some((p) => p.lat === point.lat && p.lng === point.lng)
          );
        }
      }

      // 5. 상태 업데이트
      if (bestPath) {
        const variableList = [bestPath];
        console.log("생성된 경로:", variableList); // 디버깅 로그 추가
        setCustomPathLink(variableList);
        setMapCenter({ lat: originRoute.lat, lng: originRoute.lng });
        setMapLevel(5);
        setOpenedRoute(true);
      } else {
        console.warn("유효한 경로를 찾을 수 없습니다:", {
          apiLinks: links.length,
          geoJsonLinks: linkGeoJson.features.length,
        });
        alert(
            "출발지와 도착지를 연결하는 경로를 찾을 수 없습니다. 다른 노선을 선택해주세요."
        );
        setCustomPathLink(null);
      }
    } catch (error) {
      console.error("handleRouteClick 오류:", error);
      alert("경로를 처리하는 중 오류가 발생했습니다.");
      setCustomPathLink(null);
    }
  };

    const searchRoute = (item) => {
        //console.log("검색 조건",item);
        setSelectedRoute(item);
        kakaoMap.getRouteInfo(item.routeId).then(res=>{
            /* console.log("노선정류장 : ",res);

            console.log("확인 : ",res.data.body.items);*/
        setSelectedRouteList(res.data.body.items);

        });
        kakaoMap.getRouteLocation(item.routeId).then(res=>{
            // console.log("노선위치 : ",res);
         // console.log("위치 확인 : ",res.data.body.items);
        setSelectedRoutePosition(res.data.body.items);
        });
        kakaoMap.getRouteLink(item.routeId)
            .then(res=>{
                // console.log("링크확인 : ",res.data.body.items);
                drawLine(res.data.body.items);
            })
            .catch(error=>{console.log(error)})
    }

const drawLine = (data) => {
        if(!data) return
        const validLinks = linkGeoJson.features.filter(link => {
            return Object.values(data).some(p=>
                p.linkId===link.properties.link_id
            );
        });

        validLinks.map(el=>{
            if(Object.values(data).some(p=> {
                if(p.linkId === el.properties.link_id){
                    el.dir=parseInt(p.moveDir);
                    el.seq=parseInt(p.linkSeq);
                    return true;
                }
            }));
        });
        validLinks.sort((a,b)=>a.seq-b.seq);
        validLinks.sort((a,b)=>a.dir-b.dir);
        // console.log(validLinks);
        let variableList = [];
        validLinks.forEach((link,i)=>{
            const path = link.geometry.coordinates.map(([lng,lat])=> {
                let [x,y]=proj4("EPSG:5182", "EPSG:4326", [lng, lat]);
                return {lat:y, lng:x,dir:link.dir};
            });
            if(i>0) {
                if (path[0]?.dir !== undefined && !!path[0]){
                    if (path[0]?.dir === variableList[i - 1][variableList[i - 1]?.length-1]?.dir) {
                        path.unshift(variableList[i - 1][variableList[i - 1]?.length-1]);
                    }
                }
            }
            variableList.push(path);

        })
    // console.log("유효 리턴 링크값",variableList);
        setVairableLink(variableList);
};
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
                isCommonMobile={isCommonMobile}

                mapCenter={mapCenter}
                markerClicked={markerClicked}
                hoveredStop={hoveredStop}
                setHoveredStop={setHoveredStop}
                setSelectedRouteList={setSelectedRouteList}
                setSelectedRoutePosition={setSelectedRoutePosition}
                linkGeoJson={linkGeoJson}
                variableLink={variableLink}
                setVairableLink={setVairableLink}
                myPosition={myPosition}
                setMyPosition={setMyPosition}
                mapLevel={mapLevel}
                setMapLevel={setMapLevel}

                originRoute={originRoute}
                setOriginRoute={setOriginRoute}
                destyRoute={destyRoute}
                setDestyRoute={setDestyRoute}
                openFind={openFind}
                setOpenFind={setOpenFind}
                handleRouteClick={handleRouteClick}
            />

            {isCommonMobile ||
            <article className={styles.main}>
            <Map center={mapCenter} level={mapLevel}
                 style={{width:'100%',height:'100%'}}
                 ref={mapRef}
                 /*onZoomChanged={(data)=>{
                     if(data.getLevel()>5)setIsVisible(false);
                     else setIsVisible(true);
                 }}*/
                 onClick={()=>{
                     setMarkerClicked(false);
                 }}
            >

              {/* 경로찾기 - 출발마커 */}
              {openFind && originRoute && (
                  <MapMarker
                      key={`findRoute_${originRoute.lat}_${originRoute.lng}`}
                      position={{ lat: originRoute.lat, lng: originRoute.lng }}
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
                  >
                    <div
                        style={{
                          padding: "5px",
                          background: "white",
                          borderRadius: "3px",
                        }}
                    >
                      {originRoute.bsNm}
                    </div>
                  </MapMarker>
              )}

              {/* 경로찾기 - 도착마커 */}
              {openFind && destyRoute && (
                  <MapMarker
                      key={`findRoute_${destyRoute.lat}_${destyRoute.lng}`}
                      position={{ lat: destyRoute.lat, lng: destyRoute.lng }}
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
                  >
                    <div
                        style={{
                          padding: "5px",
                          background: "white",
                          borderRadius: "3px",
                        }}
                    >
                      {destyRoute.bsNm}
                    </div>
                  </MapMarker>
              )}

              {/* 경로찾기 - 경로 랜더링 */}
              {openFind &&
                  customPathLink &&
                  customPathLink.length > 0 &&
                  customPathLink.map((item, index) => (
                      <React.Fragment key={`path_${item[0]?.linkId || index}`}>
                        <Polyline
                            key={`polyline_${item[0]?.linkId || index}`}
                            path={item}
                            strokeWeight={5}
                            strokeOpacity={1}
                            strokeColor={item[0]?.dir === 1 ? "#FF0000" : "#0000FF"}
                            strokeStyle="solid"
                        />
                        <CustomOverlayMap
                            position={item[Math.floor(item.length / 2)]}
                            yAnchor={1}
                            key={`label_${item[0]?.linkId || index}`}
                        >
                          <div
                              style={{
                                background: "white",
                                padding: "5px",
                                borderRadius: "3px",
                              }}
                          >
                            노선: {item[0]?.routeNo || "알 수 없음" | "알 수 없음"}
                          </div>
                        </CustomOverlayMap>
                      </React.Fragment>
                  ))}
              {/* ***************************** */}
              
                <MarkerClusterer
                    averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
                    minLevel={10} // 클러스터 할 최소 지도 레벨
                >
                    {openedRoute && selectedRoute && selectedRouteList && variableLink && variableLink.map(item=>{
                        if(item)
                        return (
                            <Polyline
                                key={item[0].lat+"_"+item[1].lng}
                                path={item}
                                strokeWeight={5}
                                strokeOpacity={1}
                                strokeColor={item[0].dir==1?"#FF0000":"#0000FF"}
                                strokeStyle="solid"
                            />
                        )
                    })}
                {openedRoute && selectedRouteList && selectedRouteList.map(item => {

                        return item.bsNm!=selectedStop?.bsNm&&(<MapMarker
                            key={item.bsId + item.seq}
                            position={{lat: item.yPos, lng: item.xPos}}
                            image={{
                                src: "/stop_marker.png",
                                size: {
                                    width: 50,
                                    height: 50
                                },
                                options: {
                                    offset: {
                                        x: 25, y: 48
                                    }
                                }
                            }}
                            onClick={()=>{
                                setMarkerClicked(true);
                                item.lat=item.yPos;
                                item.lng=item.xPos;
                                setSelectedStop(item);
                                setHoveredStop(item);
                                kakaoMap.getArrivalInfo(item.bsId)
                                    .then(res => {
                                        if(res!==404){
                                            // console.log("도착 예정정보",res.list);
                                            setArrivalInfo(res);
                                        }
                                    })
                                    .catch(error => {
                                        console.error("도착 정보 조회 실패:", error);
                                    });
                            }}
                        />)
                    }

                    )}

                    {selectedStop && isVisible && (
                        <MapMarker
                            key={selectedStop.lat-selectedStop.lng}
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
                            clickable={true}
                            onClick={()=>{
                                setMarkerClicked(true);
                                setHoveredStop(selectedStop);
                            }}
                        />
                    )}
                    {markerClicked && hoveredStop && (
                        <CustomOverlayMap
                            position={{ lat: hoveredStop.lat, lng: hoveredStop.lng }}
                            xAnchor={-0.1}
                            yAnchor={0.3}
                            zIndex={2}
                            clickable={true}
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
                                    width: "220px"
                                }}
                            >
                                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",borderBottom:"2px solid black" }} >
                                <h3 style={{padding:"0.5em 0"}}>{hoveredStop.bsNm}</h3>
                                    {/*<h4 style={{color:"#aaa",alignSelf:"flex-end"}}>도착 예정 정보</h4>*/}
                                </div>
                                {arrivalInfo?.list?.length>0?arrivalInfo.list.map(item=>(

                                        <div
                                            className={item.routeNo===selectedRoute?.routeNo&&styles.selectedBus}
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
            }
        </>
    );
}

export default KaokaoMain;