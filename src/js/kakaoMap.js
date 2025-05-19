import axios from "axios";

function defaultMove(){

}

async function getSearchTotal(nm){
    let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${nm}`);
    console.log(res);
    if(res?.data?.body?.length>0){
        return res.data.body;
    }else{
        return 404;
    }
}
async function getArrivalInfo(bsId){
    let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${bsId}`);
    console.log("도착 정보");
    console.log(res);
    if (res?.data?.body?.list?.length > 0) {
        return res.data.body;
    }else{
        return 404;
    }
}
export const kakaoMap = {
    defaultMove,
    getSearchTotal,
    getArrivalInfo
}

export default kakaoMap;
