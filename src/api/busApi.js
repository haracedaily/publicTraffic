const SERVICE_KEY = import.meta.env.VITE_DAEGU_ENC_KEY;
const CITY_CODE = 22; // 대구

export async function getNearbyStations(lat, lng) {
  const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=${SERVICE_KEY}&gpsLati=${lat}&gpsLong=${lng}&_type=json`;
  const res = await fetch(url);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const json = await res.json();
    json.response.body.items.item=json.response.body.items.item.filter(el=>el?.nodeid?.includes("DGB"));
    json.response.body.items.item=json.response.body.items.item.map(el=>{
        el.nodeid=el.nodeid.replaceAll("DGB","");
         el.gpslati=parseFloat(el.gpslati,6);
         el.gpslong=parseFloat(el.gpslong,6);
        return el;
    })
    // 해당 정류소 버스 도착 예정 정보
    // https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${nodeid}
    /* 
    res && res.map(el=>(
    <>
        <div onClick={()=>{axios.get("https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/"+el.nodeid).then(res=>{setArriveDataList(res.body.data.list)})}}></div>
    </>
    ))
    */
    return json.response.body.items.item || [];
  } else if (contentType && contentType.includes("text/xml")) {
    // HTML 응답 처리 (예: 404 페이지)
    const text = await res.text();
    throw new Error("HTML response from getNearbyStations()");
  }
  else {
    const text = await res.text();
    throw new Error("Invalid JSON response from getNearbyStations()");
  }
}

export async function getArrivalInfo(nodeId) {
  const url = `https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${SERVICE_KEY}&cityCode=${CITY_CODE}&nodeId=${nodeId}&_type=json`;
  const res = await fetch(url);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const json = await res.json();
    return json.response.body.items.item || [];
  } else {
    const text = await res.text();
    throw new Error("Invalid JSON response from getArrivalInfo()");
  }
}
