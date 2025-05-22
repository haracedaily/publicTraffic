const SERVICE_KEY = import.meta.env.VITE_DAEGU_ENC_KEY;
const CITY_CODE = 22; // 대구

// 공통 fetch 응답 처리 함수
async function fetchAndParse(url, type = "json") {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type");

  if (type === "json" && contentType?.includes("application/json")) {
    return await res.json();
  } else if (type === "xml" && contentType?.includes("xml")) {
    const text = await res.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/xml");
  } else {
    const text = await res.text();
    throw new Error(`Unexpected response format from: ${url}`);
  }
}

// 1. 주변 정류장 목록 조회
export async function getNearbyStations(lat, lng) {
  const url = `https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getCrdntPrxmtSttnList?serviceKey=${SERVICE_KEY}&gpsLati=${lat}&gpsLong=${lng}&_type=json`;
  const data = await fetchAndParse(url, "json");

  let items = data?.response?.body?.items?.item ?? [];

  // 대구 정류장 필터링 및 가공
  items = items
    .filter(el => el?.nodeid?.includes("DGB"))
    .map(el => ({
      ...el,
      nodeid: el.nodeid.replaceAll("DGB", ""),
      gpslati: parseFloat(el.gpslati),
      gpslong: parseFloat(el.gpslong),
    }));

  return items;
}

// 2. 특정 정류장(nodeId)에 대한 버스 도착 정보 조회 (국가 API)
export async function getArrivalInfo(nodeId) {
  const url = `https://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${SERVICE_KEY}&cityCode=${CITY_CODE}&nodeId=${nodeId}&_type=json`;
  const data = await fetchAndParse(url, "json");

  return data?.response?.body?.items?.item ?? [];
}

// 3. 대구 버스 정보 시스템 API (arsId 기반 도착 정보)
export async function fetchArrivalInfo(arsId) {
  const url = `https://businfo.daegu.go.kr/openapi/service/BusArriveService/getBusArrivalListByStation?arsId=${arsId}&serviceKey=${SERVICE_KEY}`;

  try {
    const xml = await fetchAndParse(url, "xml");
    const items = [...xml.querySelectorAll("item")];

    return items.map(item => ({
      routeId: item.querySelector("routeId")?.textContent ?? "",
      routeName: item.querySelector("routeName")?.textContent ?? "",
      predictTime1: item.querySelector("predictTime1")?.textContent ?? "-",
      locationNo1: item.querySelector("locationNo1")?.textContent ?? "-",
    }));
  } catch (err) {
    console.error("버스 도착 정보 요청 실패:", err);
    return [];
  }
}
