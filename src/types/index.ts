export type ShopType = 'aldi' | 'lidl' | 'tesco' | 'dunnes' | 'supervalu' | 'marks-spencer' | 'centra' | 'londis' | 'mr-price' | 'dealz';
export type TransportType = 'luas' | 'dart' | 'train' | 'dublin-bus' | 'bus-eireann';
export type RecreationType = 'park' | 'beach' | 'hiking' | 'cycling' | 'pubs' | 'gym' | 'clothes-shops' | 'cinema' | 'sports';

export interface Transport {
  types: TransportType[];
  busRoutes: number;
}

export interface Amenities {
  schools: number;
  libraries: number;
  cinemas: number;
}

export interface Recreation {
  parks: number;
  beaches: number;
  hasHiking: boolean;
  hasCycling: boolean;
  pubs: number;
  gyms: number;
  clothesShops: number;
  sportsFacilities: number;
}

export interface Healthcare {
  hospitals: number;
  gps: number;
  dentists: number;
}

export interface Grants {
  helpToBuy: boolean;
  firstHomeScheme: boolean;
  localAuthorityLoan: boolean;
  vacantPropertyGrant: boolean;
  seiGrants: boolean;
}

export interface IrishArea {
  id: string;
  name: string;
  county: string;
  lat: number;
  lng: number;
  population: number;
  avgHousePrice: number;
  avgMonthlyRent: number;
  shops: ShopType[];
  transport: Transport;
  amenities: Amenities;
  recreation: Recreation;
  healthcare: Healthcare;
  grants: Grants;
  description: string;
}

export interface FilterWeights {
  shops: number;
  transport: number;
  affordability: number;
  recreation: number;
  amenities: number;
  healthcare: number;
  grants: number;
}

export interface Filters {
  weights: FilterWeights;
  maxBudget: number;
  maxMonthlyRent: number;
  desiredShops: ShopType[];
  desiredTransport: TransportType[];
  desiredRecreation: RecreationType[];
}

export interface ScoreBreakdown {
  shops: number;
  transport: number;
  affordability: number;
  recreation: number;
  amenities: number;
  healthcare: number;
  grants: number;
}

export interface ScoredArea {
  area: IrishArea;
  totalScore: number;
  breakdown: ScoreBreakdown;
}

export type PresetKey = 'balanced' | 'city-life' | 'suburban-family' | 'budget-buyer' | 'rural-retreat' | 'active-lifestyle';

export interface Preset {
  key: PresetKey;
  label: string;
  emoji: string;
  filters: Filters;
}
