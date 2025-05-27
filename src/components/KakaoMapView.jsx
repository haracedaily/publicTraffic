import React, { useRef, useState, useEffect } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import MapView from "./MapView";

export default function KakaoMapView({
  center,
  markers = [],
  busStops = [],
  selectedStop,
  setSelectedStop,
  setArrivalData,
  onRelocate,
}) {
  useKakaoLoader({ appkey: import.meta.env.VITE_KAKAO_API_KEY });
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const dragHandleRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = () => {
    if (mapRef.current && window.kakao?.maps) {
      const kakaoLatLng = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapRef.current.setCenter(kakaoLatLng);
    }
    onRelocate?.();
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newHeight = window.innerHeight - e.clientY;
    setPanelHeight(
      Math.max(100, Math.min(newHeight, window.innerHeight * 0.9))
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Map
        center={center}
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        level={4}
      >
        <MapView position={center} onClick={handleClick} />
        {markers.map((marker, idx) => (
          <MapMarker
            key={idx}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            clickable={true}
          >
            {selectedStop?.bsId === marker.bsId && (
              <div
                style={{
                  margin: "0 auto",
                  padding: "4px 8px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {marker.name}
              </div>
            )}
          </MapMarker>
        ))}
      </Map>

      {isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: `${panelHeight}px`,
            background: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            zIndex: 5,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
            overflowY: "auto",
          }}
        >
          <div
            ref={dragHandleRef}
            onMouseDown={handleMouseDown}
            style={{
              width: "100%",
              height: "16px",
              cursor: "row-resize",
              background: "#ccc",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />
          {busStops.map((item, index) => (
            <div
              key={item.arsId}
              onClick={async () => {
                if (selectedStop?.bsId === item.bsId) {
                  setSelectedStop(null);
                  setArrivalData([]);
                  return;
                }

                setSelectedStop(item);
                const result = await fetchArrivalInfo(item.bsId);
                setArrivalData(result);
              }}
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              <strong>
                {index + 1}. {item.name}
              </strong>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>
                ID: {item.arsId}
              </div>
              <div>{(item.distance / 1000).toFixed(1)} km</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
