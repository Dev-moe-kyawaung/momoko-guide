export type Lang = 'en' | 'th' | 'my';
export type ThemeMode = 'system' | 'light' | 'dark';
export type Mode = 'walk' | 'bus' | 'boat' | 'rail';
export type PlaceKind = 'station' | 'stop' | 'landmark';
export type RailOperator = 'BTS' | 'MRT' | 'ARL';
export type Crowding = 1 | 2 | 3 | 4;

export interface I18nName {
  en: string;
  th: string;
  my: string;
}

export interface RailLine extends I18nName {
  id: string;
  operator: RailOperator;
  color: string;
  stations: string[];
  headwayPeakMin: number;
  serviceStart: string;
  serviceEnd: string;
}

export interface Station extends I18nName {
  id: string;
  code: string;
  lineId: string;
  lat: number;
  lng: number;
  exits: string[];
  /** index positions within the line (0 = toward terminus A) */
  terminusAName?: I18nName;
  terminusBName?: I18nName;
}

export interface BusRoute extends I18nName {
  id: string;
  code: string;
  kind: 'bus' | 'boat' | 'express';
  fuel: 'diesel' | 'electric' | 'n/a';
  fareThb: number;
  fareNote: string;
  color: string;
  stops: string[];
  headwayPeakMin: number;
}

export interface BusStop extends I18nName {
  id: string;
  code: string;
  lat: number;
  lng: number;
  /** BMTA 2026 smart-stop programme: 600 renovated + 500 digital */
  smart: 'renovated' | 'digital' | 'classic';
  shelter: boolean;
}

export interface Landmark extends I18nName {
  id: string;
  category: LandmarkCategory;
  lat: number;
  lng: number;
}

export type LandmarkCategory =
  | 'temple'
  | 'mall'
  | 'park'
  | 'hospital'
  | 'university'
  | 'market'
  | 'monument'
  | 'airport'
  | 'pier'
  | 'government'
  | 'transit';

export interface Place extends I18nName {
  id: string;
  kind: PlaceKind;
  lat: number;
  lng: number;
  category?: LandmarkCategory;
}

export interface Vehicle {
  id: string;
  routeId: string;
  lat: number;
  lng: number;
  bearing: number;
  crowding: Crowding;
  delaySec: number;
  vehicleType: string;
  occupancyStatus: string;
  lastUpdate: number;
}

export interface Arrival {
  routeId: string;
  dest: I18nName;
  etaSec: number;
  crowding: Crowding;
  realtime: boolean;
  vehicleId?: string;
}

export interface JourneyLeg {
  mode: Mode;
  lineId?: string;
  routeCode?: string;
  from: Place;
  to: Place;
  minutes: number;
  distanceM: number;
  stops: number;
  fareThb: number;
  crowding: Crowding;
  platform?: string;
  toward?: I18nName;
  exit?: string;
}

export interface Journey {
  id: string;
  legs: JourneyLeg[];
  departAt: number;
  durationMin: number;
  transfers: number;
  fareThb: number;
  walkMin: number;
  walkM: number;
  co2Kg: number;
  crowdingMax: Crowding;
  objective: 'fastest' | 'cheapest' | 'fewest';
  realtime: boolean;
}

export interface JourneyStep {
  legIndex: number;
  text: I18nName;
  icon: string;
}
