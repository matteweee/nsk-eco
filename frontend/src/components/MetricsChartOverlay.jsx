import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function MetricsChartOverlay({ visible }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!visible) return;

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/metrics");

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      setData(prev => [
        ...prev.slice(-100), // ~2 минуты (40 * 3 сек)
        {
          time: new Date(msg.timestamp).toLocaleTimeString(),
          value: msg.messages_per_second
        }
      ]);
    };

    return () => ws.close();
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 420,
        height: 260,
        background: "rgba(0,0,0,0.7)",
        borderRadius: 12,
        padding: 12,
        zIndex: 1000
      }}
    >
      <div style={{ color: "#fff", marginBottom: 8 }}>
        Сообщений / сек
      </div>

      <LineChart width={396} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ff4d4f"
          dot={false}
        />
      </LineChart>
    </div>
  );
}
