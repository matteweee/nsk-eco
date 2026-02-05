import React, { useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import MapView from "./components/MapView";
import ControlPanel from "./components/ControlPanel";
import Modal from "./components/Modal";
import MetricsChartOverlay from "./components/MetricsChartOverlay";


export default function App() {
  const [option, setOption] = useState("1");
  const [plotUrl, setPlotUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zones, setZones] = useState([]);
  const [showZones, setShowZones] = useState(false);

  const [showClusters, setShowClusters] = useState(false);
  const [showClusterHeads, setShowClusterHeads] = useState(false);
  const [showBatteryHeads, setShowBatteryHeads] = useState(false);

  const [clusters, setClusters] = useState(null);
  const [clusterHeads, setClusterHeads] = useState(null);
  const [batteryHeads, setBatteryHeads] = useState(null);


  const handleToggleClusters = async () => {
    if (showClusters) {
      setShowClusters(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    } 
    else if (showClusterHeads) {
      setShowClusterHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    } 
    else if (showBatteryHeads) {
      setShowBatteryHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    }
    else {
      const response = await fetch("http://127.0.0.1:8000/stations/plot/cluster");
      const data = await response.json();
      setClusters(data);
      setShowClusters(true);
    }
  };
  
  const handleToggleClusterHeads = async () => {
    if (showClusterHeads) {
      setShowClusterHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    } 
    else if (showBatteryHeads) {
      setShowBatteryHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
      
    }
    else if (showClusters) {
      setShowClusters(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    }
    else {
      const response = await fetch("http://127.0.0.1:8000/stations/plot/cluster?mode=head");
      const data = await response.json();
      setClusters(data);
      setShowClusterHeads(true);
    }
  };
  
  const handleToggleBatteryHeads = async () => {
    if (showBatteryHeads) {
      setShowBatteryHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    } 
    else if (showClusterHeads) {
      setShowClusterHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    } 
    else if (showClusters) {
      setShowBatteryHeads(false);
      const res = await fetch("http://127.0.0.1:8000/stations/reset", { method: "POST" });
      const data = await res.json();
      console.log("Сброс завершён:", data);
    }
    else {
      const response = await fetch("http://127.0.0.1:8000/stations/plot/cluster?mode=battery_life");
      const data = await response.json();
      setClusters(data);
      setShowBatteryHeads(true);
    }
  };
  

  const handleToggleZones = async () => {
    if (showZones) {
      setShowZones(false);
    } else {
        const response = await fetch("http://127.0.0.1:8000/stations/plot/timezone");
        const data = await response.json();
        setZones(data.zones || []);
        setShowZones(true);
      }
  };

  const handlePollutionsAdd = async () => {
    const res = await fetch("http://127.0.0.1:8000/stations/fake_pollutions", { method: "POST" });
  };
  const handlePollutionsMin = async () => {
    const res = await fetch("http://127.0.0.1:8000/stations/clear_fake_pollutions", { method: "POST" });
  };

  const handleGeneratePlot = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/stations/plot/${option}`,
        { headers: { Accept: "image/png" } }
      );
  
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }
  
      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      setPlotUrl(imgUrl);
      setShowModal(true);
    } catch (err) {
      console.error("Ошибка загрузки графика:", err);
      alert("Не удалось загрузить расписание. Проверь сервер или адрес API.");
    }
  };

  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100vh" }}>
      <MapView zones={zones} showZones={showZones} clusters={clusters} showClusters={showClusters} 
      clusterHeads={clusterHeads}
      batteryHeads={batteryHeads}
      showClusterHeads={showClusterHeads}
      showBatteryHeads={showBatteryHeads}
     />
     <MetricsChartOverlay
      visible={
      showZones ||
      showClusters ||
      showClusterHeads ||
      showBatteryHeads
      }
      />


      {}

      <div className="zone-buttons-container">
          <button onClick={handleToggleZones} className={`zone-button ${showZones ? "active" : ""}`}>
              {showZones ? "Скрыть таймзоны" : "Показать таймзоны"}
          </button>
          <button onClick={handleToggleClusters} className={`zone-button ${showClusters ? "active" : ""}`}>
              {showClusters ? "Скрыть кластеры" : "Показать кластеры"}
          </button>
          <button onClick={handleToggleClusterHeads} className={`zone-button ${showClusterHeads ? "active" : ""}`}>
              {showClusterHeads ? "Скрыть кластеры с хедами" : "Показать кластеры с хедами"}
          </button>
          <button onClick={handleToggleBatteryHeads} className={`zone-button ${showBatteryHeads ? "active" : ""}`}>
              {showBatteryHeads ? "Скрыть кластеры с батареями" : "Показать кластеры с батареями"}
          </button>

          <button onClick={handlePollutionsAdd} className={`zone-button`}>
              Добавить загрязнения
          </button>
          <button onClick={handlePollutionsMin} className={`zone-button`}>
              Убрать загрязнения
          </button>
      </div>
    </div>
  );
}
