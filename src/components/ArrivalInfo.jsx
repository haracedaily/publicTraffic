import { useEffect, useState } from "react";
import { getArrivalInfo } from "../api/busApi";

function ArrivalInfo({ station }) {
    const [arrivals, setArrivals] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const data = await getArrivalInfo(station.nodeId);
            setArrivals(data);
        }
        fetchData();
    }, [station]);

    return (
        <div>
            <h3>🚌 {station.nodeNm} 도착 정보</h3>
            <ul>
                {arrivals.map((bus, idx) => (
                    <li key={idx}>
                        {bus.routeNm}번: {bus.arriveTime}분 후 도착 예정
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArrivalInfo;