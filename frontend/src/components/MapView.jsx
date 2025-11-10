import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useStations } from "../hooks/useStations";
import StationMarker from "./StationMarker";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView() {
  const stations = useStations();

  return (
    <MapContainer
      center={[54.8676586, 83.082019]}
      zoom={10}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <StationMarker key={station.id} station={station} />
      ))}
    </MapContainer>
  );
}
