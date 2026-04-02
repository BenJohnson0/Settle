export function scoreColor(score: number): string {
  if (score >= 85) return '#15803d'; // green-700
  if (score >= 70) return '#16a34a'; // green-600
  if (score >= 55) return '#65a30d'; // lime-600
  if (score >= 40) return '#ca8a04'; // yellow-600
  if (score >= 25) return '#ea580c'; // orange-600
  return '#dc2626';                  // red-600
}

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 25) return 'Low';
  return 'Poor';
}

export function formatPrice(price: number): string {
  if (price >= 1000000) return `€${(price / 1000000).toFixed(1)}m`;
  if (price >= 1000) return `€${Math.round(price / 1000)}k`;
  return `€${price}`;
}
