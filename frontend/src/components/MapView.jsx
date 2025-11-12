import React from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, Rectangle } from "react-leaflet";
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

export default function MapView({ zones, showZones, 
  clusters,
  clusterHeads,
  batteryHeads,
  showClusters,
  showClusterHeads,
  showBatteryHeads,
                                }) {
  const stations = useStations();

  const clusterHeadIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/463/463574.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -25]
  });

  const batteryHeadIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3103/3103446.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -25]
  });

  const clusterColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
    "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
    "#bcbd22", "#17becf",
  ];

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
      {/* отрисовка кластеров */}
      {showZones && zones.map((zone, i) => {
          return (
            <Rectangle
              key={i}
              bounds={[
                [zone.x_min, zone.y_min],
                [zone.x_max, zone.y_max],
              ]}
              pathOptions={{
                color: "white",
                weight: 1,
                fillColor: clusterColors[i % clusterColors.length],
                fillOpacity: 0.4
              }}
            />
          );
        })}

      {(showClusters || showBatteryHeads || showClusterHeads) && clusters?.polygons?.length > 0 && (
        clusters.polygons.map((cluster, i) => (
          <Polygon
            key={cluster.cluster_id}
            positions={cluster.points.map(([lat, lon]) => [lat, lon])}
            pathOptions={{
              color: "white",
              weight: 1,
              fillColor: clusterColors[i % clusterColors.length],
              fillOpacity: 0.4
            }}
          />
        ))
      )}



    </MapContainer>
    
  );
}
