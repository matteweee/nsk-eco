import { useEffect, useState } from "react";
import { getStations } from "../services/api";

export const useStations = () => {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStations();
        setStations(data);
      } catch (error) {
        console.error("Ошибка загрузки станций:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return stations;
};
