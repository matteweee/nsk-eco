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
      <MapView />
      <ControlPanel
        option={option}
        setOption={setOption}
        onGenerate={handleGeneratePlot}
      />
      {showModal && <Modal plotUrl={plotUrl} onClose={() => setShowModal(false)} />}
    </div>
  );
}
