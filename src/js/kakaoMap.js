import axios from "axios";

function defaultMove() {

}

async function getSearchTotal(nm) {
    let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${nm}`);
    if (res?.data?.body?.length > 0) {
        return res.data.body;
    } else {
        return 404;
    }
}

async function getArrivalInfo(bsId) {
    try {
        let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${bsId}`);
        // console.log("도착 정보 : ",res);
        if (res.status === 200) {
            if (res?.data?.body?.list?.length > 0) {
                let data = res.data.body.list.splice(res.data.body.list.findIndex(item=>item.arrState==="도착예정"),1);
                res.data.body.list.push(...data);
                return res.data.body;
            } else {
                res.message = "조회된 데이터가 없습니다.";
                res.error = 404;
                return res;
            }
        }else{
            res.error = res.status;
            return res;
        }
    } catch (error) {
        console.log(error);
        let res = error.response;
        res.message = "에러 사항이 발생되었습니다."
        return res;
    }
}

async function getRouteInfo(routeNo) {
    try{
        // let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/bs_new/route?routeId=${routeNo}`);
        let res = await axios.get(`https://apis.data.go.kr/6270000/dbmsapi01/getBs?serviceKey=${import.meta.env.VITE_DAEGU_ENC_KEY}&routeId=${routeNo}`);
        // console.log("노선경유정류장 : ",res);
        return res;
    }catch (error) {
        let res = error.response;
        res.message = "에러 사항이 발생되었습니다.";
        return res;
    }
}

async function getRouteLocation(routeId){
    try{
        let res = await axios.get(`https://apis.data.go.kr/6270000/dbmsapi01/getPos?serviceKey=${import.meta.env.VITE_DAEGU_ENC_KEY}&routeId=${routeId}`);
        // console.log("노선 현 위치 : ",res);
        return res;
    }catch (error) {
        let res = error.response;
        res.message = "에러 사항이 발생되었습니다.";
        return res;
    }
}

async function getRouteLink(routeId){
    try{
        let res = await axios.get(`https://apis.data.go.kr/6270000/dbmsapi01/getLink?serviceKey=${import.meta.env.VITE_DAEGU_ENC_KEY}&routeId=${routeId}`);
        // console.log("route별 링크 : ",res);
        return res;
    }catch (error) {
        let res = error.response;
        res.message="에러사항 발생";
        return res;
    }
}

export const kakaoMap = {
    defaultMove,
    getSearchTotal,
    getArrivalInfo,
    getRouteInfo,
    getRouteLocation,
    getRouteLink,
}

export default kakaoMap;
