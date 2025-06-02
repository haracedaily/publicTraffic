import React from 'react';
import {CustomOverlayMap, Map, MapMarker, MarkerClusterer, Polyline} from "react-kakao-maps-sdk";
import kakaoMap from "../js/kakaoMap.js";
import styles from "../css/kakao_main.module.css";
import proj4 from "proj4";

function MobileKakaoMap(props) {
    const searchRoute = (item) => {
        //console.log("검색 조건",item);
        props.setSelectedRoute(item);
        kakaoMap.getRouteInfo(item.routeId).then(res=>{
            /* console.log("노선정류장 : ",res);

            console.log("확인 : ",res.data.body.items);*/
            props.setSelectedRouteList(res.data.body.items);

        });
        kakaoMap.getRouteLocation(item.routeId).then(res=>{
            // console.log("노선위치 : ",res);
            // console.log("위치 확인 : ",res.data.body.items);
            props.setSelectedRoutePosition(res.data.body.items);
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
        const validLinks = props.linkGeoJson.features.filter(link => {
            return Object.values(data).some(p=>
                p.linkId===link.properties.link_id
            );
        });
        // console.log("유효 링크값",validLinks);
        validLinks.map(el=>{
            if(Object.values(data).some(p=> {
                if(p.linkId === el.properties.link_id){
                    el.dir=p.moveDir;
                    return true;
                }
            }));
        });
        let variableList = [];
        validLinks.forEach(link=>{
            const path = link.geometry.coordinates.map(([lng,lat])=> {
                let [x,y]=proj4("EPSG:5182", "EPSG:4326", [lng, lat]);
                return {lat:y, lng:x,dir:link.dir};
            });
            variableList.push(path);

        })
        // console.log("유효 리턴 링크값",variableList);
        props.setVairableLink(variableList);
    };

    return (
        <Map id={"jh_mobile_kakao_map"} center={props.mapCenter} level={props.mapLevel}
             style={{width:'100%',height:'100%'}}
             ref={props.mapRef}
            /*onZoomChanged={(data)=>{
                if(data.getLevel()>5)setIsVisible(false);
                else setIsVisible(true);
            }}*/
             onClick={()=>{
                 props.setMarkerClicked(false);
             }}
        >
            <MarkerClusterer
                averageCenter={true} // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
                minLevel={10} // 클러스터 할 최소 지도 레벨
            >
                {props.openedRoute && props.selectedRoute && props.selectedRouteList && props.variableLink && props.variableLink.map(item=>{
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
                {props.openedRoute && props.selectedRouteList && props.selectedRouteList.map(item => {

                        return item.bsNm!=props.selectedStop?.bsNm&&(<MapMarker
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
                                props.setMarkerClicked(true);
                                item.lat=item.yPos;
                                item.lng=item.xPos;
                                props.setSelectedStop(item);
                                props.setHoveredStop(item);
                                kakaoMap.getArrivalInfo(item.bsId)
                                    .then(res => {
                                        if(res!==404){
                                            // console.log("도착 예정정보",res.list);
                                            props.setArrivalInfo(res);
                                        }
                                    })
                                    .catch(error => {
                                        console.error("도착 정보 조회 실패:", error);
                                    });
                            }}
                        />)
                    }

                )}

                {props.selectedStop && (
                    <MapMarker
                        key={props.selectedStop.lat-props.selectedStop.lng}
                        position={{lat:props.selectedStop.lat, lng:props.selectedStop.lng}}
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
                            props.setMarkerClicked(true);
                            props.setHoveredStop(props.selectedStop);
                        }}
                    />
                )}
                {props.markerClicked && props.hoveredStop && (
                    <CustomOverlayMap
                        position={{ lat: props.hoveredStop.lat, lng: props.hoveredStop.lng }}
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
                                fontSize: "0.8rem",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                width: "150px"
                            }}
                        >
                            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",borderBottom:"2px solid black" }} >
                                <h4 style={{padding:"0.5em 0"}}>{props.hoveredStop.bsNm}</h4>
                                {/*<h4 style={{color:"#aaa",alignSelf:"flex-end"}}>도착 예정 정보</h4>*/}
                            </div>
                            {props.arrivalInfo?.list?.length>0?props.arrivalInfo.list.map(item=>(

                                <div
                                    className={item.routeNo===props.selectedRoute?.routeNo?styles.selectedBus:""}
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
                                            fontSize: "1em",
                                            cursor:"pointer"
                                        }}
                                        onClick={()=>{
                                            props.setOpenedRoute(true);
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
    );
}

export default MobileKakaoMap;