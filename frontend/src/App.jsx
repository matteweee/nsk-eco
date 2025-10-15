import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import placeholderMarker from './assets/placeholder.png'
import googleMarker from './assets/google-maps.png'
import focusMarker from './assets/focus.png'
import { Icon, divIcon, point } from "leaflet";
import React, { useEffect, useState } from "react";
import axios from "axios";


const standardMarker = new Icon({

  iconUrl: placeholderMarker,
  attribution: <a href="https://www.flaticon.com/free-icons/pin" title="pin icons">Pin icons created by Freepik - Flaticon</a>,
  iconSize: [38, 38] // size of the icon
});

const selectedMarker = new Icon({
  iconUrl: googleMarker,
  attribution: <a href="https://www.flaticon.com/free-icons/google-maps" title="google maps icons">Google maps icons created by Freepik - Flaticon</a>,
  iconSize: [50, 50] // size of the icon
});

const overLimitMarker = new Icon({

  iconUrl: focusMarker,
  attribution: <a href="https://www.flaticon.com/free-icons/focus" title="focus icons">Focus icons created by Freepik - Flaticon</a>,
  iconSize: [60, 60] // size of the icon
});

// custom cluster icon
const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};



export default function App() {

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [stations, setStations] = useState([]);

  const fetchStations = () => {
    axios.get('http://127.0.0.1:8000/stations').then(r => {
      const stationsResponse = r.data;
      console.log(stationsResponse);
      setStations(stationsResponse);
    });
  }

  useEffect(() => {
    fetchStations();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      fetchStations();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function getMarkerIcon(index, overTLV) {
    if (overTLV) {
      return overLimitMarker;
    }
    if(index === selectedIndex) {
          return selectedMarker;
    }
    return standardMarker;
  }

  const [option, setOption] = useState("1");
  const [plotUrl, setPlotUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGeneratePlot = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/stations/plot/${option}`, {
        responseType: "blob",
      });
      const imgUrl = URL.createObjectURL(response.data);
      setPlotUrl(imgUrl);
      setShowModal(true);
    } catch (err) {
      console.error("Ошибка загрузки графика:", err);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Левая часть - карта */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[54.8676586, 83.082019]} zoom={10}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
          >
            {stations.map((station) => (
              <Marker
                key={station.id}
                index={station.id}
                position={[station.latitude, station.longitude]}
                icon={getMarkerIcon(station.id, station.overTLV)}
                overTLV={station.overTLV}
                eventHandlers={{
                  click: (e) => setSelectedIndex(e.target.options.index)
                }}
              >
                <Popup>
                  ПНЗ №: {station.id} <br />
                  Координаты: {station.latitude.toFixed(5)}, {station.longitude.toFixed(5)} <br />
                  PM 2.5: {station["PM_2_5"]} <br />
                  PM 10: {station["PM_10"]}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
            <div style={{ position: "absolute", top: 20, right: 20, zIndex: 1000, background: "white", padding: "10px", borderRadius: "5px" }}>
            <label htmlFor="plot-select">Выберите расписание: </label>
            <select id="plot-select" value={option} onChange={(e) => setOption(e.target.value)}>
              <option value="1">Time Zone</option>
              <option value="2">Cluster</option>
              <option value="3">Cluster with cluster heads</option>
              <option value="4">Cluster with battery life based cluster heads</option>
            </select>
            <button style={{ marginLeft: "10px" }} onClick={handleGeneratePlot}>Построить</button>
            </div>

        {/* Модальное окно */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "80%",
            maxHeight: "80%",
            overflow: "auto"
          }}>
            <button onClick={() => setShowModal(false)} style={{
              float: "right",
              background: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              Закрыть
            </button>
            {plotUrl && (
              <img src={plotUrl} alt="plot" style={{ width: "100%", marginTop: "10px" }} />
            )}
          </div>
        </div>
      )}
      </div>



    
  );
}
