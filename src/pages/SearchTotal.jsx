import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Input, List, message, Space, Spin} from "antd";
import kakaoMap from "../js/kakaoMap.js";
import proj4 from 'proj4';
import styles from "../css/search_total.module.css";
import KaokaoMain from "./KaokaoMain.jsx";
import MobileKakaoMap from "../component/MobileKakaoMap.jsx";

// EPSG:5182 (TM-동부원점) 좌표계 정의
proj4.defs("EPSG:5182", "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// EPSG:4326 (WGS84) 좌표계 정의
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
///[^ㄱ-ㅎ가-힣a-zA-Z0-9]/g
function SearchTotal(props) {
    let searchHeight = useRef(0);
    const [calcHeight,setCalcHeight] = useState("0px");
    useEffect(() => {
        if(!props.isCommonMobile)
        document.querySelector(".jh_sideSelectedStop")?.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
    }, [props.selectedStop,props.selectedRouteList]);
    const fetchArrivalInfo = (bsId) => {
        kakaoMap.getArrivalInfo(bsId)
            .then(res => {
                if(res!==404){
                    // console.log("도착 예정정보",res.list);
                    props.setArrivalInfo(res);
                }
            })
            .catch(error => {
                console.error("도착 정보 조회 실패:", error);
            });
    };
    const convertNGISToKakao = (x, y) => {
        const [longitude, latitude] = proj4("EPSG:5182", "EPSG:4326", [x, y]);
        let lat = latitude;
        let lng = longitude;
        return { lat, lng };
    };
    const moveSelectedStop = () => {
        document.querySelector(".jh_sideSelectedStop")?.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
    }
    const searchTotal = async (value) =>{
        if(value){
            let res = await kakaoMap.getSearchTotal(value);
            if(res===404){
                message.warning("검색결과가 존재하지 않습니다.");
            }else{
                props.setSearchResults(res);
                props.setArrivalInfo(null);
                props.setSelectedStop(null);
                props.setMarkerClicked(false);
                props.setOpenedRoute(false);
            }
        }

    }
    // const draggableSide = (e) => {
    //     if(calcHeight!=="0px")searchHeight.current = parseInt(calcHeight.replace("px",""))+e.screenY;
    //     else
    //         searchHeight.current = e.screenY;
    //
    //     window.addEventListener("mousemove", searchHeightHandler)
    //     window.addEventListener("mouseup", searchHeightEnd);
    //     e.preventDefault();
    //     e.stopPropagation();
    // }
    // const searchHeightHandler = (e) => {
    //     // console.log("마우스 이벤트",e,searchHeight.current);
    //     // console.log(e.view.outerHeight);
    //     let calc = searchHeight.current-e.screenY;
    //     if(calc<0)calc=0;
    //     setCalcHeight(calc+"px");
    // }
    // const searchHeightEnd = () =>{
    //     window.removeEventListener("mousemove", searchHeightHandler);
    //     window.removeEventListener("mouseup", searchHeightEnd);
    // }
    // const draggableTouch = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if(calcHeight!=="0px")searchHeight.current = parseInt(calcHeight.replace("px",""))+e.touches[0].screenY;
    //     else
    //         searchHeight.current = e.touches[0].screenY;
    //     window.addEventListener("touchmove", searchHeightHandlerTouch)
    //     window.addEventListener("touchend", searchHeightEndTouch);
    // }
    // const searchHeightHandlerTouch = (e) => {
    //     let calc = searchHeight.current-e.touches[0].screenY;
    //     if(calc<0)calc=0;
    //     setCalcHeight(calc+"px");
    // }
    // const searchHeightEndTouch = () =>{
    //     window.removeEventListener("touchmove", searchHeightHandlerTouch);
    //     window.removeEventListener("touchend", searchHeightEndTouch);
    // }
    const toggleStart = () => {
        if(calcHeight === "0px"){
            setCalcHeight("1000px");
        }else{
            setCalcHeight("0px");
        }
    }
    return (
        <div style={{height:"100%", position:"relative"}}>
            <Space.Compact id={"jh_searchTop"} style={{ width: '100%', padding: '20px' }}>
                <Input.Search placeholder="정류장명을 입력해주세요" onSearch={searchTotal} allowClear />
            </Space.Compact>
            {props.isCommonMobile&&
            <div style={{width:"100%",height:"50vh"}}>
                <MobileKakaoMap {...props} />
            </div>
            }
            <div className={props.isCommonMobile?"jh_search_result_mobile":"none"} style={{height:`${props.isCommonMobile?"calc(100% - 50vh - 72px + "+calcHeight+")":"auto"}`}} data-height={calcHeight}>
                {props.isCommonMobile&&
                    <div style={{display:"flex",justifyContent:"center",paddingTop:"1rem",marginBottom:"1rem",alignItems:"center",height:"20px",position:"sticky",top:0,zIndex:30000,backgroundColor:"white"}} onClick={toggleStart} onTouchStart={toggleStart}>
                    <div className={styles.upper_btn} style={{width:"10px",height:"10px",borderRadius:"3px",borderTop:"5px solid #dddddd",borderRight:"5px solid #dddddd"}}></div>
                </div>
                }
                <div>

                <List
                    style={{padding:"0.5rem",margin:"0.8rem"}}
                    bordered
                    className={styles.side_list_border}
                    dataSource={props.searchResults}
                    renderItem={(item) => (
                        <List.Item
                            className={styles.side_li_border}
                            onClick={() => {
                                props.setMarkerClicked(false);
                                props.setSelectedRoute(null);
                                props.setSelectedRouteList(null);
                                fetchArrivalInfo(item.bsId);
                                let {lat,lng} = convertNGISToKakao(item.ngisXPos, item.ngisYPos);
                                item.lat = lat;
                                item.lng = lng;
                                props.setSelectedStop(item);
                                props.setMapCenter({lat,lng});
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ width: "100%" }}>
                                <div style={{
                                    fontWeight: "bold",
                                    fontSize: "1.1em",
                                    marginBottom: "4px"
                                }}>
                                    {item.bsNm}
                                </div>
                                <div style={{
                                    color: "#666",
                                    fontSize: "0.9em",
                                    marginBottom: "4px"
                                }}>
                                    정류장 ID: {item.bsId}
                                </div>
                                <div style={{
                                    color: "#1890ff",
                                    fontSize: "0.9em"
                                }}>
                                    경유 노선: {item.routeList}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
            {props.isCommonMobile && props.selectedRoute && (
                <div style={{margin:"1rem", display:"flex",justifyContent:"flex-end"}}>
                    <Button onClick={moveSelectedStop}>선택정류소</Button>
                </div>

            )}
            {props.selectedStop && (
                <Card
                    title={`${props.selectedStop.bsNm} 실시간 도착 정보`}
                    style={{ margin: "0.8rem" }}
                >
                    {props.arrivalInfo ? (
                        <List
                            dataSource={props.arrivalInfo.list}
                            renderItem={(item) => (
                                <List.Item>
                                    <div style={{ width: "100%" }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "4px",
                                        }}>
                                            <div style={{
                                                fontWeight: "bold",
                                                fontSize: "1.1em"
                                            }}>
                                                🚌 {item.routeNo} {item.routeNote && `(${item.routeNote})`}
                                            </div>
                                            <div style={{
                                                color: item.arrState === "전" ? "#52c41a" :
                                                    item.arrState === "전전" ? "#faad14" : item.arrState ==='도착예정' ? "#aaaaaa" :"#1890ff",
                                                fontWeight: "bold"
                                            }}>
                                                {item.arrState === "전" ? "전" :
                                                    item.arrState === "전전" ? "전전" : item.arrState ==='도착예정' ? "차고지 대기" :
                                                        `${item.arrState} 후 도착`}
                                                {props?.selectedRoute?.routeId === item.routeId && props.selectedRouteList && (
                                                    <div style={{display:"flex",width:"100%",justifyContent:"end"}}>
                                                        <img className={props.openedRoute?styles.jh_side_open:styles.jh_side_close} width={15} src={"/reverse_triangle.svg"} alt={"경로 닫기"}
                                                             onClick={()=>props.setOpenedRoute(!props.openedRoute)} style={{cursor:"pointer"}} />
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                        {/*<div style={{
                                            color: "#666",
                                            fontSize: "0.9em"
                                        }}>
                                            버스 번호: {item.vhcNo2}
                                        </div>*/}

                                    {props.openedRoute && props?.selectedRoute?.routeId === item.routeId && props.selectedRouteList && (

                                        <List
                                            className={styles.jh_sideSelectedStopList}
                                            dataSource={props.selectedRouteList}
                                            renderItem={(item) => {

                                                // if(item.bsId===props.selectedStop.bsId)document.querySelector(".jh_sideSelectedStop")?.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});
                                                return (
                                                <Card className={`${item.moveDir==0?styles.origin_dir:styles.reverse_dir} ${item.bsId===props.selectedStop.bsId?"jh_sideSelectedStop":""}`} >
                                                    <List.Item>
                                                        <div className={item.bsId===props.selectedStop.bsId?"jh_sideSelectedStop":""} style={{ width: "100%" }}>
                                                            <div style={{
                                                                fontWeight: "bold",
                                                                fontSize: "1.1em",
                                                                marginBottom: "4px",
                                                                display:"flex",
                                                                justifyContent:"space-between",
                                                            }}>
                                                                {item.bsNm}
                                                                {props.selectedRoutePosition?.length>0 && props.selectedRoutePosition.find(el=>el.bsId===item.bsId && el.moveDir===item.moveDir) ? (
                                                                    <img src={"/yellow_bus.png"} width={40} style={{borderRadius:"50%", zIndex:"999"}} alt={"cross_arrow"}/>
                                                                ):(<img src={"/dir.png"} width={40} style={{border:"3px solid #ffe31a",borderRadius:"50%", zIndex:"999"}} alt={"cross_arrow"} />)}

                                                            </div>
                                                            <div style={{
                                                                color: "#666",
                                                                fontSize: "0.9em",
                                                                marginBottom: "4px"
                                                            }}>
                                                                정류장 ID: {item.bsId}
                                                            </div>
                                                        </div>
                                                    </List.Item>
                                                </Card>
                                            )}}
                                        >
                                            <img width={30} src={"/dir.png"} alt={"위로가기버튼"} className={styles.sticky_side_btn} onClick={()=>{
                                                if(props.isCommonMobile)
                                                    document.querySelector(".jh_search_result_mobile").scrollTo({behavior:"smooth",top:0});
                                                else
                                                document.querySelector(`#jh_searchTop`).scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});

                                            }}/>
                                        </List>
                                    )}
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div>도착 정보를 불러오는 중...</div>
                    )}
                </Card>
            )}
        </div>
        </div>
    );
}

export default SearchTotal;