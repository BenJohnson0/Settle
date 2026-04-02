import type { IrishArea, Filters, ScoreBreakdown, ScoredArea } from '../types';

function shopsScore(area: IrishArea, filters: Filters): number {
  const { desiredShops } = filters;
  if (desiredShops.length === 0) {
    return Math.min(100, area.shops.length * 10);
  }
  const present = desiredShops.filter(s => area.shops.includes(s)).length;
  return Math.round((present / desiredShops.length) * 100);
}

function transportScore(area: IrishArea, filters: Filters): number {
  const { desiredTransport } = filters;
  const { types, busRoutes } = area.transport;
  const busBonus = Math.min(20, busRoutes * 1.5);

  if (desiredTransport.length === 0) {
    return Math.min(100, Math.round(Math.min(80, types.length * 22) + busBonus));
  }
  const present = desiredTransport.filter(t => types.includes(t)).length;
  return Math.min(100, Math.round((present / desiredTransport.length) * 80 + busBonus));
}

function affordabilityScore(area: IrishArea, filters: Filters): number {
  // House price sub-score
  const price = area.avgHousePrice;
  const budget = filters.maxBudget;
  let priceScore: number;
  if (price <= budget) {
    priceScore = 100;
  } else {
    const overRatio = (price - budget) / budget;
    priceScore = Math.max(0, Math.round(100 - overRatio * 200));
  }

  // Rent sub-score
  const rent = area.avgMonthlyRent;
  const maxRent = filters.maxMonthlyRent;
  let rentScore: number;
  if (rent <= maxRent) {
    rentScore = 100;
  } else {
    const overRatio = (rent - maxRent) / maxRent;
    rentScore = Math.max(0, Math.round(100 - overRatio * 200));
  }

  return Math.round((priceScore + rentScore) / 2);
}

function recreationScore(area: IrishArea, filters: Filters): number {
  const { desiredRecreation } = filters;
  const rec = area.recreation;

  // Base score from all recreation assets
  let base = 0;
  base += Math.min(18, rec.parks * 4);
  base += Math.min(15, rec.beaches * 8);
  if (rec.hasHiking) base += 8;
  if (rec.hasCycling) base += 5;
  base += Math.min(15, rec.pubs * 0.3);
  base += Math.min(12, rec.gyms * 3);
  base += Math.min(10, rec.clothesShops * 0.5);
  base += Math.min(12, rec.sportsFacilities * 2);
  base = Math.min(100, base);

  if (desiredRecreation.length === 0) return Math.round(base);

  // Penalise if desired features are absent/low
  let multiplier = 1;
  if (desiredRecreation.includes('park') && rec.parks === 0) multiplier *= 0.4;
  if (desiredRecreation.includes('beach') && rec.beaches === 0) multiplier *= 0.2;
  if (desiredRecreation.includes('hiking') && !rec.hasHiking) multiplier *= 0.5;
  if (desiredRecreation.includes('cycling') && !rec.hasCycling) multiplier *= 0.7;
  if (desiredRecreation.includes('pubs') && rec.pubs < 5) multiplier *= 0.4;
  if (desiredRecreation.includes('gym') && rec.gyms === 0) multiplier *= 0.5;
  if (desiredRecreation.includes('clothes-shops') && rec.clothesShops < 2) multiplier *= 0.5;
  if (desiredRecreation.includes('cinema') && rec.sportsFacilities === 0) multiplier *= 0.8;
  if (desiredRecreation.includes('sports') && rec.sportsFacilities < 2) multiplier *= 0.5;

  return Math.round(base * multiplier);
}

function amenitiesScore(area: IrishArea): number {
  const am = area.amenities;
  let score = 0;
  score += Math.min(50, am.schools * 2.5);
  score += Math.min(25, am.libraries * 5);
  score += Math.min(25, am.cinemas * 8);
  return Math.min(100, Math.round(score));
}

function healthcareScore(area: IrishArea): number {
  const hc = area.healthcare;
  let score = 0;
  score += Math.min(40, hc.hospitals * 20);
  score += Math.min(35, hc.gps * 1.5);
  score += Math.min(25, hc.dentists * 1.2);
  return Math.min(100, Math.round(score));
}

function grantsScore(area: IrishArea): number {
  const g = area.grants;
  let score = 0;
  if (g.helpToBuy) score += 25;
  if (g.firstHomeScheme) score += 25;
  if (g.localAuthorityLoan) score += 20;
  if (g.vacantPropertyGrant) score += 20;
  if (g.seiGrants) score += 10;
  return Math.min(100, score);
}

export function scoreArea(area: IrishArea, filters: Filters): ScoredArea {
  const breakdown: ScoreBreakdown = {
    shops: shopsScore(area, filters),
    transport: transportScore(area, filters),
    affordability: affordabilityScore(area, filters),
    recreation: recreationScore(area, filters),
    amenities: amenitiesScore(area),
    healthcare: healthcareScore(area),
    grants: grantsScore(area),
  };

  const weights = filters.weights;
  const categories = ['shops', 'transport', 'affordability', 'recreation', 'amenities', 'healthcare', 'grants'] as const;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const cat of categories) {
    const w = weights[cat];
    if (w > 0) {
      weightedSum += breakdown[cat] * w;
      totalWeight += w;
    }
  }

  const totalScore = totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight);
  return { area, totalScore, breakdown };
}

export function scoreAllAreas(areas: IrishArea[], filters: Filters): ScoredArea[] {
  return areas
    .map(area => scoreArea(area, filters))
    .sort((a, b) => b.totalScore - a.totalScore);
}
