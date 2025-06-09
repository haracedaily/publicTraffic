import { useEffect, useState } from "react";

function useGeoLocation() {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const watcherId = navigator.geolocation.watchPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => console.error("위치 추적 에러:", err),
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 10000,
            }
        );

        return () => navigator.geolocation.clearWatch(watcherId);
    }, []);

    return location;
}

export default useGeoLocation;