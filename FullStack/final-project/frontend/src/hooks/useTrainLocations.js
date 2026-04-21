import { useState, useEffect, useCallback } from "react";
import {
  getAllRunningTrains,
  getStationMapping,
  getCompositionOfTrain,
  getStations,
} from "../services/trainApi";

export function useTrainLocations() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [stationMap, setStationMap] = useState({});
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedComposition, setSelectedComposition] = useState(null);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStationData = useCallback(async () => {
    try {
      const [stationsData, mapping] = await Promise.all([getStations(), getStationMapping()]);
      setStations(stationsData);
      setStationMap(mapping);
    } catch (err) {
      setError(err.message || "Station load failed");
    }
  }, []);

  const fetchTrains = useCallback(async () => {
    try {
      setLoading(true);
      const liveTrains = await getAllRunningTrains();
      setTrains(liveTrains);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Train fetch failed");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStationData();
    fetchTrains();

    const id = setInterval(() => {
      if (!isPollingPaused) {
        fetchTrains();
      }
    }, 5000);

    return () => clearInterval(id);
  }, [fetchTrains, loadStationData, isPollingPaused]);

  const onSelectTrain = useCallback(
    async (train) => {
      setSelectedTrain(train);
      setIsPollingPaused(Boolean(train));

      if (!train) {
        setSelectedComposition(null);
        return;
      }

      try {
        setLoading(true);
        const composition = await getCompositionOfTrain(train.trainNumber, train.departureDate, stationMap);
        setSelectedComposition(composition);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Composition failed");
        setSelectedComposition(null);
        setLoading(false);
      }
    },
    [stationMap]
  );

  const onClearSelection = useCallback(() => {
    setSelectedTrain(null);
    setSelectedComposition(null);
    setIsPollingPaused(false);
  }, []);

  return {
    trains,
    stations,
    selectedTrain,
    selectedComposition,
    loading,
    error,
    isPollingPaused,
    onSelectTrain,
    onClearSelection,
  };
}
