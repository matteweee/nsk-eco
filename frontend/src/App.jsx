import React, { useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import MapView from "./components/MapView";
import ControlPanel from "./components/ControlPanel";
import Modal from "./components/Modal";

export default function App() {
  const [option, setOption] = useState("1");
  const [plotUrl, setPlotUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zones, setZones] = useState([]);
  const [showZones, setShowZones] = useState(false);

  const handleToggleZones = async () => {
    if (showZones) {
      // скрываем зоны
      setShowZones(false);
    } else {
      try {
        const response = await fetch("http://127.0.0.1:8000/stations/plot/timezone");
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        const data = await response.json();
        setZones(data.zones || []);
        setShowZones(true);
      } catch (err) {
        console.error("Ошибка загрузки зон:", err);
        alert("Не удалось загрузить зоны. Проверь сервер или адрес API.");
      }
    }
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
    <div style={{ display: "flex" }}>
      <MapView zones={zones} showZones={showZones}  />
      <ControlPanel
        option={option}
        setOption={setOption}
        onGenerate={handleGeneratePlot}

      />

      {showModal && <Modal plotUrl={plotUrl} onClose={() => setShowModal(false)} />}
      <button onClick={handleToggleZones} className={`zone-button ${showZones ? "active" : ""}`}>
          {showZones ? "Скрыть таймзоны" : "Показать таймзоны"}
      </button>
    </div>
  );
}
