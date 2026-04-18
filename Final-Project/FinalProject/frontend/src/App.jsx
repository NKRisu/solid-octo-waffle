import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useTrainLocations } from "./hooks/useTrainLocations";
import TrainMap from "./components/trainMap";
import FeedbackFormPage from "./components/FeedbackFormPage";
import FeedbackListPage from "./components/FeedbackListPage";

function Home({ trains, stations, selectedTrain, selectedComposition, loading, error, onSelectTrain, onClearSelection }) {
  return (
    <>
      <header className="header">
        <h2>Map of all running trains in Finland.</h2>
        <h3>Click on a train marker to see the train details.</h3>
        <h3>The map stops refreshing after you have selected a train.</h3>
        <h3>Click "clear selected train" to allow refresh on the map.</h3>
      </header>

      <div className="content">
        <div className="map-box">
          <TrainMap
            trains={trains}
            stations={stations}
            selectedTrain={selectedTrain}
            selectedComposition={selectedComposition}
            onSelectTrain={onSelectTrain}
          />
        </div>

        <div className="details-card">
          {selectedTrain ? (
            <>
              <h3>
                Train {selectedComposition?.trainNumber || selectedTrain.trainNumber} ({selectedComposition?.trainCategory || "n/a"})
              </h3>
              <p>
                <strong>Type:</strong> {selectedComposition?.trainType || "n/a"}
              </p>
              <p>
                <strong>Route:</strong> {selectedComposition?.journey?.startStation || "..."} → {selectedComposition?.journey?.endStation || "..."}
              </p>
              <p>
                <strong>Max speed:</strong> {selectedComposition?.maximumSpeed || "n/a"} km/h
              </p>
              <p>
                <strong>Total length:</strong> {selectedComposition?.totalLength || "n/a"} m
              </p>
              <p>
                <strong>Locomotives:</strong> {selectedComposition?.locomotives?.length ?? 0}
              </p>
              <ul>
                {selectedComposition?.locomotives?.map((loco, i) => (
                  <li key={`loco-${i}`}>
                    {loco.type} ({loco.powerType})
                  </li>
                ))}
              </ul>
              <p>
                <strong>Wagons:</strong> {selectedComposition?.wagons?.length ?? 0}
              </p>
              <ul>
                {selectedComposition?.wagons?.map((wagon, ia) => {
                  const lengthMeters = wagon.length ? (wagon.length / 100).toFixed(1) : null;
                  return (
                    <li key={`wagon-${ia}`}>
                      {wagon.type} {lengthMeters ? `- ${lengthMeters}m` : ""}
                      {wagon.petFriendly ? " (pet)" : ""}
                      {wagon.disabledAccess ? " (disabled)" : ""}
                      {wagon.catering ? " (catering)" : ""}
                    </li>
                  );
                })}
              </ul>
              <button onClick={onClearSelection}>Clear selected train</button>
            </>
          ) : (
            <p>Click a train marker to view detailed information.</p>
          )}
          {loading && <p className="loader">Loading...</p>}
          {error && <p className="error">Error: {error}</p>}
        </div>
      </div>

      <footer className="footer-easter-egg">
        <div className="footer-text">@NKRisu on GitHub</div>
      </footer>

      <section className="easter-egg" />
    </>
  );
}

export default function App() {
  const {
    trains,
    stations,
    selectedTrain,
    selectedComposition,
    loading,
    error,
    onSelectTrain,
    onClearSelection,
  } = useTrainLocations();

  return (
    <Router>
      <div className="app">
        <div className="top-banner">
          <div>Train Locations App React</div>
          <nav className="app-nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Home
            </NavLink>
            <NavLink to="/test-form" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Test Form
            </NavLink>
            <NavLink to="/feedback-list" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Feedback List
            </NavLink>
          </nav>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <Home
                trains={trains}
                stations={stations}
                selectedTrain={selectedTrain}
                selectedComposition={selectedComposition}
                loading={loading}
                error={error}
                onSelectTrain={onSelectTrain}
                onClearSelection={onClearSelection}
              />
            }
          />
          <Route path="/test-form" element={<FeedbackFormPage />} />
          <Route path="/feedback-list" element={<FeedbackListPage />} />
          <Route
            path="*"
            element={
              <Home
                trains={trains}
                stations={stations}
                selectedTrain={selectedTrain}
                selectedComposition={selectedComposition}
                loading={loading}
                error={error}
                onSelectTrain={onSelectTrain}
                onClearSelection={onClearSelection}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
