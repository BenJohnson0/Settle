import type { Preset } from '../types';

export const PRESETS: Preset[] = [
  {
    key: 'balanced',
    label: 'Balanced',
    emoji: '⚖️',
    filters: {
      weights: { shops: 5, transport: 5, affordability: 6, recreation: 4, amenities: 5, healthcare: 5, grants: 4, costOfLiving: 5, airQuality: 4 },
      maxBudget: 350000,
      maxMonthlyRent: 1500,
      desiredShops: [],
      desiredTransport: [],
      desiredRecreation: [],
    },
  },
  {
    key: 'city-life',
    label: 'City Life',
    emoji: '🏙️',
    filters: {
      weights: { shops: 8, transport: 10, affordability: 3, recreation: 5, amenities: 8, healthcare: 6, grants: 2, costOfLiving: 3, airQuality: 2 },
      maxBudget: 550000,
      maxMonthlyRent: 2500,
      desiredShops: ['tesco', 'marks-spencer'],
      desiredTransport: ['luas', 'dart', 'dublin-bus'],
      desiredRecreation: ['pubs', 'gym', 'cinema', 'clothes-shops'],
    },
  },
  {
    key: 'suburban-family',
    label: 'Family Suburb',
    emoji: '🏡',
    filters: {
      weights: { shops: 6, transport: 6, affordability: 7, recreation: 5, amenities: 9, healthcare: 8, grants: 5, costOfLiving: 6, airQuality: 6 },
      maxBudget: 380000,
      maxMonthlyRent: 1800,
      desiredShops: ['aldi', 'lidl', 'tesco'],
      desiredTransport: ['train', 'dublin-bus', 'bus-eireann'],
      desiredRecreation: ['park', 'sports'],
    },
  },
  {
    key: 'budget-buyer',
    label: 'Budget Buyer',
    emoji: '💰',
    filters: {
      weights: { shops: 4, transport: 3, affordability: 10, recreation: 2, amenities: 3, healthcare: 4, grants: 9, costOfLiving: 8, airQuality: 2 },
      maxBudget: 220000,
      maxMonthlyRent: 1000,
      desiredShops: ['aldi', 'lidl'],
      desiredTransport: [],
      desiredRecreation: [],
    },
  },
  {
    key: 'rural-retreat',
    label: 'Rural Retreat',
    emoji: '🌿',
    filters: {
      weights: { shops: 3, transport: 2, affordability: 7, recreation: 10, amenities: 2, healthcare: 3, grants: 8, costOfLiving: 6, airQuality: 9 },
      maxBudget: 250000,
      maxMonthlyRent: 1000,
      desiredShops: ['supervalu'],
      desiredTransport: [],
      desiredRecreation: ['hiking', 'cycling', 'beach'],
    },
  },
  {
    key: 'active-lifestyle',
    label: 'Active Living',
    emoji: '🏄',
    filters: {
      weights: { shops: 3, transport: 4, affordability: 5, recreation: 10, amenities: 3, healthcare: 4, grants: 3, costOfLiving: 4, airQuality: 7 },
      maxBudget: 350000,
      maxMonthlyRent: 1500,
      desiredShops: [],
      desiredTransport: [],
      desiredRecreation: ['beach', 'hiking', 'cycling', 'park', 'gym', 'sports'],
    },
  },
];
