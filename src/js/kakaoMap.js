import axios from "axios";

function defaultMove() {

}

async function getSearchTotal(nm) {
    let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${nm}`);
    console.log(res);
    if (res?.data?.body?.length > 0) {
        return res.data.body;
    } else {
        return 404;
    }
}

async function getArrivalInfo(bsId) {
    try {
        let res = await axios.get(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr/${bsId}`);
        console.log("도착 정보");
        console.log(res);
        if (res.status === 200) {
            if (res?.data?.body?.list?.length > 0) {
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

export const kakaoMap = {
    defaultMove,
    getSearchTotal,
    getArrivalInfo
}

export default kakaoMap;
