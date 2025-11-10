import React, { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { stationaryMarker, movingMarker, clusterMarker } from "../icons/icons";

export default function StationMarker({ station }) {
  const [isOpen, setIsOpen] = useState(false);

  const getMarkerIcon = (station) => {
    if (station.type_st === 1) return movingMarker;
    if (station.type_st === 0) return stationaryMarker;
    return clusterMarker;
  };

  return (
    <Marker
      position={[station.latitude, station.longitude]}
      icon={getMarkerIcon(station)}
      eventHandlers={{
        click: () => setIsOpen(true),
      }}
    >
      {isOpen && (
        <Popup onClose={() => setIsOpen(false)}>
          <b>ПНЗ №{station.id}</b>
          <br />
          Тип:{" "}
          {station.type_st === 0
            ? "Стационарная"
            : station.type_st === 1
            ? "Движущаяся"
            : "Кластерная"}
          <br />
          Координаты: {station.latitude.toFixed(5)}, {station.longitude.toFixed(5)}
          <br />
          PM 2.5: {station["PM_2_5"]}
          <br />
          PM 10: {station["PM_10"]}
        </Popup>
      )}
    </Marker>
  );
}
