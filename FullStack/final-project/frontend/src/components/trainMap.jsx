import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import blueIconUrl from "../assets/images/icons/blue-icon.png";
import redIconUrl from "../assets/images/icons/red-icon.png";

const stationIcon = new L.Icon({
  iconUrl: blueIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

const trainIcon = new L.Icon({
  iconUrl: redIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

function AutoFitBounds({ trains }) {
  const map = useMap();
  const hasFitBounds = useRef(false);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    const onMoveStart = () => {
      isUserInteracting.current = true;
    };

    map.on("movestart", onMoveStart);

    return () => {
      map.off("movestart", onMoveStart);
    };
  }, [map]);

  useEffect(() => {
    if (hasFitBounds.current || isUserInteracting.current) return;

    const validLocations = trains
      .map((t) => t.location)
      .filter((loc) => Array.isArray(loc) && loc.length === 2);

    if (validLocations.length > 0) {
      map.fitBounds(validLocations, { padding: [50, 50], maxZoom: 8 });
      hasFitBounds.current = true;
    }
  }, [map, trains]);

  return null;
}

export default function TrainMap({ trains = [], stations = [], selectedTrain = null, selectedComposition = null, onSelectTrain }) {
  const center = [64, 26];

  function renderTrainPopup(train) {
    const highlighted = selectedTrain?.trainNumber === train.trainNumber && selectedComposition;
    if (!highlighted) {
      return (
        <div>
          <strong>Train Number:</strong> {train.trainNumber}
          <br />
          <strong>Speed:</strong> {train.speed ?? "N/A"} km/h
          <br />
          <strong>Accuracy:</strong> {train.accuracy ?? "N/A"}
          <br />
          <em>Click to load full composition</em>
        </div>
      );
    }

    const c = selectedComposition;
    return (
      <div style={{ maxWidth: "260px" }}>
        <strong>Train Number:</strong> {c.trainNumber}
        <br />
        <strong>Train Type:</strong> {c.trainType}
        <br />
        <strong>Train Category:</strong> {c.trainCategory}
        <br />
        <strong>Start Station:</strong> {c.journey?.startStation}
        <br />
        <strong>End Station:</strong> {c.journey?.endStation}
        <br />
        <strong>Maximum Speed:</strong> {c.maximumSpeed ?? "N/A"} km/h
        <br />
        <strong>Speed:</strong> {train.speed ?? "N/A"} km/h
        <br />
        <strong>Total Length:</strong> {c.totalLength ?? "N/A"} m
        <br />
        <strong>Locomotives:</strong> {Array.isArray(c.locomotives) ? c.locomotives.length : 0}
        <br />
        {c.locomotives?.map((loco, i) => (
          <div key={`popup-loco-${i}`} style={{ marginLeft: "8px" }}>
            Type: {loco.type}, Power: {loco.powerType}
          </div>
        ))}
        <strong>Wagons:</strong> {Array.isArray(c.wagons) ? c.wagons.length : 0}
        <br />
        {c.wagons?.map((wagon, i) => {
          const lengthMeters = wagon.length ? (wagon.length / 100).toFixed(1) : null;
          return (
            <div key={`popup-wagon-${i}`} style={{ marginLeft: "8px" }}>
              Type: {wagon.type}{lengthMeters ? ` - ${lengthMeters}m` : ""}{wagon.petFriendly ? ", Pet-Friendly" : ""}{wagon.disabledAccess ? ", Disabled Access" : ""}{wagon.catering ? ", Catering" : ""}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <AutoFitBounds trains={trains} />

      {stations
        .filter((s) => s.latitude != null && s.longitude != null)
        .slice(0, 200)
        .map((station) => (
          <Marker
            key={`station-${station.stationShortCode}-${station.stationName}`}
            position={[station.latitude, station.longitude]}
            icon={stationIcon}
          >
            <Popup>
              <div>
                <strong>{station.stationName}</strong>
                <br />
                Code: {station.stationShortCode}
              </div>
            </Popup>
          </Marker>
        ))}

      {trains
        .filter((t) => Array.isArray(t.location) && t.location.length === 2)
        .map((train) => (
          <Marker
            key={`${train.trainNumber}-${train.departureDate}`}
            position={train.location}
            icon={trainIcon}
            eventHandlers={{ click: () => onSelectTrain(train) }}
          >
            <Popup>{renderTrainPopup(train)}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
