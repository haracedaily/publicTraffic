const SERVICE_KEY = import.meta.env.VITE_SERVICE_KEY;
const CITY_CODE = 22; // 대구

export async function getNearbyStations(lat, lng) {
    const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=${SERVICE_KEY}&gpsLati=${lat}&gpsLong=${lng}&_type=json`;
    const res = await fetch(url);
    const json = await res.json();
    return json.response.body.items.item || [];
}

export async function getArrivalInfo(nodeId) {
    const url = `https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${SERVICE_KEY}&cityCode=${CITY_CODE}&nodeId=${nodeId}&_type=json`;
    const res = await fetch(url);
    const json = await res.json();
    return json.response.body.items.item || [];
}