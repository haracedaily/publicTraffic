import { useEffect, useState } from "react";
import { getNearbyStations } from "../api/busApi";
import {getDistance} from "../utils/distance.js";

function StationList({ stations, onSelectStation }) {

    return (
        <div>
            <h3>📍 주변 정류장</h3>
            <ul>
                {stations.map((s) => (
                    <li key={s.nodeId}>
                        <button onClick={() => onSelectStation(s)}>
                            {s.nodeNm} ({s.distance.toFixed(1)} m)
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default StationList;