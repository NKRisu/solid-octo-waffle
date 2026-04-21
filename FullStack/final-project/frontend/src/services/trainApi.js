const BASE_TRAIN_LOCATIONS = "https://rata.digitraffic.fi/api/v1/train-locations.geojson/latest";
const BASE_COMPOSITION = "https://rata.digitraffic.fi/api/v1/compositions/{departure_date}/{train_number}";
const BASE_STATIONS = "https://rata.digitraffic.fi/api/v1/metadata/stations";

const headers = {
  "Digitraffic-User": "Junahenkilö/FoobarApp 1.0",
  "Accept-Encoding": "gzip",
};

async function checkResponse(res) {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getAllRunningTrains() {
  const response = await fetch(BASE_TRAIN_LOCATIONS, { headers });
  const result = await checkResponse(response);

  if (!result || !Array.isArray(result.features)) {
    return [];
  }

  return result.features.map((feature) => {
    const { coordinates } = feature.geometry || {};
    const { properties = {} } = feature;

    return {
      trainNumber: properties.trainNumber,
      departureDate: properties.departureDate,
      timestamp: properties.timestamp,
      speed: properties.speed,
      accuracy: properties.accuracy,
      location: coordinates ? [coordinates[1], coordinates[0]] : null,
    };
  });
}

export async function getCompositionOfTrain(trainNumber, departureDate, stationMapping = {}) {
  if (!trainNumber || !departureDate) {
    return null;
  }

  const url = BASE_COMPOSITION
    .replace("{departure_date}", departureDate)
    .replace("{train_number}", trainNumber);

  const response = await fetch(url, { headers });
  const result = await checkResponse(response);

  if (!result || !result.journeySections || result.journeySections.length === 0) {
    return null;
  }

  const journey = result.journeySections[0];
  const locomotives = Array.isArray(journey.locomotives) ? journey.locomotives : [];
  const wagons = Array.isArray(journey.wagons) ? journey.wagons : [];

  const journeyDetails = {
    startStation: stationMapping[journey.beginTimeTableRow?.stationShortCode] || journey.beginTimeTableRow?.stationShortCode || "Unknown",
    startTime: journey.beginTimeTableRow?.scheduledTime || "Unknown",
    endStation: stationMapping[journey.endTimeTableRow?.stationShortCode] || journey.endTimeTableRow?.stationShortCode || "Unknown",
    endTime: journey.endTimeTableRow?.scheduledTime || "Unknown",
  };

  return {
    trainNumber: result.trainNumber,
    departureDate: result.departureDate,
    trainType: result.trainType || "Information not available",
    trainCategory: result.trainCategory || "Information not available",
    journey: journeyDetails,
    locomotives: locomotives.map((loco) => ({
      type: loco.locomotiveType,
      powerType: loco.powerType,
      location: loco.location,
    })),
    wagons: wagons.map((wagon) => ({
      type: wagon.wagonType,
      salesNumber: wagon.salesNumber,
      length: wagon.length,
      petFriendly: Boolean(wagon.pet),
      catering: Boolean(wagon.catering),
      disabledAccess: Boolean(wagon.disabled),
    })),
    totalLength: journey.totalLength,
    maximumSpeed: journey.maximumSpeed,
  };
}

export async function getStationMapping() {
  const response = await fetch(BASE_STATIONS, { headers });
  const data = await checkResponse(response);

  if (!Array.isArray(data)) return {};

  return data.reduce((acc, station) => {
    if (station.stationShortCode) {
      acc[station.stationShortCode] = station.stationName || station.stationShortCode;
    }
    return acc;
  }, {});
}

export async function getStations() {
  const response = await fetch(BASE_STATIONS, { headers });
  const data = await checkResponse(response);
  return Array.isArray(data) ? data : [];
}
