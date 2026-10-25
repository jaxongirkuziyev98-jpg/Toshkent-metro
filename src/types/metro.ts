export type Language = 'uz' | 'ru' | 'en';

export type LineId = 'chilonzor' | 'ozbekiston' | 'yunusobod' | 'halqa';

export interface MetroLine {
  id: LineId;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  color: string;
  darkColor: string;
  textColor: string;
  openedYear: number;
  totalLengthKm: number;
  stationCount: number;
  stations: string[]; // station IDs in order
  endpoints: {
    from: string;
    to: string;
  };
  intervals: {
    peakMinutes: string;
    dayMinutes: string;
    nightMinutes: string;
  };
}

export interface StationFacility {
  id: 'wifi' | 'elevator' | 'atm' | 'ticketMachine' | 'restroom' | 'police' | 'bikeParking';
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  available: boolean;
}

export interface StationExit {
  gate: string;
  street: string;
  nearbyPlaces: string[];
  connectingBuses: string[];
}

export interface MetroStation {
  id: string;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  lineId: LineId;
  order: number;
  lat: number;
  lng: number;
  mapCoords: {
    x: number;
    y: number;
  };
  interchanges?: {
    stationId: string;
    lineId: LineId;
    walkMinutes: number;
  }[];
  directions: {
    dir1: string; // destination name
    dir2: string; // destination name
  };
  firstTrain: string;
  lastTrain: string;
  exits: StationExit[];
  facilities: StationFacility[];
  description: {
    uz: string;
    ru: string;
    en: string;
  };
  imageUrl?: string;
  architectureHighlights?: {
    uz: string;
    ru: string;
    en: string;
  };
}

export interface RouteStep {
  type: 'travel' | 'transfer';
  lineId: LineId;
  fromStationId: string;
  toStationId: string;
  stationsPassed: string[];
  durationMinutes: number;
  instruction: {
    uz: string;
    ru: string;
    en: string;
  };
}

export interface RouteResult {
  fromStation: MetroStation;
  toStation: MetroStation;
  totalDurationMinutes: number;
  totalStations: number;
  transferCount: number;
  steps: RouteStep[];
  fareUzs: {
    atto: number;
    standard: number;
    discount: number;
  };
}

export interface FavoriteRoute {
  id: string;
  name: string;
  fromId: string;
  toId: string;
  icon?: string;
}

export interface ServiceAlert {
  id: string;
  title: {
    uz: string;
    ru: string;
    en: string;
  };
  description: {
    uz: string;
    ru: string;
    en: string;
  };
  severity: 'info' | 'warning' | 'normal';
  date: string;
  lineId?: LineId;
}

export type CrowdLevel = 'low' | 'moderate' | 'high';
