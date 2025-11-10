import L from "leaflet";
import placeholderMarker from "../assets/placeholder.png";
import googleMarker from "../assets/google-maps.png";
import focusMarker from "../assets/focus.png";

export const stationaryMarker = new L.Icon({
  iconUrl: placeholderMarker,
  iconSize: [38, 38],
});

export const movingMarker = new L.Icon({
  iconUrl: googleMarker,
  iconSize: [45, 45],
});

export const clusterMarker = new L.Icon({
  iconUrl: focusMarker,
  iconSize: [50, 50],
});
